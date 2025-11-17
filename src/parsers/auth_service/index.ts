import { parseTermIdentity } from "./term_identity";
import { createAuthSuccessMessage } from "./create_message";
import { socketSender } from "../../socketSender";
import { parseServiseProps } from "../../types";
import { createCommand } from "../commands_service/create_command";
import { parseRecordResponse } from "./record-response";

/**
 * Словарь функций-парсеров для разных подтипов подзаписей EGTS_AUTH_SERVICE.
 * Каждый подтип подзаписи (Subrecord Type) имеет свой номер по спецификации EGTS.
 *
 * Тип 0 - специальный, зарезервирован за подзаписью подтверждения данных для каждого сервиса.
 */
const subrecordParsers = {
  0: parseRecordResponse, // EGTS_SR_RECORD_RESPONSE
  1: parseTermIdentity, // EGTS_SR_TERM_IDENTITY
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
      const result = parserFn(subrecordData);

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
          socket: socket,
          trackers: trackers,
        });
        console.log(
          `\x1b[34mОтправили сообщение об успешной авторизации с запросом телеметрии. PID: ${
            trackers.get(socket)?.PID || 0
          }\x1b[0m`
        );
        // Отправляем это сообщение через TCP-сокет обратно трекеру
        socketSender({
          socket: socket,
          message: success,
          trackers: trackers,
        });

        const command = createCommand({
          address: 1,
          act: 2, // установка значения
          command_code: 0x0009, // EGTS_FLEET_DOUT_ON
          data: Buffer.from([0x01, 0x00]), // bit 0 => ON
          socket,
          trackers,
        });
        setTimeout(() => {
          console.log(
            `\x1b[34mОтправили команду. PID: ${
              trackers.get(socket)?.PID || 0
            }\x1b[0m`,
            command.toString("hex")
          );
          socketSender({
            socket: socket,
            message: command,
            trackers: trackers,
          });
        }, 5000);
      }
    } else {
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
