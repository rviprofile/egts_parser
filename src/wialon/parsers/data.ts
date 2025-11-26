import { ParserProps } from ".";
import { answer } from "../messages";

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

export const DataParser = ({ message, socket, trackers }: ParserProps) => {
  const messageStr = message.replace(/[\r\n]+$/, "");

  const crc = messageStr.split("|").pop();

  messageStr.split("|")?.map((packet, index) => {
    if (index === messageStr.split("|").length - 1) return;
    const values = packet.split(";");
    const result: Record<string, any> = {};

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

    // console.log(result);
  });
  console.log(crc);
  socket.write(Buffer.from(answer.AD.DataSuccess, "ascii"));
};
