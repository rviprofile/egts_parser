import { describe } from "node:test";
import { FlagsSchemaType } from "../types";
import { parseFlags } from "../utils/flags-parser";

// Пример схемы флагов
const flagSchema: FlagsSchemaType = {
  flag1: { length: 1, position: 0 }, // 1-битовый флаг на позиции 0
  flag2: { length: 2, position: 1 }, // 2-битовый флаг на позиции 1
  flag3: { length: 3, position: 3 }, // 3-битовый флаг на позиции 3
};

describe("parseFlags", () => {
  it("Должен корректно разбирать байтовые значения флагов", () => {
    const flagsByte = Buffer.from([0b00101101]); // Пример байта с флагами
    const expectedFlags = {
      flag1: 1, // 1-й бит
      flag2: 2, // 2-й и 3-й бит
      flag3: 5, // 4-й, 5-й и 6-й биты
    };

    const result = parseFlags({ flagsByte, flagSchema });
    expect(result).toEqual(expectedFlags);
  });
});
