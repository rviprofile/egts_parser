import {
  termIdentityDictionary,
  termIdentityFlagSchema,
  termIdentityFlagsDictionary,
  termIdentitySchema,
} from "./schemas";
import net from "net";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { parseFlags } from "../../utils/flags_parser"; // Парсер для флагов
import { consoleTableFlags } from "../../utils/consoleTableFlags";
import { BOOL } from "../../utils/boolEnv";
import { trackersEGTS } from "../../../socket";

export function parseTermIdentity({
  buffer,
  socket,
  trackers,
}: {
  buffer: Buffer;
  socket: net.Socket;
  trackers: Map<net.Socket, { [key: string]: any }>;
}) {
  const flagsByte = Buffer.from([buffer.readUInt8(4)]); // Извлекаем байт с флагами
  const flags = parseFlags({
    flagsByte: flagsByte,
    flagSchema: termIdentityFlagSchema,
  }); // Парсим флаги по схеме

  BOOL(process.env.CONSOLE_EGTS) &&
    consoleTableFlags({
      flags,
      title: "AUTH flags",
      dictionary: termIdentityFlagsDictionary,
    });

  const result: { [key: string]: any } = parseRecordWithSchema({
    buffer: buffer,
    schema: termIdentitySchema,
    flags: flags,
  });

  /** Таблица c результатом в консоль */
  const result_table: any = [];
  Object.keys(result).map((key) => {
    result_table.push({
      AUTH: termIdentityDictionary[key],
      value: result[key],
    });
  });
  trackersEGTS.set(socket, {
    IMEI: result.IMEI,
  });
  BOOL(process.env.CONSOLE_EGTS) && console.table(result_table);

  return result; // Возвращаем результат парсинга
}
