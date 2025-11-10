const exampe = "#L#2.0;45665445;7855;";

function crc16BigEndianHex(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  // big-endian HEX (4 ASCII символа)
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export const WialonParser = (data: string) => {
  if (!data.endsWith("\r\n")) {
    throw new Error("Строка должна заканчиваться на \\r\\n");
  }
  const trimmed = data.slice(0, -2); // убираем \r\n

  if (!trimmed.startsWith("#")) {
    throw new Error("Строка должна начинаться с '#'");
  }

  const secondHashIndex = trimmed.indexOf("#", 1);
  if (secondHashIndex === -1) {
    throw new Error("Некорректный формат: отсутствует второй '#'");
  }

  const pt = trimmed.slice(1, secondHashIndex);
  const body = trimmed.slice(secondHashIndex + 1);

  if (body.length < 4) {
    throw new Error("Слишком короткое сообщение для CRC");
  }

  const msg = body.slice(0, -4);
  const crc = body.slice(-4);

  const calculatedCRC = crc16BigEndianHex(msg);

  return {
    pt,
    msg,
    crc,
    crcValid: calculatedCRC === crc,
  };
};

// Пример
const example = "#L#some,data,with,commas123\r\n";

const PacketSchema = (type: PacketType) => {
  switch (type) {
    // Пакет логина
    case "L":
      return ["Protocol_version", "IMEI", "Password"];
    //Сокращенный пакет с данными
    case "SD":
      return [
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
      ];
  }
};

type PacketType =
  | "L"
  | "AL"
  | "SD"
  | "ASD"
  | "D"
  | "AD"
  | "B"
  | "AB"
  | "P"
  | "AP"
  | "US"
  | "UC"
  | "M"
  | "AM"
  | "QI"
  | "I"
  | "AI"
  | "QT"
  | "IT"
  | "AIT"
  | "T"
  | "AT";
