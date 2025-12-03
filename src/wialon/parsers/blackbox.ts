import { crc16 } from "crc";
import { ParserProps } from ".";
import { answer } from "../messages";

const { sql } = require("./../../mysql");

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
  "HDOP",
  "Inputs",
  "Outputs",
  "ADC",
  "Ibutton",
  "Params",
];

const params = [
  { name: "hdop", type: "2", value: "1.0700" },
  { name: "mcc", type: "1", value: "250" },
  { name: "mnc", type: "1", value: "1" },
  { name: "lac", type: "1", value: "16313" },
  { name: "cell_id", type: "1", value: "35012" },
  { name: "rx_level", type: "1", value: "13" },
  { name: "p25", type: "1", value: "0" },
  { name: "p9", type: "1", value: "56330940" },
  { name: "p10", type: "1", value: "1763132651" },
  { name: "p11", type: "1", value: "1" },
  { name: "p109", type: "1", value: "12" },
  { name: "p110", type: "1", value: "6" },
  { name: "p113", type: "2", value: "102886.4688" },
  { name: "p114", type: "1", value: "1" },
  { name: "p1061", type: "1", value: "0" },
  { name: "p1241", type: "1", value: "0" },
  { name: "p1249", type: "1", value: "0" },
  { name: "p1250", type: "2", value: "27.7365" },
  { name: "p1252", type: "2", value: "12.6781" },
  { name: "p1253", type: "2", value: "4.1244" },
];

export const BlackBoxParser = ({ message, socket, trackers }: ParserProps) => {
  const messageStr = message.replace(/[\r\n]+$/, "");

  let counter = 0;

  const crc = messageStr.split("|").pop();

  messageStr.split("|")?.map((packet, index) => {
    if (index === messageStr.split("|").length - 1) return;
    const values = packet.split(";");
    const result: Record<string, any> = {};
    counter++;

    fields.forEach((field, index) => {
      const raw = values[index] ?? "";

      // Если это поле с параметрами
      if (field === "Params") {
        result[field] = raw.split(",").map((param: string) => {
          const [name, type, value] = param.split(":");
          return { name, type, value };
        });
      } else {
        // Любое обычное поле
        result[field] = raw;
      }
    });

    const imei = Array.from(trackers.entries()).find(
      ([imei, data]) => data.socket === socket
    )?.[0];
    imei && sql.updateData(imei, JSON.stringify(result));
  });
  console.log("Отпраивили АВ с подтверждением " + counter + " пакетов");
  socket.write(
    Buffer.from(
      answer.AB.BlackBoxSuccess.replace("{counter}", counter.toString()),
      "ascii"
    )
  );
};
