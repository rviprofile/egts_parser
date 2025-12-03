import { ParserProps } from ".";
import { answer } from "../messages";

export const PingParser = ({ message, socket, trackers }: ParserProps) => {
  console.log("Ping received");
  socket.write(Buffer.from(answer.AP.Ping, "ascii"));
};
