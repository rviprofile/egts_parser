import net from "net";
import { parseEGTSMessage } from "./messageParser";
import { parseTCP } from "./wialon/tcp.parser";
import { trackersType } from "./types";
import { pool } from "./mysql";

const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*", credentials: true }));

/** Коллекция для хранения подключений трекеров */
const trackersWialon: trackersType = new Map<string, { [key: string]: any }>();
const trackersEGTS = new Map<net.Socket, { [key: string]: any }>();

pool.getConnection((err: any, connection: any) => {
  if (err) {
    console.error("[pool.getConnection] Ошибка подключения к базе:", err);
    return;
  }
  console.log("[pool.getConnection] Успешно подключено к базе данных");
  connection.release();
});

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
        trackersEGTS.set(socket, {
          PID: 0,
          RN: 0,
        });
        // parseEGTSMessage({
        //   buffer: data,
        //   socket: socket,
        //   trackers: trackersEGTS,
        // });
      } else if (isText) {
        parseTCP({
          buffer: data,
          trackers: trackersWialon,
          socket,
        });
      } else {
        console.warn("Unknown packet format:", data);
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
    // Удаляем трекер из колекции
    console.log("\x1b[31mТрекер отключился\x1b[0m");

    // Находим IMEI по сокету
    const imeiToDelete = Array.from(trackersWialon.entries()).find(
      ([imei, data]) => data.socket === socket
    )?.[0];

    if (imeiToDelete) {
      trackersWialon.delete(imeiToDelete);
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
