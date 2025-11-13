import { parseServiseProps } from "../../types";

export function parseEGTSCommandsService({
  record,
  socket,
  pid,
  trackers,
}: parseServiseProps) {
  let offset = 0;

  while (offset < record.length) {
    // --- Заголовок подзаписи ---
    const subrecordType = record.readUInt8(offset);
    const subrecordLength = record.readUInt16LE(offset + 1);
    const subrecordData = record.subarray(
      offset + 3,
      offset + 3 + subrecordLength
    );

    offset += 3 + subrecordLength; // Переходим к следующей подзаписи

    console.log("COMMAND_SERVICE SRT: ", subrecordType);
    console.log("COMMAND_SERVICE SRL: ", subrecordLength);

    // --- Расшифровка SRD для команд ---
    if (subrecordLength >= 3) {
      const CT = subrecordData.readUInt8(0); // Command Type
      const CCT = subrecordData.readUInt8(1); // Command Confirmation Type
      const param = subrecordData.readUInt8(2); // Параметр команды (битовое поле выходов)

      console.log("COMMAND_SERVICE SRD: ", subrecordData);
      console.log("CT (Command Type): 0x" + CT.toString(16));
      console.log("CCT (Confirmation Type): 0x" + CCT.toString(16));
      console.log(
        "Command Data (outputs bits): 0b" + param.toString(2).padStart(8, "0")
      );

      // Дополнительно можно проверять, какая команда и какой выход
      if (CT === 0x09) console.log("EGTS_FLEET_DOUT_ON");
      if (CT === 0x0a) console.log("EGTS_FLEET_DOUT_OFF");
      if (CT === 0x0b) console.log("EGTS_FLEET_GET_DOUT_DATA");
    } else {
      console.log("COMMAND_SERVICE SRD too short for parsing");
    }
  }
}
