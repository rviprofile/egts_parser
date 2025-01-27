import { termIdentityFlagSchema, termIdentitySchema } from "./schemas";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { parseFlags } from "../../utils/flags-parser"; // Парсер для флагов

export function parseTermIdentity(buffer: Buffer) {
  const flagsByte = Buffer.from([buffer.readUInt8(4)]); // Извлекаем байт с флагами
  const flags = parseFlags({
    flagsByte: flagsByte,
    flagSchema: termIdentityFlagSchema,
  }); // Парсим флаги по схеме

  const flags_table: any = [];

  Object.keys(flags).map((key) => {
    flags_table.push({ "AUTH flags": key, value: flags[key] });
  });

  console.table(flags_table);
  const result = parseRecordWithSchema({
    buffer: buffer,
    schema: termIdentitySchema,
    flags: flags,
  });
  return result; // Возвращаем результат парсинга
}
