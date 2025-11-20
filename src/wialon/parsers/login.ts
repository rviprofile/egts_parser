import { ParserProps } from ".";
import { answer } from "../messages";
import { crc16 } from "crc";

const fields = ["Protocol_version", "IMEI", "Password"];

export const LoginParser = ({ message, socket, trackers }: ParserProps) => {
  const trimmed = message.trim();
  const prepared = trimmed.slice(0, -4);

  // рассчитываем CRC
  const calculatedCRC = crc16(Buffer.from(prepared, "ascii"));
  const calculatedCRCHex = calculatedCRC
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

  const receivedCRC = trimmed.slice(-4).toUpperCase();

  if (receivedCRC !== calculatedCRCHex) {
    console.log("calculated:", calculatedCRCHex, "received:", receivedCRC);
    throw new Error("Invalid CRC");
  }

  const values = prepared.split(";");
  const result: Record<string, string> = {};
  fields.forEach((field, index) => {
    result[field] = values[index] ?? "";
  });
  console.log(result);

  trackers.set(result.IMEI, {
    PID: 0,
    IMEI: result.IMEI,
    socket: socket,
  });

  const Login = true;
  if (Login) {
    socket.write(Buffer.from(answer.AL.LoginSuccess, "ascii"));
  }
};
