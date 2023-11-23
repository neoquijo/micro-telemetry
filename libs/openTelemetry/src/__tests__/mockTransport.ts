/* eslint-disable import/no-unresolved */
import { Span, SpanContext, Tracer, context, trace } from '@opentelemetry/api';
import { setSpan } from '@opentelemetry/api/build/src/trace/context-utils';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources/';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-node';
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
    return this;
  }

  private createProvider(name: string) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    });

    const provider = new BasicTracerProvider({ resource: resource });
    return provider;
  }

  end(span: Span) {
    span.end();
  }

  span(name: string, options?: ISpanOptions): Span {
    const parentSpan = this.tracer!.startSpan(name, options);
    this.populateSpan(parentSpan, options);
    callStack.addSpan(name, parentSpan.spanContext().spanId);
    return parentSpan;
  }

  childrenSpan(name: string, father: Span, fromSpan?: SpanContext, options?: ISpanOptions): Span {
    const activeContext = context.active();
    const span = fromSpan && trace.getSpan(trace.setSpanContext(activeContext, fromSpan));
    const childSpan = this.tracer!.startSpan(name, options, setSpan(activeContext, span || father));
    this.populateSpan(childSpan, options);
    if (fromSpan) {
      callStack.addChildrenSpanTo(name, fromSpan?.spanId);
    }
    else {
      callStack.addChildrenSpanTo(name, childSpan.spanContext().spanId);
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
