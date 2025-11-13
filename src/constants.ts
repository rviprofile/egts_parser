// Типы пакетов
export const EGTS_PT_RESPONSE = 0;
export const EGTS_PT_APPDATA = 1;
export const EGTS_PT_SIGNED_APPDATA = 2;

// Типы сервисов (SST - Source Service Type)
export const EGTS_AUTH_SERVICE = 1;
export const EGTS_TELEDATA_SERVICE = 2;
export const EGTS_COMMANDS_SERVICE = 3;
export const EGTS_FIRMWARE_SERVICE = 4;

// Типы подзаписей для EGTS_AUTH_SERVICE
export const EGTS_SR_RECORD_RESPONSE = 0;
export const EGTS_SR_TERM_IDENTITY = 1;
export const EGTS_SR_MODULE_DATA = 2;
export const EGTS_SR_VEHICLE_DATA = 3;
export const EGTS_SR_DISPATCHER_IDENTITY = 5;
export const EGTS_SR_AUTH_PARAMS = 6;
export const EGTS_SR_AUTH_INFO = 7;
export const EGTS_SR_SERVICE_INFO = 8;
export const EGTS_SR_RESULT_CODE = 9;