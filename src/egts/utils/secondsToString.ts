/**
 * Преобразует количество секунд в человекочитаемую строку формата:
 * `"2 hours, 5 minutes, 10 seconds"`.
 *
 * Поддерживает годы, месяцы, дни, часы, минуты и секунды.
 * Использует приближённое значение месяца (30 дней) и года (365 дней).
 *
 * @param {number} seconds - Количество секунд, которое нужно преобразовать.
 * @returns {string} Строка с отформатированным временем.
 *
 * @example
 * ```ts
 * formatSeconds(65); 
 * // "1 minute, 5 seconds"
 *
 * formatSeconds(3661);
 * // "1 hour, 1 minute, 1 second"
 *
 * formatSeconds(0);
 * // "0 seconds"
 *
 * formatSeconds(4000000);
 * // "1 month, 16 days, 11 hours, 6 minutes, 40 seconds"
 * ```
 */
export function formatSeconds(seconds: number): string {
  const intervals: [string, number][] = [
    ["year", 60 * 60 * 24 * 365], // 1 год в секундах
    ["month", 60 * 60 * 24 * 30], // 1 месяц в секундах (приблизительно 30 дней)
    ["day", 60 * 60 * 24], // 1 день в секундах
    ["hour", 60 * 60], // 1 час в секундах
    ["minute", 60], // 1 минута в секундах
    ["second", 1], // 1 секунда
  ];

  const result: string[] = [];

  for (const [name, count] of intervals) {
    const value = Math.floor(seconds / count);
    if (value > 0) {
      result.push(`${value} ${name}${value > 1 ? "s" : ""}`);
    }
    seconds %= count;
  }

  return result.length > 0 ? result.join(", ") : "0 seconds";
}
