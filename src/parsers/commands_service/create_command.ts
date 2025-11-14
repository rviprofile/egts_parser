import { CRC8 } from "../../utils/crc8";
import { CRC16 } from "../../utils/crc16";
import { EGTS_COMMANDS_SERVICE, EGTS_PT_APPDATA } from "../../constants";

export function createBlockEngineCommand({ socket, trackers }) {
  function createFleetDoutOffCommand(outputs: number): Buffer {
    const commandCode = 0x000a; // Код команды EGTS_FLEET_DOUT_OFF
    const commandBuffer = Buffer.alloc(4); // 4 байта (2 на код, 2 на параметр)

    commandBuffer.writeUInt16BE(commandCode, 0); // Код команды
    commandBuffer.writeUInt16BE(outputs, 2); // Битовое поле выходов

    return commandBuffer;
  }
  /** PRV (Protocol Version) — содержит значение 0x01*/
  const protocolVersion = 1;
  /** HL (Header Length) — Длина заголовка с CRC8 */
  const headerLength = 11;
  /** PT (Packet Type) */
  const packetType = EGTS_PT_APPDATA;
  /** Подключенный трекер */
  const tracker = trackers.get(socket);
  /** AC (Authorization Code) */
  const AuthCode = 1234;

  /** SDR 1 (Service Data Record) */
  const sdr1 = Buffer.alloc(47);
  let sdr1_offset = 0;

  /** RL (Record Length) - параметр определяет размер данных из поля RD */
  sdr1.writeUInt16LE(21, sdr1_offset);
  sdr1_offset += 2;

  /** RN (Record Number) */
  sdr1.writeUInt16LE(tracker.RN, sdr1_offset);
  tracker.RN = (tracker.RN + 1) % 65536;
  sdr1_offset += 2;

  /**
   * RFL (Record Flags) - Устанавливаем RSOD в 1, остальные флаги в 0
   *
   * SSOD — 0 - сервис-отправитель расположен на авторизующей ТП.
   * RSOD — 1 - сервис-получатель расположен на стороне АСН (авторизуемой ТП).
   * GRP — 0 - принадлежность группе отсутствует.
   * RPP — 00 - наивысший.
   * TMFE — 0 - поле TM отсутствует.
   * EVFE — 0 - поле EVID отсутствует.
   * OBFE — 0 - поле OID отсутствует.
   */
  sdr1.writeUInt8(0b01000000, sdr1_offset++);

  /** SST (Source Service Type) */
  sdr1.writeUInt8(EGTS_COMMANDS_SERVICE, sdr1_offset++);
  /** RST (Recipient Service Type) */
  sdr1.writeUInt8(EGTS_COMMANDS_SERVICE, sdr1_offset++);

  /** SRT (Subrecord Type) - EGTS_SR_COMMAND_DATA */
  sdr1.writeUInt8(51, sdr1_offset++);
  /** SRL (Subrecord Length) */
  sdr1.writeUInt16LE(18, sdr1_offset);
  sdr1_offset += 2;

  // SRD (Subrecord Data)
  // Подзапись EGTS_SR_COMMAND_DATA сервиса EGTS_COMMANDS_SERVICE

  /**
   * CT (Command Type) и CCT (Command Confirmation Type)
   *
   * 0101 = CT_COM - команда для выполнения на АСН,
   * 0000 = CC_OK - успешное выполнение, положительный ответ (не имеет смысла при CT_COM)
   */
  sdr1.writeUInt8(0x0a, sdr1_offset++);
  sdr1.writeUInt8(0x00, sdr1_offset++);

  /** CID (Command Identifier) —  идентификатор команды, сообщения. */
  sdr1.writeUInt32LE(0, sdr1_offset);
  sdr1_offset += 4;

  /** SID (Source Identifier) — идентификатор отправителя */
  sdr1.writeUInt32LE(0, sdr1_offset);
  sdr1_offset += 4;

  /**
   * ACFE and CHSFE
   * 0 = поля ACL и AC отсутствуют в подзаписи
   * 0 = поле CHS отсутствует в подзаписи.
   */
  sdr1.writeUInt8(0, sdr1_offset++);

  /** ACL (Authorization Code Length) */
  sdr1.writeUInt8(2, sdr1_offset++);

  /** AC (Authorization Code) */
  const ACBuffer = Buffer.alloc(2);
  ACBuffer.writeUInt16BE(AuthCode, 0); // или UInt16LE в зависимости от протокола
  sdr1.set(ACBuffer, sdr1_offset);
  sdr1_offset += ACBuffer.length;

  /** CD (Command Data) - тело команды */
  const CCD = createFleetDoutOffCommand(0b0001);
  sdr1.set(CCD, sdr1_offset);
  sdr1_offset += CCD.length;

  /** SFRD для пакета типа EGTS_PT_APPDATA */
  const sfrd = sdr1; //  SFRD - структура данных, зависящая от типа пакета и содержащая информацию протокола уровня поддержки услуг.
  /** SFRCS (Services Frame Data Check Sum) */
  const SFRCS = Buffer.alloc(2);
  SFRCS.writeUInt16LE(CRC16(sfrd), 0);

  /** SFRD с добавленной контрольной суммой */
  const sfrdWithCRC16 = Buffer.concat([sfrd, SFRCS]);

  /** Заголовок пакета, первые 11 байт */
  const header = Buffer.alloc(headerLength);
  /** Текущее смещение в заголовке */
  let header_offset = 0;
  /** PRV (Protocol Version) */
  header.writeUInt8(protocolVersion, header_offset++);
  /** SKID (Security Key ID) */
  header.writeUInt8(0, header_offset++);
  /** Флаги (PRF, RTE, ENA, CMP, PR) — все 0 */
  header.writeUInt8(0, header_offset++);
  /** HL (Header Length) - длина заголовка транспортного уровня в байтах с учетом байта контрольной суммы (поля HCS). */
  header.writeUInt8(headerLength, header_offset++);
  /** HE (Header Encoding) */
  header.writeUInt8(0, header_offset++);
  /** FDL (Frame Data Length) - размер в байтах поля данных SFRD, содержащего информацию протокола уровня поддержки услуг. */
  header.writeUInt16LE(sfrd.length, header_offset);
  header_offset += 2;
  /** PID (Packet Identifier) - Cчетик отправленных пакетов, начиная с 0 до 65535 */
  header.writeUInt16LE(tracker.PID, header_offset);
  header_offset += 2;
  /** PT (Packet Type) - тип пакета транспортного уровня. */
  header.writeUInt8(packetType, header_offset++);

  /** HCS (Header Check Sum) — Контрольная сумма заголовка */
  const headerCRC8 = CRC8(header.subarray(0, headerLength - 1));
  header.writeUInt8(headerCRC8, header_offset);

  /** Финальный пакет из заголовка и данных */
  const packet = Buffer.concat([header, sfrdWithCRC16]);

  return packet;
}
