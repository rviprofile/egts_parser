import { consoleTableFlags } from "../utils/consoleTableFlags";
import { parseFlags } from "../utils/flags-parser";
import { parseRecordWithSchema } from "../utils/schemaParser";
import {
  serviceDataRecordFlagSchema,
  serviceDataRecordSchema,
  SFRDFlagsDictionary,
} from "./schemas";

const serviceDataRecordSchemaDictionary = {
  recordLength: "RL (Record Length)",
  recordNumber: "RN (Record Number) ",
  flags: "RFL (Record Flags)",
  oid: "OID (Object Identifier)",
  evid: "EVID (Event Identifier)",
  tm: "TM (Time)",
  sst: "SST (Source Service Type)",
  rst: "RST (Recipient Service Type)",
  recordData: "RD (Record Data)",
};

export function SFRD_parser({
  buffer,
  offset,
}: {
  buffer: Buffer;
  offset: number;
}): {
  record: {
    [key: string]: any;
  };
  recordData: Buffer;
  flags: {
    [flagName: string]: number;
  };
  nextOffset: number;
} {
  // Создаем объект с флагами
  const flags: {
    [flagName: string]: number;
  } = parseFlags({
    flagsByte: Buffer.from([buffer.readUInt8(offset + 4)]),
    flagSchema: serviceDataRecordFlagSchema,
  });

  // Выводим флаги в консоль
  consoleTableFlags({
    flags,
    title: "SFRD Flags",
    dictionary: SFRDFlagsDictionary,
  });

  // Базовая длина заголовка SDR = 7 байт
  let headerLength = 7;

  // Увеличиваем длину заголовка, если соответствующие флаги установлены
  if (flags.tmfe) {
    headerLength += 4; // Поле tm (Time Field)
  }
  if (flags.evfe) {
    headerLength += 4; // Поле evid (Event ID Field)
  }
  if (flags.obfe) {
    headerLength += 4; // Поле oid (Object ID Field)
  }

  // Парсинг основного заголовка записи с использованием схемы
  const record: {
    [key: string]: any;
  } = parseRecordWithSchema({
    buffer: buffer.subarray(offset),
    schema: serviceDataRecordSchema,
    flags: flags,
  });

  // Выводим основное содержимое записи
  console.table(
    Object.keys(record).map((key) => ({
      SFRD: serviceDataRecordSchemaDictionary[key],
      value: key === "recordData" ? "<Buffer/>" : record[key],
    }))
  );

  // Проверяем, что длина записи корректна
  if (record.recordLength + offset > buffer.length) {
    throw new Error("Ошибка: Длина записи выходит за пределы буфера.");
  }

  // Смещение данных начинается после заголовка
  const recordDataStart = offset + headerLength;
  const recordDataEnd = recordDataStart + record.recordLength; // Длина данных

  // Проверяем, что новое смещение не выходит за пределы буфера
  if (recordDataEnd > buffer.length) {
    throw new Error(
      `Ошибка: Смещение записи выходит за пределы буфера. recordDataEnd: ${recordDataEnd}, buffer.length: ${buffer.length}`
    );
  }

  const recordData = buffer.subarray(recordDataStart, recordDataEnd);

  // Общая длина записи = длина заголовка + длина данных (record.recordLength)
  const totalRecordLength = headerLength + record.recordLength;

  // Новое смещение для следующей записи
  const nextOffset = offset + totalRecordLength;

  return {
    record,
    recordData,
    flags,
    nextOffset,
  };
}
