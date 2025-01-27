"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEGTSCommandsService = parseEGTSCommandsService;
function parseEGTSCommandsService({ record, socket, pid, trackers, }) {
    let offset = 0;
    while (offset < record.length) {
        const subrecordType = record.readUInt8(offset);
        const subrecordLength = record.readUInt16LE(offset + 1);
        const subrecordData = record.subarray(offset + 3, offset + 3 + subrecordLength);
        offset += 3 + subrecordLength; // Сдвигаем смещение к следующей подзаписи
        console.log("COMMAND_SERVICE SRT: ", subrecordType);
        console.log("COMMAND_SERVICE SRL: ", subrecordLength);
        console.log("COMMAND_SERVICE SRD: ", subrecordData);
    }
}
