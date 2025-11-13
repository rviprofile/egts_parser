import net from "net";
import { SFRD_parser } from "./parsers/SFRD_parser";
import { route } from "./route";
import {
  ProtocolPacakgeFlagsSchema,
  ProtocolPacakgeSchema,
} from "./parsers/schemas";
import { parseRecordWithSchema } from "./utils/schemaParser";
import { parseFlags } from "./utils/flags_parser";
import { PacketTypeCodes } from "./utils/decribe-pt";
import { consoleTablePT } from "./utils/consoleTablePT";
import { checkPT } from "./utils/checkPT";
import { processingResultCodes } from "./processingResultCodes";
import {
  encodePacket,
  prepareAnswer,
} from "./utils/createConfirmationResponse";
import { EGTS_PT_APPDATA } from "./constants";
import { socketSender } from "./socketSender";

/** Параметры для `parseEGTSMessage` */
type parseEGTSMessageProps = {
  /** Буфер с бинарными данными EGTS-пакета. */
  buffer: Buffer;
  /** TCP-сокет, откуда пришло сообщение. */
  socket: net.Socket;
  /** Коллекция всех подключенных трекеров */
  trackers: Map<
    net.Socket,
    {
      [key: string]: number;
    }
  >;
};
/**
 * Разбирает и обрабатывает входящее сообщение по протоколу EGTS.
 *
 * @remarks
 * Функция выполняет следующие шаги:
 * 1. Определяет тип пакета данных (PT — Packet Type) и парсит его заголовок.
 * 2. Выводит таблицу значений заголовка для отладки.
 * 3. Проверяет корректность контрольной суммы заголовка (HCS).
 * 4. Если пакет содержит `APPDATA` — извлекает и парсит Service Frame Data Records (SFRD),
 *    передавая их в маршрутизатор `route`.
 * 5. Если пакет содержит `RESPONSE` — извлекает RPID, PR, и также парсит SFRD для дальнейшей обработки.
 *
 */
export function parseEGTSMessage({
  buffer,
  socket,
  trackers,
}: parseEGTSMessageProps) {
  /** Разбор флагов заголовка PT (Packet Type) */
  const flags_PT = parseFlags({
    flagsByte: buffer.subarray(2, 3),
    flagSchema: ProtocolPacakgeFlagsSchema,
  });
  /** Парсинг заголовка PT по схеме протокола */
  const result_PT = parseRecordWithSchema({
    buffer: buffer,
    schema: ProtocolPacakgeSchema,
    flags: flags_PT,
  });

  // Выводит result_PT в консоль
  consoleTablePT({
    result_PT,
    buffer,
    schema: ProtocolPacakgeSchema,
  });

  checkPT({
    result_PT,
    buffer,
    flags_PT,
  });

  /** В 9-м байте пакета содержится его тип (PT) */
  switch (PacketTypeCodes[buffer.readUInt8(9)]) {
    case "EGTS_PT_APPDATA": {
      /** Формируем подтверждение (EGTS_PT_RESPONSE) */
      const response = prepareAnswer(
        {
          PacketType: EGTS_PT_APPDATA,
          PacketID: buffer.readUInt16LE(7), // переданный в props идентификатор пакета
        } as any, // остальное prepareAnswer не использует
        buffer.readUInt16LE(7) + 1 // можно использовать новый ID для ответа
      );

      const bufferToSend = encodePacket(response);
      socketSender({
        socket,
        message: bufferToSend,
        trackers,
      });
      console.log("[Teledata Service]: EGTS_PT_RESPONSE отправлен ✅");
      /**  Длина заголовка (HL), для нас это смещение, после которого идут данные */
      let currentOffset = buffer.readUInt8(3);
      // Пока смещение меньше, чем длинна буфера минус контрольная сумма (последние 2 байта)
      while (currentOffset < buffer.length - 2) {
        // Парсим SFRD (Services Frame Data)
        const record: {
          record: {
            [key: string]: any;
          };
          recordData: Buffer;
          flags: {
            [flagName: string]: number;
          };
          nextOffset: number;
        } = SFRD_parser({ buffer: buffer, offset: currentOffset });

        currentOffset = record.nextOffset;

        /** Передача распарсенных данных в маршрутизатор */
        route({
          data: record,
          socket: socket,
          pid: buffer.readUInt16LE(7),
          trackers: trackers,
        });
      }
      break;
    }
    case "EGTS_PT_RESPONSE": {
      /** Обработка пакета RESPONSE (ответ на запрос) */
      let currentOffset = buffer.readUInt8(3); // Длина заголовка (HL)
      console.log(
        "RPID (Response Packet ID): ",
        buffer.readUInt16LE(currentOffset)
      );
      currentOffset += 2;
      console.log("PR (Processing Result): ", buffer.readUInt8(currentOffset));
      currentOffset += 1;
      /** Парсинг Service Frame Data (SFRD) */
      const record: {
        record: {
          [key: string]: any;
        };
        recordData: Buffer;
        flags: {
          [flagName: string]: number;
        };
        nextOffset: number;
      } = SFRD_parser({ buffer: buffer, offset: currentOffset });
      /** Передача распарсенных данных в маршрутизатор */
      route({
        data: record,
        socket: socket,
        pid: buffer.readUInt16LE(7),
        trackers: trackers,
      });
      break;
    }
  }
}
