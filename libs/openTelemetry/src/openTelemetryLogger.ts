/* eslint-disable import/no-unresolved */
import { Attributes, Span, SpanContext, Tracer, context, propagation, trace, } from '@opentelemetry/api';
import { setSpan, setSpanContext } from '@opentelemetry/api/build/src/trace/context-utils';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources/';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BasicTracerProvider, BatchSpanProcessor, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Ctx, ISpanOptions, Event } from './types';
import { LogTransport } from './logTransport';
import { createTraceParent } from './microserviceUtils';
import { isUndefined } from 'util';

let sdk: NodeSDK;

export function startOpenTelemetrySdk() {
  sdk = new NodeSDK();
  sdk.start();
}

export class OpenTelemetryLogTransport implements LogTransport<Span> {

  private tracer: Tracer | undefined;
  private _span: Span | undefined;

  constructor(public readonly name: string) {
    this.checkSdk();

    this.name = name;
    const provider = this.createProvider(this.name);
    this.tracer = provider.getTracer(process.title);
    // this._span = this.tracer.startSpan(this.name);
  }

  private checkSdk() {
    if (!sdk)
      startOpenTelemetrySdk();
  }

  private createProvider(name: string) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    });

    const exporterConsole = new ConsoleSpanExporter();
    const exporter = new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
    });
    const provider = new BasicTracerProvider({ resource: resource });
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    // provider.addSpanProcessor(new SimpleSpanProcessor(exporterConsole))

    return provider;
  }

  endSpan(span: Span): void {
    span.end();
  }

  getSpanId(span: Span): string {
    const ctx = span.spanContext();
    return createTraceParent(ctx);
  }

  getSpanTraceId(span: Span): string {
    const ctx = span.spanContext();
    return ctx.traceId;
  }

  private span(name: string, options?: ISpanOptions): Span {
    const parentSpan = this.tracer!.startSpan(name, options);
    this.populateSpan(parentSpan, options);
    return parentSpan;
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

  childrenSpan(name: string, father?: Span, options?: ISpanOptions): Span {
    if (!father)
      return this.span(name, options);
    const ctx = setSpan(context.active(), father);
    const childSpan = this.tracer!.startSpan(name, options, ctx);
    this.populateSpan(childSpan, options);
    return childSpan;
  }

  // spanFromContext(ctx: SpanContext) {
  //   return trace.getSpan(trace.setSpanContext(context.active(), ctx));
  // }

  private populateSpan(span: Span, options?: ISpanOptions) {
    if (options?.attributes)
      span.setAttributes(options.attributes);
    options?.events?.map((event: Event) => span.addEvent(
      event.name,
      event?.attributes,
      event?.startTime,
    ));
  }

  public addSpanAttributes(span: Span, attributes: Attributes): void {
    span.setAttributes(attributes);
  }
}
