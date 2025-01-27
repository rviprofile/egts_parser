"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareAnswer = prepareAnswer;
const constants_1 = require("../../constants");
// Helper function to write a 16-bit integer into a buffer at a given offset
function writeUInt16LE(value, offset, buffer) {
    buffer.writeUInt16LE(value, offset);
    return offset + 2;
}
// Helper function to write an 8-bit integer into a buffer at a given offset
function writeUInt8(value, offset, buffer) {
    buffer.writeUInt8(value, offset);
    return offset + 1;
}
// Function to prepare an acknowledgment packet as a Buffer
function prepareAnswer({ packet, recordNum, pid }) {
    const EGTS_PT_RESPONSE = 0; // Define the EGTS response packet type
    const EGTS_PC_OK = 0; // Define the EGTS OK status
    if (packet.packetType === constants_1.EGTS_PT_APPDATA) {
        let records = [];
        let serviceType = 0;
        if (packet.servicesFrameData) {
            packet.servicesFrameData.forEach((record) => {
                records.push({
                    confirmedRecordNumber: record.recordNumber,
                    recordStatus: EGTS_PC_OK,
                });
                serviceType = record.sourceServiceType;
            });
            const response = {
                responsePacketID: packet.packetID,
                processingResult: packet.errorCode,
                SDR: [
                    {
                        recordLength: records.length,
                        recordNumber: recordNum,
                        SSOD: "0",
                        RSOD: "1",
                        GRP: "0",
                        RPP: "11",
                        TMFE: "0",
                        EVFE: "0",
                        OBFE: "0",
                        sourceServiceType: serviceType,
                        recipientServiceType: serviceType,
                        recordsData: records,
                    },
                ],
            };
            // Estimate buffer size: 11 bytes for header + response fields
            const buffer = Buffer.alloc(256); // Allocate a buffer (adjust size if needed)
            let offset = 0;
            // Write header fields
            offset = writeUInt8(1, offset, buffer); // Protocol version
            offset = writeUInt8(0, offset, buffer); // Security Key ID
            offset = writeUInt8(0b11000000, offset, buffer); // PRF, RTE, ENA, CMP, PR
            offset = writeUInt8(11, offset, buffer); // Header length
            offset = writeUInt8(0, offset, buffer); // Header encoding
            offset = writeUInt16LE(3 + 4 * records.length, offset, buffer); // Frame Data Length (estimate)
            offset = writeUInt16LE(pid, offset, buffer); // Packet ID
            offset = writeUInt8(EGTS_PT_RESPONSE, offset, buffer); // Packet Type
            // Write services frame data
            offset = writeUInt16LE(packet.packetID, offset, buffer); // Response Packet ID
            offset = writeUInt8(packet.errorCode, offset, buffer); // Processing result
            // Write each record response
            records.forEach((record) => {
                offset = writeUInt16LE(record.confirmedRecordNumber, offset, buffer); // Confirmed record number
                offset = writeUInt8(record.recordStatus, offset, buffer); // Record status
            });
            return buffer.subarray(0, offset); // Return the buffer up to the current offset
        }
    }
    return Buffer.alloc(0); // Return an empty buffer if no response is generated
}
