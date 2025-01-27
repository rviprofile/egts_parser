"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePosData = parsePosData;
const schemaParser_1 = require("../../utils/schemaParser");
const flags_parser_1 = require("../../utils/flags-parser");
const schemas_1 = require("./schemas");
const convertCoordinate_1 = require("../../utils/convertCoordinate");
const parseNavigationTime_1 = require("../../utils/parseNavigationTime");
function parsePosData(buffer) {
    const flagsByte = buffer.subarray(12, 13); // Извлекаем байт с флагами
    const flags = (0, flags_parser_1.parseFlags)({
        flagsByte: flagsByte,
        flagSchema: schemas_1.posDataFlagSchema,
    }); // Парсим флаги по схеме
    const speedBytes = buffer.readUInt16LE(13);
    // Маска для извлечения 14 младших бит (0x3FFF = 0011111111111111)
    const speedValue = speedBytes & 0x3fff;
    // Скорость в км/ч с дискретностью 0.1 (делим на 10)
    const speed = speedValue / 10;
    // Извлечение бита ALTS (бит 15, старший бит)
    const alts = (speedBytes & 0x8000) >> 15; // 0 или 1
    // Извлечение бита DIRH (бит 14)
    const dirh = (speedBytes & 0x4000) >> 14; // 0 или 1
    // Читаем байт направления DIR
    const dir = buffer.readUInt8(15); // DIR находится в 15 байте
    // Объединяем старший бит DIRH и младшие биты DIR
    const direction = (dirh << 7) | dir; // Итоговое направление
    const result = (0, schemaParser_1.parseRecordWithSchema)({
        buffer: buffer,
        schema: schemas_1.posDataSchema,
        flags: flags,
    });
    let digital_inputs = [];
    for (var i = 7; i >= 0; i--) {
        var bit = result["digitalInputs"] & (1 << i) ? 1 : 0;
        digital_inputs.push(bit);
    }
    const posData_table = [
        {
            POSITION: "NTM (Navigation Time)",
            value: (0, parseNavigationTime_1.parseNavigationTime)(result["NTM"]),
        },
        {
            POSITION: "LAT (Latitude)",
            value: (0, convertCoordinate_1.convertLat)({ latitude: Number(result["LAT"]) }),
        },
        {
            POSITION: "LONG (Longitude)",
            value: (0, convertCoordinate_1.convertLong)({ longitude: Number(result["LONG"]) }),
        },
        {
            POSITION: "ALTE",
            value: flags["ALTE"],
        },
        {
            POSITION: "LOHS",
            value: flags["LOHS"] === 0 ? "Eastern Longitude" : "Western Longitude",
        },
        {
            POSITION: "LAHS",
            value: flags["LAHS"] === 0 ? "North Latitude" : "South Latitude",
        },
        {
            POSITION: "MV",
            value: flags["MV"] === 1 ? "Moving" : "Parking",
        },
        {
            POSITION: "BB",
            value: flags["BB"] === 0 ? "Relevant" : "Black Box",
        },
        {
            POSITION: "FIX",
            value: flags["FIX"] === 0 ? "2D fix" : "3D fix",
        },
        {
            POSITION: "CS",
            value: flags["CS"] === 0 ? "WGS-84" : "ПЗ-90.02",
        },
        {
            POSITION: "VLD",
            value: flags["VLD"] === 1 ? "Valid" : "Invalid",
        },
        {
            POSITION: "ALTS",
            value: alts === 0 ? "Above sea level" : "Below sea level",
        },
        {
            POSITION: "SPEED",
            value: `${speed} km/h`,
        },
        {
            POSITION: "DIR (Direction)",
            value: `${direction}°`,
        },
        {
            POSITION: "ODM (Odometer)",
            value: result["ODM"].readUintLE(0, 3),
        },
        {
            POSITION: "DIN (Digital Inputs)",
            value: digital_inputs.join(),
        },
        {
            POSITION: "SRC (Source)",
            value: result["SRC"],
        },
        {
            POSITION: "ALT (Altitude)",
            value: result["ALT"].readUintLE(0, 3),
        },
    ];
    console.table(posData_table);
    return result; // Возвращаем результат парсинга
}
