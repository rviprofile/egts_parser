"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SFRD_parser = SFRD_parser;
const flags_parser_1 = require("../utils/flags-parser");
const schemaParser_1 = require("../utils/schemaParser");
const schemas_1 = require("./schemas");
function SFRD_parser({ buffer, offset, }) {
    // Создаем объект с флагами
    const flags = (0, flags_parser_1.parseFlags)({
        flagsByte: Buffer.from([buffer.readUInt8(offset + 4)]),
        flagSchema: schemas_1.serviceDataRecordFlagSchema,
    });
    // Выводим флаги в консоль
    const flags_table = [
        {
            "SFRD Record Flags": "SSOD (Source Service On Device)",
            value: flags.ssod,
        },
        {
            "SFRD Record Flags": "RSOD (Recipient Service On Device)",
            value: flags.rsod,
        },
        { "SFRD Record Flags": "GRP (Group)", value: flags.grp },
        {
            "SFRD Record Flags": "RPP (Record Processing Priority)",
            value: flags.rpp,
        },
        { "SFRD Record Flags": "TMFE (Time Field Exists)", value: flags.tmfe },
        { "SFRD Record Flags": "EVFE (Event ID Field Exists)", value: flags.evfe },
        { "SFRD Record Flags": "OBFE (Object ID Field Exists)", value: flags.obfe },
    ];
    console.table(flags_table);
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
    const record = (0, schemaParser_1.parseRecordWithSchema)({
        buffer: buffer.subarray(offset),
        schema: schemas_1.serviceDataRecordSchema,
        flags: flags,
    });
    // Выводим основное содержимое записи
    console.table(Object.keys(record).map((key) => ({
        SFRD: key,
        value: key === "recordData" ? "<Buffer/>" : record[key],
    })));
    // Проверяем, что длина записи корректна
    if (record.recordLength + offset > buffer.length) {
        throw new Error("Ошибка: Длина записи выходит за пределы буфера.");
    }
    // Смещение данных начинается после заголовка
    const recordDataStart = offset + headerLength;
    const recordDataEnd = recordDataStart + record.recordLength; // Длина данных
    // Проверяем, что новое смещение не выходит за пределы буфера
    if (recordDataEnd > buffer.length) {
        throw new Error(`Ошибка: Смещение записи выходит за пределы буфера. recordDataEnd: ${recordDataEnd}, buffer.length: ${buffer.length}`);
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
