import { parseEGTSAuthService } from "../parsers/auth_service";
import { parseTermIdentity } from "../parsers/auth_service/term_identity";
import { parseEGTSCommandsService } from "../parsers/commands_service";
import { parseEGTSTeledataService } from "../parsers/teledata_service";

export const parsers = {
  1: parseEGTSAuthService, // EGTS_AUTH_SERVICE
  2: parseEGTSTeledataService, // EGTS_TELEDATA_SERVICE
  3: parseEGTSCommandsService, // EGTS_COMMANDS_SERVICE
  // и другие парсеры
};

export function route({ data, socket, pid, trackers }) {
  const parser = parsers[data.record.sst];
  if (parser) {
    parser({
      record: data.record.recordData,
      socket: socket,
      pid: pid,
      trackers: trackers,
    });
  } else {
    console.error(
      `Неизвестный тип сервиса SST: ${data.record.sst}`
    );
  }
}
