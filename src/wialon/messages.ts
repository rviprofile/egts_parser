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

const BlackBoxSuccess = "#AB#{counter}\r\n";
const BlackBoxFail = "#AB#\r\n";

const AB = {
  BlackBoxSuccess,
  BlackBoxFail,
};

const Ping = "#AP#\r\n";

const AP = {
  Ping,
};

const DataSuccess = "#AD#1\r\n";
const DataIncorrectStructure = "#AD#-1\r\n";
const DataIncorrectTine = "#AD#0\r\n";

const AD = {
  DataSuccess,
  DataIncorrectStructure,
  DataIncorrectTine,
};

export const answer = {
  AL,
  AB,
  AP,
  AD,
};

export const commands = [
  {
    description: "Запросить конфигурацию серверов мониторинга",
    command: "server?",
  },
  { description: "Холодный старт GNSS приемника", command: "rebootgnss" },
  { description: "Очистить чёрный ящик", command: "bboxclear" },
  { description: "Сброс к заводским настройкам", command: "tofactory" },
  { description: "Сделать фотографию", command: "makephoto" },
  {
    description: "Установить состояние выхода 1 в 0",
    command: "setout1=0",
  },
  {
    description: "Установить состояние выхода 1 в 1",
    command: "setout1=1",
  },
  {
    description: "Установить состояние выхода 2 в 0",
    command: "setout2=0",
  },
  {
    description: "Установить состояние выхода 2 в 1",
    command: "setout2=1",
  },
  {
    description: "Установить выход 1 блока расширения в 1",
    command: "setextout1=1",
  },
  {
    description: "Установить выход 1 блока расширения в 0",
    command: "setextout1=0",
  },
  {
    description: "Установить выход 2 блока расширения в 1",
    command: "setextout2=1",
  },
  {
    description: "Установить выход 2 блока расширения в 0",
    command: "setextout2=0",
  },
  {
    description: "Установить выход 3 блока расширения в 1",
    command: "setextout3=1",
  },
  {
    description: "Установить выход 3 блока расширения в 0",
    command: "setextout3=0",
  },
  {
    description: "Установить выход 4 блока расширения в 1",
    command: "setextout4=1",
  },
  {
    description: "Установить выход 4 блока расширения в 0",
    command: "setextout4=0",
  },
  {
    description: "Установить выход 5 блока расширения в 1",
    command: "setextout5=1",
  },
  {
    description: "Установить выход 5 блока расширения в 0",
    command: "setextout5=0",
  },
  {
    description: "Установить выход 15 блока расширения в 1",
    command: "setextout15=1",
  },
  {
    description: "Установить выход 15 блока расширения в 0",
    command: "setextout15=0",
  },
  {
    description: "Запустить CAN-скрипт номер Х",
    command: "runcanscriptX",
  },
  { description: "Сменить текущую SIM-карту", command: "changesim" },
  {
    description: "Сменить текущую SIM-карту на первую",
    command: "changesim:1",
  },
  {
    description: "Сменить текущую SIM-карту на вторую",
    command: "changesim:2",
  },
  {
    description: "Сформировать DDD файл карты водителя 1",
    command: "makeddd",
  },
  {
    description: "Сформировать DDD файл карты водителя 1",
    command: "makeddd:1",
  },
  {
    description: "Сформировать DDD файл карты водителя 2",
    command: "makeddd:2",
  },
  { description: "Поморгать габаритами", command: "can_blinkerflasing" },
  { description: "Закрыть все двери", command: "can_closealldoor" },
  { description: "Открыть все двери", command: "can_openalldoor" },
  {
    description: "Открыть дверь водителя",
    command: "can_opendriverdoor",
  },
  { description: "Открыть багажник", command: "can_opentrunk" },
  { description: "Остановить двигатель", command: "can_stopengine" },
  { description: "Запустить двигатель", command: "can_startengine" },
  {
    description: "Эмуляция двери водителя",
    command: "can_driverdooremulation",
  },
  { description: "Остановить вебасто", command: "can_stopwebasto" },
  { description: "Запустить вебасто", command: "can_startwebasto" },
  { description: "Клаксон", command: "can_horn" },
  { description: "Габариты и клаксон", command: "can_hornblinker" },
  {
    description: "Закрытие окон 3 секунды",
    command: "can_closewindows3",
  },
  { description: "Закрытие окон 7 секунд", command: "can_closewindows7" },
  {
    description: "Закрытие окон 11 секунд",
    command: "can_closewindows11",
  },
  {
    description: "Закрытие окон 15 секунд",
    command: "can_closewindows15",
  },
  {
    description: "Закрытие окон 19 секунд",
    command: "can_closewindows19",
  },
  {
    description: "Закрытие окон 23 секунды",
    command: "can_closewindows23",
  },
  {
    description: "Закрытие окон 29 секунд",
    command: "can_closewindows29",
  },
  { description: "Открытие окон 3 секунды", command: "can_openwindows3" },
  { description: "Открытие окон 7 секунд", command: "can_openwindows7" },
  {
    description: "Открытие окон 11 секунд",
    command: "can_openwindows11",
  },
  {
    description: "Открытие окон 15 секунд",
    command: "can_openwindows15",
  },
  {
    description: "Открытие окон 19 секунд",
    command: "can_openwindows19",
  },
  {
    description: "Открытие окон 23 секунды",
    command: "can_openwindows23",
  },
  {
    description: "Открытие окон 29 секунд",
    command: "can_openwindows29",
  },
];
