import { describePacketFields, PacketTypeCodes } from "./decribe-pt";
type consoleTablePTProps = {
  /** Результат парсинга пакета */
  result_PT: { [key: string]: any };
  /** Буфер с данными пакета */
  buffer: Buffer;
  /** Схема пакета */
  schema: {
    [key: string]: {
      length?: number;
      type: string;
      flag?: string;
      dynamic?: string;
    };
  };
};
/**
 * Функция выводит результат парсинга пакета в консоль.
 */
export const consoleTablePT = ({
  result_PT,
  buffer,
  schema,
}: consoleTablePTProps) => {
  /** Массив для вывода в таблице */
  let result_PT_table: any = [];
  /** Формирование читаемой таблицы данных */
  Object.keys(result_PT).map((key: string) => {
    key === "SFRD"
      ? result_PT_table.push({
          [`PT ${buffer.length} байт`]: describePacketFields(key),
          value: "<Buffer/>",
          length: schema[key].length
            ? schema[key].length
            : schema[key].dynamic
            ? result_PT[schema[key].dynamic]
            : undefined,
        })
      : result_PT_table.push({
          [`PT ${buffer.length} байт`]: describePacketFields(key),
          value:
            key === "PT" ? PacketTypeCodes[result_PT[key]] : result_PT[key],
          length: schema[key].length
            ? schema[key].length
            : schema[key].dynamic
            ? result_PT[schema[key].dynamic]
            : undefined,
        });
  });

  console.table(result_PT_table);
};
