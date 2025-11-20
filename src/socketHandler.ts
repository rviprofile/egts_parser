import net from "net";
import { parseEGTSMessage } from "./messageParser";
import { parseTCP } from "./wialon/tcp.parser";
import { trackersType } from "./types";

/** Коллекция для хранения подключений трекеров */
const trackers: trackersType = new Map<string, { [key: string]: any }>();

// Создаем сервер для приема TCP-соединений
const server = net.createServer((socket) => {
  console.log("\x1b[32mТрекер подключился\x1b[0m");

  // Обрабатываем поступающие данные
  socket.on("data", (data: Buffer) => {
    try {
      data.readUInt8(0) === 35
        ? // Передаем данные на парсинг по протоколу Wialon
          parseTCP({
            buffer: data,
            trackers,
            socket,
          })
        : console.log("Получили ЕГТС пакет");
      // // Передаем данные на парсинг по протоколу EGTS, а также возможность отправки ответа
      //   parseEGTSMessage({
      //     buffer: data,
      //     socket: socket,
      //     trackers: trackers,
      //   });
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
    // Удаляем трекер из колекции
    console.log("\x1b[31mТрекер отключился\x1b[0m");

    // Находим IMEI по сокету
    const imeiToDelete = Array.from(trackers.entries()).find(
      ([imei, data]) => data.socket === socket
    )?.[0];

    if (imeiToDelete) {
      trackers.delete(imeiToDelete);
      console.log("Удален трекер с IMEI:", imeiToDelete);
    }
  });

  // Обрабатываем ошибки на уровне сокета
  socket.on("error", (err) => {
    console.error("[socketHandler.ts]: ", "Ошибка сокета:", err.message);
  });
});

// Запускаем сервер на порту 8002
server.listen(8002, () => {
  console.log("Сервер запущен на порту 8002");
});
