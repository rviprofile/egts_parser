import { parseTermIdentity } from "./term_identity";
import { createAuthSuccessMessage } from "./create_message";
import { socketSender } from "../../socketSender";
import { parseServiseProps } from "../../../types";
import { createCommand } from "../commands_service/create_command";
import { parseRecordResponse } from "./record-response";
import {
  EGTS_SR_RECORD_RESPONSE,
  EGTS_SR_TERM_IDENTITY,
} from "../../constants";
import { BOOL } from "../../utils/boolEnv";

/**
 * Словарь функций-парсеров для разных подтипов подзаписей EGTS_AUTH_SERVICE.
 * Каждый подтип подзаписи (Subrecord Type) имеет свой номер по спецификации EGTS.
 *
 * Тип 0 - специальный, зарезервирован за подзаписью подтверждения данных для каждого сервиса.
 */
const subrecordParsers = {
  [EGTS_SR_RECORD_RESPONSE]: parseRecordResponse,
  [EGTS_SR_TERM_IDENTITY]: parseTermIdentity,
  // 2: EGTS_SR_MODULE_DATA
  // 3: EGTS_SR_VEHICLE_DATA
  // 5: EGTS_SR_DISPATCHER_IDENTITY
  // 6: EGTS_SR_AUTH_PARAMS
  // 7: EGTS_SR_AUTH_INFO
  // 8: EGTS_SR_SERVICE_INFO
  // 9: EGTS_SR_RESULT_CODE
};

/**
 * Главная функция для парсинга службы EGTS_AUTH_SERVICE
 * (служба авторизации устройства на сервере).
 */
export function parseEGTSAuthService({
  record,
  socket,
  pid,
  trackers,
}: parseServiseProps) {
  /** Смещение внутри буфера записи */
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
      const result = parserFn({
        buffer: subrecordData,
        socket,
        trackers,
      });

      // Получаем текущее состояние трекера, привязанного к этому сокету
      const currentData = trackers.get(socket) || {};
      // Обновляем Map с данными — сохраняем старые значения, добавляем новые из AUTH
      trackers.set(socket, {
        ...currentData, // Сохраняем старые данные
        AUTH: result, // Добавляем/обновляем поле AUTH
      });

      // --- Этап проверки логина (в реальности тут должен быть запрос в базу данных) ---
      const isLogin = true;

      if (isLogin && subrecordType === 1) {
        /** Готовое сообщение "успешной авторизации" (EGTS_AUTH_SERVICE response) */
        const success: Buffer = createAuthSuccessMessage({
          tracker: trackers.get(socket),
        });
        BOOL(process.env.CONSOLE_EGTS) &&
          console.log(
            `\x1b[34mОтправили сообщение об успешной авторизации с запросом телеметрии. PID: ${
              trackers.get(socket)?.PID || 0
            }\x1b[0m`
          );
        // Отправляем это сообщение через сокет трекеру
        socketSender({
          socket: socket,
          message: success,
          trackers: trackers,
        });

        // const command = createCommand({
        //   /** ADR (Address) - адрес модуля, для которого данная команда предназначена. */
        //   address: 0x0000,

        //   /**
        //    * ACT (Action) - описание действия, используемое в случае типа команды.
        //    * 0 - параметры передаваемой команды, которая задается кодом из поля CCD.
        //    * 2 - установка значения. Используется для установки нового значения определенному
        //    * параметру в АСН. Устанавливаемый параметр определяется кодом из поля CCD, а его
        //    * значение полем DT */
        //   act: 0,
        //   command_code: 0x000d, // EGTS_FLEET_GET_SENSORS_DATA
        //   data: Buffer.from([0x01]),
        //   tracker: trackers.get(socket),
        // });
        // setTimeout(() => {
        //   console.log(
        //     `\x1b[34mОтправили команду. PID: ${
        //       trackers.get(socket)?.PID || 0
        //     }\x1b[0m`,
        //     command.toString("hex")
        //   );
        //   socketSender({
        //     socket: socket,
        //     message: command,
        //     trackers: trackers,
        //   });
        // }, 5000);
      }
    } else {
      if (!BOOL(process.env.CONSOLE_EGTS)) return;
      console.log(
        `\x1b[33mПарсер для Subrecord Type: ${subrecordType} не найден\x1b[0m`
      );
      // Если парсер для данного подтипа не найден — просто логируем содержимое
      console.log(`AUTH_SERVICE SRT: ${subrecordType}`);
      console.log(`AUTH_SERVICE SRL: ${subrecordLength}`);
      console.log(`AUTH_SERVICE SRD: `, subrecordData);
    }
  }
}
