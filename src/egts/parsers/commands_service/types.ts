// Список команд для АСН
export const EGTS_FLEET_DOUT_ON = { code: 0x0009, type: "UInt16LE" }; // Активация дискретных выходов
export const EGTS_FLEET_DOUT_OFF = { code: 0x000a, type: "UInt16LE" }; // Деактивация дискретных выходов
export const EGTS_FLEET_GET_DOUT_DATA = { code: 0x000b }; // Запрос состояния дискретных выходов
export const EGTS_FLEET_GET_POS_DATA = { code: 0x000c }; // Запрос текущих данных местоположения
export const EGTS_FLEET_GET_SENSORS_DATA = { code: 0x000d }; // Запрос состояния дискретных и аналоговых входов
export const EGTS_FLEET_GET_LIN_DATA = { code: 0x000e }; // Запрос состояния шлейфовых входов
export const EGTS_FLEET_GET_CIN_DATA = { code: 0x000f }; // Запрос состояния счетных входов
export const EGTS_FLEET_GET_STATE = { code: 0x0010 }; // Запрос состояния АСН
export const EGTS_FLEET_ODOM_CLEAR = { code: 0x0011 }; // Команда для обнуления показаний внутреннего одометра АСН

// CT (Command Type)
// export const CT_COMCONF = 0001;
// export const CT_MSGCONF = 0010;
// export const CT_MSGFROM = 0011;
// export const CT_MSGTO = 0100;
// export const CT_COM = 0101; // Команда для выполнения на АСН
// export const CT_DELCOM = 0110;
// export const CT_SUBREQ = 0111;
// export const CT_DELIV = 1000;

// CCT (Command Confirmation Type)
// export const CC_OK = 0000;
// export const CC_ERROR = 0001;
// export const CC_ILL = 0010;
// export const CC_DEL = 0011;
// export const CC_NFOUND = 0100;
// export const CC_NCONF = 0101;
// export const CC_INPROG = 0110;

