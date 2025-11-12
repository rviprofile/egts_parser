export const consoleTableFlags = ({
  flags,
  title,
  dictionary,
}: {
  title: string;
  flags: { [flagName: string]: number };
  dictionary: { [key: string]: string };
}) => {
  const flags_table: { [key: string]: any } = [];

  Object.keys(flags).map((flag: string) => {
    flags_table.push({
      [title]: dictionary[flag],
      value: flags[flag] === 0 ? false : true,
    });
  });
  console.table(flags_table);
};
