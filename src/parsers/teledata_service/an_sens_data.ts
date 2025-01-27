import { parseNavigationTime } from "../../utils/parseNavigationTime";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { formatSeconds } from "../../utils/secondsToString";
import { absAnSensDataFlagsSchema } from "./schemas";
const asn_map = new Map();
// Переменная для хранения таймера
let updateTimeout: NodeJS.Timeout | null = null;
// Функция для вывода таблицы в консоль
function printASNTable() {
  console.table(
    [...asn_map.entries()].map(([key, value]) =>
      parseABS({ ASN: key, ASV: value })
    )
  );
}

function parseABS({ ASN, ASV }: { ASN: number; ASV: Buffer }) {
  const dictionary = {
    16: { name: "HDOP", float: true },
    3: { name: "Время работы устройства", float: false, type: "seconds" },
    4: { name: "Текущее время", float: false, },
    5: { name: "Режим работы", float: false },
    19: { name: "Видимых спутников GPS", float: false },
    20: { name: "Видимых спутников ГЛОНАСС", float: false },
    23: { name: "Одометр GPS", float: true },
    116: { name: "Внутренний датчик температуры", float: true },
    117: { name: "Напряжение бортовой сети", float: true },
    118: { name: "Напряжение встроенной АКБ", float: true },
    153: { name: "CAN: Полный пробег, км.", float: false },
    161: { name: "CAN: Скорость, км/ч", float: true },
    158: { name: "CAN: Уровень топлива, л.", float: false },
  };
  const parseFloatPointValue = (buffer: Buffer) => {
    const value = buffer.readUIntLE(0, 3);
    if (dictionary[ASN].type === 'seconds') {
      return formatSeconds(value)
    }
    if (dictionary[ASN].float) {
      return (value - 8388607) / 10;
    } else {
      return value;
    }
  };

  return {
    ASN: ASN,
    Name: dictionary[ASN].name,
    ASV: parseFloatPointValue(ASV),
  };
}

export function parseAbsAnSensData(buffer: Buffer) {
  if (buffer.length !== 4) {
    throw new Error("Некорректный размер буфера. Ожидается 4 байта.");
  }

  const result: any = parseRecordWithSchema({
    buffer: buffer,
    schema: absAnSensDataFlagsSchema,
    flags: {},
  });

  asn_map.set(result.ASN, result.ASV);

  // Сбрасываем таймер при каждом обновлении
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  // Устанавливаем новый таймер на 2 секунды
  updateTimeout = setTimeout(() => {
    // Если карта не обновлялась 2 секунды, выводим её содержимое
    printASNTable();
  }, 2000); // Задержка в 2 секунды
}
