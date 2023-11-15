/* eslint-disable import/no-unresolved */
import { Span, Tracer, context, propagation, trace, } from '@opentelemetry/api';
import { setSpan, setSpanContext } from '@opentelemetry/api/build/src/trace/context-utils';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources/';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BasicTracerProvider, BatchSpanProcessor, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Ctx, ISpanOptions, Event } from './types';
import { isUndefined } from 'util';


let sdk: NodeSDK;

export function startOpenTelemetrySdk() {
  sdk = new NodeSDK();
  sdk.start();
}

export class OpenTelemetryLogger {
  private tracer: Tracer | undefined;
  private _span: Span | undefined;
  public name: string | undefined;
  constructor() {
    this.checkSdk();
  }

  private checkSdk() {
    if (!sdk)
      startOpenTelemetrySdk();
  }

  public init(name: string): OpenTelemetryLogger {
    this.name = name;
    const provider = this.createProvider(this.name);
    this.tracer = provider.getTracer(process.title);
    this._span = this.tracer.startSpan(this.name);
    return this;
  }

  private createProvider(name: string) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    });

    const exporterConsole = new ConsoleSpanExporter();
    const exporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    });
    const provider = new BasicTracerProvider({ resource: resource });
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.addSpanProcessor(new SimpleSpanProcessor(exporterConsole))

    return provider;
  }

  end(span: Span) {
    span.end();
  }

  getSpanId(span: Span): string | undefined {
    const context = span.spanContext();
    return `00-${context.traceId}-${context.spanId}-${context.traceFlags.toString(16)}`;
  }

  span(name: string, options?: ISpanOptions): Span {
    const parentSpan = this.tracer!.startSpan(name, options);
    this.populateSpan(parentSpan, options);
    return parentSpan;
  }

  createContext(span: Span): Ctx {
    const contextWithSpan = trace.setSpan(context.active(), span);
    const ctx = {};
    context.with(contextWithSpan, () => {
      propagation.inject(context.active(), ctx);
    });
    return ctx as Ctx;
  }

  createSpanWithContext(ctx: Ctx): Span | undefined {
    const contextActive = propagation.extract(context.active(), ctx);
    return trace.getSpan(contextActive);
  }

  childrenSpan(name: string, father?: Span, options?: ISpanOptions): Span {
    if (!father)
      return this.span(name, options);
    const ctx = setSpan(context.active(), father);
    const childSpan = this.tracer!.startSpan(name, options, ctx);
    this.populateSpan(childSpan, options);
    return childSpan;
  }

  childrenSpanInId(name: string, parentId: string | undefined, options?: ISpanOptions): Span {
    if (isUndefined(parentId))
      return this.span(name, options);

    const [version, traceId, spanId, traceFlags] = parentId.split('-', 4);

    const ctx = setSpanContext(
      context.active(),
      {
        traceId,
        traceFlags: parseInt(traceFlags, 16),
        spanId,
      }
    );
    const childSpan = this.tracer!.startSpan(name, options, ctx);

    this.populateSpan(childSpan, options);
    return childSpan;
  }

  private populateSpan(span: Span, options?: ISpanOptions) {
    if (options?.attributes)
      span.setAttributes(options.attributes);
    options?.events?.map((event: Event) => span.addEvent(
      event.name,
      event?.attributes,
      event?.startTime,
    ));
  }
}
