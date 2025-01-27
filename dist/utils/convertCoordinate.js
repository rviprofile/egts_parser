"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLat = convertLat;
exports.convertLong = convertLong;
// Преобразование широты
function convertLat({ latitude }) {
    const MAX_UINT32 = 0xffffffff;
    const latDegrees = (latitude / MAX_UINT32) * 90;
    return latDegrees;
}
// Преобразование долготы
function convertLong({ longitude }) {
    const MAX_UINT32 = 0xffffffff;
    const longDegrees = (longitude / MAX_UINT32) * 180;
    return longDegrees;
}
