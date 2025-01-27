"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.absAnSensDataFlagsSchema = exports.extPosDataSchema = exports.extPosDataFlagSchema = exports.posDataSchema = exports.posDataFlagSchema = void 0;
// POS_DATA
exports.posDataFlagSchema = {
    ALTE: { length: 1, position: 7 },
    LOHS: { length: 1, position: 6 },
    LAHS: { length: 1, position: 5 },
    MV: { length: 1, position: 4 },
    BB: { length: 1, position: 3 },
    CS: { length: 1, position: 2 },
    FIX: { length: 1, position: 1 },
    VLD: { length: 1, position: 0 },
};
exports.posDataSchema = {
    NTM: { type: "UInt32LE", length: 4 }, // NTM (Navigation Time)
    LAT: { type: "UInt32LE", length: 4 }, // LAT (Latitude)
    LONG: { type: "UInt32LE", length: 4 }, // LONG (Longitude) 
    FLG: { type: "UInt8", length: 1 }, // FLG (Flags) 
    SPD: { type: "UInt16LE", length: 2 }, // SPD (Speed) - DIRH, ALTS и SPD парсятся отдельно
    DIR: { type: "UInt8", length: 1 }, // DIR (Direction)
    ODM: { type: "Binary", length: 3 }, // ODM (Odometer)
    DIN: { type: "UInt8", length: 1 }, // DIN (Digital Inputs)
    SRC: { type: "UInt8", length: 1 }, // SRC (Source)
    ALT: { type: "Binary", length: 3, flag: "ALTE" }, // ALT (Altitude)
    SRCD: { type: "UInt16LE", length: 2, connection: "SRC" }, // SRCD (Source Data)
};
// EXT_POS_DATA
exports.extPosDataFlagSchema = {
    NSFE: { length: 1, position: 4 },
    SFE: { length: 1, position: 3 },
    PFE: { length: 1, position: 2 },
    HFE: { length: 1, position: 1 },
    VFE: { length: 1, position: 0 },
};
exports.extPosDataSchema = {
    flags: { type: "UInt8", length: 1 },
    VDOP: { type: "UInt16LE", length: 2, flag: "VFE" }, // VDOP (Vertical Dilution of Precision)
    HDOP: { type: "UInt16LE", length: 2, flag: "HFE" }, // HDOP (Horizontal Dilution of Precision)
    PDOP: { type: "UInt16LE", length: 2, flag: "PFE" }, // PDOP (Position Dilution of Precision)
    SAT: { type: "UInt8", length: 1, flag: "SFE" }, // SAT (Satellites)
    NS: { type: "UInt16LE", length: 2, flag: "NSFE" }, // NS (Navigation System)
};
// ABS_AN_SENS_DATA
exports.absAnSensDataFlagsSchema = {
    ASN: { type: "UInt8", length: 1 }, // ASN (Analog Sensor Number) - номер аналогового входа
    ASV: { type: "Binary", length: 3 }, // ASV (Analog Sensor Value) - значение показаний аналогового входа
};
