/**
 * Функция для преобразования широты из формата UInt32 в градусы
 *
 * @param {number} latitude - Широта в формате UInt32
 * @returns {number} Широта в градусах
 */
export function convertLat({ latitude }: { latitude: number }) {
  const MAX_UINT32 = 0xffffffff;

  const latDegrees = (latitude / MAX_UINT32) * 90;

  return latDegrees;
}

/** Функция для преобразования долготы из формата UInt32 в градусы
 *
 * @param {number} longitude - Долгота в формате UInt32
 * @returns {number} Долгота в градусах
 */
export function convertLong({ longitude }: { longitude: number }) {
  const MAX_UINT32 = 0xffffffff;

  const longDegrees = (longitude / MAX_UINT32) * 180;

  return longDegrees;
}
