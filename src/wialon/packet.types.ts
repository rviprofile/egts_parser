const L = "Пакет логина";
const AL = "Ответ на пакет типа L";
const SD = "Сокращенный пакет с данными";
const ASD = "Ответ на пакет типа SD";
const D = "Расширенный пакет с данными";
const AD = "Ответ на пакет типа D";
const B = "Пакет из черного ящика";
const AB = "Ответ на пакет типа B";
const P = "Пинговый пакет";
const AP = "Ответ на пакет типа P";
const US = "Пакет с новой прошивкой";
const UC = "Пакет с файлом конфигурации";
const M = "Сообщение для/от водителя /";
const AM = "Ответ на пакет типа M";
const QI = "Команда запроса фотоизображения";
const I = "Пакет с фотоизображением";
const AI = "Ответ на пакет типа I";
const QT = "Команда запроса файла DDD";
const IT = "Пакет с информацией о файле DDD";
const AIT = "Ответ на пакет типа IT";
const T = "Пакет с блоком файла DDD";
const AT = "Ответ на пакет типа T";

export const PacketTypes = {
  L,
  AL,
  SD,
  ASD,
  D,
  AD,
  B,
  AB,
  P,
  AP,
  US,
  UC,
  M,
  AM,
  QI,
  I,
  AI,
  IT,
  QT,
  AIT,
  T,
  AT,
};

export type PacketType = keyof typeof PacketTypes;
