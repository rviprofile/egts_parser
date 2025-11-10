import net from "net";
import { parseEGTSMessage } from "./messageParser";

/** Коллекция для хранения подключений трекеров */
const trackers = new Map<net.Socket, { [key: string]: any }>();

// Создаем сервер для приема TCP-соединений
const server = net.createServer((socket) => {
  console.log("Трекер подключился");
  // Инициализируем данные для нового трекера
  trackers.set(socket, {
    PID: 0, // Счетчик отправленных сообщений от сервера для каждого трекера
  });

  // Обрабатываем поступающие данные
  socket.on("data", (data) => {
    try {
      // Передаем данные на парсинг, а также возможность отправки ответа
      parseEGTSMessage({
        buffer: data,
        socket: socket,
        trackers: trackers,
      });
    } catch (error: any) {
      console.error("Ошибка при разборе сообщения:", error.message);
    }
  });

  // Обрабатываем отключение трекера
  socket.on("end", () => {
    console.log("Трекер отключился");
    // Удаляем трекер из колекции
    trackers.delete(socket);
  });

  // Обрабатываем ошибки на уровне сокета
  socket.on("error", (err) => {
    console.error("Ошибка сокета:", err.message);
  });
});

// Запускаем сервер на порту 8002
server.listen(8002, () => {
  console.log("Сервер запущен на порту 8002");
});
