import net from "net";
import { BlackBoxParser } from "./blackbox";
import { LoginParser } from "./login";
import { trackersType } from "../../types";

export const route = {
  L: LoginParser,
  B: BlackBoxParser,
};

export type ParserProps = {
  message: string;
  socket: net.Socket;
  trackers: trackersType;
};
