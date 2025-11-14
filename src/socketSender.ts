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
  try {
    if (socket && trackers.get(socket) !== undefined) {
      socket.write(message);
    }
  } catch (error) {
    console.error(
      "[socketSender.ts]: ",
      "Ошибка при отправке сообщения:",
      error
    );
  }
}
