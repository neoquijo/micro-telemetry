"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const debug_level_1 = __importDefault(require("debug-level"));
const util_1 = require("util");
class Logger {
    constructor(transport, _span) {
        this.transport = transport;
        this._span = _span;
        this.isOpen = true;
        // eslint-disable-next-line no-use-before-define
        this.childrens = [];
        this.log = {
            error: new debug_level_1.default(`${this.transport.name}:error`, { level: 'ERROR' }).error,
            info: new debug_level_1.default(`${this.transport.name}:info`, { level: 'INFO' }).info,
            warn: new debug_level_1.default(`${this.transport.name}:warn`, { level: 'WARN' }).warn,
            debug: new debug_level_1.default(`${this.transport.name}:debug`, { level: 'DEBUG' }).debug,
            silly: new debug_level_1.default(`${this.transport.name}:silly`, { level: 'TRACE' }).trace,
            verbose: new debug_level_1.default(`${this.transport.name}:verbose`, { level: 'TRACE' }).trace,
        };
    }
    validateIsOpen() {
        if (!this.isOpen)
            throw new Error('Span is already closed');
    }
    span(text) {
        this.validateIsOpen();
        const span = new Logger(this.transport, this.transport.childrenSpan(text, this._span));
        this.childrens.push(span);
        return span;
    }
    end() {
        var _a;
        this.childrens.forEach((children) => children.end());
        (_a = this._span) === null || _a === void 0 ? void 0 : _a.end();
        this.isOpen = false;
    }
    addLog(logLevel, message, data) {
        this.validateIsOpen();
        const rawMessage = message.replace(/\w+\[\[([^\]]+)\]\]/g, '$1');
        const span = this.transport.childrenSpan(rawMessage, this._span);
        span.setAttribute('level', logLevel);
        span.setAttributes(data);
        span.end();
        this.log[logLevel](rawMessage);
    }
    warn(message, data = {}) {
        this.addLog('warn', message, data);
    }
    silly(message, data = {}) {
        this.addLog('silly', message, data);
    }
    debug(message, data = {}) {
        this.addLog('debug', message, data);
    }
    error(message, error, data = {}) {
        this.addLog('error', message + ((0, util_1.isUndefined)(error)
            ? ''
            : ('\n' + String(error))), {
            error: String(error),
            ...data,
        });
    }
    info(message, data = {}) {
        this.addLog('info', message, data);
    }
    verbose(message, data = {}) {
        this.addLog('verbose', message, data);
    }
}
exports.Logger = Logger;
