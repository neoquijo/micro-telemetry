"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryLogger = exports.startOpenTelemetrySdk = void 0;
/* eslint-disable import/no-unresolved */
const api_1 = require("@opentelemetry/api");
const context_utils_1 = require("@opentelemetry/api/build/src/trace/context-utils");
const resources_1 = require("@opentelemetry/resources/");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
let sdk;
function startOpenTelemetrySdk() {
    sdk = new sdk_node_1.NodeSDK();
    sdk.start();
}
exports.startOpenTelemetrySdk = startOpenTelemetrySdk;
class OpenTelemetryLogger {
    constructor() {
        this.checkSdk();
    }
    checkSdk() {
        if (!sdk)
            startOpenTelemetrySdk();
    }
    init(name) {
        this.name = name;
        const provider = this.createProvider(this.name);
        this.tracer = provider.getTracer(process.title);
        this._span = this.tracer.startSpan(this.name);
        return this;
    }
    createProvider(name) {
        const resource = new resources_1.Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: name,
        });
        const exporter = new sdk_trace_node_1.ConsoleSpanExporter();
        // const exporter = new OTLPTraceExporter({
        //   url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        // });
        const provider = new sdk_trace_node_1.BasicTracerProvider({ resource: resource });
        provider.addSpanProcessor(new sdk_trace_node_1.BatchSpanProcessor(exporter));
        return provider;
    }
    end(span) {
        span.end();
    }
    span(name, options) {
        const parentSpan = this.tracer.startSpan(name, options);
        this.populateSpan(parentSpan, options);
        return parentSpan;
    }
    childrenSpan(name, father, options) {
        if (!father)
            return this.span(name, options);
        const ctx = (0, context_utils_1.setSpan)(api_1.context.active(), father);
        const childSpan = this.tracer.startSpan(name, options, ctx);
        this.populateSpan(childSpan, options);
        return childSpan;
    }
    populateSpan(span, options) {
        var _a;
        if (options === null || options === void 0 ? void 0 : options.attributes)
            span.setAttributes(options.attributes);
        (_a = options === null || options === void 0 ? void 0 : options.events) === null || _a === void 0 ? void 0 : _a.map((event) => span.addEvent(event.name, event === null || event === void 0 ? void 0 : event.attributes, event === null || event === void 0 ? void 0 : event.startTime));
    }
}
exports.OpenTelemetryLogger = OpenTelemetryLogger;
