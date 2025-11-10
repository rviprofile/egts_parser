import { SchemaType } from "../types";
import iconv from "iconv-lite";

type parseRecordWithSchemaProps = {
  buffer: Buffer;
  schema: SchemaType;
  flags: { [flagName: string]: number };
};

/**
 * Универсальная функция для парсинга данных на основе схемы с поддержкой флага dynamic
 *
 * @param {Buffer} buffer - Буфер с данными для парсинга
 * @param {SchemaType} schema - Схема, описывающая структуру данных
 * @param {Object} flags - Флаги, влияющие на парсинг
 *
 * @returns {Object} - Результат парсинга
 */
export function parseRecordWithSchema({
  buffer,
  schema,
  flags,
}: parseRecordWithSchemaProps) {
  /** Смещение */
  let offset = 0;
  /** Результат парсинга */
  const parsedData = {};

  for (const [
    key,
    { type, length, flag, dynamic, connection },
  ] of Object.entries(schema)) {
    // Если поле зависит от флага, проверяем значение флага
    if (flag && flags[flag] === 0) {
      continue; // Пропускаем поле, если флаг отключен
    }
    /** Длинна поля */
    let fieldLength: number | undefined = length;

    // Если поле имеет динамическую длину, основанную на другом поле
    if (dynamic) {
      fieldLength = parsedData[dynamic]; // Динамическая длина основана на ранее прочитанном поле
    }

    // Если поле зависит от другого поля, оно указано в connection. В таком случае connection не может быть равно нулю
    if (connection && parsedData[connection] === 0) {
      continue;
    }

    // Чтение данных в зависимости от типа
    switch (type) {
      case "UInt8":
        parsedData[key] = buffer.readUInt8(offset);
        break;
      case "UInt16LE":
        parsedData[key] = buffer.readUInt16LE(offset);
        break;
      case "UInt32LE":
        parsedData[key] = buffer.readUInt32LE(offset);
        break;
      case "Binary":
        if (fieldLength) {
          parsedData[key] = buffer.subarray(offset, offset + fieldLength);
        }
        break;
      case "String":
        if (length)
          parsedData[key] = iconv.decode(
            buffer.subarray(offset, offset + length),
            "win1251"
          );
        break;
      case undefined:
        console.log(key + " is undefined, length: " + length + " bytes");
        break;
      default:
        throw new Error(`Неизвестный тип данных: ${type}`);
    }
    // Смещаем указатель на длину поля
    if (fieldLength) offset += fieldLength;
  }
  return parsedData;
}
