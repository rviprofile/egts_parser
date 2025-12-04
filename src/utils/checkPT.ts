import { CRC16 } from "./crc16";
import { CRC8 } from "./crc8";

export const checkPT = ({
  result_PT,
  buffer,
  flags_PT,
}: {
  result_PT: { [key: string]: any };
  buffer: Buffer;
  flags_PT: {
    [key: string]: any;
  };
}): boolean => {
  const result: boolean[] = [];

  if (result_PT["HL"] === 11 || result_PT["HL"] === 16) {
    process.env.CONSOLE_EGTS &&
      console.log("HL (Header Length): \x1b[32mДлинна заголовка ✅\x1b[0m");
    result.push(true);
  } else {
    process.env.CONSOLE_EGTS &&
      console.log(
        `HL (Header Length): \x1b[31mДлинна заголовка не корректна.\x1b[0m Поддерживается 11 или 16, получено ${result_PT["HL"]}`
      );
    result.push(false);
  }

  /** Проверка контрольной суммы (HCS) */
  if (result_PT["HCS"] !== CRC8(buffer.subarray(0, buffer.readUInt8(3) - 1))) {
    process.env.CONSOLE_EGTS &&
      console.log(
        "HCS (Header Check Sum): \x1b[31mОшибка контрольной суммы заголовка\x1b[0m"
      );
    result.push(false);
  } else {
    process.env.CONSOLE_EGTS &&
      console.log(
        "HCS (Header Check Sum): \x1b[32mКонтрольная сумма заголовка ✅\x1b[0m"
      );
    result.push(true);
  }

  if (flags_PT["RTE"] !== 0) {
    process.env.CONSOLE_EGTS &&
      console.log(
        "RTE (Route): \x1b[33mНеобходима дальнейшая маршрутизация\x1b[0m"
      );
    process.env.CONSOLE_EGTS && console.log(result_PT["RCA"]);
    result.push(true);
  } else {
    process.env.CONSOLE_EGTS && console.log("RTE (Route): \x1b[32m0 ✅\x1b[0m");
    result.push(true);
  }

  if (
    result_PT["SFRD"] &&
    result_PT["SFRCS"] !==
      CRC16(buffer.subarray(result_PT["HL"], buffer.length - 2))
  ) {
    process.env.CONSOLE_EGTS &&
      console.log(
        `SFRCS (Services Frame Data Check Sum): \x1b[31mОшибка контрольной суммы данных\x1b[0m [${
          result_PT["SFRCS"]
        } и ${CRC16(buffer.subarray(result_PT["HL"], buffer.length - 2))}]`
      );
    process.env.CONSOLE_EGTS && console.log(`FDL: ${result_PT["FDL"]}`);
    process.env.CONSOLE_EGTS &&
      console.log(
        `SFRD length: ${
          buffer.subarray(result_PT["HL"], buffer.length - 2).length
        }`
      );
    result.push(false);
  } else if (result_PT["SFRD"]) {
    process.env.CONSOLE_EGTS &&
      console.log(
        "SFRCS (Services Frame Data Check Sum): \x1b[32mКонтрольная сумма данных ✅\x1b[0m"
      );
    result.push(true);
  }
  return !result.some((res) => res === false);
};
