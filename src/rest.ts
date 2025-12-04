import { trackersWialon } from "./socket";
import { commandQueue, QueuedCommand } from "./types";
import { commands } from "./wialon/messages";
import net from "net";

const { sql } = require("./mysql");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

export const initializeRest = () => {
  const serverRest = app.listen(process.env.REST_PORT, () => {
    const addressInfo = serverRest.address();
    if (typeof addressInfo === "string") {
      console.log(`REST API слушает на ${addressInfo}`);
    } else if (addressInfo && typeof addressInfo === "object") {
      const host =
        addressInfo.address === "::" || addressInfo.address === "0.0.0.0"
          ? "localhost"
          : addressInfo.address;
      console.log(`REST API слушает на http://${host}:${addressInfo.port}`);
    }
  });

  /** Проверка работоспособности REST API */
  app.get("/", (req, res) => {
    res.json({ status: "ok", message: "REST API работает" });
  });

  app.use(authMiddleware);

  /** Получение списка всех автомобилей */
  app.get("/trackers/cars", async (req, res) => {
    try {
      const cars = await sql.getAllCars();
      res.json({ status: "ok", data: cars });
    } catch (error) {
      console.error("Ошибка при получении трекеров из базы данных:", error);
      res
        .status(500)
        .json({ status: "error", message: "Ошибка при получении трекеров" });
    }
  });

  /** Получение информации об автомобиле по IMEI */
  app.get("/trackers/car/:imei", async (req, res) => {
    try {
      const car = await sql.getCarByImei(req.params.imei);
      res.json({ status: "ok", data: car || null });
    } catch (error) {
      console.error("Ошибка при получении трекера из базы данных:", error);
      res
        .status(500)
        .json({ status: "error", message: "Ошибка при получении трекера" });
    }
  });

  app.get("/trackers/commandslist", (req, res) => {
    res.status(200).json({ status: "ok", data: commands });
  });

  app.post("/trackers/command", async (req, res) => {
    const { imei, command } = req.query;

    if (!imei || !command) {
      return res
        .status(400)
        .json({ status: "error", message: "imei и command обязательны" });
    }

    if (typeof imei !== "string" || typeof command !== "string") {
      return res.status(400).json({
        status: "error",
        message: "imei и command должны быть строками",
      });
    }

    if (command.startsWith("#") || command.endsWith("#\r\n")) {
      return res.status(400).json({
        status: "error",
        message:
          "Отправляйте только тело команды. Вместо #setout1=0#\r\n используйте setout1=0",
      });
    }

    const tracker = trackersWialon.get(imei);

    if (!tracker) {
      return res.status(404).json({
        status: "error",
        message: `Трекер с IMEI ${imei} не найден`,
      });
    }

    if (!tracker.socket) {
      // Добавляем в очередь с меткой времени
      const queuedCommand: QueuedCommand = { command, timestamp: Date.now() };
      if (!commandQueue.has(imei)) commandQueue.set(imei, []);
      commandQueue.get(imei)?.push(queuedCommand);

      res.json({
        status: "queued",
        message: `Трекер оффлайн, команда ${command} добавлена в очередь на 10 секунд`,
      });
    }

    try {
      const trackerResponse = await sendCommandAndWait(tracker.socket, command);
      return res.json({
        status: "ok",
        response: {
          server: "Команда успешно отправлена",
          tracker: trackerResponse,
          command: command,
          imei: imei,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Нет ответа от трекера",
        error: err instanceof Error ? err.message : err,
      });
    }
  });
};

function sendCommandAndWait(
  socket: net.Socket,
  command: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `#${command}#\r\n`;
    socket.write(Buffer.from(cmd, "ascii"));

    const onData = (data: Buffer) => {
      const msg = data
        .toString("ascii")
        .replace(/^#[A-Za-z0-9]#/, "")
        .split("\n")[0]
        .split(";")[0]
        .trim();
      socket.removeListener("data", onData);
      clearTimeout(timeout);
      resolve(msg);
    };

    const timeout = setTimeout(() => {
      socket.removeListener("data", onData);
      reject("Timeout: нет ответа от трекера");
    }, 5000);

    socket.on("data", onData);
  });
}

/** Проверка Bearer токена */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res
      .status(401)
      .json({ status: "error", message: "Нет заголовка Authorization" });

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token)
    return res
      .status(401)
      .json({ status: "error", message: "Неверный формат Authorization" });

  if (token !== process.env.REST_TOKEN)
    return res.status(403).json({ status: "error", message: "Неверный токен" });

  next();
};
