import { EGTS_PT_APPDATA, EGTS_PT_RESPONSE } from "../constants";
import { CRC16 } from "./crc16";
import { CRC8 } from "./crc8";

/**
 * EGTS Packet structure
 */
export interface Packet {
  ProtocolVersion: number; // PRV
  SecurityKeyID: number; // SKID
  PRF: string; // Prefix
  RTE: string; // Route flag
  ENA: string; // Encryption
  CMP: string; // Compression
  PR: string; // Priority

  HeaderLength: number; // HL
  HeaderEncoding: number; // HE
  FrameDataLength: number; // FDL
  PacketID: number; // PID
  PacketType: number; // PT
  HeaderCheckSum: number; // HCS
  ServicesFrameData?: Buffer; // SFRD
  ServicesFrameDataCheckSum?: number; // SFRCS
}

/**
 * Read incoming EGTS packet
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

  // --- Flags ---
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

  // --- Читаем данные ---
  const sfrdStart = p.HeaderLength;
  const sfrdEnd = sfrdStart + p.FrameDataLength;
  p.ServicesFrameData = buffer.subarray(sfrdStart, sfrdEnd);

  p.ServicesFrameDataCheckSum = buffer.readUInt16LE(sfrdEnd);
  const sfrcsCalc = CRC16(p.ServicesFrameData);
  if (sfrcsCalc !== p.ServicesFrameDataCheckSum) {
    throw new Error(
      `Data CRC mismatch: ${sfrcsCalc} != ${p.ServicesFrameDataCheckSum}`
    );
  }

  return p;
}

/**
 * Encode EGTS_PT_RESPONSE packet
 */
export function encodePacket(p: Packet): Buffer {
  const header: number[] = [];

  header.push(p.ProtocolVersion);
  header.push(p.SecurityKeyID);

  // Flags
  const flagBits = p.PRF + p.RTE + p.ENA + p.CMP + p.PR;
  const flagByte = parseInt(flagBits, 2);
  header.push(flagByte);

  header.push(p.HeaderLength);
  header.push(p.HeaderEncoding);

  const fdl = Buffer.alloc(2);
  fdl.writeUInt16LE(p.FrameDataLength);
  header.push(...fdl);

  const pid = Buffer.alloc(2);
  pid.writeUInt16LE(p.PacketID);
  header.push(...pid);

  header.push(p.PacketType);

  // CRC8
  const hcs = CRC8(Buffer.from(header));
  header.push(hcs);

  const sfrd = p.ServicesFrameData ?? Buffer.alloc(0);
  const sfrcs = Buffer.alloc(2);
  sfrcs.writeUInt16LE(CRC16(sfrd));

  return Buffer.concat([Buffer.from(header), sfrd, sfrcs]);
}

/**
 * Prepare confirmation for incoming APPDATA packet
 */
export function prepareAnswer(incoming: Packet, pid: number): Packet {
  if (incoming.PacketType !== EGTS_PT_APPDATA) {
    throw new Error("prepareAnswer: not APPDATA packet");
  }

  // EGTS_PT_RESPONSE: только RPID и PR
  const response = Buffer.alloc(3);
  response.writeUInt16LE(incoming.PacketID, 0); // RPID
  response.writeUInt8(0, 2); // PR = EGTS_PC_OK

  const packet: Packet = {
    ProtocolVersion: 1,
    SecurityKeyID: 0,
    PRF: "00",
    RTE: "0",
    ENA: "00",
    CMP: "0",
    PR: "11",
    HeaderLength: 11,
    HeaderEncoding: 0,
    FrameDataLength: response.length,
    PacketID: pid,
    PacketType: EGTS_PT_RESPONSE,
    HeaderCheckSum: 0,
    ServicesFrameData: response,
  };

  return packet;
}
