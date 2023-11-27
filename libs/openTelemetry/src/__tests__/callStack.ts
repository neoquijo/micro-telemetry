type Call = {
  service: string,
  method: string,
  args?: unknown
}

type Span = {
  name: string,
  context: string,
  childrens: Span[],
  father?: string,
  fatherId?: string,
  isOpen: boolean
  closedAt?: number
}

export class CallStack {
  stack: Array<Call> = [];
  spanList: Array<Span> = [];
  spanTree: Span[] = [];

  addCall(service: string, method: string, args?: unknown) {
    this.stack.push({
      service,
      method,
      args,
    });
  }

  clear() {
    this.stack = [];
    this.spanList = [];
    this.spanTree = [];
  }

  addSpan(name: string, spanId: string, fatherId?: string) {
    const span = {
      name,
      context: spanId,
      fatherId,
      isOpen: true,
      childrens: [],
    };
    this.spanList.push(span);
    this.spanTree = this.buildSpanTree();
  }

  closeSpan(context: string): void {
    const span = this.spanList.find((item) => item.context === context);
    if (span) {
      span.closedAt = new Date().getTime();
      span.isOpen = false;
    }
  }

  getSpan(name: string): Span {
    const span = this.spanList.find((item) => item.name === name && item.fatherId)!;
    return span;
  }

  private iterateSpanTree(
    span: Span,
    callback: (span: Span) => void,
    result: Span[] = [],
  ) {
    callback(span);
    result.push(span);

    if (span.childrens.length > 0) {
      span.childrens.forEach((child) => {
        this.iterateSpanTree(child, callback, result);
      });
    }
  }

  public map(callback: (span: Span) => void): Span[] {
    const result: Span[] = [];
    this.spanTree.forEach((rootSpan) => {
      this.iterateSpanTree(rootSpan, callback, result);
    });
    return result;
  }

  private buildSpanTree(): Span[] {
    const spanMap: { [key: string]: Span } = {};
    const rootSpans: Span[] = [];

    this.spanList.forEach((span) => {
      span.childrens = [];
      spanMap[span.context] = span;
    });

    this.spanList.forEach((span) => {
      if (span.fatherId) {
        const fatherSpan = spanMap[span.fatherId];
        span.father = fatherSpan ? fatherSpan.name : undefined;
        if (fatherSpan) {
          fatherSpan.childrens!.push(span);
        }
      }
    });

    this.spanList.forEach((span) => {

      if (!span.fatherId && span.childrens.length > 0) {
        rootSpans.push(...span.childrens);
      }
    });

    return rootSpans;
  }
}

export const callStack = new CallStack();
