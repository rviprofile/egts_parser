import { CRC8 } from "../../utils/crc8";
import { CRC16 } from "../../utils/crc16";

/** 
 * Функция для создания ответа об успешной авторизации с разрешенным сервисом 
 */
export function createAuthSuccessMessage({ socket, trackers }) {
  const protocolVersion = 1; // Версия протокола EGTS
  const headerLength = 11; // Длина заголовка с CRC8
  const packetType = 1; // EGTS_PT_APPDATA
  const tracker = trackers.get(socket);

  const sdr1 = Buffer.alloc(11);
  let sdr1_offset = 0;
  sdr1.writeUInt16LE(4, sdr1_offset); // RL (Record Length) - параметр определяет размер данных из поля RD;
  sdr1_offset += 2;
  sdr1.writeUInt16LE(0, sdr1_offset); // RN (Record Number)
  sdr1_offset += 2;
  sdr1.writeUInt8(0b01000000, sdr1_offset++); // RFL (Record Flags) - Устанавливаем RSOD в 1, остальные флаги в 0
  sdr1.writeUInt8(1, sdr1_offset++); // SST (Source Service Type) - EGTS_AUTH_SERVICE
  sdr1.writeUInt8(1, sdr1_offset++); // RST (Recipient Service Type) - EGTS_AUTH_SERVICE

  sdr1.writeUInt8(9, sdr1_offset++); // SRT (Subrecord Type) - EGTS_SR_RESULT_CODE
  sdr1.writeUInt16LE(1, sdr1_offset); // SRL (Subrecord Length)
  sdr1_offset += 2;
  sdr1.writeUInt8(0, sdr1_offset++); // RCD (Result Code) - EGTS_PC_OK

  const sdr2 = Buffer.alloc(19);
  let sdr2_offset = 0;
  sdr2.writeUInt16LE(12, sdr2_offset); // RL (Record Length) - параметр определяет размер данных из поля RD;
  sdr2_offset += 2;
  sdr2.writeUInt16LE(tracker.RN, sdr2_offset); // RN (Record Number)
  tracker.RN = (tracker.RN + 1) % 65536;
  sdr2_offset += 2;
  sdr1.writeUInt8(0b01000000, sdr2_offset++); // RFL (Record Flags) - Устанавливаем RSOD в 1, остальные флаги в 0
  sdr2.writeUInt8(1, sdr2_offset++); // SST (Source Service Type) - EGTS_AUTH_SERVICE
  sdr2.writeUInt8(1, sdr2_offset++); // RST (Recipient Service Type) - EGTS_AUTH_SERVICE
  sdr2.writeUInt8(8, sdr2_offset++); // SRT (Subrecord Type) - EGTS_SR_SERVICE_INFO
  sdr2.writeUInt16LE(3, sdr2_offset); // SRL (Subrecord Length)
  sdr2_offset += 2;
  sdr2.writeUInt8(2, sdr2_offset++); // ST (Service Type) - EGTS_TELEDATA_SERVICE
  sdr2.writeUInt8(0, sdr2_offset++); // SST (Service Statement) - EGTS_SST_IN_SERVICE
  sdr2.writeUInt8(0, sdr2_offset++); // SRVP (Service Parameters)

  sdr2.writeUInt8(8, sdr2_offset++); // SRT (Subrecord Type) - EGTS_SR_SERVICE_INFO
  sdr2.writeUInt16LE(3, sdr2_offset); // SRL (Subrecord Length)
  sdr2_offset += 2;
  sdr2.writeUInt8(3, sdr2_offset++); // ST (Service Type) - EGTS_COMMANDS_SERVICE
  sdr2.writeUInt8(0, sdr2_offset++); // SST (Service Statement) - EGTS_SST_IN_SERVICE
  sdr2.writeUInt8(0, sdr2_offset++); // SRVP (Service Parameters)

  const sfrd = Buffer.concat([sdr1, sdr2]); //  SFRD - структура данных, зависящая от типа пакета и содержащая информацию протокола уровня поддержки услуг.
  const SFRCS = Buffer.alloc(2);
  SFRCS.writeUInt16LE(CRC16(sfrd), 0);

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
  const headerCRC8 = CRC8(header.subarray(0, headerLength - 1));
  header.writeUInt8(headerCRC8, header_offset); // Поле HCS - контрольная сумма заголовка Транспортного уровня (начиная с поля "PRV" до поля "HCS", не включая поле "HCS")

  // Формируем финальный пакет
  const packet = Buffer.concat([header, sfrdWithCRC16]);

  return packet;
}

// 1	PRV (Protocol Version)	                        1
// 1	SKID (Security Key ID)	                        0
// 1	PRF, RTE, ENA, CMP, PR	                        0
// 1	HL (Header Length)	                            11
// 1	HE (Header Encoding)	                          0
// 2	FDL (Frame Data Length)	                        11
// 2	PID (Packet Identifier)	                        0
// 1	PT (Packet Type)	                              1 - EGTS_PT_APPDATA
// 1	HCS	crc8(0, 11)
// 	SFRD (Services Frame Data)
// 	SDR 1 (Services Data Record)
// 2	RL (Record Length)	                            4
// 2	RN (Record Number) 	                            0
// 1	RFL (Record Flags)	                            0b01000000 -  RSOD = 1, остальные 0
// 1	SST (Source Service Type) 	                    1 - EGTS_AUTH_SERVICE
// 1	RST (Recipient Service Type) 	                  1 - EGTS_AUTH_SERVICE
// 	RD (Record Data)
// 1	SRT (Subrecord Type)	                          9 - EGTS_SR_RESULT_CODE
// 2	SRL (Subrecord Length)	                        1
// 	SRD (Subrecord Data)
// 1	RCD (Result Code)	                              0 - EGTS_PC_OK
// 	SDR 2 (Services Data Record)
// 2	RL (Record Length)	                            5
// 2	RN (Record Number) 	                            1
// 1	RFL (Record Flags)	                            0b01000000 -  RSOD = 1, остальные 0
// 1	SST (Source Service Type) 	                    1 - EGTS_AUTH_SERVICE
// 1	RST (Recipient Service Type) 	                  1 - EGTS_AUTH_SERVICE
// 	RD (Record Data)
// 1	SRT (Subrecord Type)	                          8 - EGTS_SR_SERVICE_INFO
// 2	SRL (Subrecord Length)	                        1
// 	SRD (Subrecord Data)
// 1	ST (Service Type)	                              2 - EGTS_TELEDATA_SERVICE
// 1	SST (Service Statement)	                        0 - EGTS_SST_IN_SERVICE
// 1	SRVP (Service Parameters)	                      0
// 1	SFRCS (Services Frame Data Check Sum) 	        crc16(SFRD.subarray(0, 3))
