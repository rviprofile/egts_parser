"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTermIdentity = parseTermIdentity;
const schemas_1 = require("./schemas");
const schemaParser_1 = require("../../utils/schemaParser");
const flags_parser_1 = require("../../utils/flags-parser"); // Парсер для флагов
function parseTermIdentity(buffer) {
    const flagsByte = Buffer.from([buffer.readUInt8(4)]); // Извлекаем байт с флагами
    const flags = (0, flags_parser_1.parseFlags)({
        flagsByte: flagsByte,
        flagSchema: schemas_1.termIdentityFlagSchema,
    }); // Парсим флаги по схеме
    const flags_table = [];
    Object.keys(flags).map((key) => {
        flags_table.push({ "AUTH flags": key, value: flags[key] });
    });
    console.table(flags_table);
    const result = (0, schemaParser_1.parseRecordWithSchema)({
        buffer: buffer,
        schema: schemas_1.termIdentitySchema,
        flags: flags,
    });
    return result; // Возвращаем результат парсинга
}
