"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = createCommand;
const crc8_1 = require("../../utils/crc8");
const crc16_1 = require("../../utils/crc16");
function createCommand({ socket, trackers }) {
    function createFleetDoutOnCommand(outputs) {
        const commandCode = 0x0009; // Код команды EGTS_FLEET_DOUT_ON
        const commandBuffer = Buffer.alloc(4); // 4 байта для кода команды и данных
        commandBuffer.writeUInt16BE(commandCode, 0); // Записываем код команды
        commandBuffer.writeUInt16BE(outputs, 2); // Записываем битовое поле выходов
        return commandBuffer;
    }
    const protocolVersion = 1; // Версия протокола EGTS
    const headerLength = 11; // Длина заголовка с CRC8
    const packetType = 1; // EGTS_PT_APPDATA
    const tracker = trackers.get(socket);
    const sdr1 = Buffer.alloc(28);
    let sdr1_offset = 0;
    sdr1.writeUInt16LE(17, sdr1_offset); // RL (Record Length) - параметр определяет размер данных из поля RD;
    sdr1_offset += 2;
    sdr1.writeUInt16LE(0, sdr1_offset); // RN (Record Number)
    sdr1_offset += 2;
    sdr1.writeUInt8(0b01000000, sdr1_offset++); // RFL (Record Flags) - Устанавливаем RSOD в 1, остальные флаги в 0
    sdr1.writeUInt8(3, sdr1_offset++); // SST (Source Service Type) - EGTS_COMMANDS_SERVICE
    sdr1.writeUInt8(3, sdr1_offset++); // RST (Recipient Service Type) - EGTS_COMMANDS_SERVICE
    sdr1.writeUInt8(51, sdr1_offset++); // SRT (Subrecord Type) - EGTS_SR_COMMAND_DATA
    sdr1.writeUInt16LE(14, sdr1_offset); // SRL (Subrecord Length)
    sdr1_offset += 2;
    sdr1.writeUInt8(0b01010000, sdr1_offset++); // CT (Command Type) and CCT (Command Confirmation Type)
    sdr1.writeUInt32LE(1, sdr1_offset); // CID (Command Identifier)
    sdr1_offset += 4;
    sdr1.writeUInt32LE(0, sdr1_offset); // SID (Source Identifier)
    sdr1_offset += 4;
    sdr1.writeUInt8(0, sdr1_offset++); // ACFE and CHSFE
    sdr1.writeUInt8(1, sdr1_offset++); // ACL (Authorization Code Length)
    sdr1.writeUInt16LE(1234, sdr1_offset); // AC
    sdr1_offset += 2;
    const CCD = createFleetDoutOnCommand(0b11); // CCD (Command Code) - EGTS_FLEET_GET_STATE
    sdr1.set(CCD, sdr1_offset); // Запись CCD в sdr1
    const sfrd = sdr1; //  SFRD - структура данных, зависящая от типа пакета и содержащая информацию протокола уровня поддержки услуг.
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
