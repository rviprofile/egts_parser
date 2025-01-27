"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEGTSMessage = parseEGTSMessage;
const SFRD_parser_1 = require("./parsers/SFRD_parser");
const route_1 = require("./route");
const schemas_1 = require("./parsers/schemas");
const schemaParser_1 = require("./utils/schemaParser");
const flags_parser_1 = require("./utils/flags-parser");
const decribe_pt_1 = require("./utils/decribe-pt");
const crc8_1 = require("./utils/crc8");
function parseEGTSMessage({ buffer, socket, trackers, }) {
    const PacketTypeCodes = {
        0: "EGTS_PT_RESPONSE",
        1: "EGTS_PT_APPDATA",
        2: "EGTS_PT_SIGNED_APPDATA",
    };
    const flags_PT = (0, flags_parser_1.parseFlags)({
        flagsByte: buffer.subarray(2, 3),
        flagSchema: schemas_1.ProtocolPacakgeFlagsSchema,
    });
    const result_PT = (0, schemaParser_1.parseRecordWithSchema)({
        buffer: buffer,
        schema: schemas_1.ProtocolPacakgeSchema,
        flags: flags_PT,
    });
    let result_PT_table = [];
    Object.keys(result_PT).map((key) => {
        key === "SFRD"
            ? result_PT_table.push({
                [`PT ${buffer.length} байт`]: (0, decribe_pt_1.describePacketFields)(key),
                value: "<Buffer/>",
            })
            : result_PT_table.push({
                [`PT ${buffer.length} байт`]: (0, decribe_pt_1.describePacketFields)(key),
                value: key === "PT" ? PacketTypeCodes[result_PT[key]] : result_PT[key],
            });
    });
    console.table(result_PT_table);
    // Проверка контрольной суммы
    if (result_PT["HCS"] !== (0, crc8_1.CRC8)(buffer.subarray(0, buffer.readUInt8(3) - 1))) {
        console.error("Ошибка контрольной суммы заголовка");
        return;
    }
    if (PacketTypeCodes[buffer.readUInt8(9)] === "EGTS_PT_APPDATA") {
        let currentOffset = buffer.readUInt8(3); // Длина заголовка (HL)
        // Пока смещение меньше, чем длинна буфера минус SFRCS (Services Frame Data Check Sum)
        while (currentOffset < buffer.length - 2) {
            // Парсим SFRD (Services Frame Data)
            const record = (0, SFRD_parser_1.SFRD_parser)({ buffer: buffer, offset: currentOffset });
            currentOffset = record.nextOffset;
            (0, route_1.route)({
                data: record,
                socket: socket,
                pid: buffer.readUInt16LE(7),
                trackers: trackers,
            });
        }
    }
    else if (PacketTypeCodes[buffer.readUInt8(9)] === "EGTS_PT_RESPONSE") {
        let currentOffset = buffer.readUInt8(3); // Длина заголовка (HL)
        console.log("RPID (Response Packet ID): ", buffer.readUInt16LE(currentOffset));
        currentOffset += 2;
        console.log("PR (Processing Result): ", buffer.readUInt8(currentOffset));
        currentOffset += 1;
        const record = (0, SFRD_parser_1.SFRD_parser)({ buffer: buffer, offset: currentOffset });
        (0, route_1.route)({
            data: record,
            socket: socket,
            pid: buffer.readUInt16LE(7),
            trackers: trackers,
        });
    }
}
