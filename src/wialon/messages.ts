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
    description: "Запросить конфигурацию серверов мониторинга#\r\n",
    command: "#server?#\r\n",
  },
  { description: "Холодный старт GNSS приемника", command: "#rebootgnss#\r\n" },
  { description: "Очистить чёрный ящик", command: "#bboxclear#\r\n" },
  { description: "Сброс к заводским настройкам", command: "#tofactory#\r\n" },
  { description: "Сделать фотографию", command: "#makephoto#\r\n" },
  {
    description: "Установить состояние выхода 1 в 0",
    command: "#setout1=0#\r\n",
  },
  {
    description: "Установить состояние выхода 1 в 1",
    command: "#setout1=1#\r\n",
  },
  {
    description: "Установить состояние выхода 2 в 0",
    command: "#setout2=0#\r\n",
  },
  {
    description: "Установить состояние выхода 2 в 1",
    command: "#setout2=1#\r\n",
  },
  {
    description: "Установить выход 1 блока расширения в 1",
    command: "#setextout1=1#\r\n",
  },
  {
    description: "Установить выход 1 блока расширения в 0",
    command: "#setextout1=0#\r\n",
  },
  {
    description: "Установить выход 2 блока расширения в 1",
    command: "#setextout2=1#\r\n",
  },
  {
    description: "Установить выход 2 блока расширения в 0",
    command: "#setextout2=0#\r\n",
  },
  {
    description: "Установить выход 3 блока расширения в 1",
    command: "#setextout3=1#\r\n",
  },
  {
    description: "Установить выход 3 блока расширения в 0",
    command: "#setextout3=0#\r\n",
  },
  {
    description: "Установить выход 4 блока расширения в 1",
    command: "#setextout4=1#\r\n",
  },
  {
    description: "Установить выход 4 блока расширения в 0",
    command: "#setextout4=0#\r\n",
  },
  {
    description: "Установить выход 5 блока расширения в 1",
    command: "#setextout5=1#\r\n",
  },
  {
    description: "Установить выход 5 блока расширения в 0",
    command: "#setextout5=0#\r\n",
  },
  {
    description: "Установить выход 15 блока расширения в 1",
    command: "#setextout15=1#\r\n",
  },
  {
    description: "Установить выход 15 блока расширения в 0",
    command: "#setextout15=0#\r\n",
  },
  {
    description: "Запустить CAN-скрипт номер Х",
    command: "#runcanscriptX#\r\n",
  },
  { description: "Сменить текущую SIM-карту", command: "#changesim#\r\n" },
  {
    description: "Сменить текущую SIM-карту на первую",
    command: "#changesim:1#\r\n",
  },
  {
    description: "Сменить текущую SIM-карту на вторую",
    command: "#changesim:2#\r\n",
  },
  {
    description: "Сформировать DDD файл карты водителя 1",
    command: "#makeddd#\r\n",
  },
  {
    description: "Сформировать DDD файл карты водителя 1",
    command: "#makeddd:1#\r\n",
  },
  {
    description: "Сформировать DDD файл карты водителя 2",
    command: "#makeddd:2#\r\n",
  },
  { description: "Поморгать габаритами", command: "#can_blinkerflasing#\r\n" },
  { description: "Закрыть все двери", command: "#can_closealldoor#\r\n" },
  { description: "Открыть все двери", command: "#can_openalldoor#\r\n" },
  {
    description: "Открыть дверь водителя",
    command: "#can_opendriverdoor#\r\n",
  },
  { description: "Открыть багажник", command: "#can_opentrunk#\r\n" },
  { description: "Остановить двигатель", command: "#can_stopengine#\r\n" },
  { description: "Запустить двигатель", command: "#can_startengine#\r\n" },
  {
    description: "Эмуляция двери водителя",
    command: "#can_driverdooremulation#\r\n",
  },
  { description: "Остановить вебасто", command: "#can_stopwebasto#\r\n" },
  { description: "Запустить вебасто", command: "#can_startwebasto#\r\n" },
  { description: "Клаксон", command: "#can_horn#\r\n" },
  { description: "Габариты и клаксон", command: "#can_hornblinker#\r\n" },
  {
    description: "Закрытие окон 3 секунды",
    command: "#can_closewindows3#\r\n",
  },
  { description: "Закрытие окон 7 секунд", command: "#can_closewindows7#\r\n" },
  {
    description: "Закрытие окон 11 секунд",
    command: "#can_closewindows11#\r\n",
  },
  {
    description: "Закрытие окон 15 секунд",
    command: "#can_closewindows15#\r\n",
  },
  {
    description: "Закрытие окон 19 секунд",
    command: "#can_closewindows19#\r\n",
  },
  {
    description: "Закрытие окон 23 секунды",
    command: "#can_closewindows23#\r\n",
  },
  {
    description: "Закрытие окон 29 секунд",
    command: "#can_closewindows29#\r\n",
  },
  { description: "Открытие окон 3 секунды", command: "#can_openwindows3#\r\n" },
  { description: "Открытие окон 7 секунд", command: "#can_openwindows7#\r\n" },
  {
    description: "Открытие окон 11 секунд",
    command: "#can_openwindows11#\r\n",
  },
  {
    description: "Открытие окон 15 секунд",
    command: "#can_openwindows15#\r\n",
  },
  {
    description: "Открытие окон 19 секунд",
    command: "#can_openwindows19#\r\n",
  },
  {
    description: "Открытие окон 23 секунды",
    command: "#can_openwindows23#\r\n",
  },
  {
    description: "Открытие окон 29 секунд",
    command: "#can_openwindows29#\r\n",
  },
];
