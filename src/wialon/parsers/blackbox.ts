import { crc16 } from "crc";
import { ParserProps } from ".";

const fields: string[] = [
  "Date",
  "Time",
  "Lat1",
  "Lat2",
  "Lon1",
  "Lon2",
  "Speed",
  "Course",
  "Alt",
  "Sats",
];

export const BlackBoxParser = ({ message, socket, trackers }: ParserProps) => {
  const trimmed = message.trim();
  const prepared = trimmed.slice(0, -4);1

  console.log(message);

  if (parseInt(trimmed.slice(-4)) !== crc16(Buffer.from(prepared, "ascii"))) {
    throw new Error("Invalid CRC");
  }

  prepared.split("|").map((packet) => {
    const values = packet.split(";");
    const result: Record<string, string> = {};
    fields.forEach((field, index) => {
      result[field] = values[index] ?? "";
    });
    console.log(result);
  });
};
