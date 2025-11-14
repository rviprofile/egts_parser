import { socketSenderProps } from "./types";

/**
 *  Функция для отпарвки сообщений по сокету.
 *
 *  @param socket Соединение по которому пойдет сообщение
 *  @param message Данные для отправки
 *  @param trackers Коллекция всех трекеров. Здесь необходимо для подсчета сообщений
 *
 * */
export function socketSender({ socket, message, trackers }: socketSenderProps) {
  if (socket && trackers.get(socket) !== undefined) {
    socket.write(message);
  }
}
