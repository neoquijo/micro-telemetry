"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerFactory = void 0;
const logger_1 = require("./logger");
const openTelemetryLogger_1 = require("./openTelemetryLogger");
class LoggerFactory {
    constructor() {
        this.loggerMap = new Map();
    }
    use(name) {
        if (this.loggerMap.has(name)) {
            return this.loggerMap.get(name);
        }
        const openTelemetryLogger = new openTelemetryLogger_1.OpenTelemetryLogger().init(name);
        const logger = new logger_1.Logger(openTelemetryLogger);
        this.loggerMap.set(name, logger);
        return logger;
    }
    forget(name) {
        if (this.loggerMap.has(name)) {
            const logger = this.loggerMap.get(name);
            logger === null || logger === void 0 ? void 0 : logger.end();
            this.loggerMap.delete(name);
        }
    }
}
exports.loggerFactory = new LoggerFactory();
