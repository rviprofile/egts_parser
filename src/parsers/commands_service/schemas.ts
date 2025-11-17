import { SchemaType } from "../../types";

/** Схема флагов подзаписи EGTS_SR_COMMAND_DATA сервисаEGTS_COMMANDS_SERVICE */
export const commandDataFlagSchema: {
  [key: string]: {
    length: number;
    position: number;
  };
} = {
  ACFE: { length: 1, position: 0 },
  CHSFE: { length: 1, position: 0 },
};

export const commandDataFlagsDictionary = {
  ACFE: "ACFE (Authorization Code Field Exists)",
  CHSFE: "CHSFE (Charset Field Exists)",
};

export const commandDataSchema: SchemaType = {
  CT_CCT: { type: "UInt8", length: 1 },
  CID: { type: "UInt32LE", length: 4 },
  SID: { type: "UInt32LE", length: 4 },
  Flags: { type: "UInt8", length: 1 },
  CHS: { type: "UInt8", length: 1, flag: "CHSFE" },
  ACL: { type: "UInt8", length: 1, flag: "ACFE" },
  AC: { type: "Binary", flag: "ACFE", connection: "ACL" },
  CD: { type: "Binary" },
};

export const commandDataSchemaDictionary: { [key: string]: string } = {
  CT_CCT: "CT (Command Type) & CCT (Command Confirmation Type)",
  CID: "CID (Command Identifier)",
  SID: "SID (Source Identifier) ",
  Flags: "Flags",
  CHS: "CHS (Charset)",
  ACL: "ACL (Authorization Code Length)",
  AC: "AC (Authorization Code) ",
  CD: "CD (Command Data) ",
};

export const recordResponseSchema: SchemaType = {
  CRN: { length: 2, type: "UInt16LE" },
  RST: { length: 1, type: "UInt8" },
};

export const recordResponseSchemaDictionary: { [key: string]: string } = {
  CRN: "CRN (Confirmed Record Number)",
  RST: "RST (Record Status)",
};
