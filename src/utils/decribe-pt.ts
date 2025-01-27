export const describePacketFields = (code: string): string => {
  switch (code) {
    case "PRV":
      return "PRV (Protocol Version)";
    case "SKID":
      return "SKID (Security Key ID)";
    case "HL":
      return "HL (Header Length)";
    case "HE":
      return "HE (Header Encoding)";
    case "FDL":
      return "FDL (Frame Data Length)";
    case "PID":
      return "PID (Packet Identifier)";
    case "PT":
      return "PT (Packet Type)";
    case "HCS":
      return "HCS (Header Check Sum)";
    case "SFRD":
      return "SFRD (Services Frame Data)";
    case "SFRCS":
      return "SFRCS (Services Frame Data Check Sum)";
    default:
      return code;
  }
};
