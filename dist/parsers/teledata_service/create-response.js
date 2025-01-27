"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeleDataResponse = createTeleDataResponse;
const crc8_1 = require("../../utils/crc8");
const crc16_1 = require("../../utils/crc16");
// Функция для сбора подтверждения на сообщение
function createTeleDataResponse({ socket, trackers, pid }) {
    const protocolVersion = 1; // Версия протокола EGTS
    const headerLength = 11; // Длина заголовка с CRC8
    const packetType = 0; // EGTS_PT_RESPONSE
    const tracker = trackers.get(socket);
    const sdr1 = Buffer.alloc(3);
    let sdr1_offset = 0;
    sdr1.writeUInt16LE(pid, sdr1_offset); // RPID (Response Packet ID) - на какой пакет отвечаем
    sdr1_offset += 2;
    sdr1.writeUInt8(0, sdr1_offset++); // PR (Processing Result) - Результат обработки - EGTS_PC_OK
    const sdr2 = Buffer.alloc(6);
    let sdr2_offset = 0;
    sdr2.writeUInt8(0, sdr2_offset++); // SRT (Subrecord Type)
    sdr2.writeUInt16LE(3, sdr2_offset); // SRL (Subrecord Length)
    sdr2_offset += 2;
    const SRD = Buffer.from([0x00, 0x00, 0x00]); // SRD (Subrecord Data)
    sdr2.set(SRD, sdr2_offset);
    const sfrd = Buffer.concat([sdr1, sdr2]); //  SFRD - структура данных, зависящая от типа пакета и содержащая информацию протокола уровня поддержки услуг.
    const SFRCS = Buffer.alloc(2);
    SFRCS.writeUInt16LE((0, crc16_1.CRC16)(sfrd), 0);
    const sfrdWithCRC16 = Buffer.concat([sfrd, SFRCS]);
    // Заголовок пакета
    const header = Buffer.alloc(headerLength);
    let header_offset = 0;
    header.writeUInt8(protocolVersion, header_offset++); // PRV (Protocol Version)
    header.writeUInt8(0, header_offset++); // SKID (Security Key ID)
    header.writeUInt8(0, header_offset++); // Флаги (PRF, RTE, ENA, CMP, PR)
    header.writeUInt8(headerLength, header_offset++); // HL (Header Length) - длина заголовка транспортного уровня в байтах с учетом байта контрольной суммы (поля HCS).
    header.writeUInt8(0, header_offset++); // HE (Header Encoding)
    header.writeUInt16LE(sfrd.length, header_offset); // FDL (Frame Data Length) - размер в байтах поля данных SFRD, содержащего информацию протокола уровня поддержки услуг.
    header_offset += 2;
    header.writeUInt16LE(tracker.PID, header_offset); // PID (Packet Identifier) - Cчетик отправленных записей, начиная с 0 до 65535
    header_offset += 2;
    header.writeUInt8(packetType, header_offset++); // PT (Packet Type) - тип пакета транспортного уровня.
    // Рассчитываем CRC8 для заголовка
    const headerCRC8 = (0, crc8_1.CRC8)(header.subarray(0, headerLength - 1));
    header.writeUInt8(headerCRC8, header_offset); // Поле HCS - контрольная сумма заголовка Транспортного уровня (начиная с поля "PRV" до поля "HCS", не включая поле "HCS")
    // Формируем финальный пакет
    const packet = Buffer.concat([header, sfrdWithCRC16]);
    return packet;
}
