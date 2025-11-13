import { processingResultCodesType } from "./types";

export const processingResultCodes: processingResultCodesType = {
  0: { value: "EGTS_PC_OK", description: "Успешно обработано" },
  1: { value: "EGTS_PC_IN_PROGRESS", description: " В процессе обработки" },
  128: {
    value: "EGTS_PC_UNS_PROTOCOL",
    description: " Неподдерживаемый протокол",
  },
  129: { value: "EGTS_PC_DECRYPT_ERROR", description: " Ошибка декодирования" },
  130: { value: "EGTS_PC_PROC_DENIED", description: " Обработка запрещена" },
  131: {
    value: "EGTS_PC_INC_HEADERFORM",
    description: " Неверный формат заголовка",
  },
  132: {
    value: "EGTS_PC_INC_DATAFORM",
    description: " Неверный формат данных",
  },
  133: { value: "EGTS_PC_UNS_TYPE", description: " Неподдерживаемый тип" },
  134: {
    value: "EGTS_PC_NOTEN_PARAM",
    description: "S Неверное число параметров",
  },
  135: {
    value: "EGTS_PC_DBL_PROC Попытка",
    description: " повторной обработки",
  },
  136: {
    value: "EGTS_PC_PROC_SRC_DENIED",
    description: " Обработка данных от источника запрещена",
  },
  137: {
    value: "EGTS_PC_HEADERCRC_ERROR",
    description: " Ошибка контрольной суммы заголовка",
  },
  138: {
    value: "EGTS_PC_DATACRC_ERROR",
    description: " Ошибка контрольной суммы данных",
  },
  139: {
    value: "EGTS_PC_INVDATALEN",
    description: " Некорректная длина данных",
  },
  140: { value: "EGTS_PC_ROUTE_NFOUND", description: " Маршрут не найден" },
  141: { value: "EGTS_PC_ROUTE_CLOSED", description: " Маршрут закрыт" },
  142: {
    value: "EGTS_PC_ROUTE_DENIED",
    description: " Маршрутизация запрещена",
  },
  143: { value: "EGTS_PC_INVADDR", description: " Неверный адрес" },
  144: {
    value: "EGTS_PC_TTLEXPIRED",
    description: " Превышено количество ретрансляции данных",
  },
  145: { value: "EGTS_PC_NO_ACK", description: " Нет подтверждения" },
  146: { value: "EGTS_PC_OBJ_NFOUND", description: " Объект не найден" },
  147: { value: "EGTS_PC_EVNT_NFOUND", description: " Событие не найдено" },
  148: { value: "EGTS_PC_SRVC_NFOUND", description: " Сервис не найден" },
  149: { value: "EGTS_PC_SRVC_DENIED", description: " Сервис запрещен" },
  150: { value: "EGTS_PC_SRVC_UNKN", description: " Неизвестный тип сервиса" },
  151: { value: "EGTS_PC_AUTH_DENIED", description: " Авторизация запрещена" },
  152: {
    value: "EGTS_PC_ALREADY_EXISTS",
    description: " Объект уже существует",
  },
  153: { value: "EGTS_PC_ID_NFOUND", description: " Идентификатор не найден" },
  154: {
    value: "EGTS_PC_INC_DATETIME",
    description: " Неправильная дата и время",
  },
  155: { value: "EGTS_PC_IO_ERROR", description: " Ошибка ввода/вывода" },
  156: { value: "EGTS_PC_NO_RES_AVAIL", description: " Недостаточно ресурсов" },
  157: {
    value: "EGTS_PC_MODULE_FAULT",
    description: " Внутренний сбой модуля",
  },
  158: {
    value: "EGTS_PC_MODULE_PWR_FLT",
    description: " Сбой в работе цепи питания модуля",
  },
  159: {
    value: "EGTS_PC_MODULE_PROC_FLT",
    description: " Сбой в работе микроконтроллера модуля",
  },
  160: {
    value: "EGTS_PC_MODULE_SW_FLT",
    description: " Сбой в работе программы модуля",
  },
  161: {
    value: "EGTS_PC_MODULE_FW_FLT",
    description: " Сбой в работе внутреннего ПО модуля",
  },
  162: {
    value: "EGTS_PC_MODULE_IO_FLT",
    description: " Сбой в работе блока ввода/вывода модуля",
  },
  163: {
    value: "EGTS_PC_MODULE_MEM_FLT",
    description: " Сбой в работе внутренней памяти модуля",
  },
  164: { value: "EGTS_PC_TEST_FAILED", description: " Тест не пройден" },
};
