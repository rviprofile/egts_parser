const dsn_map = new Map();
/** Переменная для хранения таймера */
let updateTimeout: NodeJS.Timeout | null = null;

// Функция для вывода таблицы в консоль
function printDSNTable() {
  console.table(
    [...dsn_map.entries()].map(([key, value]) => ({
      DSN: parseABS({ DSN: key }),
      DSST: value === 0 ? "not active" : "active",
    }))
  );
}

function parseABS({ DSN }: { DSN: number }) {
  const dictionary = {
    99: { name: "Датчик движения акселерометра" },
    96: { name: "Зажигание " },
  };
  return dictionary[DSN] ? dictionary[DSN].name : DSN;
}

export function parseAbsDigSensData(buffer: Buffer) {
  if (buffer.length !== 2) {
    throw new Error("Некорректный размер буфера. Ожидается 2 байта.");
  }

  // Чтение данных из буфера
  const data = buffer.readUInt16LE(0);
  // Извлекаем младшие 8 битов (DSST и младшие биты DSN)
  const DSST = data & 0xf; // Младшие 4 бита для состояния сенсора (0000 - неактивен, остальное - активен)
  const DSN_low = (data >> 4) & 0xf; // Следующие 4 бита для младшей части DSN
  // Извлекаем старшие 8 битов (старшие биты DSN)
  const DSN_high = (data >> 8) & 0xff;
  // Объединяем старшие и младшие биты DSN в одно число
  const DSN = (DSN_high << 4) | DSN_low;
  dsn_map.set(DSN, DSST);
  // Сбрасываем таймер при каждом обновлении
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  // Устанавливаем новый таймер на 2 секунды
  updateTimeout = setTimeout(() => {
    // Если карта не обновлялась 2 секунды, выводим её содержимое
    printDSNTable();
  }, 2000); // Задержка в 2 секунды
}
