type Call = {
  service: string,
  method: string,
  args?: unknown
}

type Span = {
  name: string,
  context: string,
  childrens?: Span[],
  father?: string,
  isOpen: boolean
}

export class CallStack {
  stack: Array<Call> = [];
  spanTree: Map<string, Span> = new Map();

  clearStack() {
    this.stack = [];
  }

  addCall(service: string, method: string, args?: unknown) {
    this.stack.push({
      service,
      method,
      args,
    });
  }

  addSpan(name: string, context: string, fatherContext?: string) {
    const span: Span = {
      name,
      context,
      isOpen: true,
      childrens: [],
    };

    if (fatherContext) {
      const fatherSpan = this.spanTree.get(fatherContext);
      if (fatherSpan) {
        fatherSpan.childrens?.push(span);
      }
      else {
        throw new Error('fatherContext not found');
      }
    }

    this.spanTree.set(context, span);
  }

  addChildrenSpanTo(name: string, fatherContext: string) {
    const fatherSpan = this.spanTree.get(fatherContext);

    if (fatherSpan) {
      const childSpan: Span = {
        name,
        context: fatherSpan.context,
        isOpen: true,
        childrens: [],
      };

      fatherSpan.childrens?.push(childSpan);
    }
    else {
      const childSpan: Span = {
        name,
        context: fatherContext,
        isOpen: true,
        childrens: [],
      };
      this.spanTree.set(fatherContext, childSpan);
    }
  }

  closeSpan(name: string) {
    const span = this.spanTree.get(name);
    if (span) {
      span.childrens?.forEach((children) => {
        this.closeSpan(children.name);
      });
      span.isOpen = false;
      this.spanTree.set(name, span);
    }
  }

  resolveSpanTree(): Array<{ name: string, parent?: string, isOpen: boolean }> {
    const result: Array<{ name: string, parent?: string, isOpen: boolean }> = [];

    const traverse = (span: Span, parent?: string) => {
      result.push({
        name: span.name,
        parent,
        isOpen: span.isOpen,
      });

      if (span.childrens) {
        for (const child of span.childrens) {
          traverse(child, span.name);
        }
      }
    };

    for (const span of this.spanTree.values()) {
      traverse(span);
    }

    return result;
  }
}

export const callStack = new CallStack();

// type Call = {
//   service: string,
//   method: string,
//   args?: unknown
// }

// type Span = {
//   name: string,
//   childrens?: Span[],
//   isOpen: boolean,
//   father?: string,
// }

// export class CallStack {
//   stack: Array<Call> = [];
//   spanTree: Map<string, Span> = new Map();

//   clearStack() {
//     this.stack = [];
//   }

//   addCall(service: string, method: string, args?: unknown) {
//     this.stack.push({
//       service,
//       method,
//       args,
//     });
//   }

//   addSpan(name: string, context: string) {
//     this.spanTree.set(context, {
//       name,
//       isOpen: true,
//       childrens: [],
//     });
//   }

//   addChildrenSpanTo(father: string, name: string) {
//     const fatherSpan = this.spanTree.get(father);
//     // if (fatherSpan) {
//     //   fatherSpan?.childrens?.push({
//     //     name,
//     //     father,
//     //     isOpen: true,
//     //     childrens: [],
//     //   });
//     //   this.spanTree.set(father, fatherSpan);
//     }
//     else {
//       throw new Error('no father span');
//     }
//   }

//   closeSpan(name: string) {
//     const span = this.spanTree.get(name);
//     span?.childrens?.forEach((children) => {
//       this.closeSpan(children.name);
//     });
//   }
// }

// export const callStack = new CallStack();
