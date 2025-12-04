import { EGTS_PT_APPDATA, EGTS_PT_RESPONSE } from "../constants";
import { CRC16 } from "./crc16";
import { CRC8 } from "./crc8";

export interface Packet {
  ProtocolVersion: number;
  SecurityKeyID: number;
  Flags: number;
  HeaderLength: number;
  HeaderEncoding: number;
  FrameDataLength: number;
  PacketID: number;
  PacketType: number;
  HeaderCheckSum: number;

  ServicesFrameData?: Buffer;
  ServicesFrameDataCheckSum?: number;
}

/* --------------------------------------------------------
 * 1. Разбор входящего пакета EGTS
 * ------------------------------------------------------*/
export function readPacket(buffer: Buffer): Packet {
  const p: Packet = {
    ProtocolVersion: buffer.readUInt8(0),
    SecurityKeyID: buffer.readUInt8(1),
    Flags: buffer.readUInt8(2),
    HeaderLength: buffer.readUInt8(3),
    HeaderEncoding: buffer.readUInt8(4),
    FrameDataLength: buffer.readUInt16LE(5),
    PacketID: buffer.readUInt16LE(7),
    PacketType: buffer.readUInt8(9),
    HeaderCheckSum: buffer.readUInt8(10),
  };

  // ---- CRC8 (HCS) ----
  const hcsCalc = CRC8(buffer.subarray(0, p.HeaderLength - 1));
  if (hcsCalc !== p.HeaderCheckSum) {
    throw new Error(`Header CRC mismatch: ${hcsCalc} != ${p.HeaderCheckSum}`);
  }

  // ---- CRC16 ----
  const start = p.HeaderLength;
  const end = start + p.FrameDataLength;

  p.ServicesFrameData = buffer.subarray(start, end);
  p.ServicesFrameDataCheckSum = buffer.readUInt16LE(end);

  const dataCrc = CRC16(p.ServicesFrameData);
  if (dataCrc !== p.ServicesFrameDataCheckSum) {
    throw new Error(
      `Data CRC mismatch: ${dataCrc} != ${p.ServicesFrameDataCheckSum}`
    );
  }

  return p;
}

/* --------------------------------------------------------
 * 2. Кодирование нового EGTS пакета
 * ------------------------------------------------------*/
export function encodePacket(p: Packet): Buffer {
  const header: number[] = [];

  header.push(p.ProtocolVersion);
  header.push(p.SecurityKeyID);
  header.push(p.Flags);
  header.push(p.HeaderLength);
  header.push(p.HeaderEncoding);

  const fdl = Buffer.alloc(2);
  fdl.writeUInt16LE(p.FrameDataLength);
  header.push(...fdl);

  const pid = Buffer.alloc(2);
  pid.writeUInt16LE(p.PacketID);
  header.push(...pid);

  header.push(p.PacketType);

  // ----- CRC8 -----
  const hcs = CRC8(Buffer.from(header));
  header.push(hcs);

  // Body + CRC16
  const sfrd = p.ServicesFrameData ?? Buffer.alloc(0);
  const sfrcs = Buffer.alloc(2);
  sfrcs.writeUInt16LE(CRC16(sfrd));

  return Buffer.concat([Buffer.from(header), sfrd, sfrcs]);
}

/* --------------------------------------------------------
 * 3. Формирование RESPONSE на один Record
 * ------------------------------------------------------*/
export function createRecordResponse(
  recordNumber: number,
  myPid: number
): Buffer {
  const body = Buffer.alloc(3);
  body.writeUInt16LE(recordNumber, 0); // RPID
  body.writeUInt8(0, 2); // EGTS_PC_OK

  const p: Packet = {
    ProtocolVersion: 1,
    SecurityKeyID: 0,
    Flags: parseInt("00110000", 2),
    HeaderLength: 11,
    HeaderEncoding: 0,
    FrameDataLength: body.length,
    PacketID: myPid,
    PacketType: EGTS_PT_RESPONSE,
    HeaderCheckSum: 0,
    ServicesFrameData: body,
  };

  return encodePacket(p);
}

/* --------------------------------------------------------
 * 4. Универсальная функция подтверждения APPDATA
 * ------------------------------------------------------*/
export function handleConfirmation(
  buffer: Buffer,
  myPid: number
): Buffer | null {
  const pkt = readPacket(buffer);

  if (pkt.PacketType !== EGTS_PT_APPDATA || !pkt.ServicesFrameData) return null;

  const records: Buffer[] = [];
  let offset = 0;

  // Проходим по всем SFRD записям
  while (offset < pkt.ServicesFrameData.length) {
    const rl = pkt.ServicesFrameData.readUInt8(offset); // Record Length
    const rn = pkt.ServicesFrameData.readUInt8(offset + 1); // Record Number (RN)
    records.push(createRecordResponse(rn, myPid));
    offset += rl;
  }

  return Buffer.concat(records);
}
