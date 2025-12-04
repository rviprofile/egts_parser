import { consoleTableFlags } from "../../utils/consoleTableFlags";
import { parseFlags } from "../../utils/flags_parser";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import {
  commandDataFlagSchema,
  commandDataFlagsDictionary,
  commandDataSchema,
  commandDataSchemaDictionary,
} from "./schemas";
export function parseCommandData(buffer: Buffer) {
  const flagsByte = Buffer.from([buffer.readUInt8(10)]); // Извлекаем байт с флагами
  const flags = parseFlags({
    flagsByte: flagsByte,
    flagSchema: commandDataFlagSchema,
  }); // Парсим флаги по схеме

  process.env.CONSOLE_EGTS &&
    consoleTableFlags({
      flags,
      title: "COMMAND flags",
      dictionary: commandDataFlagsDictionary,
    });

  const result = parseRecordWithSchema({
    buffer: buffer,
    schema: commandDataSchema,
    flags: flags,
  });

  /** Таблица c результатом в консоль */
  const result_table: any = [];
  Object.keys(result).map((key) => {
    result_table.push({
      COMMAND: commandDataSchemaDictionary[key],
      value: result[key],
    });
  });
  process.env.CONSOLE_EGTS && console.table(result_table);

  return result; // Возвращаем результат парсинга
}
