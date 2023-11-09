/* eslint-disable import/no-unresolved */
import { Attributes, Span, TimeInput, Tracer, context } from '@opentelemetry/api';
import { setSpan } from '@opentelemetry/api/build/src/trace/context-utils';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources/';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BasicTracerProvider, BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

type Event = {
  name: string,
  attributes?: Attributes,
  startTime?: TimeInput,
};

interface ISpanOptions {
  events: Event[]
  name: string,
  attributes?: Attributes;
}

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

    const exporter = new ConsoleSpanExporter();
    // const exporter = new OTLPTraceExporter({
    //   url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    // });
    const provider = new BasicTracerProvider({ resource: resource });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    return provider;
  }

  end(span: Span) {
    span.end();
  }

  span(name: string, options?: ISpanOptions): Span {
    const parentSpan = this.tracer!.startSpan(name, options);
    this.populateSpan(parentSpan, options);
    return parentSpan;
  }

  childrenSpan(name: string, father?: Span, options?: ISpanOptions): Span {
    if (!father)
      return this.span(name, options);
    const ctx = setSpan(context.active(), father);
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
