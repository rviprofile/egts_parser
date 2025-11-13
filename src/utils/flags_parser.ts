import { FlagsSchemaType, parseFlagsProps } from "../types";

export function parseFlags({ flagsByte, flagSchema }: parseFlagsProps) {
  const flags = {};

  // Проходим по каждому флагу в схеме
  for (const [flagName, { length, position }] of Object.entries(flagSchema)) {
    // Извлекаем значение флага с помощью битового сдвига и маски
    const mask = (1 << length) - 1; // Создаем маску, соответствующую длине флага
    const flagValue = (flagsByte.readUInt8(0) >> position) & mask; // Сдвигаем байт и применяем маску
    flags[flagName] = flagValue;
  }
  return flags;
}

export function serializationFlags({
  flags,
  flagSchema,
}: {
  flags: any;
  flagSchema: FlagsSchemaType;
}) {
  let flagsByte = 0;

  for (const flagName in flagSchema) {
    const { length, position } = flagSchema[flagName];
    const flagValue = flags[flagName];

    // Сдвигаем флаг в нужное место и добавляем его к flagsByte
    flagsByte |= (flagValue & ((1 << length) - 1)) << position;
  }
  return flagsByte;
}
