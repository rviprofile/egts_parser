// Схема для флагов
export const termIdentityFlagSchema = {
  hdide: { length: 1, position: 0 }, // Home Dispatcher Identifier Exists
  imeie: { length: 1, position: 1 }, // IMEI Exists
  imsie: { length: 1, position: 2 }, // IMSI Exists
  lngce: { length: 1, position: 3 }, // Language Code Exists
  nide: { length: 1, position: 5 }, // Network Identifier Exists
  bse: { length: 1, position: 6 }, // Buffer Size Exists
  mne: { length: 1, position: 7 }, // Mobile Network Exists
};

// Схема для записи Term Identity
export const termIdentitySchema = {
  TID: { type: "UInt32LE", length: 4 }, // TID (Terminal Identifier)
  Flags: { type: "UInt8", length: 1 }, // Флаги будут парситься отдельно
  HDID: { type: "UInt16LE", flag: "hdide" }, // HDID (Home Dispatcher Identifier)
  IMEI: { type: "String", length: 15, flag: "imeie" }, // IMEI (International Mobile Equipment Identity) 
  IMSI: { type: "String", length: 16, flag: "imsie" }, // IMSI (International Mobile Subscriber Identity)
  LNGC: { type: "String", length: 3, flag: "lngce" }, // LNGC (Language Code) 
  NID: { type: "Binary", length: 3, flag: "nide" }, // NID (Network Identifier) 
  BS: { type: "UInt16LE", length: 4, flag: "bse" }, // BS (Buffer Size)
  MSISDN: { type: "String", length: 15, flag: "mne" }, // MSISDN (Mobile Station Integrated Services Digital Network Number)
    
};
