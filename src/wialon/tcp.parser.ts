import { route } from "./parsers/index";
import { trackersType } from "../types";
import { PacketType } from "./packet.types";
import { crc16 } from "crc";
import net from "net";

export type TCPMassage = {
  PT: PacketType;
  Msg: string;
};

export const parseTCP = ({
  buffer,
  trackers,
  socket,
}: {
  buffer: Buffer;
  trackers: trackersType;
  socket: net.Socket;
}): TCPMassage => {
  /** Сообщение без хвоста */
  const trimmed = buffer.toString().trim();
  // Проверка на стартовый байт '#'
  if (!trimmed.startsWith("#")) {
    throw new Error("Invalid packet: missing starting #");
  }
  /** Сообщение без стартового байта '#' */
  const withoutStart = trimmed.slice(1);
  /** Индекс разделителя '#', который отделяет тип пакета */
  const separatorIndex = withoutStart.indexOf("#");
  // Проверка на наличие разделителя '#'
  if (separatorIndex === -1) {
    throw new Error("Invalid packet: missing separator #");
  }
  /** Тип пакета */
  const PTchar = withoutStart[0] as PacketType;
  /** Сообщение и контрольная сумма */
  const msgAndCRC = withoutStart.slice(separatorIndex + 1);

  route[PTchar]?.({
    message: msgAndCRC,
    trackers,
    socket,
  });

  return {
    PT: PTchar as PacketType,
    Msg: msgAndCRC,
  };
};
