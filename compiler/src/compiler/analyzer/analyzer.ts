import * as p from "../parser/parser";

export class AnalyzerError extends Error {
  constructor(public pos: number, public message: string) {
    super();
    // Remove internal type representer .!
    this.message = this.message.replace(/\.!/, "");
  }
}

export enum AccessType {
  CONST,
  VAR,
}

export class VarType {
  constructor(
    public identifier: string,
    public accessType: AccessType,
    public type: string
  ) {}
}

export class StructureType {
  constructor(
    public identifier: string,
    public fields: { [ident: string]: string }
  ) {}
}

export class ProcedureType {
  constructor(
    public identifier: string,
    public parameters: { [ident: string]: ProcedureParamType },
    public returnType: string
  ) {}
}

export class ProcInner {
  constructor(
    public fields: ProcInnerField[],
    public returnType: string | void
  ) {}
}

export class ProcInnerSDecl {
  constructor(public types: string[]) {}
}

export type ProcInnerField = string | ProcInner | ProcInnerSDecl;

export type ProcedureParamType = string | StructureType | ProcInner;

export class ForwardType {
  constructor(public identifier: string, public procType: ProcInner | void) {}
}

export type ComplexType =
  | string
  | VarType
  | StructureType
  | ProcedureType
  | ProcedureParamType
  | ForwardType;

export class TypeStore {
  public types: { [key: string]: ComplexType } = {};
}

export class TypeStack {
  public stores = [new TypeStore()];

  public currStore() {
    return this.stores[this.stores.length - 1];
  }

  public popStore() {
    this.stores.pop();
  }

  public pushStore() {
    this.stores.push(new TypeStore());
  }

  public getStoredType(
    varName: string,
    onlyCurrent: boolean
  ): void | ComplexType {
    // If onlyCurrent then we only check latest store
    // Otherwise we iterate up the stack (order matters)
    const findInStore = (store: TypeStore) => {
      const currTypes = store.types;
      if (varName in currTypes) return currTypes[varName];
    };

    if (onlyCurrent) {
      const t = findInStore(this.currStore());
      if (t) return t;
    } else
      for (let i = this.stores.length - 1; i >= 0; i--) {
        const t = findInStore(this.stores[i]);
        if (t) return t;
      }
  }
}

export class Analyzer {
  private typeStack = new TypeStack();

  constructor(private program: p.Program) {}

  public run(): void {
    this.seedTypes();
    this.getTypeProgram(this.program);
  }

  private seedTypes(): void {
    // Add standard library types
    // Procedure options, returns array of constant strings
    const defaultVars: [string, string][] = [
      ["s.w", ".!number"],
      ["options", "*cstring"],
      ["environment", "*cstring"],
      ["read.a.line", "string"],
      ["readi", ".!number"],
      ["readr", ".!number"],
      ["readb", "boolean"],
      ["peek", "string"],
      ["reads", "string"],
      ["read.byte", ".!number"],
      ["read.16", ".!number"],
      ["read.32", ".!number"],
    ];

    const currStore = this.typeStack.currStore();
    for (const defaultVar of defaultVars)
      currStore.types[defaultVar[0]] = new VarType(
        defaultVar[0],
        AccessType.VAR,
        defaultVar[1]
      );

    currStore.types["dump"] = new ProcedureType(
      "dump",
      { a: "nonvoid" },
      "void"
    );

    currStore.types["length"] = new ProcedureType(
      "length",
      { a: "vector" },
      ".!number"
    );

    currStore.types["upb"] = new ProcedureType(
      "upb",
      { a: "vector" },
      ".!number"
    );

    currStore.types["lwb"] = new ProcedureType(
      "lwb",
      { a: "vector" },
      ".!number"
    );

    currStore.types["close"] = new ProcedureType(
      "close",
      { a: "cfile" },
      "void"
    );

    currStore.types["find.substr"] = new ProcedureType(
      "find.substr",
      { a: "cstring", b: "cstring" },
      ".!number"
    );

    currStore.types["decode"] = new ProcedureType(
      "decode",
      { a: "cstring" },
      ".!number"
    );

    currStore.types["b.or"] = new ProcedureType(
      "b.or",
      { a: "cint", b: "cint" },
      ".!number"
    );

    currStore.types["trace"] = new ProcedureType("trace", {}, "void");

    currStore.types["shift.l"] = new ProcedureType(
      "shift.l",
      { a: "cint", b: "cint" },
      ".!number"
    );

    currStore.types["fiddle.r"] = new ProcedureType(
      "fiddle.r",
      { a: "creal" },
      "*number"
    );

    currStore.types["code"] = new ProcedureType(
      "code",
      { a: "cint" },
      "string"
    );

    currStore.types["read"] = new ProcedureType(
      "read",
      { a: "nonvoid" },
      "string"
    );

    currStore.types["read.name"] = new ProcedureType(
      "read.name",
      { a: "nonvoid", b: "nonvoid" },
      "string"
    );

    currStore.types["eof"] = new ProcedureType("eof", { a: "nonvoid" }, "bool");

    currStore.types["iformat"] = new ProcedureType(
      "iformat",
      { a: "cint" },
      "string"
    );

    currStore.types["float"] = new ProcedureType(
      "float",
      { a: ".!number" },
      ".!number"
    );

    currStore.types["digit"] = new ProcedureType(
      "digit",
      { a: "cstring" },
      "bool"
    );

    currStore.types["letter"] = new ProcedureType(
      "letter",
      { a: "cstring" },
      "bool"
    );
  }

  private expectType(
    pos: number,
    expected: string | void,
    actual: string | void
  ): void {
    if (!expected || !actual) return;

    // Lookup real types
    // Do not lookup if primitive types
    const p = [".!number"];
    if (!p.includes(expected)) expected = this.resolveType(expected);
    if (!p.includes(actual)) actual = this.resolveType(actual);

    // Expected can always be less specific than actual
    // e.g. could have expected nonvoid and actual "pic"
    // Whereas cannot have other way around, so no expect "pic" and actual be nonvoid

    // type      = nonvoid     | void
    // nonvoid   = literal     | image   | vector | "pic"
    // literal   = writeable   | "pixel" | "pntr" | "file"
    // writeable = ordered     | "bool"
    // ordered   = ".!number"  | "string"
    // image     = "#pixel"    | "#cpixel"
    // vector    = "*" nonvoid | "*c" nonvoid

    // If actual refers to a type, fetch and set it
    const actualT = this.typeStack.getStoredType(actual, false);
    if (typeof actualT === "string") actual = actualT;
    else if (actualT instanceof VarType) actual = actualT.type;
    // Can't expect forwards
    else if (actualT instanceof ForwardType) return;

    // If expected refers to a type, fetch and set it
    const expectedT = this.typeStack.getStoredType(expected, false);
    if (typeof expectedT === "string") expected = expectedT;
    else if (expectedT instanceof VarType) expected = expectedT.type;
    // Can't expect forwards
    else if (expectedT instanceof ForwardType) return;

    // Don't strip if remaining is a real type
    const rType = ["const", "clause"];
    while (actual.startsWith("c") && !rType.includes(actual))
      actual = actual.slice(1);
    while (expected.startsWith("c") && !rType.includes(expected))
      expected = expected.slice(1);

    // Type rewrites (just awkward naming inconsistencies from the reference manual)
    const rewrites: { [k: string]: string } = {
      int: ".!number",
      real: ".!number",
    };
    const rewriteKeys = Object.keys(rewrites);
    if (rewriteKeys.includes(expected)) expected = rewrites[expected];
    if (rewriteKeys.includes(actual)) actual = rewrites[actual];

    // Simple identical match
    if (expected === actual) return;

    // Pointers ignore type rules.  Ignore them.
    if (expected === "pntr" || actual === "pntr") return;

    const matchCheck = {
      type(actual: string) {
        return this.nonvoid(actual) || true;
      },
      nonvoid(actual: string) {
        return actual !== "void";
      },
      literal(actual: string) {
        return (
          ["pixel", "pntr", "file"].includes(actual) || this.writeable(actual)
        );
      },
      writeable(actual: string) {
        return ["bool"].includes(actual) || this.ordered(actual);
      },
      ordered(actual: string) {
        return [".!number", "string"].includes(actual);
      },
      image(actual: string) {
        return ["#pixel", "#cpixel"].includes(actual);
      },
      vector: function (actual: string): boolean {
        if (actual.startsWith("*")) return this.nonvoid(actual.substr(1));
        else if (actual.startsWith("*c")) return this.nonvoid(actual.substr(2));
        else return false;
      },
    };

    let r = false;

    if (expected === "type") r = matchCheck.type(actual);
    else if (expected === "nonvoid") r = matchCheck.nonvoid(actual);
    else if (expected === "literal") r = matchCheck.literal(actual);
    else if (expected === "writeable") r = matchCheck.writeable(actual);
    else if (expected === "ordered") r = matchCheck.ordered(actual);
    else if (expected === "image") r = matchCheck.image(actual);
    else if (expected === "vector" || expected.startsWith("*"))
      r = matchCheck.vector(actual);
    else
      throw new AnalyzerError(
        pos,
        `Expected type ${expected}, received type ${actual}`
      );

    if (!r)
      throw new AnalyzerError(
        pos,
        `Expected type ${expected}, received type ${actual}`
      );
  }

  private requireSoftID(id: p.Identifier): string {
    if (id instanceof p.Identifier1)
      return this.getTypeStandardId(id.standardId);
    else return id.id.val;
  }

  private idFromClause(c: p.Clause): string {
    // exp66<exp5<exp4<exp3<exp2<exp1<expression<clause8
    if (
      c instanceof p.Clause8 &&
      c.expression.exp1.exp2.exp3.exp4.exp5.exp6 instanceof p.Exp66
    ) {
      return this.requireSoftID(
        c.expression.exp1.exp2.exp3.exp4.exp5.exp6.identifier
      );
    }
    throw new AnalyzerError(c.pos, `Can only index using exact ID of field`);
  }

  private matchStructureCreation(
    pos: number,
    st: StructureType,
    args: p.Clause[]
  ) {
    // clauseList should match each structure property
    const expectedFieldCount = Object.keys(st.fields).length;
    const actualFieldCount = args.length;
    if (expectedFieldCount !== actualFieldCount)
      throw new AnalyzerError(
        pos,
        `Expected ${expectedFieldCount} fields ` +
          `for structure, received ${actualFieldCount} fields`
      );

    for (let i = 0; i < expectedFieldCount; i++) {
      const expectedType = Object.values(st.fields)[i];
      const actualType = this.getTypeClause(args[i]);
      this.expectType(args[i].pos, expectedType, actualType);
    }
  }

  private matchProcCall(pos: number, pc: ProcedureType, args: p.Clause[]) {
    // clauseList should match each argument type
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const arg_type = this.resolveType(this.getTypeClause(arg));
      const param = Object.values(pc.parameters)[i];
      if (typeof param === "string") this.expectType(arg.pos, param, arg_type);
    }
  }

  private resolveType(id: string | void): string {
    if (!id) return "";

    let ret: string | void;
    const type = this.typeStack.getStoredType(id, false);
    if (typeof type === "string") ret = type;
    else if (type instanceof VarType) ret = type.type;
    else if (type instanceof ProcedureType) ret = type.returnType as string;

    return ret || id;
  }

  // Specific pullers

  private pullStructureDecl(n: p.StructureDecl): StructureType {
    const id = this.requireSoftID(n.identifier);

    // Structure cannot already be declared at this level
    const existingType = this.typeStack.getStoredType(id, true);
    if (existingType) {
      throw new AnalyzerError(n.identifier.pos, "Identifier already used");
    }

    // Get fields from structure_decl_fields
    const fields: { [ident: string]: string } = {};
    if (n.structureDeclFields && n.structureDeclFields.fieldList) {
      // Add fields
      const fieldList = n.structureDeclFields.fieldList;

      const addFromFieldListEl = (fle: p.FieldListEl) => {
        const type = fle.type.val;
        // First identifier
        const id = this.requireSoftID(fle.identifierList.identifier);
        fields[id] = type;
        // Iterate through following identifiers
        fle.identifierList.identifierListFollow.forEach((ident) => {
          const id = this.requireSoftID(ident.identifier);
          fields[id] = type;
        });
      };

      // Add for field_list_el and through field_list_follows
      addFromFieldListEl(fieldList.fieldListEl);
      fieldList.fieldListFollow.forEach((flf) =>
        addFromFieldListEl(flf.fieldListEl)
      );
    }

    return new StructureType(id, fields);
  }

  private pullProcType(n: p.ProcType): ProcInner {
    // Fetch fields
    const fields: ProcInnerField[] = [];

    const handleEl = (pel: p.PtypeListEl) => {
      if (pel instanceof p.PtypeListEl0) fields.push(pel.type.val);
      else if (pel instanceof p.PtypeListEl1) {
        fields.push(this.pullProcType(pel.procType));
      } else if (pel instanceof p.PtypeListEl2) {
        const types: string[] = [];
        const sd = pel.sDecl;
        types.push(sd.type.val);
        sd.sDeclFollow.forEach((sdf) => types.push(sdf.type.val));
        fields.push(new ProcInnerSDecl(types));
      }
    };

    if (n.ptypeList) {
      handleEl(n.ptypeList.ptypeListEl);
      n.ptypeList.ptypeListFollow.forEach((plf) => handleEl(plf.ptypeListEl));
    }

    const returnType = n.returnTypex && n.returnTypex.type.val;

    return new ProcInner(fields, returnType);
  }

  private pullProcDecl(n: p.ProcDecl): ProcedureType {
    // Get proc ID
    const id = this.requireSoftID(n.identifier);

    // Proc cannot already be declared at this level
    const existingType = this.typeStack.getStoredType(id, true);
    if (existingType && !(existingType instanceof ForwardType)) {
      throw new AnalyzerError(n.identifier.pos, "Identifier already used");
    }

    // Pull ProcDeclType
    let params: { [ident: string]: ProcedureParamType } = {};
    let returnType: string | void = undefined;
    if (n.procDeclType) {
      const parseParam = (param: p.Parameter) => {
        if (param instanceof p.Parameter0) {
          const type = param.type.val;
          const id = this.requireSoftID(param.identifierList.identifier);

          params[id] = type;
          param.identifierList.identifierListFollow.forEach((ilf) => {
            const id = this.requireSoftID(ilf.identifier);
            params[id] = type;
          });
        } else if (param instanceof p.Parameter1) {
          const struct = this.pullStructureDecl(param.structureDecl);
          params[struct.identifier] = struct;
        } else if (param instanceof p.Parameter2) {
          const procType = this.pullProcType(param.procType);

          const id = this.requireSoftID(param.identifierList.identifier);
          params[id] = procType;

          param.identifierList.identifierListFollow.forEach((ilf) => {
            const id = this.requireSoftID(ilf.identifier);
            params[id] = procType;
          });
        }
      };

      // Resolve parameter list
      const pList = n.procDeclType.parameterList;
      if (pList) {
        parseParam(pList.parameter);
        pList.parameterListFollow.forEach((pl) => parseParam(pl.parameter));
      }

      // Resolve return type
      const rType = n.procDeclType.returnTypex;
      if (rType) returnType = rType.type.val;
    }

    return new ProcedureType(id, params, returnType || "void");
  }

  // Beware ...

  private getTypeProgram(n: p.Program): string | void {
    let ret: string | void = undefined;

    this.getTypeSequence(n.sequence);

    return ret;
  }

  private getTypeSequence(n: p.Sequence): string | void {
    let ret: string | void = undefined;

    ret = this.getTypeSequenceEl(n.sequenceEl);
    n.sequenceFollow.forEach((n) => {
      ret = this.getTypeSequenceFollow(n);
    });

    return ret;
  }

  private getTypeSequenceFollow(n: p.SequenceFollow): string | void {
    let ret: string | void = undefined;

    ret = this.getTypeSequenceEl(n.sequenceEl);

    return ret;
  }

  private getTypeSequenceEl(n: p.SequenceEl): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.SequenceEl0) {
      ret = this.getTypeDeclaration(n.declaration);
    } else if (n instanceof p.SequenceEl1) {
      ret = this.getTypeClause(n.clause);
    }

    return ret;
  }

  private getTypeDeclaration(n: p.Declaration): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.Declaration0) {
      ret = this.getTypeLetDecl(n.letDecl);
    } else if (n instanceof p.Declaration1) {
      ret = this.getTypeStructureDecl(n.structureDecl);
    } else if (n instanceof p.Declaration2) {
      ret = this.getTypeProcDecl(n.procDecl);
    } else if (n instanceof p.Declaration3) {
      ret = this.getTypeForward(n.forward);
    }

    return ret;
  }

  private getTypeLetDecl(n: p.LetDecl): string | void {
    let ret: string | void = undefined;

    const id = this.requireSoftID(n.identifier);

    // Var cannot already be declared at this level
    const existingType = this.typeStack.getStoredType(id, true);
    if (existingType)
      throw new AnalyzerError(n.identifier.pos, "Identifier already used");

    // Calculate type
    ret = this.getTypeClause(n.clause);
    if (!ret) {
      throw new AnalyzerError(n.clause.pos, "Did not return type");
    }
    ret = this.resolveType(ret);

    // If n.initOp is type InitOp0 (=) then it's constant else var
    this.typeStack.currStore().types[id] = new VarType(
      id,
      n.initOp instanceof p.InitOp0 ? AccessType.CONST : AccessType.VAR,
      ret
    );

    return ret;
  }

  private getTypeStructureDecl(n: p.StructureDecl): string | void {
    let ret: string | void = undefined;

    const st = this.pullStructureDecl(n);

    this.typeStack.currStore().types[st.identifier] = st;

    return ret;
  }

  private getTypeProcDecl(n: p.ProcDecl): string | void {
    let ret: string | void = undefined;

    const proc = this.pullProcDecl(n);

    // Store type
    this.typeStack.currStore().types[proc.identifier] = proc;

    // Push store
    this.typeStack.pushStore();

    // Add each proc parameter to current type stack
    const currStore = this.typeStack.currStore();
    Object.keys(proc.parameters).forEach(
      (paramName) => (currStore.types[paramName] = proc.parameters[paramName])
    );

    // Validate clause matches unless void return type
    let clauseType = this.getTypeClause(n.clause);
    clauseType = this.resolveType(clauseType);
    if (proc.returnType !== "void") {
      this.expectType(n.pos, proc.returnType, clauseType);
    }

    // Pop store
    this.typeStack.popStore();

    ret = clauseType;
    return ret;
  }

  private getTypeForward(n: p.Forward): string | void {
    let ret: string | void = undefined;

    // Get forward ID
    const id = this.requireSoftID(n.identifier);

    // Cannot already be used
    const existingType = this.typeStack.getStoredType(id, true);
    if (existingType) throw new AnalyzerError(n.pos, "identifier already used");

    // Get proc type
    const procType = n.procType && this.pullProcType(n.procType);

    // Store
    const forward = new ForwardType(id, procType);
    this.typeStack.currStore().types[id] = forward;

    return ret;
  }

  private getTypeClause(n: p.Clause): string | void {
    let ret: string | void = undefined;

    // Run operation within own store
    const nst = (a: () => void) => {
      this.typeStack.pushStore();
      a();
      this.typeStack.popStore();
    };

    if (n instanceof p.Clause0) {
      // If clause
      // Push stack
      this.typeStack.pushStore();
      // n.clause must be a bool type
      const conditionalType = this.getTypeClause(n.clause);
      this.expectType(n.clause.pos, "bool", conditionalType);

      const ift = n.ifClauseThen;
      if (ift instanceof p.IfClauseThen0) {
        // if n.ifClauseThen is type 0 return type is that clause
        // Return type is the clause
        ret = this.getTypeClause(ift.clause);
      } else if (ift instanceof p.IfClauseThen1) {
        // if n.ifClausethen is type 1 then `then` and `elsex` must match and are return type
        const thenType = this.getTypeClause(ift.then);
        const elseType = this.getTypeClause(ift.elsex);
        this.expectType(ift.elsex.pos, thenType, elseType);
        ret = thenType;
      }

      ret = this.resolveType(ret);
      // Pop stack
      this.typeStack.popStore();
    } else if (n instanceof p.Clause1) {
      // Push stack
      this.typeStack.pushStore();
      // Repeat clause
      const repeatType = this.getTypeClause(n.repeat);
      // Pop stack
      this.typeStack.popStore();

      // Condition must be bool type
      const conditionalType = this.getTypeClause(n.whilex);
      this.expectType(n.whilex.pos, "bool", conditionalType);

      // If do clause set, must be same type as repeat expression type
      if (n.clauseDo) {
        const doType = this.getTypeClause(n.clauseDo.clause);
        this.expectType(n.clauseDo.clause.pos, repeatType, doType);
      }

      // Set return type
      ret = repeatType;
    } else if (n instanceof p.Clause2) {
      // While clause
      // Push a new type store
      this.typeStack.pushStore();

      // Clause type
      const clauseType = this.getTypeClause(n.dox);
      ret = clauseType;

      // Condition must be bool type
      const conditionalType = this.getTypeClause(n.whilex);
      this.expectType(n.whilex.pos, "bool", conditionalType);

      // Pop store
      this.typeStack.popStore();
    } else if (n instanceof p.Clause3) {
      // For loop
      // Push a new type store
      this.typeStack.pushStore();

      const id = this.requireSoftID(n.identifier);
      // Store iterator type
      this.typeStack.currStore().types[id] = new VarType(
        id,
        AccessType.VAR,
        ".!number"
      );

      // from, to, and by all must be numbers
      const fromType = this.getTypeClause(n.from);
      this.expectType(n.from.pos, ".!number", fromType);
      const toType = this.getTypeClause(n.to);
      this.expectType(n.to.pos, ".!number", toType);
      if (n.clauseBy) {
        const byType = this.getTypeClause(n.clauseBy.clause);
        this.expectType(n.clauseBy.clause.pos, ".!number", byType);
      }

      // do clause is return
      this.typeStack.pushStore();
      const doType = this.getTypeClause(n.dox);
      this.typeStack.popStore();
      ret = doType;

      // Pop store
      this.typeStack.popStore();
    } else if (n instanceof p.Clause4) {
      // Case list
      // Each case has the same type and that is the return type
      const caseClauseType = this.resolveType(this.getTypeClause(n.casex));
      this.expectType(n.casex.pos, "nonvoid", caseClauseType);

      // Get default type
      const defaultType = this.resolveType(this.getTypeClause(n.defaultx));
      ret = defaultType;

      // Ensure every case has the same type, and matches caseClauseType
      const checkCaseListEl = (cle: p.CaseListEl) => {
        // Clauses must match caseClauseType

        nst(() =>
          this.expectType(
            cle.clauseList.clause.pos,
            caseClauseType,
            this.resolveType(this.getTypeClause(cle.clauseList.clause))
          )
        );
        cle.clauseList.clauseListFollow.forEach((clause) =>
          nst(() =>
            this.expectType(
              clause.pos,
              caseClauseType,
              this.resolveType(this.getTypeClause(clause))
            )
          )
        );

        // Clause must match defaultType
        nst(() =>
          this.expectType(
            cle.clause.pos,
            defaultType,
            this.resolveType(this.getTypeClause(cle.clause))
          )
        );
      };

      // Validate
      checkCaseListEl(n.caseList.caseListEl);
      n.caseList.caseListFollow.forEach((clf) =>
        checkCaseListEl(clf.caseListEl)
      );
    } else if (n instanceof p.Clause5) {
      // Abort clause, nothing to do
    } else if (n instanceof p.Clause6) {
      // Write clause
      ret = this.getTypeWriteClause(n.writeClause);
    } else if (n instanceof p.Clause7) {
      // Raster clause
      ret = this.getTypeRaster(n.raster);
    } else if (n instanceof p.Clause8) {
      // Expression, possible assignment
      const expType = this.getTypeExpression(n.expression);
      // If clauseExprFollow set, expType must be mutable varType and
      //  expType must be a string
      if (n.clauseExprFollow) {
        if (typeof expType !== "string")
          throw new AnalyzerError(n.expression.pos, "Unable to set variable");

        const heldVar = this.typeStack.getStoredType(expType, false);
        if (!heldVar) {
          // Setting a transient variable
          ret = expType;
        } else {
          if (!(heldVar instanceof VarType)) {
            throw new AnalyzerError(n.expression.pos, "Unable to set variable");
          }

          // Must not be a constant
          if (heldVar.accessType === AccessType.CONST)
            throw new AnalyzerError(
              n.expression.pos,
              `Unable to modify constant variable ${heldVar.identifier} type ${heldVar.type}`
            );

          // Calculate type of clause
          const clauseType = this.getTypeClause(n.clauseExprFollow.clause);
          // Must match
          this.expectType(
            n.clauseExprFollow.clause.pos,
            heldVar.type,
            clauseType
          );
        }
      } else {
        ret = expType;
      }
    }

    return ret;
  }

  private getTypeWriteClause(n: p.WriteClause): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.WriteClause0) {
      // Write clause
      // No return
      // Need to validate writeList
      this.getTypeWriteList(n.writeList);
    } else if (n instanceof p.WriteClause1) {
      // Output clause
      // No return
      // Clause must be file type
      this.expectType(n.clause.pos, "file", this.getTypeClause(n.clause));
      // Validate writeList
      this.getTypeWriteList(n.writeList);
    } else if (n instanceof p.WriteClause2) {
      // Output byte clause
      // No return, first clause is file, second and third are numbers
      this.expectType(n.clause.pos, "file", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
      this.expectType(n.c.pos, ".!number", this.getTypeClause(n.c));
    } else if (n instanceof p.WriteClause3) {
      // Output 16 clause
      // No return, first clause is file, second and third are numbers
      this.expectType(n.clause.pos, "file", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
      this.expectType(n.c.pos, ".!number", this.getTypeClause(n.c));
    } else if (n instanceof p.WriteClause4) {
      // Output 32 clause
      // No return, first clause is file, second is number
      this.expectType(n.clause.pos, "file", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
    }

    return ret;
  }

  private getTypeWriteList(n: p.WriteList): string | void {
    let ret: string | void = undefined;

    const checkWriteListEl = (wle: p.WriteListEl) => {
      // First clause must be writeable
      this.expectType(
        wle.clause.pos,
        "writeable",
        this.getTypeClause(wle.clause)
      );
      // If set, second clause must be number
      if (wle.writeListElFollow) {
        this.expectType(
          wle.writeListElFollow.clause.pos,
          ".!number",
          this.getTypeClause(wle.writeListElFollow.clause)
        );
      }
    };

    // Check for initial and for all subsequent
    checkWriteListEl(n.writeListEl);
    n.writeListFollow.forEach((wlf) => checkWriteListEl(wlf.writeListEl));

    return ret;
  }

  private getTypeRaster(n: p.Raster): string | void {
    let ret: string | void = undefined;

    // First clause type image, second type #pixel
    this.expectType(n.thisx.pos, "image", this.getTypeClause(n.thisx));
    this.expectType(n.that.pos, "#pixel", this.getTypeClause(n.that));

    return ret;
  }

  private getTypeExpression(n: p.Expression): string | void {
    let ret: string | void = undefined;

    if (n.expressionFollow.length > 0) {
      // If expressionFollow set, then all exp1s must be bools, returns a bool
      ret = "bool";
      this.expectType(n.exp1.pos, "bool", this.getTypeExp1(n.exp1));
      n.expressionFollow.forEach((ef) =>
        this.expectType(ef.exp1.pos, "bool", this.getTypeExp1(ef.exp1))
      );
    } else {
      // Else just return the first expr1 type
      ret = this.getTypeExp1(n.exp1);
    }

    return ret;
  }

  private getTypeExp1(n: p.Exp1): string | void {
    let ret: string | void = undefined;

    if (n.exp1Follow.length > 0) {
      // If exp1Follow set, then all exp2s must be bools, returns a bool
      ret = "bool";
      this.expectType(n.exp2.pos, "bool", this.getTypeExp2(n.exp2));
      n.exp1Follow.forEach((ef) =>
        this.expectType(ef.exp2.pos, "bool", this.getTypeExp2(ef.exp2))
      );
    } else {
      // Else just return the first expr2 type
      ret = this.getTypeExp2(n.exp2);
    }

    return ret;
  }

  private getTypeExp2(n: p.Exp2): string | void {
    let ret: string | void = undefined;

    const checkRel = () => {
      ret = "bool";
      let left = this.getTypeExp3(n.exp3);
      // While exp2Op, iterate through setting left and resolving against right
      // exp3 [rel_op exp3]*
      n.exp2Op.forEach((e2op) => {
        const right = this.getTypeExp3(e2op.exp3);
        if (e2op.relOp instanceof p.RelOp0) {
          // If equality op, then must be the same type of nonvoid
          this.expectType(e2op.pos, "nonvoid", right);
          this.expectType(e2op.pos, this.resolveType(left as string), right);
        } else if (e2op.relOp instanceof p.RelOp1) {
          // If comparison op, then must be same type of ordered
          this.expectType(e2op.pos, "ordered", right);
          this.expectType(e2op.pos, this.resolveType(left as string), right);
        } else if (e2op.relOp instanceof p.RelOp2) {
          // If type op, left must be a pntr, right must be identifier
          //  pointing to structure
          this.expectType(n.exp3.pos, "pntr", left);
          if (!right) {
            throw new AnalyzerError(
              e2op.exp3.pos,
              "Expected structure identifier"
            );
          } else {
            const t = this.typeStack.getStoredType(right, false);
            if (!t || !(t instanceof StructureType)) {
              throw new AnalyzerError(
                e2op.exp3.pos,
                "Expected structure identifier"
              );
            }
          }
        }

        // Each returns a bool
        left = "bool";
      });
    };

    if (n instanceof p.Exp20) {
      // Negated, check rel
      checkRel();
    } else if (n instanceof p.Exp21) {
      // If exp2op set then must be bool, calculate relatives
      if (n.exp2Op.length > 0) {
        checkRel();
      } else {
        // Else just return type
        ret = this.getTypeExp3(n.exp3);
      }
    }

    return ret;
  }

  private getTypeExp3(n: p.Exp3): string | void {
    let ret: string | void = undefined;

    if (n.exp3Op.length > 0) {
      // if exp3Op set then both must be numbers
      this.expectType(n.exp4.pos, ".!number", this.getTypeExp4(n.exp4));
      n.exp3Op.forEach((e3op) =>
        this.expectType(e3op.exp4.pos, ".!number", this.getTypeExp4(e3op.exp4))
      );
      ret = ".!number";
    } else {
      // Else just return type
      ret = this.getTypeExp4(n.exp4);
    }

    return ret;
  }

  private getTypeExp4(n: p.Exp4): string | void {
    let ret: string | void = undefined;

    if (n.exp4Op.length > 0) {
      if (n.exp4Op[0].multOp instanceof p.MultOp0) {
        // String concatenation
        this.expectType(n.exp5.pos, "string", this.getTypeExp5(n.exp5));
        n.exp4Op.forEach((e4op) =>
          this.expectType(e4op.exp5.pos, "string", this.getTypeExp5(e4op.exp5))
        );
        ret = "string";
      } else {
        // Else number operations
        this.expectType(n.exp5.pos, ".!number", this.getTypeExp5(n.exp5));
        n.exp4Op.forEach((e4op) =>
          this.expectType(
            e4op.exp5.pos,
            ".!number",
            this.getTypeExp5(e4op.exp5)
          )
        );
        ret = ".!number";
      }
    } else {
      // Else just return type
      ret = this.getTypeExp5(n.exp5);
    }

    return ret;
  }

  private getTypeExp5(n: p.Exp5): string | void {
    let ret: string | void = undefined;

    // For exp5Follow, if not expressionArgFollow0 then it's dereference
    // Otherwise it's .. who knows

    ret = this.getTypeExp6(n.exp6);

    const index = (cl: p.Clause[]) => {
      if (typeof ret !== "string")
        throw new AnalyzerError(n.exp6.pos, "Unable to index");

      ret = this.resolveType(ret);
      const t = this.typeStack.getStoredType(ret, false);

      if (t instanceof StructureType) {
        (n.exp6 as any).v_type = "struct";
        // Match and adjust ret and index(:1)
        // cl[0] must be a field, set ret and re-index

        const id = this.idFromClause(cl[0]);
        // Fetch and make sure field exists
        const fieldType = t.fields[id];
        if (!fieldType)
          throw new AnalyzerError(cl[0].pos, `Unable to match field ${id}`);

        // Set ret and re-index
        ret = fieldType;
        if (cl.length > 1) index(cl.slice(1));
      } else {
        // strip "c" from start
        while (ret.startsWith("c")) ret = ret.slice(1);
        if (ret === "pntr") return;
        if (!ret.startsWith("*")) {
          throw new AnalyzerError(n.exp6.pos, `Unable to index ${ret} ${cl}`);
        }

        // Clause term must be a number
        this.expectType(cl[0].pos, ".!number", this.getTypeClause(cl[0]));

        // Match and adjust ret and index(:1)
        ret = ret.slice(1);
        if (cl.length > 1) index(cl.slice(1));
      }
    };

    // Resolving multiple dereferences (e.g. dereference of nested struct
    //  or vector) and function calls
    if (ret && n.exp5Follow.length > 0) {
      for (const exp5Follow of n.exp5Follow) {
        if (!ret)
          throw new AnalyzerError(n.exp6.pos, "Unable to operate on void type");
        const eArg = exp5Follow.expressionArg;
        if (
          !eArg.expressionArgFollow ||
          eArg.expressionArgFollow instanceof p.ExpressionArgFollow1
        ) {
          // Type 1 (clause list) means indexing, structure creation, or proc call
          // Structure creation
          // OR Indexing, sequential for successive indexing
          //  (e.g. of struct pointers or multi dimensional vectors)
          // OR Procedure call

          // Flatten list of clauses
          const clauseList = [eArg.clause];
          if (eArg.expressionArgFollow) {
            clauseList.push(eArg.expressionArgFollow.clauseList.clause);
            eArg.expressionArgFollow.clauseList.clauseListFollow.map((clf) =>
              clauseList.push(clf.clause)
            );
          }

          const t = this.typeStack.getStoredType(ret, false);
          // Destructure and restructure as appropriate
          if (t instanceof StructureType) {
            // Structure creation
            this.matchStructureCreation(n.pos, t, clauseList);
            // Return type is the structure name
            ret = t.identifier;
            // Alternatively if structure ID is a pntr type, return pntr
            const rType = ["const", "STRUCTURE"];
            if (rType.includes(ret)) ret = "pntr";
          } else if (t instanceof ProcedureType) {
            // Procedure call
            this.matchProcCall(n.pos, t, clauseList);
            // Return type is the procedure return type
            ret = t.returnType;
          } else if (t instanceof ForwardType) {
          } else if (t instanceof VarType) {
            // Structure indexing
            // Each item in clauselist is a successive index operation
            if (t.type !== "clause") index(clauseList);
          } else {
            // Vector indexing
            // Each item in clauselist is a successive index operation
            index(clauseList);
          }
        } else {
          // Type 0 (bar) means depth selection
          // Yields same type as previous, i.e. don't modify
        }
      }
    }

    return ret;
  }
  private getTypeExp6(n: p.Exp6): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.Exp60) {
      // ( clause ) - return type clause
      ret = this.getTypeClause(n.clause);
    } else if (n instanceof p.Exp61) {
      // begin sequence? end - return type sequence
      if (n.sequence) ret = this.getTypeSequence(n.sequence);
    } else if (n instanceof p.Exp62) {
      // { sequence? } - return type sequence
      if (n.sequence) ret = this.getTypeSequence(n.sequence);
    } else if (n instanceof p.Exp63) {
      // standard expression - return it
      ret = this.getTypeStandardExp(n.standardExp);
    } else if (n instanceof p.Exp64) {
      // literal - return it
      ret = this.getTypeLiteral(n.literal);
    } else if (n instanceof p.Exp65) {
      // value constructor - return it
      (n as any).v_type = "vector";
      ret = this.getTypeValueConstructor(n.valueConstructor);
    } else if (n instanceof p.Exp66) {
      // identifier - must be a variable, check and return
      const id = this.requireSoftID(n.identifier);
      const type = this.typeStack.getStoredType(id, false);
      if (!type)
        throw new AnalyzerError(n.identifier.pos, `Type ${id} does not exist`);

      if (typeof type === "string") ret = type;
      else if (type instanceof VarType) ret = type.identifier;
      else if (type instanceof ProcedureType) ret = type.identifier;
      else if (type instanceof StructureType) ret = type.identifier;
      else if (type instanceof ForwardType) ret = type.identifier;
      else
        throw new AnalyzerError(n.identifier.pos, `Type ${type} not expected`);
    }

    return ret;
  }

  private getTypeValueConstructor(n: p.ValueConstructor): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.ValueConstructor0) {
      // Vector constructor
      ret = this.getTypeVectorConstr(n.vectorConstr);
    } else if (n instanceof p.ValueConstructor1) {
      // Image constructor
      ret = this.getTypeImageConstr(n.imageConstr);
    } else if (n instanceof p.ValueConstructor2) {
      // Subimage constructor
      ret = this.getTypeSubimageConstr(n.subimageConstr);
    } else if (n instanceof p.ValueConstructor3) {
      // Picture constructor
      ret = this.getTypePictureConstr(n.pictureConstr);
    }

    return ret;
  }

  private getTypeVectorConstr(n: p.VectorConstr): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.VectorConstr0) {
      // "vector" range "of" clause
      // Clause must be nonvoid
      const clauseType = this.getTypeClause(n.clause);
      if (!clauseType)
        throw new AnalyzerError(n.clause.pos, `Unable to create void vector`);
      this.expectType(n.clause.pos, "nonvoid", clauseType);
      // Range is number and number
      const checkRangeEl = (re: p.RangeEl) => {
        this.expectType(re.a.pos, ".!number", this.getTypeClause(re.a));
        this.expectType(re.b.pos, ".!number", this.getTypeClause(re.b));
      };
      checkRangeEl(n.range.rangeEl);
      n.range.rangeFollow.forEach((rf) => checkRangeEl(rf.rangeEl));

      // Return type is vector of this
      ret = "*" + this.resolveType(clauseType);
    } else if (n instanceof p.VectorConstr1) {
      // "@" clause "of" type "[" clause:b vector_constr_follow* "]"
      // clause is number, b and each of follow is same nonvoid T, return is *T
      this.expectType(n.clause.pos, ".!number", this.getTypeClause(n.clause));

      const clauseType = this.getTypeClause(n.b);
      this.expectType(n.b.pos, "nonvoid", clauseType);
      n.vectorConstrFollow.forEach((vcf) =>
        this.expectType(vcf.pos, clauseType, this.getTypeClause(vcf.clause))
      );

      ret = "*" + clauseType;
    }

    return ret;
  }

  private getTypeImageConstr(n: p.ImageConstr): string | void {
    let ret: string | void = undefined;

    // "image" clause:image "by" clause:by "of" clause:of
    // image type image T, by type number, of type number, return type T
    const imageType = this.getTypeClause(n.image);
    this.expectType(n.image.pos, "image", imageType);
    ret = imageType;
    this.expectType(n.by.pos, ".!number", this.getTypeClause(n.by));
    this.expectType(n.of.pos, ".!number", this.getTypeClause(n.of));

    return ret;
  }

  private getTypeSubimageConstr(n: p.SubimageConstr): string | void {
    let ret: string | void = undefined;

    // "limit" clause subimage_constr_mid? subimage_constr_end?
    // clause type image T, return type T, to/by/at1/at2 all number
    const imageType = this.getTypeClause(n.clause);
    this.expectType(n.clause.pos, "image", imageType);
    ret = imageType;

    if (n.subimageConstrMid) {
      this.expectType(
        n.subimageConstrMid.to.pos,
        ".!number",
        this.getTypeClause(n.subimageConstrMid.to)
      );
      this.expectType(
        n.subimageConstrMid.by.pos,
        ".!number",
        this.getTypeClause(n.subimageConstrMid.by)
      );
    }

    if (n.subimageConstrEnd) {
      this.expectType(
        n.subimageConstrEnd.at1.pos,
        ".!number",
        this.getTypeClause(n.subimageConstrEnd.at1)
      );
      this.expectType(
        n.subimageConstrEnd.at2.pos,
        ".!number",
        this.getTypeClause(n.subimageConstrEnd.at2)
      );
    }

    return ret;
  }

  private getTypePictureConstr(n: p.PictureConstr): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.PictureConstr0) {
      // "shift" clause "by" clause:b "," clause:c
      // clause type pic, b/c type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, "pic", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
      this.expectType(n.c.pos, ".!number", this.getTypeClause(n.c));
    } else if (n instanceof p.PictureConstr1) {
      // "scale" clause "by" clause:b "," clause:c
      // clause type pic, b/c type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, "pic", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
      this.expectType(n.c.pos, ".!number", this.getTypeClause(n.c));
    } else if (n instanceof p.PictureConstr2) {
      // "rotate" clause "by" clause:b
      // clause type pic, b type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, "pic", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
    } else if (n instanceof p.PictureConstr3) {
      // "colour" clause "in" clause:b
      // clause type pic, b type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, "pic", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
    } else if (n instanceof p.PictureConstr4) {
      // "text" clause "from" clause:b "," clause:c "to" clause:d "," clause:e
      // clause type pic, b/c/d/e type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, "pic", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
      this.expectType(n.c.pos, ".!number", this.getTypeClause(n.c));
      this.expectType(n.d.pos, ".!number", this.getTypeClause(n.d));
      this.expectType(n.e.pos, ".!number", this.getTypeClause(n.e));
    } else if (n instanceof p.PictureConstr5) {
      // "[" clause "," clause:b "]"
      // clause/b type number, return pic
      ret = "pic";
      this.expectType(n.clause.pos, ".!number", this.getTypeClause(n.clause));
      this.expectType(n.b.pos, ".!number", this.getTypeClause(n.b));
    }

    return ret;
  }

  private getTypeLiteral(n: p.Literal): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.Literal0) {
      // nil
      ret = "pntr";
    } else if (n instanceof p.Literal1) {
      // nullfile
      ret = "file";
    } else if (n instanceof p.Literal2) {
      // integer literal
      ret = ".!number";
    } else if (n instanceof p.Literal3) {
      // boolean literal
      ret = "bool";
    } else if (n instanceof p.Literal4) {
      // string
      ret = "string";
    } else if (n instanceof p.Literal5) {
      // pixel literal
      ret = "#pixel";
    }

    return ret;
  }

  private getTypeStandardExp(n: p.StandardExp): string | void {
    let ret: string | void = undefined;

    ret = this.getTypeStandardName(n.standardName);

    return ret;
  }

  private getTypeStandardName(n: p.StandardName): string | void {
    let ret: string | void = undefined;

    if (n instanceof p.StandardName0) ret = "upb";
    else if (n instanceof p.StandardName1) ret = "lwb";
    else if (n instanceof p.StandardName2) ret = "eof";
    else if (n instanceof p.StandardName3) ret = "read.a.line";
    else if (n instanceof p.StandardName4) ret = "read";
    else if (n instanceof p.StandardName5) ret = "readi";
    else if (n instanceof p.StandardName6) ret = "readr";
    else if (n instanceof p.StandardName7) ret = "readb";
    else if (n instanceof p.StandardName8) ret = "peek";
    else if (n instanceof p.StandardName9) ret = "reads";
    else if (n instanceof p.StandardName10) ret = "read.name";
    else if (n instanceof p.StandardName11) ret = "read.byte";
    else if (n instanceof p.StandardName12) ret = "read.16";
    else if (n instanceof p.StandardName13) ret = "read.32";

    return ret;
  }

  private getTypeStandardId(n: p.StandardId): string {
    let ret = "";

    if (n instanceof p.StandardId0) ret = "r.w";
    else if (n instanceof p.StandardId1) ret = "i.w";
    else if (n instanceof p.StandardId2) ret = "s.w";
    else if (n instanceof p.StandardId3) ret = "s.o";
    else if (n instanceof p.StandardId4) ret = "s.i";
    else if (n instanceof p.StandardId5) ret = "maxint";
    else if (n instanceof p.StandardId6) ret = "maxreal";
    else if (n instanceof p.StandardId7) ret = "epsilon";
    else if (n instanceof p.StandardId8) ret = "pi";
    else if (n instanceof p.StandardId9) ret = "cursor";
    else if (n instanceof p.StandardId10) ret = "screen";

    return ret;
  }
}
