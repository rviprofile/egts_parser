import { CRC8 } from "../../utils/crc8";
import { CRC16 } from "../../utils/crc16";
import { EGTS_COMMANDS_SERVICE, EGTS_PT_APPDATA } from "../../constants";

/** AC (Authorization Code) */
const acBuffer = Buffer.from([0x04, 0xd2]);

export function createCommand({
  tracker,
  address,
  act,
  command_code,
  data,
}): Buffer {
  function createCommandData({
    address,
    act = 0,
    ccd,
    data,
    size = 0,
  }: {
    address: number;
    act?: number;
    ccd: number;
    data?: Buffer;
    size?: number;
  }): Buffer {
    // Вычисляем SZ/ACT байт
    // SZ занимает биты 2..7, ACT — биты 0..1
    const SZ = act === 3 ? size : 0;
    const SZ_ACT = (SZ << 2) | (act & 0b11);

    // DT требуется только при ACT 2 и 3
    const DT = (act === 2 || act === 3) && data ? data : Buffer.alloc(0);

    let commandDataBuffer: Buffer = Buffer.alloc(2 + 1 + 2 + DT.length);
    let command_offset = 0;
    /**
     * ADR (Address) - адрес модуля, для которого данная команда предназначена. Адрес
     * определяют, исходя из начальной конфигурации АСН или из списка модулей, который
     * может быть получен при регистрации терминала через сервис EGTS_AUTH_SERVICE и
     * передачи подзаписей EGTS_SR_MODULE_DATA
     */
    commandDataBuffer.writeUInt16LE(address, command_offset);
    command_offset += 2;
    /**
     * SZ (Size) - объем памяти для параметра (используется совместно с действием ACT=3).
     * При добавлении нового параметра в АСН, данное поле определяет, что для нового
     * параметра требуется 2(SZ) байт памяти в АСН и ACT (Action)
     *
     * ACT (Action) - описание действия, используемое в случае типа команды
     * (поле CT = T_COM подзаписи EGTS_SR_COMMAND_DATA).
     * 0 - параметры передаваемой команды, которая задается кодом из поля CCD,
     * 1 - запрос значения. Используется для запроса информации, хранящейся в АСН.
     * Запрашиваемый параметр определяется кодом из поля CCD,
     * 2 - установка значения. Используется для установки нового значения определенному
     * параметру в АСН. Устанавливаемый параметр определяется кодом из поля CCD, а его значение полем DT,
     * 3 - добавление нового параметра в АСН. Код нового параметра указывается в поле CCD,
     * его тип в поле SZ, а значение в поле DT,
     * 4 - удаление имеющегося параметра из АСН. Код удаляемого параметра указывается в поле CCD.
     */
    commandDataBuffer.writeUInt8(SZ_ACT, command_offset++);
    /** CCD (Command Code) - код команды при ACT=0 */
    const ccdBuffer = Buffer.isBuffer(ccd)
      ? ccd
      : Buffer.from([ccd & 0xff, (ccd >> 8) & 0xff]);
    ccdBuffer.copy(commandDataBuffer, command_offset);
    command_offset += ccdBuffer.length;

    DT.copy(commandDataBuffer, command_offset);
    return commandDataBuffer;
  }

  /** CD (Command Data) - тело команды */
  const CD = createCommandData({
    address,
    ccd: command_code,
    data,
    act,
  });

  /** SRD (Subrecord Data) */
  const srd = createSrCommandData({ CD });

  /**
   * RD (Record Data) - поле, содержащее информацию, присущую определенному типу
   * сервиса (одну или несколько подзаписей сервиса типа, указанного в поле SST или RST, в
   * зависимости от вида предаваемой информации)
   */
  const rd: Buffer = Buffer.alloc(1 + 2 + srd.length);
  let rd_offset = 0;

  /** SRT (Subrecord Type) - EGTS_SR_COMMAND_DATA */
  rd.writeUInt8(51, rd_offset++);
  /** SRL (Subrecord Length) */
  rd.writeUInt16LE(srd.length, rd_offset);
  rd_offset += 2;

  // Копируем SRD внутрь RD
  srd.copy(rd, rd_offset);

  /** SFRD для пакета типа EGTS_PT_APPDATA */
  const sfrd = createSDR({
    RD: rd,
    tracker,
  }); //  SFRD - структура данных, зависящая от типа пакета и содержащая информацию протокола уровня поддержки услуг.

  /** Финальный пакет */
  return createPacket({ sfrd, tracker });
}

const createPacket = ({
  sfrd,
  tracker,
}: {
  sfrd: Buffer;
  tracker: { PID: number };
}): Buffer => {
  /** PRV (Protocol Version) — содержит значение 0x01*/
  const protocolVersion = 1;
  /** HL (Header Length) — Длина заголовка с CRC8 */
  const headerLength = 11;
  /** PT (Packet Type) */
  const packetType = EGTS_PT_APPDATA;

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

  /** SFRCS (Services Frame Data Check Sum) — Контрольная сумма данных */
  const SFRCS = Buffer.alloc(2);
  SFRCS.writeUInt16LE(CRC16(sfrd), 0);

  /** SFRD с добавленной контрольной суммой */
  const sfrdWithCRC16 = Buffer.concat([sfrd, SFRCS]);

  const packet: Buffer = Buffer.concat([header, sfrdWithCRC16]);

  return packet;
};

const createSDR = ({
  RD,
  tracker,
}: {
  RD: Buffer;
  tracker: { RN: number };
}): Buffer => {
  const sdrLength = 2 + 2 + 1 + 1 + 1 + RD.length; // RL + RN + RFL + SST + RST + RD
  /** SDR (Service Data Record) */
  const sdr = Buffer.alloc(sdrLength);
  let sdr_offset = 0;

  /** RL (Record Length) - параметр определяет размер данных из поля RD */
  sdr.writeUInt16LE(RD.length, sdr_offset);
  sdr_offset += 2;

  /** RN (Record Number) */
  sdr.writeUInt16LE(tracker.RN, sdr_offset);
  tracker.RN = (tracker.RN + 1) % 65536;
  sdr_offset += 2;

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
  sdr.writeUInt8(0b01000000, sdr_offset++);
  /** SST (Source Service Type) */
  sdr.writeUInt8(EGTS_COMMANDS_SERVICE, sdr_offset++);
  /** RST (Recipient Service Type) */
  sdr.writeUInt8(EGTS_COMMANDS_SERVICE, sdr_offset++);

  RD.copy(sdr, sdr_offset); // вставляем RD внутрь
  return sdr;
};

/** Подзапись EGTS_SR_COMMAND_DATA сервиса EGTS_COMMANDS_SERVICE */
const createSrCommandData = ({ CD }: { CD: Buffer }): Buffer => {
  const srCommandData: Buffer = Buffer.alloc(12 + 2 + CD.length);
  let srCommandData_offset = 0;
  /**
   * CT (Command Type) и CCT (Command Confirmation Type)
   *
   * 0101 = CT_COM - команда для выполнения на АСН,
   * 0000 = CC_OK - успешное выполнение, положительный ответ (не имеет смысла при CT_COM)
   */
  srCommandData.writeUInt8(0x0a, srCommandData_offset++);
  srCommandData.writeUInt8(0x00, srCommandData_offset++);

  /** CID (Command Identifier) —  идентификатор команды, сообщения. */
  srCommandData.writeUInt32LE(0, srCommandData_offset);
  srCommandData_offset += 4;

  /** SID (Source Identifier) — идентификатор отправителя */
  srCommandData.writeUInt32LE(0, srCommandData_offset);
  srCommandData_offset += 4;

  /**
   * ACFE + CHSFE
   * bit1 = ACFE = 1 (есть ACL и AC)
   * bit0 = CHSFE = 0 (CHS отсутствует)
   * → 0b00000010 = 0x02
   */
  srCommandData.writeUInt8(0x02, srCommandData_offset++);

  /** ACL (Authorization Code Length) — длина поля AC в байтах */
  srCommandData.writeUInt8(acBuffer.length, srCommandData_offset++);

  /** AC (Authorization Code) */
  acBuffer.copy(srCommandData, srCommandData_offset);
  srCommandData_offset += acBuffer.length;

  // Вставляем CD внутрь
  CD.copy(srCommandData, srCommandData_offset);

  return srCommandData;
};
