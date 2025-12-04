import { trackersType } from "./types";
import net from "net";
import { parseTCP } from "./wialon/tcp.parser";
import { parseEGTSMessage } from "./messageParser";

const SOCKET_PORT = 8002;

/** Коллекция для хранения подключений трекеров */
export const trackersWialon: trackersType = new Map<
  string,
  { [key: string]: any }
>();
const trackersEGTS = new Map<net.Socket, { [key: string]: any }>();

export const initializeSocket = () => {
  // Создаем сервер для приема TCP-соединений
  const server = net.createServer((socket) => {
    console.log("\x1b[32mТрекер подключился\x1b[0m");

    // Обрабатываем поступающие данные
    socket.on("data", async (data: Buffer) => {
      try {
        const firstByte = data.readUInt8(0);

        // Проверка на EGTS: первый байт всегда 0x01
        const isEGTS = firstByte === 0x01;

        // Проверка на текстовый формат Wialon: ASCII диапазон
        const isText = firstByte >= 0x20 && firstByte <= 0x7e;

        if (isEGTS) {
          console.log("\x1b[32mНаправлен в ЕГТС парсер\x1b[0m");
          trackersEGTS.set(socket, {
            PID: 0,
            RN: 0,
          });
          parseEGTSMessage({
            buffer: data,
            socket: socket,
            trackers: trackersEGTS,
          });
        } else if (isText) {
          console.log("\x1b[32mНаправлен в Wialon парсер\x1b[0m");
          parseTCP({
            buffer: data,
            trackers: trackersWialon,
            socket,
          });
        } else {
          console.warn("Unknown packet format:", data.toString("hex"));
        }
      } catch (error: any) {
        console.error(
          "[socketHandler.ts]: ",
          "Ошибка при разборе сообщения:",
          error.message
        );
      }
    });

    // Обрабатываем отключение трекера
    socket.on("end", () => {
      if (trackersEGTS.has(socket)) {
        // Удаляем трекер из колекции
        trackersEGTS.delete(socket);
      } else {
        console.log("\x1b[31mТрекер отключился\x1b[0m");
      }
    });

    // Обрабатываем ошибки на уровне сокета
    socket.on("error", (err) => {
      console.error("[socketHandler.ts]: ", "Ошибка сокета:", err.message);
    });
  });

  // Запускаем сервер
  server.listen(SOCKET_PORT, () => {
    console.log(`Сервер запущен на порту ${SOCKET_PORT}`);
  });
};
