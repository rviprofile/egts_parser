import { parseFlags } from "../../utils/flags_parser";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { extPosDataFlagSchema, extPosDataSchema } from "./schemas";

export function parseExtPosData(buffer: Buffer) {
  const flagsByte = Buffer.from([buffer.readUInt8(0)]); // Извлекаем байт с флагами
  const flags = parseFlags({
    flagsByte: flagsByte,
    flagSchema: extPosDataFlagSchema,
  }); // Парсим флаги по схеме
  const result = parseRecordWithSchema({
    buffer: buffer,
    schema: extPosDataSchema,
    flags: flags,
  });
  console.table(result);
  return result;
}
