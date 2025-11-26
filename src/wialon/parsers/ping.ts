import { ParserProps } from ".";
import { answer } from "../messages";

export const PingParser = ({ message, socket, trackers }: ParserProps) => {
  socket.write(Buffer.from(answer.AP.Ping, "ascii"));
};
