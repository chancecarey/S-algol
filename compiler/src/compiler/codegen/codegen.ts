import * as p from "../parser/parser";

class StructDef {
  constructor(public name: string, public fields: string[]) {}
}
class ProcDec {
  constructor(public name: string) {}
}

type Type = StructDef | ProcDec;
type TypeMap = { [k: string]: Type };

class TypeStack {
  maps: TypeMap[] = [
    {
      reads: new ProcDec("reads"),
      readi: new ProcDec("readi"),
      upb: new ProcDec("upb"),
      lwb: new ProcDec("lwb"),
      dump: new ProcDec("dump"),
    },
  ];
  now = () => this.maps[this.maps.length - 1];
  pop = () => this.maps.pop();
  push = () => this.maps.push({});
  has = (k: string) => {
    for (const m of this.maps) if (Object.keys(m).includes(k)) return m[k];
  };
}

export class CodeGen {
  constructor(private program: p.Program) {}

  private typeStack = new TypeStack();

  generate(): string {
    const code = this.genProgram(this.program);
    // Perform some tidying
    const improved = code.replace(/^;*/, "").trim();
    return improved;
  }

  // Utility methods
  private getSoftID(n: p.Identifier): string {
    return (n as p.Identifier0).id.val.replace(/\./g, "_");
  }

  private flattenIdentifierList(n: p.IdentifierList): string[] {
    return [
      this.getSoftID(n.identifier),
      ...n.identifierListFollow.map((f) => this.getSoftID(f.identifier)),
    ];
  }

  private immediate(x: string): string {
    return `(()=>{return ${x}})()`;
  }

  // Generation methods below

  private genProgram(n: p.Program): string {
    return this.genSequence(n.sequence);
  }

  private genSequence(n: p.Sequence, ret = false): string {
    this.typeStack.push();

    const sequences = [
      n.sequenceEl,
      ...n.sequenceFollow.map((sf) => sf.sequenceEl),
    ].map((se) => this.genSequenceEl(se));

    if (ret && sequences.length > 0)
      sequences[sequences.length - 1] =
        "return " + this.immediate(sequences[sequences.length - 1]);

    const s = sequences.join(";");

    this.typeStack.pop();

    return s;
  }

  private genSequenceFollow(n: p.SequenceFollow): string {
    return this.genSequenceEl(n.sequenceEl);
  }

  private genSequenceEl(n: p.SequenceEl): string {
    if (n instanceof p.SequenceEl0) {
      return this.genDeclaration(n.declaration);
    } else if (n instanceof p.SequenceEl1) {
      return this.genClause(n.clause);
    }

    throw new Error("Unhandled branch");
  }

  private genDeclaration(n: p.Declaration): string {
    if (n instanceof p.Declaration0) {
      return this.genLetDecl(n.letDecl);
    } else if (n instanceof p.Declaration1) {
      return this.genStructureDecl(n.structureDecl);
    } else if (n instanceof p.Declaration2) {
      return this.genProcDecl(n.procDecl);
    } else if (n instanceof p.Declaration3) {
      return this.genForward(n.forward);
    }

    throw new Error("Unhandled branch");
  }

  private genLetDecl(n: p.LetDecl): string {
    const isConst = n.initOp instanceof p.InitOp0;
    const clause = this.genClause(n.clause);

    return `${isConst ? "const" : "let"} ${this.getSoftID(
      n.identifier
    )} = ${this.immediate(clause)}`;
  }

  private genStructureDecl(n: p.StructureDecl): string {
    // Register structure type for future invocation
    const id = this.getSoftID(n.identifier);

    const fields: string[] = [];

    if (n.structureDeclFields && n.structureDeclFields.fieldList) {
      // Get field names
      const fieldList = n.structureDeclFields.fieldList;

      [
        fieldList.fieldListEl,
        ...fieldList.fieldListFollow.map((f) => f.fieldListEl),
      ].map((el) =>
        fields.push(...this.flattenIdentifierList(el.identifierList))
      );
    }

    this.typeStack.now()[id] = new StructDef(id, fields);

    return "";
  }

  private genProcDecl(n: p.ProcDecl): string {
    const id = this.getSoftID(n.identifier);
    const params: string[] = [];

    this.typeStack.now()[id] = new ProcDec(id);

    this.typeStack.push();
    let clause = this.genClause(n.clause);
    // if (!(n.clause instanceof p.Clause8)) clause = `return ${clause}`;
    this.typeStack.pop();

    // Check if we have params
    if (n.procDeclType && n.procDeclType.parameterList) {
      const pl = n.procDeclType.parameterList;
      [pl.parameter, ...pl.parameterListFollow.map((p) => p.parameter)].forEach(
        (param) => {
          if (param instanceof p.Parameter0) {
            params.push(...this.flattenIdentifierList(param.identifierList));
          } else if (param instanceof p.Parameter1) {
            params.push(this.getSoftID(param.structureDecl.identifier));
          } else if (param instanceof p.Parameter2) {
            params.push(...this.flattenIdentifierList(param.identifierList));
          }
        }
      );
    }

    return `const ${id} = (${params.join(", ")}) => ${clause};`;
  }

  private genForward(n: p.Forward): string {
    const id = this.getSoftID(n.identifier);
    this.typeStack.now()[id] = new ProcDec(id);
    return "";
  }

  private genClause(n: p.Clause): string {
    // Must return the last thing
    // Clause is called like `const sconst = () => {genClause()}`

    if (n instanceof p.Clause0) {
      // If statement
      const ifClause = this.immediate(this.genClause(n.clause));
      if (n.ifClauseThen instanceof p.IfClauseThen0) {
        let doClause = this.genClause(n.ifClauseThen.clause);
        if (!doClause.startsWith("{")) doClause = `return ${doClause}`;
        return `(()=>{if (${ifClause}) ${doClause}})()`;
        // const doClause = this.immediate(this.genClause(n.ifClauseThen.clause));
        // return `(()=>{if (${ifClause}) {return ${doClause}}})()`;
      } else {
        let thenClause = this.genClause(n.ifClauseThen.then);
        if (!thenClause.startsWith("{")) thenClause = `return ${thenClause}`;
        let elseClause = this.genClause(n.ifClauseThen.elsex);
        if (!elseClause.startsWith("{")) elseClause = `return ${elseClause}`;
        return `(()=>{if (${ifClause}) ${thenClause} else ${elseClause}})()`;
        // const thenClause = this.immediate(this.genClause(n.ifClauseThen.then));
        // const elseClause = this.immediate(this.genClause(n.ifClauseThen.elsex));
        // return `(()=>{if (${ifClause}) {return ${thenClause}} else {return ${elseClause}}})()`;
      }
    } else if (n instanceof p.Clause1) {
      // Repeat statement
      // REPEAT clause WHILE clause
      // REPEAT clause WHILE clause DO clause
      const whileClause = this.genClause(n.whilex);
      const repeatClause = this.genClause(n.repeat);
      if (n.clauseDo) {
        return "";
      } else {
        return `do {${repeatClause}} while (${whileClause})`;
      }
    } else if (n instanceof p.Clause2) {
      // While statement
      const whileClause = this.genClause(n.whilex);
      const doClause = this.genClause(n.dox);
      return `while (${whileClause}) {${doClause}}`;
    } else if (n instanceof p.Clause3) {
      // For statement
      const id = this.getSoftID(n.identifier);
      const fromClause = this.immediate(this.genClause(n.from));
      const toClause = this.immediate(this.genClause(n.to));
      const doClause = this.genClause(n.dox);

      let byClause = "1";
      if (n.clauseBy)
        byClause = this.immediate(this.genClause(n.clauseBy.clause));

      return `(()=>{for (let ${id} = ${fromClause}; ${byClause} > 0 ? ${id} <= ${toClause} : ${id} > ${toClause};  ${id} += ${byClause}) {(()=>{${doClause}})()}})()`;
    } else if (n instanceof p.Clause4) {
      // Case statement
      const switchClause = this.genClause(n.casex);
      const defaultClause = this.genClause(n.defaultx);

      const cases = [
        n.caseList.caseListEl,
        ...n.caseList.caseListFollow.map((clf) => clf.caseListEl),
      ]
        .map((cle) => {
          const subCases = [
            cle.clauseList.clause,
            ...cle.clauseList.clauseListFollow.map((clf) => clf.clause),
          ].map((clause) => `case ${this.genClause(clause)}:`);
          const clause = this.genClause(cle.clause);
          return `${subCases.join("\n")} return ${this.immediate(clause)}`;
        })
        .join("\n");

      return `(()=>{switch (${this.immediate(
        switchClause
      )}) {${cases}\ndefault: return ${this.immediate(defaultClause)}}})()`;
    } else if (n instanceof p.Clause5) {
      // Abort statement
      return "";
    } else if (n instanceof p.Clause6) {
      // Write clause
      return this.genWriteClause(n.writeClause);
    } else if (n instanceof p.Clause7) {
      // Raster expression
      throw new Error("TODO implement raster expression");
    } else if (n instanceof p.Clause8) {
      // Expression
      const expr = this.genExpression(n.expression);
      if (n.clauseExprFollow) {
        // Assignment
        const to = this.genClause(n.clauseExprFollow.clause);
        return `${expr} = ${to};`;
      } else {
        // Normal expression, just compute result
        return expr;
      }
    }

    console.log(n);
    throw new Error("Unhandled branch");
  }

  private genWriteClause(n: p.WriteClause): string {
    if (n instanceof p.WriteClause0) {
      return `write(${this.genWriteList(n.writeList)});`;
    } else if (n instanceof p.WriteClause1) {
    } else if (n instanceof p.WriteClause2) {
    } else if (n instanceof p.WriteClause3) {
    } else if (n instanceof p.WriteClause4) {
    }

    throw new Error("Unhandled branch");
  }

  private genWriteList(n: p.WriteList): string {
    return [n.writeListEl, ...n.writeListFollow.map((wlf) => wlf.writeListEl)]
      .map((wle) => this.genWriteListEl(wle))
      .join(",");
  }

  private genWriteListEl(n: p.WriteListEl): string {
    if (n.writeListElFollow !== undefined)
      throw new Error("TODO unable to handle depth writing");
    return this.genClause(n.clause);
  }

  private genExpression(n: p.Expression): string {
    return (
      this.genExp1(n.exp1) +
      n.expressionFollow.map((ef) => `|| ${this.genExp1(ef.exp1)}`).join(" ")
    );
  }

  private genExp1(n: p.Exp1): string {
    return (
      this.genExp2(n.exp2) +
      n.exp1Follow.map((ef) => `&& ${this.genExp2(ef.exp2)}`).join(" ")
    );
  }

  private genExp2(n: p.Exp2): string {
    // if exp20 then we have a tilde at the front indicating boolean negation
    const s =
      this.genExp3(n.exp3) +
      n.exp2Op
        .map((eop) => `${this.genRelOp(eop.relOp)} ${this.genExp3(eop.exp3)}`)
        .join(" ");

    return n instanceof p.Exp20 ? `!(${s})` : s;
  }

  private genExp3(n: p.Exp3): string {
    return (
      this.genExp4(n.exp4) +
      n.exp3Op
        .map((eop) => `${this.genAddOp(eop.addOp)} ${this.genExp4(eop.exp4)}`)
        .join(" ")
    );
  }

  private genExp4(n: p.Exp4): string {
    return (
      this.genExp5(n.exp5) +
      n.exp4Op
        .map((eop) => `${this.genMultOp(eop.multOp)} ${this.genExp5(eop.exp5)}`)
        .join(" ")
    );
  }

  private genExp5(n: p.Exp5): string {
    // if exp50 then we have an addition operation at the start

    const e6g = this.genExp6(n.exp6);
    const type = this.typeStack.has(e6g);

    let s = e6g;

    const follows = n.exp5Follow.map((ef) =>
      this.genExpressionArg(ef.expressionArg)
    );

    if (type instanceof StructDef) {
      const parts = [];
      for (let i = 0; i < type.fields.length; i++)
        parts.push(`"${type.fields[i]}": ${follows[0][i]}`);

      return `{${parts.join(",")}}`;
    } else {
      if (type instanceof ProcDec) s += `(${follows.join()})`;
      else if ((n.exp6 as any).v_type === "struct") s = `${s}["${follows[0]}"]`;
      else if (follows.length > 0) {
        // Not struct, not proc, must be vector indexing
        return `${s}[${follows[0].join()}]`;
      }

      if (n instanceof p.Exp50) s = this.genAddOp(n.addOp) + `(${s})`;
    }

    return s;
  }

  private genExpressionArg(n: p.ExpressionArg): string[] {
    if (n.expressionArgFollow instanceof p.ExpressionArgFollow0) {
      return [];
    }

    const accessClauses = [n.clause];
    if (n.expressionArgFollow instanceof p.ExpressionArgFollow1)
      accessClauses.push(
        n.expressionArgFollow.clauseList.clause,
        ...n.expressionArgFollow.clauseList.clauseListFollow.map(
          (clf) => clf.clause
        )
      );

    const computedClauses = accessClauses.map((ac) => this.genClause(ac));

    return computedClauses;
  }

  private genExp6(n: p.Exp6): string {
    if (n instanceof p.Exp60) {
      return `(${this.genClause(n.clause)})`;
    } else if (n instanceof p.Exp61 || n instanceof p.Exp62) {
      // Generate all sequences and append last
      // return n.sequence ? this.genSequence(n.sequence, true) : "";
      return `{${n.sequence ? this.genSequence(n.sequence, true) : ""}}`;
    } else if (n instanceof p.Exp63) {
      return this.genStandardExp(n.standardExp);
    } else if (n instanceof p.Exp64) {
      return this.genLiteral(n.literal);
    } else if (n instanceof p.Exp65) {
      return this.genValueConstructor(n.valueConstructor);
    } else if (n instanceof p.Exp66) {
      return this.genIdentifier(n.identifier);
    }

    throw new Error("Unhandled branch");
  }

  private genValueConstructor(n: p.ValueConstructor): string {
    if (n instanceof p.ValueConstructor0) {
      return this.genVectorConstr(n.vectorConstr);
    } else if (n instanceof p.ValueConstructor1) {
    } else if (n instanceof p.ValueConstructor2) {
    } else if (n instanceof p.ValueConstructor3) {
      return this.genPictureConstr(n.pictureConstr);
    }

    throw new Error("Unhandled branch");
  }

  private genVectorConstr(n: p.VectorConstr): string {
    if (n instanceof p.VectorConstr0) {
      const from = this.genClause(n.range.rangeEl.a);
      const to = this.genClause(n.range.rangeEl.b);
      const val = this.genClause(n.clause);
      return `(()=>{const a = {};for(let i = ${from}; i <= ${to}; i++) a[i] = ${val};return a;})()`;
    } else if (n instanceof p.VectorConstr1) {
    }

    throw new Error("Unhandled branch");
  }

  private genPictureConstr(n: p.PictureConstr): string {
    if (n instanceof p.PictureConstr0) {
      // Shift
      const a = this.genClause(n.clause);
      const b = this.genClause(n.b);
      const c = this.genClause(n.c);
      return `_d_sh(${a}, ${b}, ${c})`;
    } else if (n instanceof p.PictureConstr1) {
      // Scale
      const a = this.genClause(n.clause);
      const b = this.genClause(n.b);
      const c = this.genClause(n.c);
      return `_d_sc(${a}, ${b}, ${c})`;
    } else if (n instanceof p.PictureConstr2) {
      // Rotate
      const a = this.genClause(n.clause);
      const b = this.genClause(n.b);
      return `_d_ro(${a}, ${b})`;
    } else if (n instanceof p.PictureConstr3) {
    } else if (n instanceof p.PictureConstr4) {
    } else if (n instanceof p.PictureConstr5) {
    }

    throw new Error("Unhandled branch");
  }

  private genLiteral(n: p.Literal): string {
    if (n instanceof p.Literal0) {
      return "[]";
    } else if (n instanceof p.Literal1) {
      return "undefined";
    } else if (n instanceof p.Literal2) {
      return n.integerLiteral.number.val.toString();
    } else if (n instanceof p.Literal3) {
      return n.booleanLiteral instanceof p.BooleanLiteral0 ? "true" : "false";
    } else if (n instanceof p.Literal4) {
      return `"${n.string.val}"`;
    } else if (n instanceof p.Literal5) {
      throw new Error("Pixel literals not implemented");
    }

    throw new Error("Unhandled branch");
  }

  private genAddOp(n: p.AddOp): string {
    if (n instanceof p.AddOp0) {
      return "+";
    } else if (n instanceof p.AddOp1) {
      return "-";
    }

    throw new Error("Unhandled branch");
  }

  private genMultOp(n: p.MultOp): string {
    if (n instanceof p.MultOp0) {
      return "+";
    } else if (n instanceof p.MultOp1) {
      return "";
    } else if (n instanceof p.MultOp2) {
      return "%";
    } else if (n instanceof p.MultOp3) {
      return "*";
    } else if (n instanceof p.MultOp4) {
      return "/";
    } else if (n instanceof p.MultOp5) {
      throw new Error("Pixel joining not supported");
    } else if (n instanceof p.MultOp6) {
      throw new Error("Pixel inclusion not supported");
    }

    throw new Error("Unhandled branch");
  }

  private genRelOp(n: p.RelOp): string {
    if (n instanceof p.RelOp0) {
      return this.genEqOp(n.eqOp);
    } else if (n instanceof p.RelOp1) {
      return this.genComparOp(n.comparOp);
    } else if (n instanceof p.RelOp2) {
      return this.genTypeOp(n.typeOp);
    }

    throw new Error("Unhandled branch");
  }

  private genEqOp(n: p.EqOp): string {
    if (n instanceof p.EqOp0) {
      return "==";
    } else if (n instanceof p.EqOp1) {
      return "!=";
    }

    throw new Error("Unhandled branch");
  }

  private genComparOp(n: p.ComparOp): string {
    if (n instanceof p.ComparOp0) {
      return "<=";
    } else if (n instanceof p.ComparOp1) {
      return "<";
    } else if (n instanceof p.ComparOp2) {
      return ">=";
    } else if (n instanceof p.ComparOp3) {
      return ">";
    }

    throw new Error("Unhandled branch");
  }

  private genTypeOp(n: p.TypeOp): string {
    if (n instanceof p.TypeOp0) {
      return "instanceof";
    } else if (n instanceof p.TypeOp1) {
      return "";
    }

    throw new Error("Unhandled branch");
  }

  private genIdentifier(n: p.Identifier): string {
    if (n instanceof p.Identifier0) {
      return this.getSoftID(n);
    } else if (n instanceof p.Identifier1) {
      return this.genStandardId(n.standardId);
    }

    throw new Error("Unhandled branch");
  }

  private genStandardExp(n: p.StandardExp): string {
    return this.genStandardName(n.standardName);
  }

  private genStandardName(n: p.StandardName): string {
    if (n instanceof p.StandardName0) {
      return "upb";
    } else if (n instanceof p.StandardName1) {
      return "lwb";
    } else if (n instanceof p.StandardName2) {
      return "eof";
    } else if (n instanceof p.StandardName3) {
      return "read.a.line";
    } else if (n instanceof p.StandardName4) {
      return "read";
    } else if (n instanceof p.StandardName5) {
      return "readi";
    } else if (n instanceof p.StandardName6) {
      return "readr";
    } else if (n instanceof p.StandardName7) {
      return "readb";
    } else if (n instanceof p.StandardName8) {
      return "peak";
    } else if (n instanceof p.StandardName9) {
      return "reads";
    } else if (n instanceof p.StandardName10) {
      return "read.name";
    } else if (n instanceof p.StandardName11) {
      return "read.byte";
    } else if (n instanceof p.StandardName12) {
      return "read.16";
    } else if (n instanceof p.StandardName13) {
      return "read.32";
    }

    throw new Error("Unhandled branch");
  }

  private genStandardId(n: p.StandardId): string {
    if (n instanceof p.StandardId0) {
      return "r.w";
    } else if (n instanceof p.StandardId1) {
      return "i.w";
    } else if (n instanceof p.StandardId2) {
      return "s.w";
    } else if (n instanceof p.StandardId3) {
      return "s.o";
    } else if (n instanceof p.StandardId4) {
      return "s.i";
    } else if (n instanceof p.StandardId5) {
      return "maxint";
    } else if (n instanceof p.StandardId6) {
      return "maxreal";
    } else if (n instanceof p.StandardId7) {
      return "epsilon";
    } else if (n instanceof p.StandardId8) {
      return "pi";
    } else if (n instanceof p.StandardId9) {
      return "cursor";
    } else if (n instanceof p.StandardId10) {
      return "screen";
    }

    throw new Error("Unhandled branch");
  }
}
