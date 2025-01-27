import net from "net";
import { SFRD_parser } from "./parsers/SFRD_parser";
import { route } from "./route";
import {
  ProtocolPacakgeFlagsSchema,
  ProtocolPacakgeSchema,
} from "./parsers/schemas";
import { parseRecordWithSchema } from "./utils/schemaParser";
import { parseFlags } from "./utils/flags-parser";
import { describePacketFields } from "./utils/decribe-pt";
import { CRC8 } from "./utils/crc8";

type parseEGTSMessageProps = {
  buffer: Buffer;
  socket: net.Socket;
  trackers: Map<
    net.Socket,
    {
      [key: string]: number;
    }
  >;
};

export function parseEGTSMessage({
  buffer,
  socket,
  trackers,
}: parseEGTSMessageProps) {
  const PacketTypeCodes = {
    0: "EGTS_PT_RESPONSE",
    1: "EGTS_PT_APPDATA",
    2: "EGTS_PT_SIGNED_APPDATA",
  };

  const flags_PT = parseFlags({
    flagsByte: buffer.subarray(2, 3),
    flagSchema: ProtocolPacakgeFlagsSchema,
  });

  const result_PT = parseRecordWithSchema({
    buffer: buffer,
    schema: ProtocolPacakgeSchema,
    flags: flags_PT,
  });

  let result_PT_table: any = [];

  Object.keys(result_PT).map((key: string) => {
    key === "SFRD"
      ? result_PT_table.push({
          [`PT ${buffer.length} байт`]: describePacketFields(key),
          value: "<Buffer/>",
        })
      : result_PT_table.push({
          [`PT ${buffer.length} байт`]: describePacketFields(key),
          value:
            key === "PT" ? PacketTypeCodes[result_PT[key]] : result_PT[key],
        });
  });

  console.table(result_PT_table);

  // Проверка контрольной суммы
  if (result_PT["HCS"] !== CRC8(buffer.subarray(0, buffer.readUInt8(3) - 1))) {
    console.error("Ошибка контрольной суммы заголовка");
    return;
  }

  if (PacketTypeCodes[buffer.readUInt8(9)] === "EGTS_PT_APPDATA") {
    let currentOffset = buffer.readUInt8(3); // Длина заголовка (HL)
    // Пока смещение меньше, чем длинна буфера минус SFRCS (Services Frame Data Check Sum)
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

      route({
        data: record,
        socket: socket,
        pid: buffer.readUInt16LE(7),
        trackers: trackers,
      });
    }
  } else if (PacketTypeCodes[buffer.readUInt8(9)] === "EGTS_PT_RESPONSE") {
    let currentOffset = buffer.readUInt8(3); // Длина заголовка (HL)
    console.log(
      "RPID (Response Packet ID): ",
      buffer.readUInt16LE(currentOffset)
    );
    currentOffset += 2;
    console.log("PR (Processing Result): ", buffer.readUInt8(currentOffset));
    currentOffset += 1;
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
    route({
      data: record,
      socket: socket,
      pid: buffer.readUInt16LE(7),
      trackers: trackers,
    });
  }
}
