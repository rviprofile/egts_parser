import { parseEGTSAuthService } from "../parsers/auth_service";
import { parseTermIdentity } from "../parsers/auth_service/term_identity";
import { parseEGTSCommandsService } from "../parsers/commands_service";
import { parseEGTSTeledataService } from "../parsers/teledata_service";

export const parsers = {
  /**
   * EGTS_AUTH_SERVICE — Данный тип сервиса применяется для осуществления процедуры аутентификации
   * АСН (авторизуемой ТП) на авторизующей ТП.
   */
  1: parseEGTSAuthService,

  /**
   * EGTS_TELEDATA_SERVICE — Сервис предназначен для обработки телематической информации
   * (координатные данные, данные о срабатывании датчиков и т.д.), поступающей от АСН.
   */
  2: parseEGTSTeledataService,

  /**
   * EGTS_COMMANDS_SERVICE — сервис обработки команд.
   * Данный тип сервиса предназначен для обработки управляющих и конфигурационных команд,
   * информационных сообщений и статусов, передаваемых между АСН, ТП и операторами
   */
  3: parseEGTSCommandsService,
};

export function route({ data, socket, pid, trackers }) {
  const parser = parsers[data.record.sst as number];
  if (parser) {
    parser({
      record: data.record.recordData,
      socket: socket,
      pid: pid,
      trackers: trackers,
    });
  } else {
    process.env.CONSOLE_EGTS &&
      console.error(
        "[route/index.ts]: ",
        `Неизвестный тип сервиса SST: ${
          data.record.sst
        }. Поддерживаются следующие типы: ${Object.keys(parsers).join(", ")}`
      );
  }
}
