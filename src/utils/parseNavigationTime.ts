
/** Функция для парсинга времени навигации (NTM) */
export function parseNavigationTime(ntm: number) {
  /** Базовая дата */
  const baseDate = new Date(Date.UTC(2010, 0, 1, 0, 0, 0)); // 01.01.2010 00:00:00 UTC

  // Добавляем NTM (число секунд) к базовой дате
  const date = new Date(baseDate.getTime() + ntm * 1000);

  return date;
}
