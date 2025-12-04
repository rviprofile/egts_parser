import { BOOL } from "../../utils/boolEnv";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { recordResponseDictionary, recordResponseSchema } from "./schemas";

export function parseRecordResponse(buffer: Buffer) {
  const result = parseRecordWithSchema({
    buffer: buffer,
    schema: recordResponseSchema,
  }); /** Таблица c результатом в консоль */
  const result_table: any = [];
  Object.keys(result).map((key) => {
    result_table.push({
      AUTH: recordResponseDictionary[key],
      value: result[key],
    });
  });
  BOOL(process.env.CONSOLE_EGTS) && console.table(result_table);
  return result;
}
