import { ParserProps } from ".";
import { COMMAND_TTL, commandQueue } from "../../types";
import { answer } from "../messages";
import { crc16 } from "crc";

const { sql } = require("./../../mysql");

const fields = ["Protocol_version", "IMEI", "Password"];

export const LoginParser = async ({
  message,
  socket,
  trackers,
}: ParserProps) => {
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

    // Если есть отложенные команды для этого ИМЕИ, отправляем их
    if (commandQueue.has(result.IMEI)) {
      const now = Date.now();
      const commands = commandQueue.get(result.IMEI) || [];
      const validCommands = commandQueue
        .get(result.IMEI)!
        .filter((cmd) => now - cmd.timestamp <= COMMAND_TTL);
      validCommands.forEach((cmd) => socket.write(cmd.command));
      commandQueue.delete(result.IMEI);
    }

    try {
      sql.addCar(result.IMEI.toString());
    } catch (error) {
      console.error("Ошибка при добавлении трекера в базу данных:", error);
    }
  }
};
