"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketSender = socketSender;
function socketSender({ socket, message, trackers, }) {
    if (socket && trackers.get(socket) !== undefined) {
        // Увеличиваем счетчик отправленных сообщений
        trackers.get(socket).PID += 1;
        socket.write(message);
    }
}
