"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolPacakgeFlagsSchema = exports.ProtocolPacakgeSchema = exports.serviceDataRecordFlagSchema = exports.serviceDataRecordSchema = void 0;
// Схема для Service Data Record
exports.serviceDataRecordSchema = {
    recordLength: { type: "UInt16LE", length: 2 },
    recordNumber: { type: "UInt16LE", length: 2 },
    flags: { type: "UInt8", length: 1 },
    oid: { type: "UInt32LE", length: 4, flag: "obfe" },
    evid: { type: "UInt32LE", length: 4, flag: "evfe" },
    tm: { type: "UInt32LE", length: 4, flag: "tmfe" },
    sst: { type: "UInt8", length: 1 },
    rst: { type: "UInt8", length: 1 },
    recordData: { type: "Binary", dynamic: "recordLength" },
};
// Схема для битовых флагов Record Flags (RFL)
exports.serviceDataRecordFlagSchema = {
    ssod: { length: 1, position: 7 }, // Source Service On Device (1 бит)
    rsod: { length: 1, position: 6 }, // Recipient Service On Device (1 бит)
    grp: { length: 1, position: 5 }, // Group (1 бит)
    rpp: { length: 2, position: 3 }, // Record Processing Priority (2 бита)
    tmfe: { length: 1, position: 2 }, // Time Field Exists (1 бит)
    evfe: { length: 1, position: 1 }, // Event ID Field Exists (1 бит)
    obfe: { length: 1, position: 0 }, // Object ID Field Exists (1 бит)
};
exports.ProtocolPacakgeSchema = {
    PRV: { length: 1, type: "UInt8" }, // PRV (Protocol Version)
    SKID: { length: 1, type: "UInt8" }, // SKID (Security Key ID)
    FLAGS: { length: 1, type: "UInt8" },
    HL: { length: 1, type: "UInt8" },
    HE: { length: 1, type: "UInt8" },
    FDL: { length: 2, type: "UInt16LE" },
    PID: { length: 2, type: "UInt16LE" },
    PT: { length: 1, type: "UInt8" },
    PRA: { length: 2, type: "UInt16LE", flag: "RTE" },
    RCA: { length: 2, type: "UInt16LE", flag: "RTE" },
    TTL: { length: 1, type: "UInt8", flag: "RTE" },
    HCS: { length: 1, type: "UInt8" },
    SFRD: { dynamic: "FDL", type: "Binary" },
    SFRCS: { length: 2, type: "UInt16LE" },
};
exports.ProtocolPacakgeFlagsSchema = {
    PRF: { length: 2, position: 6 },
    RTE: { length: 1, position: 5 },
    ENA: { length: 2, position: 3 },
    CMP: { length: 1, position: 2 },
    PR: { length: 2, position: 0 },
};
