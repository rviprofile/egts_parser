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
import { parseEGTSMessageProps } from "./types";
import { handleConfirmation } from "./utils/createConfirmationResponse";
import { socketSender } from "./socketSender";

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

  process.env.CONSOLE_EGTS &&
  // Выводит result_PT в консоль
  consoleTablePT({
    result_PT,
    buffer,
    schema: ProtocolPacakgeSchema,
  });

  if (
    !checkPT({
      result_PT,
      buffer,
      flags_PT,
    })
  ) {
    return;
  }

  /** В 9-м байте пакета содержится его тип (PT) */
  switch (PacketTypeCodes[buffer.readUInt8(9)]) {
    case "EGTS_PT_APPDATA": {
      /** Подтверждение пакета APPDATA */
      // try {
      //   const confirm = handleConfirmation(
      //     buffer,
      //     trackers.get(socket)?.PID || 0
      //   );
      //   console.log(
      //     `\x1b[34mОтправили подтверждение на пакет: ${buffer.readUInt16LE(
      //       7
      //     )}. Мой PID: ${trackers.get(socket)?.PID || 0}\x1b[0m`
      //   );
      //   confirm &&
      //     socketSender({
      //       socket,
      //       message: confirm,
      //       trackers,
      //     });
      // } catch (error) {
      //   console.error("[messageParser.ts]: ", error);
      // }

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
      
      process.env.CONSOLE_EGTS &&
        console.log(
          "RPID (Response Packet ID): ",
          buffer.readUInt16LE(currentOffset)
        );
      currentOffset += 2;
      process.env.CONSOLE_EGTS &&
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
    case "EGTS_PT_SIGNED_APPDATA":
      return;
  }
}
