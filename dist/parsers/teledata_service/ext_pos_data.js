"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExtPosData = parseExtPosData;
const flags_parser_1 = require("../../utils/flags-parser");
const schemaParser_1 = require("../../utils/schemaParser");
const schemas_1 = require("./schemas");
function parseExtPosData(buffer) {
    const flagsByte = Buffer.from([buffer.readUInt8(0)]); // Извлекаем байт с флагами
    const flags = (0, flags_parser_1.parseFlags)({
        flagsByte: flagsByte,
        flagSchema: schemas_1.extPosDataFlagSchema,
    }); // Парсим флаги по схеме
    const result = (0, schemaParser_1.parseRecordWithSchema)({
        buffer: buffer,
        schema: schemas_1.extPosDataSchema,
        flags: flags,
    });
    console.table(result);
    return result;
}
