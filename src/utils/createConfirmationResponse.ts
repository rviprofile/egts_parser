import { EGTS_PT_APPDATA, EGTS_PT_RESPONSE } from "../constants";
import { CRC16 } from "./crc16";
import { CRC8 } from "./crc8";

export interface Packet {
  ProtocolVersion: number;
  SecurityKeyID: number;
  PRF: string;
  RTE: string;
  ENA: string;
  CMP: string;
  PR: string;

  HeaderLength: number;
  HeaderEncoding: number;
  FrameDataLength: number;
  PacketID: number;
  PacketType: number;
  HeaderCheckSum: number;

  ServicesFrameData?: Buffer;
  ServicesFrameDataCheckSum?: number;
}

/**
 * ---------- 1. Разбор входящего пакета ----------
 */
export function readPacket(buffer: Buffer): Packet {
  const p: Packet = {
    ProtocolVersion: buffer.readUInt8(0),
    SecurityKeyID: buffer.readUInt8(1),
    PRF: "",
    RTE: "",
    ENA: "",
    CMP: "",
    PR: "",
    HeaderLength: 0,
    HeaderEncoding: 0,
    FrameDataLength: 0,
    PacketID: 0,
    PacketType: 0,
    HeaderCheckSum: 0,
  };

  const flags = buffer.readUInt8(2);
  const bits = flags.toString(2).padStart(8, "0");

  p.PRF = bits.slice(0, 2);
  p.RTE = bits.slice(2, 3);
  p.ENA = bits.slice(3, 5);
  p.CMP = bits.slice(5, 6);
  p.PR = bits.slice(6, 8);

  p.HeaderLength = buffer.readUInt8(3);
  p.HeaderEncoding = buffer.readUInt8(4);
  p.FrameDataLength = buffer.readUInt16LE(5);
  p.PacketID = buffer.readUInt16LE(7);
  p.PacketType = buffer.readUInt8(9);
  p.HeaderCheckSum = buffer.readUInt8(10);

  // Проверка CRC8
  const hcsCalc = CRC8(buffer.subarray(0, p.HeaderLength - 1));
  if (hcsCalc !== p.HeaderCheckSum) {
    throw new Error(`Header CRC mismatch: ${hcsCalc} != ${p.HeaderCheckSum}`);
  }

  // SFRD
  const start = p.HeaderLength;
  const end = start + p.FrameDataLength;

  p.ServicesFrameData = buffer.subarray(start, end);
  p.ServicesFrameDataCheckSum = buffer.readUInt16LE(end);

  // CRC16
  const dataCrc = CRC16(p.ServicesFrameData);
  if (dataCrc !== p.ServicesFrameDataCheckSum) {
    throw new Error(
      `Data CRC mismatch: ${dataCrc} != ${p.ServicesFrameDataCheckSum}`
    );
  }

  return p;
}

/**
 * ---------- 2. Кодирование ответа ----------
 */
export function encodePacket(p: Packet): Buffer {
  const header: number[] = [];

  header.push(p.ProtocolVersion);
  header.push(p.SecurityKeyID);

  const flagBits = p.PRF + p.RTE + p.ENA + p.CMP + p.PR;
  header.push(parseInt(flagBits, 2));

  header.push(p.HeaderLength);
  header.push(p.HeaderEncoding);

  const fdl = Buffer.alloc(2);
  fdl.writeUInt16LE(p.FrameDataLength);
  header.push(...fdl);

  const pid = Buffer.alloc(2);
  pid.writeUInt16LE(p.PacketID);
  header.push(...pid);

  header.push(p.PacketType);

  const hcs = CRC8(Buffer.from(header));
  header.push(hcs);

  const sfrd = p.ServicesFrameData ?? Buffer.alloc(0);
  const sfrcs = Buffer.alloc(2);
  sfrcs.writeUInt16LE(CRC16(sfrd));

  return Buffer.concat([Buffer.from(header), sfrd, sfrcs]);
}

/**
 * ---------- 3. Формирование ответа на APPDATA ----------
 * сюда передаёшь правильный RECORD_ID (если он у тебя есть извне)
 */
export function createAppdataConfirmation(
  recordId: number,
  responsePid: number
): Buffer {
  // 3 байта — RPID + ProcessingResult
  const body = Buffer.alloc(3);
  body.writeUInt16LE(recordId, 0);
  body.writeUInt8(0, 2); // EGTS_PC_OK

  const p: Packet = {
    ProtocolVersion: 1,
    SecurityKeyID: 0,
    PRF: "00",
    RTE: "0",
    ENA: "00",
    CMP: "0",
    PR: "11",

    HeaderLength: 11,
    HeaderEncoding: 0,
    FrameDataLength: body.length,
    PacketID: responsePid,
    PacketType: EGTS_PT_RESPONSE,
    HeaderCheckSum: 0,

    ServicesFrameData: body,
  };

  return encodePacket(p);
}

/**
 * ---------- 4. Универсальная функция ----------
 * ты даёшь ему буфер от трекера → он даёт готовый буфер-ответ
 */
export function handleConfirmation(
  buffer: Buffer,
  responsePid: number
): Buffer | null {
  const pkt = readPacket(buffer);

  // Если пакет — APPDATA, формируем подтверждение
  if (pkt.PacketType === EGTS_PT_APPDATA) {
    return createAppdataConfirmation(buffer.readUInt16LE(7), responsePid);
  }

  // на другие типы пакетов можно возвращать null или другое поведение
  return null;
}
