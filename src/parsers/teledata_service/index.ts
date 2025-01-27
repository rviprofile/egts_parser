import { socketSender } from "../../socketSender";
import { parseServiseProps } from "../../types";
import { parseAbsAnSensData } from "./an_sens_data";
import { parseAbsDigSensData } from "./big_sense_data";
import { parseExtPosData } from "./ext_pos_data";
import { parsePosData } from "./pos_data";
import { createTeleDataResponse } from "./create-response";

const subrecordParsers = {
  16: parsePosData, // EGTS_SR_POS_DATA
  17: parseExtPosData, // EGTS_SR_EXT_POS_DATA
  23: parseAbsDigSensData, // EGTS_SR_ABS_DIG_SENS_DATA
  24: parseAbsAnSensData, // EGTS_SR_ABS_AN_SENS_DATA
  // другие подзаписи...
};

export function parseEGTSTeledataService({
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
      // Получаем текущие данные по socket
      const currentData = trackers.get(socket) || {};
      // Обновляем объект с новыми данными, не удаляя старые
      result &&
        trackers.set(socket, {
          ...currentData, // Сохраняем старые данные
          ["TELEDATA_" + subrecordType + "_" + offset]: result, // Добавляем/обновляем поле AUTH
        });
    } else {
      console.warn(
        `TELEDATA_SERVICE: Неизвестный тип подзаписи: ${subrecordType}`
      );
    }
    // if (subrecordType === 16) {
    //   console.log(`Отправили подтверждение на EGTS_SR_POS_DATA. PRID: ${pid}`);
    //   socketSender({
    //     socket: socket,
    //     trackers: trackers,
    //     message: createTeleDataResponse({ socket, trackers, pid }),
    //   });
    // }
  }
}
