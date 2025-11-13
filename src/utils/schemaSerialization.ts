import { Buffer } from "buffer"; // Модуль для работы с буферами в Node.js
import { serializeRecordWithSchemaProps } from "../types";

/** Универсальная функция для создания бинарной строки на основе схемы и данных JSON */
function serializeRecordWithSchema({
  schema,
  flags,
  jsonData,
}: serializeRecordWithSchemaProps) {
  /** Общая длина буфера на основе схемы */
  let totalLength = 0;
  for (const [key, { length, flag, dynamic }] of Object.entries(schema)) {
    // Если поле зависит от флага и флаг отключен, пропускаем
    if (flag && flags[flag] === 0) {
      continue;
    }

    // Если длина поля динамическая, возьмем значение из jsonData
    if (dynamic) {
      totalLength += jsonData[dynamic];
    } else if (length) {
      totalLength += length;
    }
  }

  // Создаем буфер нужной длины
  const buffer = Buffer.alloc(totalLength);
  /** Смещение */
  let offset = 0;

  // Проходим по каждому полю и записываем его в буфер
  for (const [key, { type, length, flag, dynamic }] of Object.entries(schema)) {
    // Если поле зависит от флага и флаг отключен, пропускаем
    if (flag && flags[flag] === 0) {
      continue;
    }

    /** Длинна поля */
    let fieldLength = length;

    // Если поле имеет динамическую длину, основанную на другом поле
    if (dynamic) {
      fieldLength = jsonData[dynamic];
    }

    // Записываем данные в буфер в зависимости от типа
    switch (type) {
      case "UInt8":
        buffer.writeUInt8(jsonData[key], offset);
        break;
      case "UInt16LE":
        buffer.writeUInt16LE(jsonData[key], offset);
        break;
      case "UInt32LE":
        buffer.writeUInt32LE(jsonData[key], offset);
        break;
      case "Binary":
        if (!Buffer.isBuffer(jsonData[key])) {
          throw new Error(`Значение ${key} должно быть буфером`);
        }
        jsonData[key].copy(buffer, offset, 0, fieldLength);
        break;
      case "String":
        if (fieldLength)
          buffer.write(jsonData[key], offset, fieldLength, "ascii");
        break;
      default:
        throw new Error(`Неизвестный тип данных: ${type}`);
    }

    // Смещаем указатель на длину поля
    if (fieldLength) offset += fieldLength;
  }

  return buffer;
}

function calculateBufferLength(data, schema) {
  let length = 0;

  for (const field in schema) {
    const { type, length: fieldLength, flag, dynamic } = schema[field];

    // Calculate buffer length based on field type
    switch (type) {
      case "UInt32LE":
        length += 4;
        break;
      case "UInt16LE":
        length += 2;
        break;
      case "UInt8":
        length += 1;
        break;
      case "String":
        length += fieldLength;
        break;
      case "Binary":
        if (dynamic === "recordLength") {
          length += data.recordLength;
        } else {
          length += fieldLength;
        }
        break;
      // Add support for other types as needed
      default:
        throw new Error(`Unknown field type: ${type}`);
    }
  }
  return length;
}

module.exports = {
  serializeRecordWithSchema,
};
