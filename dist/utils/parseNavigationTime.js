"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNavigationTime = parseNavigationTime;
function parseNavigationTime(ntm) {
    // 01.01.2010 00:00:00 UTC
    const baseDate = new Date(Date.UTC(2010, 0, 1, 0, 0, 0));
    // Добавляем NTM (число секунд) к базовой дате
    const date = new Date(baseDate.getTime() + ntm * 1000);
    return date;
}
