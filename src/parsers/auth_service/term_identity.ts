import {
  termIdentityFlagSchema,
  termIdentityFlagsDictionary,
  termIdentitySchema,
} from "./schemas";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { parseFlags } from "../../utils/flags_parser"; // Парсер для флагов
import { consoleTableFlags } from "../../utils/consoleTableFlags";

export function parseTermIdentity(buffer: Buffer) {
  const flagsByte = Buffer.from([buffer.readUInt8(4)]); // Извлекаем байт с флагами
  const flags = parseFlags({
    flagsByte: flagsByte,
    flagSchema: termIdentityFlagSchema,
  }); // Парсим флаги по схеме

  consoleTableFlags({
    flags,
    title: "AUTH flags",
    dictionary: termIdentityFlagsDictionary,
  });

  const result = parseRecordWithSchema({
    buffer: buffer,
    schema: termIdentitySchema,
    flags: flags,
  });
  return result; // Возвращаем результат парсинга
}
