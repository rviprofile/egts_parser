import { initializeRest } from "./rest";
import { initializeSocket } from "./socket";
/** Подгружаем переменные окружения */
require("dotenv").config();

/** База данных  */
const { pool } = require("./mysql");
/** Инициализация сокет-сервера */
initializeSocket();
/** Инициализация REST API */
initializeRest();
/** Проверка подключения к базе данных */
pool.getConnection((err: any, connection: any) => {
  if (err) {
    console.error("Ошибка подключения к базе:", err);
    return;
  }
  connection.release();
});
