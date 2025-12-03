import { trackersWialon } from "./socket";
import { commandQueue, QueuedCommand } from "./types";

const { sql } = require("./mysql");
const express = require("express");
const cors = require("cors");
const app = express();

const PORT_REST = 3077;

app.use(cors({ origin: "*" }));
app.use(express.json());

export const initializeRest = () => {
  const serverRest = app.listen(PORT_REST, () => {
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

  app.get("/", (req, res) => {
    res.json({ status: "ok", message: "REST API работает" });
  });

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

  app.get("/trackers/car/:imei", (req, res) => {
    try {
      const car = sql.getCarByImei(req.params.imei);
      res.json({ status: "ok", data: car });
    } catch (error) {
      console.error("Ошибка при получении трекера из базы данных:", error);
      res
        .status(500)
        .json({ status: "error", message: "Ошибка при получении трекера" });
    }
  });

  app.post("/trackers/command", (req, res) => {
    const { imei, command } = req.query;

    if (!imei || !command) {
      return res
        .status(400)
        .json({ status: "error", message: "imei и command обязательны" });
    }

    const tracker = trackersWialon.get(imei);

    if (tracker?.socket) {
      tracker.socket.write(Buffer.from(command, "ascii"));
      res.json({ status: "ok", message: `Команда отправлена трекеру ${imei}` });
    } else {
      // Добавляем в очередь с меткой времени
      const queuedCommand: QueuedCommand = { command, timestamp: Date.now() };
      if (!commandQueue.has(imei)) commandQueue.set(imei, []);
      commandQueue.get(imei)?.push(queuedCommand);

      res.json({
        status: "queued",
        message: `Трекер оффлайн, команда добавлена в очередь`,
      });
    }
  });
};
