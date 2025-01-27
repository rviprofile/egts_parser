import { parseTermIdentity } from "./term_identity";
import { createAuthSuccessMessage } from "./create-message";
import net from "net";
import { socketSender } from "../../socketSender";
import { parseServiseProps } from "../../types";
import { createCommand } from "../commands_service/create_command";
import { prepareAnswer } from "./create-response";

const subrecordParsers = {
  1: parseTermIdentity, // EGTS_SR_TERM_IDENTITY
  // 2: EGTS_SR_MODULE_DATA
  // 3: EGTS_SR_VEHICLE_DATA
  // 5: EGTS_SR_DISPATCHER_IDENTITY
  // 6: EGTS_SR_AUTH_PARAMS
  // 7: EGTS_SR_AUTH_INFO
  // 8: EGTS_SR_SERVICE_INFO
  // 9: EGTS_SR_RESULT_CODE
};

export function parseEGTSAuthService({
  record,
  socket,
  pid,
  trackers,
}: parseServiseProps) {
  let offset = 0;

  while (offset < record.length) {
    const subrecordType = record.readUInt8(offset);
    const subrecordLength = record.readUInt16LE(offset + 1);
    const subrecordData = record.subarray(
      offset + 3,
      offset + 3 + subrecordLength
    );

    offset += 3 + subrecordLength; // Сдвигаем смещение к следующей подзаписи

    const parserFn = subrecordParsers[subrecordType];

    if (parserFn) {
      const result = parserFn(subrecordData);

      const result_table: any = [];
      Object.keys(result).map((key) => {
        result_table.push({
          AUTH: key,
          value: result[key],
        });
      });
      console.table(result_table);
      // Получаем текущие данные по socket
      const currentData = trackers.get(socket) || {};
      // Обновляем объект с новыми данными, не удаляя старые
      trackers.set(socket, {
        ...currentData, // Сохраняем старые данные
        AUTH: result, // Добавляем/обновляем поле AUTH
      });

      // Здесь будет проверка на наличия автомобиля в базе
      const isLogin = true;

      if (isLogin) {
        // const response = prepareAnswer({
        //   packet: {
        //     packetType: 1,
        //     servicesFrameData: [{ recordNumber: 1, sourceServiceType: 3 }],
        //     packetID: pid,
        //     errorCode: 0,
        //   },
        //   recordNum: trackers.get(socket)!.PID,
        //   pid: pid,
        // });
        // socketSender({
        //   socket: socket,
        //   message: response,
        //   trackers: trackers,
        // });
        // console.log(
        //   `Отправили подтверждение на сообщение авторизации. PRID: ${pid}`
        // );
        const success = createAuthSuccessMessage({
          socket: socket,
          trackers: trackers,
        });
        socketSender({
          socket: socket,
          message: success,
          trackers: trackers,
        });
        console.log("Отправили ответ на сообщение авторизации");
        const command = createCommand({
          socket: socket,
          trackers: trackers,
        });
        // setTimeout(() => {
        //   console.log("Отправили команду");
        //   socketSender({
        //     socket: socket,
        //     message: command,
        //     trackers: trackers,
        //   });
        // }, 5000);
      }
    } else {
      console.log(`AUTH_SERVICE SRT: ${subrecordType}`);
      console.log(`AUTH_SERVICE SRL: ${subrecordLength}`);
      console.log(`AUTH_SERVICE SRD: `, subrecordData);
    }
  }
}
