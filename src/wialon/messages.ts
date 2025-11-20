export type ALMessageType = keyof typeof AL;
export type ABMessageType = keyof typeof AB;
export type APMessageType = typeof Ping;

const LoginSuccess = "#AL#1\r\n";
const LoginFail = "#AL#0\r\n";
const LoginIncorrectPassword = "#AL#01\r\n";
const LoginIncorrectHash = "#AL#10\r\n";

const AL = {
  LoginSuccess,
  LoginFail,
  LoginIncorrectPassword,
  LoginIncorrectHash,
};

const BlackBoxSuccess = "#AB#[count]\r\n";
const BlackBoxFail = "#AB#\r\n";

const AB = {
  BlackBoxSuccess,
  BlackBoxFail,
};

const Ping = "#AP#\r\n";

const AP = {
  Ping,
};

export const answer = {
  AL,
  AB,
  AP,
};
