import { checkPT } from "../utils/checkPT";
import { CRC16 } from "../utils/crc16";
import { CRC8 } from "../utils/crc8";

jest.mock("../utils/crc16");
jest.mock("../utils/crc8");

describe("checkPT", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const mockBuffer = Buffer.from([0x00, 0x00, 0x00, 0x0b, 0x01, 0x02, 0x03]);

  it("✅ возвращает true, если все проверки успешны", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x12);
    (CRC16 as jest.Mock).mockReturnValue(0xabcd);

    const result_PT = {
      HL: 11,
      HCS: 0x12,
      SFRCS: 0xabcd,
      SFRD: true,
    };
    const flags_PT = { RTE: 0 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Длинна заголовка ✅")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Контрольная сумма заголовка ✅")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Контрольная сумма данных ✅")
    );
  });

  it("❌ возвращает false при некорректной длине заголовка", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x00);

    const result_PT = { HL: 10, HCS: 0x00 };
    const flags_PT = { RTE: 0 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Длинна заголовка не корректна")
    );
  });

  it("❌ возвращает false при ошибке контрольной суммы заголовка", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x99);

    const result_PT = { HL: 11, HCS: 0x01 };
    const flags_PT = { RTE: 0 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ошибка контрольной суммы заголовка")
    );
  });

  it("⚠️ выводит сообщение о маршрутизации, если RTE ≠ 0", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x12);

    const result_PT = { HL: 11, HCS: 0x12 };
    const flags_PT = { RTE: 1 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(true); // RTE не влияет на корректность
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Необходима дальнейшая маршрутизация")
    );
  });

  it("❌ возвращает false при ошибке контрольной суммы данных", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x12);
    (CRC16 as jest.Mock).mockReturnValue(0x9999);

    const result_PT = {
      HL: 11,
      HCS: 0x12,
      SFRD: true,
      SFRCS: 0x1111,
    };
    const flags_PT = { RTE: 0 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ошибка контрольной суммы данных")
    );
  });

  it("✅ возвращает true, если SFRD отсутствует, но остальное корректно", () => {
    (CRC8 as jest.Mock).mockReturnValue(0x12);

    const result_PT = { HL: 16, HCS: 0x12, SFRD: undefined };
    const flags_PT = { RTE: 0 };

    const result = checkPT({ result_PT, buffer: mockBuffer, flags_PT });

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Длинна заголовка ✅")
    );
  });
});
