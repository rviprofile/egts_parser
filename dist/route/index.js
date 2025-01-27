"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsers = void 0;
exports.route = route;
const auth_service_1 = require("../parsers/auth_service");
const commands_service_1 = require("../parsers/commands_service");
const teledata_service_1 = require("../parsers/teledata_service");
exports.parsers = {
    1: auth_service_1.parseEGTSAuthService, // EGTS_AUTH_SERVICE
    2: teledata_service_1.parseEGTSTeledataService, // EGTS_TELEDATA_SERVICE
    3: commands_service_1.parseEGTSCommandsService, // EGTS_COMMANDS_SERVICE
    // и другие парсеры
};
function route({ data, socket, pid, trackers }) {
    const parser = exports.parsers[data.record.sst];
    if (parser) {
        parser({
            record: data.record.recordData,
            socket: socket,
            pid: pid,
            trackers: trackers,
        });
    }
    else {
        console.error(`Неизвестный тип сервиса SST: ${data.record.sst}`);
    }
}
