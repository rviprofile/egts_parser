"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGTS_FLEET_ODOM_CLEAR = exports.EGTS_FLEET_GET_STATE = exports.EGTS_FLEET_GET_CIN_DATA = exports.EGTS_FLEET_GET_LIN_DATA = exports.EGTS_FLEET_GET_SENSORS_DATA = exports.EGTS_FLEET_GET_POS_DATA = exports.EGTS_FLEET_GET_DOUT_DATA = exports.EGTS_FLEET_DOUT_OFF = exports.EGTS_FLEET_DOUT_ON = void 0;
// Список команд для АСН
exports.EGTS_FLEET_DOUT_ON = { code: 0x0009, type: "UInt16LE" }; // Активация дискретных выходов
exports.EGTS_FLEET_DOUT_OFF = { code: 0x000a, type: "UInt16LE" }; // Деактивация дискретных выходов
exports.EGTS_FLEET_GET_DOUT_DATA = { code: 0x000b }; // Запрос состояния дискретных выходов
exports.EGTS_FLEET_GET_POS_DATA = { code: 0x000c }; // Запрос текущих данных местоположения
exports.EGTS_FLEET_GET_SENSORS_DATA = { code: 0x000d }; // Запрос состояния дискретных и аналоговых входов
exports.EGTS_FLEET_GET_LIN_DATA = { code: 0x000e }; // Запрос состояния шлейфовых входов
exports.EGTS_FLEET_GET_CIN_DATA = { code: 0x000f }; // Запрос состояния счетных входов
exports.EGTS_FLEET_GET_STATE = { code: 0x0010 }; // Запрос состояния АСН
exports.EGTS_FLEET_ODOM_CLEAR = { code: 0x0011 }; // Команда для обнуления показаний внутреннего одометра АСН
