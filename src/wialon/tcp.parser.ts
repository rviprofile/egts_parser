import { route } from "./parsers/index";
import { PacketType } from "./packet.types";

export type TCPMassage = {
  PT: PacketType;
  Msg: string;
};

// Пакет который мы собираем по частям
let tcpBuffer = "";

export const parseTCP = ({ buffer, trackers, socket }) => {
  // if (buffer.toString()) {
  //   console.log(buffer.toString());
  // }
  // Сразу добавляет полученные данные к буферу
  tcpBuffer += buffer.toString();

  // Индекс конца пакета
  let index;
  // Пока в буфере есть полный пакет (оканчивается на \r\n)
  while ((index = tcpBuffer.indexOf("\r\n")) !== -1) {
    // Извлекает полный пакет из буфера
    const rawPacket = tcpBuffer.slice(0, index);
    tcpBuffer = tcpBuffer.slice(index + 2);

    if (!rawPacket.startsWith("#")) {
      // Не Wialon, можно проигнорировать или обработать иначе
      continue;
    }

    // Тип пакета
    const match = rawPacket.match(/^#([^#]+)#/);
    if (!match) continue;

    const PTchar = match[1];
    const message = rawPacket.replace(`#${PTchar}#`, "");

    if (route[PTchar]) {
      route[PTchar]({
        message,
        trackers,
        socket,
      });
    } else {
      console.warn("Неизвестный пакет:", rawPacket);
    }
  }
};
