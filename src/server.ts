import { initializeRest } from "./rest";
import { initializeSocket } from "./socket";

const { pool } = require("./mysql");

initializeSocket();
initializeRest();

pool.getConnection((err: any, connection: any) => {
  if (err) {
    console.error("Ошибка подключения к базе:", err);
    return;
  }
  console.log("Успешно подключено к базе данных");
  connection.release();
});