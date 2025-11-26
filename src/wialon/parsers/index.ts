import net from "net";
import { BlackBoxParser } from "./blackbox";
import { LoginParser } from "./login";
import { trackersType } from "../../types";
import { DataParser } from "./data";
import { PingParser } from "./ping";
import { MessageParser } from "./message";

export const route = {
  L: LoginParser,
  B: BlackBoxParser,
  D: DataParser,
  P: PingParser,
  M: MessageParser,
};

export type ParserProps = {
  message: string;
  socket: net.Socket;
  trackers: trackersType;
};
