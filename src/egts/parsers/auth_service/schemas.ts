import { SchemaType } from "../../../types";

/** Схема флагов подзаписи EGTS_SR_TERM_IDENTITY сервиса EGTS_AUTH_SERVICE */
export const termIdentityFlagSchema: {
  [key: string]: {
    length: number;
    position: number;
  };
} = {
  /** HDIDE (Home Dispatcher Identifier Exists) - битовый флаг, который определяет наличие
   * поля HDID в подзаписи (если бит равен 1, то поле передается, если 0, то не передается) */
  hdide: { length: 1, position: 0 },

  /** IMEIE (International Mobile Equipment Identity Exists) - битовый флаг, который
   * определяет наличие поля IMEI в подзаписи (если бит равен 1, то поле передается, если 0,
   * то не передается) */
  imeie: { length: 1, position: 1 },

  /** IMSIE (International Mobile Subscriber Identity Exists) - битовый флаг, который определяет
   * наличие поля IMSI в подзаписи (если бит равен 1, то поле передается, если 0, то не
   * передается) */
  imsie: { length: 1, position: 2 },

  /** LNGCE (Language Code Exists) - битовый флаг, который определяет наличие поля LNGC
   * в подзаписи (если бит равен 1, то поле передается, если 0, то не передается) */
  lngce: { length: 1, position: 3 },

  /** SSRA - битовый флаг предназначен для определения алгоритма использования сервисов
   * (если бит равен 1, то используется "простой" алгоритм, если 0, то алгоритм "запросов" на
   * использование сервисов), */
  ssra: { length: 1, position: 4 },

  /** NIDE (Network Identifier Exists) - битовый флаг определяет наличие поля NID в
   * подзаписи (если бит равен 1, то поле передается, если 0, то не передается) */
  nide: { length: 1, position: 5 },

  /** BSE (Buffer Size Exists) - битовый флаг, определяющий наличие поля BS в подзаписи
   * (если бит равен 1, то поле передается, если 0, то не передается) */
  bse: { length: 1, position: 6 },

  /** MNE (Mobile Network Exists) - битовый флаг, определяющий наличие поля MSISDN в
   * подзаписи (если бит равен 1, то поле передается, если 0, то не передается) */
  mne: { length: 1, position: 7 },
};

/** Схема подзаписи EGTS_SR_TERM_IDENTITY сервиса EGTS_AUTH_SERVICE */
export const termIdentitySchema: SchemaType = {
  /**
   * TID (Terminal Identifier) — уникальный идентификатор, назначаемый при программировании АСН.
   */
  TID: { type: "UInt32LE", length: 4 },

  /** @see termIdentityFlagSchema */
  Flags: { type: "UInt8", length: 1 },

  /**
   * HDID (Home Dispatcher Identifier) - идентификатор "домашней" ТП
   * (подробная учетнаяинформация о терминале хранится на данной ТП)
   */
  HDID: { type: "UInt16LE", length: 2, flag: "hdide" },

  /**
   * IMEI (International Mobile Equipment Identity) - идентификатор мобильного устройства (модема).
   * При невозможности определения данного параметра, АСН должна заполнять
   * данное поле значением 0 во всех 15 символах
   */
  IMEI: { type: "String", length: 15, flag: "imeie" },

  /**
   * IMSI (International Mobile Subscriber Identity) - идентификатор мобильного абонента.
   * При невозможности определения данного параметра АСН должна заполнять данное поле
   * значением 0 во всех 16 символах
   */
  IMSI: { type: "String", length: 16, flag: "imsie" },

  /**
   * LNGC (Language Code) - код языка, предпочтительного к использованию на стороне АСН,
   * например "rus" - русский
   */
  LNGC: { type: "String", length: 3, flag: "lngce" },

  /**
   * NID (Network Identifier) - идентификатор сети оператора, в которой зарегистрированаАСН на данный момент.
   * Используются 20 младших бит. Представляет пару кодов MCC-MNC
   */
  NID: { type: "Binary", length: 3, flag: "nide" },

  /**
   * BS (Buffer Size) - максимальный размер буфера приема АСН в байтах.
   */
  BS: { type: "UInt16LE", length: 4, flag: "bse" },

  /**
   * MSISDN (Mobile Station Integrated Services Digital Network Number) - телефонный номер мобильного абонента.
   * При невозможности определения данного параметра устройство
   * должно заполнять данное поле значением 0 во всех 15 символах
   */
  MSISDN: { type: "String", length: 15, flag: "mne" },
};

export const termIdentityFlagsDictionary = {
  hdide: "HDIDE (Home Dispatcher Identifier Exists)",
  imeie: "IMEIE (International Mobile Equipment Identity Exists)",
  imsie: "IMSIE (International Mobile Subscriber Identity Exists)",
  lngce: "LNGCE (Language Code Exists)",
  ssra: "SSRA",
  nide: "NIDE (Network Identifier Exists)",
  bse: "BSE (Buffer Size Exists)",
  mne: "MNE (Mobile Network Exists)",
};

export const termIdentityDictionary = {
  TID: "TID (Terminal Identifier)",
  Flags: "Flags",
  HDID: "HDID (Home Dispatcher Identifier)",
  IMEI: "IMEI (International Mobile Equipment Identity)",
  IMSI: "IMSI (International Mobile Subscriber Identity)",
  LNGC: "LNGC (Language Code)",
  NID: "NID (Network Identifier)",
  BS: "BS (Buffer Size)",
  MSISDN: "MSISDN (Mobile Station Integrated Services Digital Network Number)",
};

export const recordResponseSchema: SchemaType = {
  crn: { type: "UInt16LE", length: 2 },
  rst: { type: "UInt8", length: 1 },
};

export const recordResponseDictionary = {
  crn: "CRN (Confirmed Record Number)",
  rst: "RST (Record Status)",
};
