// Преобразование широты
export function convertLat({ latitude }: { latitude: number }) {
  const MAX_UINT32 = 0xffffffff;

  const latDegrees = (latitude / MAX_UINT32) * 90;

  return latDegrees;
}
// Преобразование долготы
export function convertLong({ longitude }: { longitude: number }) {
  const MAX_UINT32 = 0xffffffff;

  const longDegrees = (longitude / MAX_UINT32) * 180;

  return longDegrees;
}
