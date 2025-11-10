import { EGTS_PT_APPDATA } from "../../constants";

/**
 * Записывает 16-битное целое число (unsigned) в буфер в формате Little Endian
 * и возвращает новый смещённый указатель `offset`.
 *
 * @param {number} value - Значение для записи (0–65535).
 * @param {number} offset - Текущая позиция в буфере, куда будет записано значение.
 * @param {Buffer} buffer - Буфер, в который производится запись.
 * @returns {number} Новый `offset`, увеличенный на 2 байта.
 *
 * @example
 * ```ts
 * let offset = 0;
 * const buffer = Buffer.alloc(10);
 * offset = writeUInt16LE(513, offset, buffer);
 * // buffer теперь содержит [0x01, 0x02, ...]
 * ```
 */
function writeUInt16LE(value, offset, buffer) {
  buffer.writeUInt16LE(value, offset);
  return offset + 2;
}

/**
 * Записывает 8-битное целое число (unsigned) в буфер
 * и возвращает новый смещённый указатель `offset`.
 *
 * @param {number} value - Значение для записи (0–255).
 * @param {number} offset - Текущая позиция в буфере, куда будет записано значение.
 * @param {Buffer} buffer - Буфер, в который производится запись.
 * @returns {number} Новый `offset`, увеличенный на 1 байт.
 *
 * @example
 * ```ts
 * let offset = 0;
 * const buffer = Buffer.alloc(5);
 * offset = writeUInt8(255, offset, buffer);
 * // buffer теперь содержит [0xFF, ...]
 * ```
 */
function writeUInt8(value, offset, buffer) {
  buffer.writeUInt8(value, offset);
  return offset + 1;
}

/**
 * Формирует EGTS-ответ в бинарном виде (`Buffer`).
 *
 * Эта функция используется для генерации служебного пакета подтверждения (response),
 * который отправляется в ответ на входящий пакет `EGTS_PT_APPDATA`.
 *
 * В ответ включается:
 * - идентификатор исходного пакета (`responsePacketID`),
 * - код результата обработки (`processingResult`),
 * - набор записей (`records`), каждая из которых содержит номер подтверждённой записи
 *   и статус `EGTS_PC_OK`.
 *
 * @param {object} params - Параметры ответа.
 * @param {any} params.packet - Исходный EGTS-пакет, полученный от устройства.
 * @param {number} params.recordNum - Номер записи (Record Number), присваиваемый ответу.
 * @param {number} params.pid - Уникальный идентификатор пакета (Packet ID) для ответа.
 * @returns {Buffer} Сформированный бинарный буфер ответа EGTS.
 *
 * @example
 * ```ts
 * const responseBuffer = prepareAnswer({
 *   packet: {
 *     packetType: EGTS_PT_APPDATA,
 *     packetID: 42,
 *     errorCode: 0,
 *     servicesFrameData: [
 *       { recordNumber: 1, sourceServiceType: 5 },
 *       { recordNumber: 2, sourceServiceType: 5 },
 *     ],
 *   },
 *   recordNum: 100,
 *   pid: 200,
 * });
 *
 * console.log(responseBuffer);
 * // <Buffer 01 00 c0 0b 00 0b 00 c8 00 00 2a 00 00 01 00 00 02 00 00>
 * ```
 */
export function prepareAnswer({ packet, recordNum, pid }) {
  const EGTS_PT_RESPONSE = 0; // Define the EGTS response packet type
  const EGTS_PC_OK = 0; // Define the EGTS OK status

  if (packet.packetType === EGTS_PT_APPDATA) {
    let records: any = [];
    let serviceType = 0;

    if (packet.servicesFrameData) {
      packet.servicesFrameData.forEach((record) => {
        records.push({
          confirmedRecordNumber: record.recordNumber,
          recordStatus: EGTS_PC_OK,
        });
        serviceType = record.sourceServiceType;
      });

      const response = {
        responsePacketID: packet.packetID,
        processingResult: packet.errorCode,
        SDR: [
          {
            recordLength: records.length,
            recordNumber: recordNum,
            SSOD: "0",
            RSOD: "1",
            GRP: "0",
            RPP: "11",
            TMFE: "0",
            EVFE: "0",
            OBFE: "0",
            sourceServiceType: serviceType,
            recipientServiceType: serviceType,
            recordsData: records,
          },
        ],
      };

      // Estimate buffer size: 11 bytes for header + response fields
      const buffer = Buffer.alloc(256); // Allocate a buffer (adjust size if needed)
      let offset = 0;

      // Write header fields
      offset = writeUInt8(1, offset, buffer); // Protocol version
      offset = writeUInt8(0, offset, buffer); // Security Key ID
      offset = writeUInt8(0b11000000, offset, buffer); // PRF, RTE, ENA, CMP, PR
      offset = writeUInt8(11, offset, buffer); // Header length
      offset = writeUInt8(0, offset, buffer); // Header encoding
      offset = writeUInt16LE(3 + 4 * records.length, offset, buffer); // Frame Data Length (estimate)
      offset = writeUInt16LE(pid, offset, buffer); // Packet ID
      offset = writeUInt8(EGTS_PT_RESPONSE, offset, buffer); // Packet Type

      // Write services frame data
      offset = writeUInt16LE(packet.packetID, offset, buffer); // Response Packet ID
      offset = writeUInt8(packet.errorCode, offset, buffer); // Processing result

      // Write each record response
      records.forEach((record) => {
        offset = writeUInt16LE(record.confirmedRecordNumber, offset, buffer); // Confirmed record number
        offset = writeUInt8(record.recordStatus, offset, buffer); // Record status
      });

      return buffer.subarray(0, offset); // Return the buffer up to the current offset
    }
  }

  return Buffer.alloc(0); // Return an empty buffer if no response is generated
}
