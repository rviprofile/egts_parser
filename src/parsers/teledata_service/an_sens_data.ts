import { parseNavigationTime } from "../../utils/parseNavigationTime";
import { parseRecordWithSchema } from "../../utils/schemaParser";
import { formatSeconds } from "../../utils/secondsToString";
import { absAnSensDataFlagsSchema } from "./schemas";

type parseABSProps = {
  ASN: number;
  ASV: Buffer;
};

const asn_map = new Map();

/** Таймер для отслеживания обновлений данных ASN */
let updateTimeout: NodeJS.Timeout | null = null;

/**
 * Выводит в консоль таблицу со всеми распознанными ASN-данными.
 *
 * Использует `parseABS()` для декодирования содержимого `asn_map`.
 * Таблица автоматически выводится через 2 секунды после последнего обновления данных.
 *
 * @use `parseABS`
 *
 * @example
 * ```
 * // Пример вывода:
 * ┌─────────┬─────┬────────────────────────────────────────┬────────────┐
 * │ (index) │ ASN │                 Name                   │    ASV     │
 * ├─────────┼─────┼────────────────────────────────────────┼────────────┤
 * │    0    │  16 │                 HDOP                   │   0.8      │
 * │    1    │ 117 │     Напряжение бортовой сети           │  13.7      │
 * │    2    │   3 │     Время работы устройства            │ "2 hours"  │
 * └─────────┴─────┴────────────────────────────────────────┴────────────┘
 * ```
 */
function printASNTable() {
  console.table(
    [...asn_map.entries()].map(([key, value]) =>
      parseABS({ ASN: key, ASV: value })
    )
  );
}

/** Словарь для преобразования ASN в человекочитаемые названия */
const dictionary = {
  16: { name: "HDOP", float: true },
  3: { name: "Время работы устройства", float: false, type: "seconds" },
  4: { name: "Текущее время", float: false },
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

function parseABS({ ASN, ASV }: parseABSProps) {
  const parseFloatPointValue = (buffer: Buffer) => {
    const value = buffer.readUIntLE(0, 3);
    if (dictionary[ASN].type === "seconds") {
      return formatSeconds(value);
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

/**
 * Функция для парсинга данных ABS/ASN-сенсоров из бинарного буфера.
 *
 * - Проверяет корректность размера буфера (4 байта).
 * - Расшифровывает запись с помощью `parseRecordWithSchema`.
 * - Обновляет `asn_map` и запускает таймер на 2 секунды для вывода таблицы.
 *
 * Если в течение 2 секунд не поступают новые данные, текущая таблица выводится в консоль.
 *
 * @param {Buffer} buffer - 4-байтовый буфер данных для парсинга.
 * @throws {Error} Если длина буфера не равна 4.
 *
 * @example
 * ```ts
 * parseAbsAnSensData(Buffer.from([0x01, 0x02, 0x03, 0x04]));
 * // Через 2 секунды таблица автоматически выведется в консоль
 * ```
 */
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
  if (!process.env.CONSOLE_EGTS) return;
  // Устанавливаем новый таймер на 2 секунды
  updateTimeout = setTimeout(() => {
    // Если карта не обновлялась 2 секунды, выводим её содержимое
    printASNTable();
  }, 2000); // Задержка в 2 секунды
}
