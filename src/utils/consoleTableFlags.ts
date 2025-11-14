type consoleTableFlagsProps = {
  title: string;
  flags: { [flagName: string]: number };
  dictionary: { [key: string]: string };
};
/**
 * Функция выводит флаги пакета в консоль в виде таблицы.
 *
 * @param flags - объект с флагами и их значениями
 * @param title - заголовок таблицы
 * @param dictionary - словарь для отображения флагов c полными названиями
 */
export const consoleTableFlags = ({
  flags,
  title,
  dictionary,
}: consoleTableFlagsProps) => {
  const flags_table: { [key: string]: any } = [];

  Object.keys(flags).map((flag: string) => {
    flags_table.push({
      [title]: dictionary[flag],
      value: flags[flag] === 0 ? false : true,
    });
  });
  console.table(flags_table);
};
