import net from "net";

export function socketSender({
  socket,
  message,
  trackers,
}: {
  socket: net.Socket;
  message: Buffer;
  trackers: Map<
    net.Socket,
    {
      [key: string]: number;
    }
  >;
}) {
  if (socket && trackers.get(socket) !== undefined) {
    // Увеличиваем счетчик отправленных сообщений
    trackers.get(socket)!.PID += 1;
    
    socket.write(message);
  }
}
