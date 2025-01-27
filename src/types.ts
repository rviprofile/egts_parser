import net from "net";

export type FlagsSchemaType = {
  [flagName: string]: { length: number; position: number };
};

export type SchemaType = {
  [fieldName: string]: {
    type: string; // Тип, например, Binary или UInt16LE и т.д.
    length?: number; // Длинна поля в байтах
    flag?: string; // Если есть флаг, значит поля присутствует только если флаг
    dynamic?: string; // Используется когда в каком-то поле указана длинна этого поля. Например RL или FDL
    connection?: string; // Используется, когда поле зависит нет от флага, а от другого поля
  };
};

export type parseServiseProps = {
  record: Buffer;
  socket: net.Socket;
  pid: number;
  trackers: Map<
    net.Socket,
    {
      [key: string]: number;
    }
  >;
};
