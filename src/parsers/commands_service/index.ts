import { EGTS_SR_COMMAND_DATA, EGTS_SR_RECORD_RESPONSE } from "../../constants";
import { parseServiseProps } from "../../types";
import { parseCommandData } from "./command-data";
import { parseRecordResponse } from "./record-response";

/** Cписок подзаписей сервиса EGTS_COMMAND_SERVICE */
const subrecordParsers = {
  /**
   * EGTS_SR_RECORD_RESPONSE — Подзапись применяется для подтверждения процесса обработки записи протокола уровня
   * поддержки услуг. Данный тип подзаписи должен поддерживаться всеми сервисами
   */
  [EGTS_SR_RECORD_RESPONSE]: parseRecordResponse,
  /**
   * EGTS_SR_COMMAND_DATA — Подзапись используется АСН и ТП для передачи команд, информационных сообщений,
   * подтверждений доставки, подтверждений выполнения команд, подтверждения прочтения сообщений и т.п.
   */
  [EGTS_SR_COMMAND_DATA]: parseCommandData,
};

export function parseEGTSCommandsService({
  record,
  socket,
  pid,
  trackers,
}: parseServiseProps) {
  let offset = 0;

  // Пока не дошли до конца буфера записи
  while (offset < record.length) {
    /** 1 байт — тип подзаписи (Subrecord Type) */
    const subrecordType = record.readUInt8(offset);
    /** 2 байта (младший порядок) — длина подзаписи (Subrecord Length) */
    const subrecordLength = record.readUInt16LE(offset + 1);
    /** Содержимое подзаписи */
    const subrecordData = record.subarray(
      offset + 3,
      offset + 3 + subrecordLength
    );

    // Сдвигаем смещение к следующей подзаписи
    offset += 3 + subrecordLength;

    /** Зарегистрированный парсер для данного типа подзаписи */
    const parserFn = subrecordParsers[subrecordType];
    // Если парсер найден
    if (parserFn) {
      /** Результат расшифровки содержимого подзаписи */
      const result = parserFn(subrecordData);
    } else {
      process.env.CONSOLE_EGTS &&
        console.log(
          `\x1b[33mПарсер для Subrecord Type: ${subrecordType} не найден\x1b[0m`
        );
    }
  }
}
