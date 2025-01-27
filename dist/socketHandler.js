"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const messageParser_1 = require("./messageParser");
// Массив и коллекция для хранения подключений трекеров
const trackers = new Map();
// Создаем сервер для приема TCP-соединений
const server = net_1.default.createServer((socket) => {
    console.log("Трекер подключился");
    // Инициализируем данные для нового трекера
    trackers.set(socket, {
        PID: 0, // Счетчик отправленных сообщений от сервера для каждого трекера
    });
    // Обрабатываем поступающие данные
    socket.on("data", (data) => {
        try {
            // Передаем данные на парсинг, а также возможность отправки ответа
            (0, messageParser_1.parseEGTSMessage)({
                buffer: data,
                socket: socket,
                trackers: trackers,
            });
        }
        catch (error) {
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
