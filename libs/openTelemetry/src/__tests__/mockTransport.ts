/* eslint-disable import/no-unresolved */
import { Span, SpanContext, Tracer, context, trace } from '@opentelemetry/api';
import { setSpan } from '@opentelemetry/api/build/src/trace/context-utils';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources/';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { ISpanOptions, Event } from '../types';
import { callStack } from './callStack';

let sdk: NodeSDK;

export function startOpenTelemetrySdk() {
  sdk = new NodeSDK();
  sdk.start();
}

export class MockTransport {

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

  public init(name: string): MockTransport {
    callStack.addCall(name, 'init');
    this.name = name;
    const provider = this.createProvider(this.name);
    this.tracer = provider.getTracer(process.title);
    this._span = this.tracer.startSpan(this.name);
    callStack.addSpan(name, this._span.spanContext().spanId);
    return this;
  }

  private createProvider(name: string) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    });

    const exporter = new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
    });
    const provider = new BasicTracerProvider({ resource: resource });
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    // provider.addSpanProcessor(new SimpleSpanProcessor(exporterConsole))

    return provider;
  }

  end(span: Span) {
    span.end();
  }

  span(name: string, options?: ISpanOptions): Span {
    const parentSpan = this.tracer!.startSpan(name, options);
    this.populateSpan(parentSpan, options);
    callStack.addSpan(name, parentSpan.spanContext().spanId, this._span!.spanContext().spanId);
    return parentSpan;
  }

  childrenSpan(name: string, father: Span, fromSpan?: SpanContext, options?: ISpanOptions): Span {
    const activeContext = context.active();
    const span = fromSpan && trace.getSpan(trace.setSpanContext(activeContext, fromSpan));
    const childSpan = this.tracer!.startSpan(name, options, setSpan(activeContext, span || father));
    this.populateSpan(childSpan, options);
    if (fromSpan) {
      callStack.addSpan(name, childSpan.spanContext().spanId, fromSpan.spanId);
    }
    else {
      callStack.addSpan(name, childSpan.spanContext().spanId, father.spanContext().spanId);
    }

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
