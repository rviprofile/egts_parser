"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describePacketFields = void 0;
const describePacketFields = (code) => {
    switch (code) {
        case "PRV":
            return "PRV (Protocol Version)";
        case "SKID":
            return "SKID (Security Key ID)";
        case "HL":
            return "HL (Header Length)";
        case "HE":
            return "HE (Header Encoding)";
        case "FDL":
            return "FDL (Frame Data Length)";
        case "PID":
            return "PID (Packet Identifier)";
        case "PT":
            return "PT (Packet Type)";
        case "HCS":
            return "HCS (Header Check Sum)";
        case "SFRD":
            return "SFRD (Services Frame Data)";
        case "SFRCS":
            return "SFRCS (Services Frame Data Check Sum)";
        default:
            return code;
    }
};
exports.describePacketFields = describePacketFields;
