import { LogTransport } from '../logTransport';

import type { Attributes, ISpanOptions, SpanContext } from '../types';

export type MockSpan = {
  id: string;
  name: string;
  // isOpen: boolean;
  // children: MockSpan[];
  // attributes: Attributes;
  parent?: MockSpan | string;
};

export class MockLogTransport implements LogTransport<MockSpan> {
  public readonly name = 'mock';

  childrenSpan(name: string, father?: MockSpan, options?: ISpanOptions): MockSpan {
    const id = randomString();
    console.log(`creating new span ${id} "${name}" in ${father?.id ?? 'root'}`);
    return { id, name, parent: father };
  }

  childrenSpanInId(name: string, parentId?: string): MockSpan {
    const id = randomString();
    console.log(`creating new span ${id} "${name}" in FAKE ${parentId ?? 'root'}`);
    return { id, name, parent: parentId };
  }

  endSpan(span: MockSpan): void {
    console.log(`ending span ${span.id}`);
  }

  addSpanAttributes(span: MockSpan, attributes: Attributes): void {
    console.log(`adding span ${span.id} attributes ${JSON.stringify(attributes)}`);
    // span.attributes = { ...span.attributes, ...attributes };
  }

  getSpanId(span: MockSpan): string {
    return span.id;
  }

  getSpanTraceId(span: MockSpan): string {
    return 'the one and only';
  }

  getSpanStackTrace(span: MockSpan): MockSpan[] {
    const stack = [span];
    if (span.parent) {
      if (typeof(span.parent) === 'string')
        stack.push({ id: span.parent, name: 'from string' });
      else 
        stack.push(...this.getSpanStackTrace(span.parent));
    }
    return stack;
  }

  getSpanStackTraceAsStrings(span: MockSpan): string[] {
    return this.getSpanStackTrace(span).map((s) => s.name);
  }
}

function randomString() {
  return process.hrtime.bigint().toString();
}
