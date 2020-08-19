export class Type_ {
  constructor(public val: string) {}
}

export class String_ {
  constructor(public val: string) {}
}

export class Id_ {
  constructor(public val: string) {}
}

export class Number_ {
  constructor(public val: number) {}
}

export class Parser {
  private typeR = /^[*c]*(?:int|real|bool|string|pixel|pic|pntr|file|#pixel|#cpixel)/;
  private numberR = /^\d+(?:\.\d*)?(?:e\d+)?/;
  private idR = /^\w+(?:[.\w]*\w)?/;
  private stringR = /^"((?:'"|''|.)*?)"/;

  private wsR = /^\s+/;
  private semicolonR = /^\s*[\n;]\s*/;
  private symbolsR = /^[^\s\w]+/;
  private commentR = /![^"]*/;

  private cursor = 0;
  private program: string;
  constructor(private programRaw: string) {
    // Replace comments
    this.program = programRaw
      .split("\n")
      .map((l) => {
        const commentM = l.match(this.commentR);
        // Replace comments with equal length whitespace
        if (commentM)
          return l.replace(this.commentR, " ".repeat(commentM[0].length));
        else return l;
      })
      .join("\n");
  }

  public parse(): Program {
    try {
      return this.createProgram();
    } catch (e) {
      e.pos = this.cursor;
      throw e;
    }
  }

  private next(from: number = this.cursor): string {
    const wsM = this.program.slice(from).match(this.wsR);

    if (wsM) return this.program.slice(from + wsM[0].length);
    else return this.program.slice(from);
  }

  private skipWS(): void {
    const wsM = this.program.slice(this.cursor).match(this.wsR);
    if (wsM) this.cursor += wsM[0].length;
  }

  private isWord(s: string): boolean {
    return s.match(this.idR) !== null;
  }

  private expect(s: string): void {
    // Must match - if it does not, error out
    if (s === ";") {
      // Match a semicolon
      const semicolonM = this.program.slice(this.cursor).match(this.semicolonR);
      if (!semicolonM) throw new Error("Expected semicolon");
      this.cursor += semicolonM[0].length;
    } else if (s === "__TYPE") {
      throw new Error("Called type match - should not be called in expect");
    } else if (s === "__NUMBER") {
      throw new Error("Called number match - should not be called in expect");
    } else if (s === "__ID") {
      throw new Error("Called ID match - should not be called in expect");
    } else if (s === "__STRING") {
      throw new Error("Called string match - should not be called in expect");
    } else {
      this.skipWS();
      // Check if matching a word or symbols
      if (this.isWord(s)) {
        // If a word, needs to totally match the entire next word \w+
        const nextWord = this.next().match(this.idR);
        if (!nextWord || nextWord[0] !== s) throw new Error("Expected " + s);
        this.cursor += s.length;
      } else {
        // If a symbol, only needs to prefix match
        if (!this.next().startsWith(s)) throw new Error("Expected " + s);
        this.cursor += s.length;
      }
    }
  }

  private nextMatches(
    lookaheads: string[],
    nextLookaheads: string[] | void,
    from: number = this.cursor
  ): boolean {
    for (const l of lookaheads) {
      if (l === ";") {
        // Magic semicolon matching
        // If nextLookaheads is set, also only match if that matches
        const semicolonM = this.program.slice(from).match(this.semicolonR);
        if (!semicolonM) continue;
        if (!nextLookaheads) return true;
        return this.nextMatches(
          nextLookaheads,
          [],
          from + semicolonM[0].length
        );
      } else if (l === "__TYPE") {
        // Match against a type
        if (this.next(from).match(this.typeR)) return true;
      } else if (l === "__NUMBER") {
        // Match against a number
        if (this.next(from).match(this.numberR)) return true;
      } else if (l === "__ID") {
        // Match an ID
        // Must not be in terminals and cannot be a fully matched type
        const idM = this.next(from).match(this.idR);
        const typeM = this.next(from).match(this.typeR);
        if (
          idM &&
          (!typeM || idM[0] !== typeM[0]) &&
          !this.terminals.includes(idM[0])
        )
          return true;
      } else if (l === "__STRING") {
        // Match a string
        if (this.next(from).match(this.stringR)) return true;
      } else {
        if (this.isWord(l)) {
          // Match word
          // Full match
          const idM = this.next(from).match(this.idR);
          if (idM && idM[0] === l) return true;
        } else {
          // Match symbols
          // Prefix match
          const symbolsM = this.next(from).match(this.symbolsR);
          if (symbolsM && this.next(from).startsWith(l)) return true;
        }
      }
    }

    return false;
  }

  private createType_(): Type_ {
    // Match a single type
    this.skipWS();

    const typeM = this.next().match(this.typeR)!;
    this.cursor += typeM[0].length;
    return new Type_(typeM[0]);
  }

  private createString_(): String_ {
    // Match a string
    this.skipWS();

    const stringM = this.next().match(this.stringR)!;
    this.cursor += stringM[0].length;
    return new String_(stringM[1]);
  }

  private createId_(): Id_ {
    // Match an ID
    this.skipWS();

    const idM = this.next().match(this.idR)!;
    this.cursor += idM[0].length;
    return new Id_(idM[0]);
  }

  private createNumber_(): Number_ {
    // Match a number
    this.skipWS();

    const numberM = this.next().match(this.numberR)!;
    this.cursor += numberM[0].length;
    return new Number_(Number.parseFloat(numberM[0]));
  }

  // DO NOT MODIFY BELOW THIS LINE
  // PARSER IS AUTO GENERATED AND ANY CHANGES WILL BE REMOVED

  private terminals = [
    ";",
    "let",
    "=",
    ":=",
    "structure",
    "(",
    ")",
    ";",
    "procedure",
    ";",
    "(",
    ")",
    ";",
    "(",
    ")",
    "->",
    ",",
    "structure",
    "(",
    ")",
    ",",
    "forward",
    ",",
    "if",
    "repeat",
    "while",
    "while",
    "do",
    "for",
    "=",
    "to",
    "do",
    "case",
    "of",
    "default",
    ":",
    "abort",
    "do",
    "by",
    ":=",
    "do",
    "then",
    "else",
    ";",
    ":",
    "write",
    "output",
    ",",
    "out.byte",
    ",",
    ",",
    "out.16",
    ",",
    ",",
    "out.32",
    ",",
    ",",
    ":",
    "onto",
    "ror",
    "rand",
    "xor",
    "copy",
    "nand",
    "nor",
    "not",
    "xnor",
    ",",
    "or",
    "and",
    "~",
    "(",
    ")",
    "|",
    ",",
    "(",
    ")",
    "begin",
    "end",
    "{",
    "}",
    "vector",
    "of",
    "@",
    "of",
    "[",
    "]",
    ",",
    ",",
    "::",
    "image",
    "by",
    "of",
    "limit",
    "to",
    "by",
    "at",
    ",",
    "shift",
    "by",
    ",",
    "scale",
    "by",
    ",",
    "rotate",
    "by",
    "colour",
    "in",
    "text",
    "from",
    ",",
    "to",
    ",",
    "[",
    ",",
    "]",
    "nil",
    "nullfile",
    "true",
    "false",
    "on",
    "off",
    "&",
    "+",
    "-",
    "++",
    "div",
    "rem",
    "*",
    "/",
    "^",
    "&",
    "=",
    "~=",
    "<=",
    "<",
    ">=",
    ">",
    "is",
    "isnt",
    "upb",
    "lwb",
    "eof",
    "read.a.line",
    "read",
    "readi",
    "readr",
    "readb",
    "peek",
    "reads",
    "read.name",
    "read.byte",
    "read.16",
    "read.32",
    "r.w",
    "i.w",
    "s.w",
    "s.o",
    "s.i",
    "maxint",
    "maxreal",
    "epsilon",
    "pi",
    "cursor",
    "screen",
  ];
  private createProgram(): Program {
    const cursor = this.cursor;
    if (this.nextMatches(Program0.lookaheads())) {
      const sequence = this.createSequence();
      return new Program0(cursor, sequence);
    } else throw new Error("Unexpected input");
  }
  private createSequence(): Sequence {
    const cursor = this.cursor;
    if (this.nextMatches(Sequence0.lookaheads())) {
      const sequenceEl = this.createSequenceEl();
      const sequenceFollow: SequenceFollow[] = [];
      while (
        this.nextMatches(
          this.lookaheads["SequenceFollow"],
          this.lookaheads["SequenceEl"]
        )
      ) {
        sequenceFollow.push(this.createSequenceFollow());
      }
      return new Sequence0(cursor, sequenceEl, sequenceFollow);
    } else throw new Error("Unexpected input");
  }
  private createSequenceFollow(): SequenceFollow {
    const cursor = this.cursor;
    if (this.nextMatches(SequenceFollow0.lookaheads())) {
      this.expect(";");
      const sequenceEl = this.createSequenceEl();
      return new SequenceFollow0(cursor, sequenceEl);
    } else throw new Error("Unexpected input");
  }
  private createSequenceEl(): SequenceEl {
    const cursor = this.cursor;
    if (this.nextMatches(SequenceEl0.lookaheads())) {
      const declaration = this.createDeclaration();
      return new SequenceEl0(cursor, declaration);
    } else if (this.nextMatches(SequenceEl1.lookaheads())) {
      const clause = this.createClause();
      return new SequenceEl1(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createDeclaration(): Declaration {
    const cursor = this.cursor;
    if (this.nextMatches(Declaration0.lookaheads())) {
      const letDecl = this.createLetDecl();
      return new Declaration0(cursor, letDecl);
    } else if (this.nextMatches(Declaration1.lookaheads())) {
      const structureDecl = this.createStructureDecl();
      return new Declaration1(cursor, structureDecl);
    } else if (this.nextMatches(Declaration2.lookaheads())) {
      const procDecl = this.createProcDecl();
      return new Declaration2(cursor, procDecl);
    } else if (this.nextMatches(Declaration3.lookaheads())) {
      const forward = this.createForward();
      return new Declaration3(cursor, forward);
    } else throw new Error("Unexpected input");
  }
  private createLetDecl(): LetDecl {
    const cursor = this.cursor;
    if (this.nextMatches(LetDecl0.lookaheads())) {
      this.expect("let");
      const identifier = this.createIdentifier();
      const initOp = this.createInitOp();
      const clause = this.createClause();
      return new LetDecl0(cursor, identifier, initOp, clause);
    } else throw new Error("Unexpected input");
  }
  private createInitOp(): InitOp {
    const cursor = this.cursor;
    if (this.nextMatches(InitOp0.lookaheads())) {
      this.expect("=");
      return new InitOp0(cursor);
    } else if (this.nextMatches(InitOp1.lookaheads())) {
      this.expect(":=");
      return new InitOp1(cursor);
    } else throw new Error("Unexpected input");
  }
  private createStructureDecl(): StructureDecl {
    const cursor = this.cursor;
    if (this.nextMatches(StructureDecl0.lookaheads())) {
      this.expect("structure");
      const identifier = this.createIdentifier();
      let structureDeclFields: StructureDeclFields | void = undefined;
      if (this.nextMatches(this.lookaheads["StructureDeclFields"])) {
        structureDeclFields = this.createStructureDeclFields();
      }
      return new StructureDecl0(cursor, identifier, structureDeclFields);
    } else throw new Error("Unexpected input");
  }
  private createStructureDeclFields(): StructureDeclFields {
    const cursor = this.cursor;
    if (this.nextMatches(StructureDeclFields0.lookaheads())) {
      this.expect("(");
      let fieldList: FieldList | void = undefined;
      if (this.nextMatches(this.lookaheads["FieldList"])) {
        fieldList = this.createFieldList();
      }
      this.expect(")");
      return new StructureDeclFields0(cursor, fieldList);
    } else throw new Error("Unexpected input");
  }
  private createFieldList(): FieldList {
    const cursor = this.cursor;
    if (this.nextMatches(FieldList0.lookaheads())) {
      const fieldListEl = this.createFieldListEl();
      const fieldListFollow: FieldListFollow[] = [];
      while (
        this.nextMatches(
          this.lookaheads["FieldListFollow"],
          this.lookaheads["FieldListEl"]
        )
      ) {
        fieldListFollow.push(this.createFieldListFollow());
      }
      return new FieldList0(cursor, fieldListEl, fieldListFollow);
    } else throw new Error("Unexpected input");
  }
  private createFieldListFollow(): FieldListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(FieldListFollow0.lookaheads())) {
      this.expect(";");
      const fieldListEl = this.createFieldListEl();
      return new FieldListFollow0(cursor, fieldListEl);
    } else throw new Error("Unexpected input");
  }
  private createFieldListEl(): FieldListEl {
    const cursor = this.cursor;
    if (this.nextMatches(FieldListEl0.lookaheads())) {
      const type = this.createType_();
      const identifierList = this.createIdentifierList();
      return new FieldListEl0(cursor, type, identifierList);
    } else throw new Error("Unexpected input");
  }
  private createProcDecl(): ProcDecl {
    const cursor = this.cursor;
    if (this.nextMatches(ProcDecl0.lookaheads())) {
      this.expect("procedure");
      const identifier = this.createIdentifier();
      let procDeclType: ProcDeclType | void = undefined;
      if (this.nextMatches(this.lookaheads["ProcDeclType"])) {
        procDeclType = this.createProcDeclType();
      }
      this.expect(";");
      const clause = this.createClause();
      return new ProcDecl0(cursor, identifier, procDeclType, clause);
    } else throw new Error("Unexpected input");
  }
  private createProcDeclType(): ProcDeclType {
    const cursor = this.cursor;
    if (this.nextMatches(ProcDeclType0.lookaheads())) {
      this.expect("(");
      let parameterList: ParameterList | void = undefined;
      if (this.nextMatches(this.lookaheads["ParameterList"])) {
        parameterList = this.createParameterList();
      }
      let returnTypex: ReturnTypex | void = undefined;
      if (this.nextMatches(this.lookaheads["ReturnTypex"])) {
        returnTypex = this.createReturnTypex();
      }
      this.expect(")");
      return new ProcDeclType0(cursor, parameterList, returnTypex);
    } else throw new Error("Unexpected input");
  }
  private createParameterList(): ParameterList {
    const cursor = this.cursor;
    if (this.nextMatches(ParameterList0.lookaheads())) {
      const parameter = this.createParameter();
      const parameterListFollow: ParameterListFollow[] = [];
      while (
        this.nextMatches(
          this.lookaheads["ParameterListFollow"],
          this.lookaheads["Parameter"]
        )
      ) {
        parameterListFollow.push(this.createParameterListFollow());
      }
      return new ParameterList0(cursor, parameter, parameterListFollow);
    } else throw new Error("Unexpected input");
  }
  private createParameterListFollow(): ParameterListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(ParameterListFollow0.lookaheads())) {
      this.expect(";");
      const parameter = this.createParameter();
      return new ParameterListFollow0(cursor, parameter);
    } else throw new Error("Unexpected input");
  }
  private createParameter(): Parameter {
    const cursor = this.cursor;
    if (this.nextMatches(Parameter0.lookaheads())) {
      const type = this.createType_();
      const identifierList = this.createIdentifierList();
      return new Parameter0(cursor, type, identifierList);
    } else if (this.nextMatches(Parameter1.lookaheads())) {
      const structureDecl = this.createStructureDecl();
      return new Parameter1(cursor, structureDecl);
    } else if (this.nextMatches(Parameter2.lookaheads())) {
      const procType = this.createProcType();
      const identifierList = this.createIdentifierList();
      return new Parameter2(cursor, procType, identifierList);
    } else throw new Error("Unexpected input");
  }
  private createProcType(): ProcType {
    const cursor = this.cursor;
    if (this.nextMatches(ProcType0.lookaheads())) {
      this.expect("(");
      let ptypeList: PtypeList | void = undefined;
      if (this.nextMatches(this.lookaheads["PtypeList"])) {
        ptypeList = this.createPtypeList();
      }
      let returnTypex: ReturnTypex | void = undefined;
      if (this.nextMatches(this.lookaheads["ReturnTypex"])) {
        returnTypex = this.createReturnTypex();
      }
      this.expect(")");
      return new ProcType0(cursor, ptypeList, returnTypex);
    } else throw new Error("Unexpected input");
  }
  private createReturnTypex(): ReturnTypex {
    const cursor = this.cursor;
    if (this.nextMatches(ReturnTypex0.lookaheads())) {
      this.expect("->");
      const type = this.createType_();
      return new ReturnTypex0(cursor, type);
    } else throw new Error("Unexpected input");
  }
  private createPtypeList(): PtypeList {
    const cursor = this.cursor;
    if (this.nextMatches(PtypeList0.lookaheads())) {
      const ptypeListEl = this.createPtypeListEl();
      const ptypeListFollow: PtypeListFollow[] = [];
      while (this.nextMatches(this.lookaheads["PtypeListFollow"])) {
        ptypeListFollow.push(this.createPtypeListFollow());
      }
      return new PtypeList0(cursor, ptypeListEl, ptypeListFollow);
    } else throw new Error("Unexpected input");
  }
  private createPtypeListFollow(): PtypeListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(PtypeListFollow0.lookaheads())) {
      this.expect(",");
      const ptypeListEl = this.createPtypeListEl();
      return new PtypeListFollow0(cursor, ptypeListEl);
    } else throw new Error("Unexpected input");
  }
  private createPtypeListEl(): PtypeListEl {
    const cursor = this.cursor;
    if (this.nextMatches(PtypeListEl0.lookaheads())) {
      const type = this.createType_();
      return new PtypeListEl0(cursor, type);
    } else if (this.nextMatches(PtypeListEl1.lookaheads())) {
      const procType = this.createProcType();
      return new PtypeListEl1(cursor, procType);
    } else if (this.nextMatches(PtypeListEl2.lookaheads())) {
      const sDecl = this.createSDecl();
      return new PtypeListEl2(cursor, sDecl);
    } else throw new Error("Unexpected input");
  }
  private createSDecl(): SDecl {
    const cursor = this.cursor;
    if (this.nextMatches(SDecl0.lookaheads())) {
      this.expect("structure");
      this.expect("(");
      const type = this.createType_();
      const sDeclFollow: SDeclFollow[] = [];
      while (this.nextMatches(this.lookaheads["SDeclFollow"])) {
        sDeclFollow.push(this.createSDeclFollow());
      }
      this.expect(")");
      return new SDecl0(cursor, type, sDeclFollow);
    } else throw new Error("Unexpected input");
  }
  private createSDeclFollow(): SDeclFollow {
    const cursor = this.cursor;
    if (this.nextMatches(SDeclFollow0.lookaheads())) {
      this.expect(",");
      const type = this.createType_();
      return new SDeclFollow0(cursor, type);
    } else throw new Error("Unexpected input");
  }
  private createForward(): Forward {
    const cursor = this.cursor;
    if (this.nextMatches(Forward0.lookaheads())) {
      this.expect("forward");
      const identifier = this.createIdentifier();
      let procType: ProcType | void = undefined;
      if (this.nextMatches(this.lookaheads["ProcType"])) {
        procType = this.createProcType();
      }
      return new Forward0(cursor, identifier, procType);
    } else throw new Error("Unexpected input");
  }
  private createIdentifierList(): IdentifierList {
    const cursor = this.cursor;
    if (this.nextMatches(IdentifierList0.lookaheads())) {
      const identifier = this.createIdentifier();
      const identifierListFollow: IdentifierListFollow[] = [];
      while (this.nextMatches(this.lookaheads["IdentifierListFollow"])) {
        identifierListFollow.push(this.createIdentifierListFollow());
      }
      return new IdentifierList0(cursor, identifier, identifierListFollow);
    } else throw new Error("Unexpected input");
  }
  private createIdentifierListFollow(): IdentifierListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(IdentifierListFollow0.lookaheads())) {
      this.expect(",");
      const identifier = this.createIdentifier();
      return new IdentifierListFollow0(cursor, identifier);
    } else throw new Error("Unexpected input");
  }
  private createClause(): Clause {
    const cursor = this.cursor;
    if (this.nextMatches(Clause0.lookaheads())) {
      this.expect("if");
      const clause = this.createClause();
      const ifClauseThen = this.createIfClauseThen();
      return new Clause0(cursor, clause, ifClauseThen);
    } else if (this.nextMatches(Clause1.lookaheads())) {
      this.expect("repeat");
      const repeat = this.createClause();
      this.expect("while");
      const whilex = this.createClause();
      let clauseDo: ClauseDo | void = undefined;
      if (this.nextMatches(this.lookaheads["ClauseDo"])) {
        clauseDo = this.createClauseDo();
      }
      return new Clause1(cursor, repeat, whilex, clauseDo);
    } else if (this.nextMatches(Clause2.lookaheads())) {
      this.expect("while");
      const whilex = this.createClause();
      this.expect("do");
      const dox = this.createClause();
      return new Clause2(cursor, whilex, dox);
    } else if (this.nextMatches(Clause3.lookaheads())) {
      this.expect("for");
      const identifier = this.createIdentifier();
      this.expect("=");
      const from = this.createClause();
      this.expect("to");
      const to = this.createClause();
      let clauseBy: ClauseBy | void = undefined;
      if (this.nextMatches(this.lookaheads["ClauseBy"])) {
        clauseBy = this.createClauseBy();
      }
      this.expect("do");
      const dox = this.createClause();
      return new Clause3(cursor, identifier, from, to, clauseBy, dox);
    } else if (this.nextMatches(Clause4.lookaheads())) {
      this.expect("case");
      const casex = this.createClause();
      this.expect("of");
      const caseList = this.createCaseList();
      this.expect("default");
      this.expect(":");
      const defaultx = this.createClause();
      return new Clause4(cursor, casex, caseList, defaultx);
    } else if (this.nextMatches(Clause5.lookaheads())) {
      this.expect("abort");
      return new Clause5(cursor);
    } else if (this.nextMatches(Clause6.lookaheads())) {
      const writeClause = this.createWriteClause();
      return new Clause6(cursor, writeClause);
    } else if (this.nextMatches(Clause7.lookaheads())) {
      const raster = this.createRaster();
      return new Clause7(cursor, raster);
    } else if (this.nextMatches(Clause8.lookaheads())) {
      const expression = this.createExpression();
      let clauseExprFollow: ClauseExprFollow | void = undefined;
      if (this.nextMatches(this.lookaheads["ClauseExprFollow"])) {
        clauseExprFollow = this.createClauseExprFollow();
      }
      return new Clause8(cursor, expression, clauseExprFollow);
    } else throw new Error("Unexpected input");
  }
  private createClauseDo(): ClauseDo {
    const cursor = this.cursor;
    if (this.nextMatches(ClauseDo0.lookaheads())) {
      this.expect("do");
      const clause = this.createClause();
      return new ClauseDo0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createClauseBy(): ClauseBy {
    const cursor = this.cursor;
    if (this.nextMatches(ClauseBy0.lookaheads())) {
      this.expect("by");
      const clause = this.createClause();
      return new ClauseBy0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createClauseExprFollow(): ClauseExprFollow {
    const cursor = this.cursor;
    if (this.nextMatches(ClauseExprFollow0.lookaheads())) {
      this.expect(":=");
      const clause = this.createClause();
      return new ClauseExprFollow0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createIfClauseThen(): IfClauseThen {
    const cursor = this.cursor;
    if (this.nextMatches(IfClauseThen0.lookaheads())) {
      this.expect("do");
      const clause = this.createClause();
      return new IfClauseThen0(cursor, clause);
    } else if (this.nextMatches(IfClauseThen1.lookaheads())) {
      this.expect("then");
      const then = this.createClause();
      this.expect("else");
      const elsex = this.createClause();
      return new IfClauseThen1(cursor, then, elsex);
    } else throw new Error("Unexpected input");
  }
  private createCaseList(): CaseList {
    const cursor = this.cursor;
    if (this.nextMatches(CaseList0.lookaheads())) {
      const caseListEl = this.createCaseListEl();
      const caseListFollow: CaseListFollow[] = [];
      while (
        this.nextMatches(
          this.lookaheads["CaseListFollow"],
          this.lookaheads["CaseListEl"]
        )
      ) {
        caseListFollow.push(this.createCaseListFollow());
      }
      return new CaseList0(cursor, caseListEl, caseListFollow);
    } else throw new Error("Unexpected input");
  }
  private createCaseListFollow(): CaseListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(CaseListFollow0.lookaheads())) {
      this.expect(";");
      const caseListEl = this.createCaseListEl();
      return new CaseListFollow0(cursor, caseListEl);
    } else throw new Error("Unexpected input");
  }
  private createCaseListEl(): CaseListEl {
    const cursor = this.cursor;
    if (this.nextMatches(CaseListEl0.lookaheads())) {
      const clauseList = this.createClauseList();
      this.expect(":");
      const clause = this.createClause();
      return new CaseListEl0(cursor, clauseList, clause);
    } else throw new Error("Unexpected input");
  }
  private createWriteClause(): WriteClause {
    const cursor = this.cursor;
    if (this.nextMatches(WriteClause0.lookaheads())) {
      this.expect("write");
      const writeList = this.createWriteList();
      return new WriteClause0(cursor, writeList);
    } else if (this.nextMatches(WriteClause1.lookaheads())) {
      this.expect("output");
      const clause = this.createClause();
      this.expect(",");
      const writeList = this.createWriteList();
      return new WriteClause1(cursor, clause, writeList);
    } else if (this.nextMatches(WriteClause2.lookaheads())) {
      this.expect("out.byte");
      const clause = this.createClause();
      this.expect(",");
      const b = this.createClause();
      this.expect(",");
      const c = this.createClause();
      return new WriteClause2(cursor, clause, b, c);
    } else if (this.nextMatches(WriteClause3.lookaheads())) {
      this.expect("out.16");
      const clause = this.createClause();
      this.expect(",");
      const b = this.createClause();
      this.expect(",");
      const c = this.createClause();
      return new WriteClause3(cursor, clause, b, c);
    } else if (this.nextMatches(WriteClause4.lookaheads())) {
      this.expect("out.32");
      const clause = this.createClause();
      this.expect(",");
      const b = this.createClause();
      return new WriteClause4(cursor, clause, b);
    } else throw new Error("Unexpected input");
  }
  private createWriteList(): WriteList {
    const cursor = this.cursor;
    if (this.nextMatches(WriteList0.lookaheads())) {
      const writeListEl = this.createWriteListEl();
      const writeListFollow: WriteListFollow[] = [];
      while (this.nextMatches(this.lookaheads["WriteListFollow"])) {
        writeListFollow.push(this.createWriteListFollow());
      }
      return new WriteList0(cursor, writeListEl, writeListFollow);
    } else throw new Error("Unexpected input");
  }
  private createWriteListFollow(): WriteListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(WriteListFollow0.lookaheads())) {
      this.expect(",");
      const writeListEl = this.createWriteListEl();
      return new WriteListFollow0(cursor, writeListEl);
    } else throw new Error("Unexpected input");
  }
  private createWriteListEl(): WriteListEl {
    const cursor = this.cursor;
    if (this.nextMatches(WriteListEl0.lookaheads())) {
      const clause = this.createClause();
      let writeListElFollow: WriteListElFollow | void = undefined;
      if (this.nextMatches(this.lookaheads["WriteListElFollow"])) {
        writeListElFollow = this.createWriteListElFollow();
      }
      return new WriteListEl0(cursor, clause, writeListElFollow);
    } else throw new Error("Unexpected input");
  }
  private createWriteListElFollow(): WriteListElFollow {
    const cursor = this.cursor;
    if (this.nextMatches(WriteListElFollow0.lookaheads())) {
      this.expect(":");
      const clause = this.createClause();
      return new WriteListElFollow0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createRaster(): Raster {
    const cursor = this.cursor;
    if (this.nextMatches(Raster0.lookaheads())) {
      const rasterOp = this.createRasterOp();
      const thisx = this.createClause();
      this.expect("onto");
      const that = this.createClause();
      return new Raster0(cursor, rasterOp, thisx, that);
    } else throw new Error("Unexpected input");
  }
  private createRasterOp(): RasterOp {
    const cursor = this.cursor;
    if (this.nextMatches(RasterOp0.lookaheads())) {
      this.expect("ror");
      return new RasterOp0(cursor);
    } else if (this.nextMatches(RasterOp1.lookaheads())) {
      this.expect("rand");
      return new RasterOp1(cursor);
    } else if (this.nextMatches(RasterOp2.lookaheads())) {
      this.expect("xor");
      return new RasterOp2(cursor);
    } else if (this.nextMatches(RasterOp3.lookaheads())) {
      this.expect("copy");
      return new RasterOp3(cursor);
    } else if (this.nextMatches(RasterOp4.lookaheads())) {
      this.expect("nand");
      return new RasterOp4(cursor);
    } else if (this.nextMatches(RasterOp5.lookaheads())) {
      this.expect("nor");
      return new RasterOp5(cursor);
    } else if (this.nextMatches(RasterOp6.lookaheads())) {
      this.expect("not");
      return new RasterOp6(cursor);
    } else if (this.nextMatches(RasterOp7.lookaheads())) {
      this.expect("xnor");
      return new RasterOp7(cursor);
    } else throw new Error("Unexpected input");
  }
  private createClauseList(): ClauseList {
    const cursor = this.cursor;
    if (this.nextMatches(ClauseList0.lookaheads())) {
      const clause = this.createClause();
      const clauseListFollow: ClauseListFollow[] = [];
      while (this.nextMatches(this.lookaheads["ClauseListFollow"])) {
        clauseListFollow.push(this.createClauseListFollow());
      }
      return new ClauseList0(cursor, clause, clauseListFollow);
    } else throw new Error("Unexpected input");
  }
  private createClauseListFollow(): ClauseListFollow {
    const cursor = this.cursor;
    if (this.nextMatches(ClauseListFollow0.lookaheads())) {
      this.expect(",");
      const clause = this.createClause();
      return new ClauseListFollow0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createExpression(): Expression {
    const cursor = this.cursor;
    if (this.nextMatches(Expression0.lookaheads())) {
      const exp1 = this.createExp1();
      const expressionFollow: ExpressionFollow[] = [];
      while (this.nextMatches(this.lookaheads["ExpressionFollow"])) {
        expressionFollow.push(this.createExpressionFollow());
      }
      return new Expression0(cursor, exp1, expressionFollow);
    } else throw new Error("Unexpected input");
  }
  private createExpressionFollow(): ExpressionFollow {
    const cursor = this.cursor;
    if (this.nextMatches(ExpressionFollow0.lookaheads())) {
      this.expect("or");
      const exp1 = this.createExp1();
      return new ExpressionFollow0(cursor, exp1);
    } else throw new Error("Unexpected input");
  }
  private createExp1(): Exp1 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp10.lookaheads())) {
      const exp2 = this.createExp2();
      const exp1Follow: Exp1Follow[] = [];
      while (this.nextMatches(this.lookaheads["Exp1Follow"])) {
        exp1Follow.push(this.createExp1Follow());
      }
      return new Exp10(cursor, exp2, exp1Follow);
    } else throw new Error("Unexpected input");
  }
  private createExp1Follow(): Exp1Follow {
    const cursor = this.cursor;
    if (this.nextMatches(Exp1Follow0.lookaheads())) {
      this.expect("and");
      const exp2 = this.createExp2();
      return new Exp1Follow0(cursor, exp2);
    } else throw new Error("Unexpected input");
  }
  private createExp2(): Exp2 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp20.lookaheads())) {
      const exp2Tilde = this.createExp2Tilde();
      const exp3 = this.createExp3();
      const exp2Op: Exp2Op[] = [];
      while (this.nextMatches(this.lookaheads["Exp2Op"])) {
        exp2Op.push(this.createExp2Op());
      }
      return new Exp20(cursor, exp2Tilde, exp3, exp2Op);
    } else if (this.nextMatches(Exp21.lookaheads())) {
      const exp3 = this.createExp3();
      const exp2Op: Exp2Op[] = [];
      while (this.nextMatches(this.lookaheads["Exp2Op"])) {
        exp2Op.push(this.createExp2Op());
      }
      return new Exp21(cursor, exp3, exp2Op);
    } else throw new Error("Unexpected input");
  }
  private createExp2Tilde(): Exp2Tilde {
    const cursor = this.cursor;
    if (this.nextMatches(Exp2Tilde0.lookaheads())) {
      this.expect("~");
      return new Exp2Tilde0(cursor);
    } else throw new Error("Unexpected input");
  }
  private createExp2Op(): Exp2Op {
    const cursor = this.cursor;
    if (this.nextMatches(Exp2Op0.lookaheads())) {
      const relOp = this.createRelOp();
      const exp3 = this.createExp3();
      return new Exp2Op0(cursor, relOp, exp3);
    } else throw new Error("Unexpected input");
  }
  private createExp3(): Exp3 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp30.lookaheads())) {
      const exp4 = this.createExp4();
      const exp3Op: Exp3Op[] = [];
      while (this.nextMatches(this.lookaheads["Exp3Op"])) {
        exp3Op.push(this.createExp3Op());
      }
      return new Exp30(cursor, exp4, exp3Op);
    } else throw new Error("Unexpected input");
  }
  private createExp3Op(): Exp3Op {
    const cursor = this.cursor;
    if (this.nextMatches(Exp3Op0.lookaheads())) {
      const addOp = this.createAddOp();
      const exp4 = this.createExp4();
      return new Exp3Op0(cursor, addOp, exp4);
    } else throw new Error("Unexpected input");
  }
  private createExp4(): Exp4 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp40.lookaheads())) {
      const exp5 = this.createExp5();
      const exp4Op: Exp4Op[] = [];
      while (this.nextMatches(this.lookaheads["Exp4Op"])) {
        exp4Op.push(this.createExp4Op());
      }
      return new Exp40(cursor, exp5, exp4Op);
    } else throw new Error("Unexpected input");
  }
  private createExp4Op(): Exp4Op {
    const cursor = this.cursor;
    if (this.nextMatches(Exp4Op0.lookaheads())) {
      const multOp = this.createMultOp();
      const exp5 = this.createExp5();
      return new Exp4Op0(cursor, multOp, exp5);
    } else throw new Error("Unexpected input");
  }
  private createExp5(): Exp5 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp50.lookaheads())) {
      const addOp = this.createAddOp();
      const exp6 = this.createExp6();
      const exp5Follow: Exp5Follow[] = [];
      while (this.nextMatches(this.lookaheads["Exp5Follow"])) {
        exp5Follow.push(this.createExp5Follow());
      }
      return new Exp50(cursor, addOp, exp6, exp5Follow);
    } else if (this.nextMatches(Exp51.lookaheads())) {
      const exp6 = this.createExp6();
      const exp5Follow: Exp5Follow[] = [];
      while (this.nextMatches(this.lookaheads["Exp5Follow"])) {
        exp5Follow.push(this.createExp5Follow());
      }
      return new Exp51(cursor, exp6, exp5Follow);
    } else throw new Error("Unexpected input");
  }
  private createExp5Follow(): Exp5Follow {
    const cursor = this.cursor;
    if (this.nextMatches(Exp5Follow0.lookaheads())) {
      this.expect("(");
      const expressionArg = this.createExpressionArg();
      this.expect(")");
      return new Exp5Follow0(cursor, expressionArg);
    } else throw new Error("Unexpected input");
  }
  private createExpressionArg(): ExpressionArg {
    const cursor = this.cursor;
    if (this.nextMatches(ExpressionArg0.lookaheads())) {
      const clause = this.createClause();
      let expressionArgFollow: ExpressionArgFollow | void = undefined;
      if (this.nextMatches(this.lookaheads["ExpressionArgFollow"])) {
        expressionArgFollow = this.createExpressionArgFollow();
      }
      return new ExpressionArg0(cursor, clause, expressionArgFollow);
    } else throw new Error("Unexpected input");
  }
  private createExpressionArgFollow(): ExpressionArgFollow {
    const cursor = this.cursor;
    if (this.nextMatches(ExpressionArgFollow0.lookaheads())) {
      this.expect("|");
      const clause = this.createClause();
      return new ExpressionArgFollow0(cursor, clause);
    } else if (this.nextMatches(ExpressionArgFollow1.lookaheads())) {
      this.expect(",");
      const clauseList = this.createClauseList();
      return new ExpressionArgFollow1(cursor, clauseList);
    } else throw new Error("Unexpected input");
  }
  private createExp6(): Exp6 {
    const cursor = this.cursor;
    if (this.nextMatches(Exp60.lookaheads())) {
      this.expect("(");
      const clause = this.createClause();
      this.expect(")");
      return new Exp60(cursor, clause);
    } else if (this.nextMatches(Exp61.lookaheads())) {
      this.expect("begin");
      let sequence: Sequence | void = undefined;
      if (this.nextMatches(this.lookaheads["Sequence"])) {
        sequence = this.createSequence();
      }
      this.expect("end");
      return new Exp61(cursor, sequence);
    } else if (this.nextMatches(Exp62.lookaheads())) {
      this.expect("{");
      let sequence: Sequence | void = undefined;
      if (this.nextMatches(this.lookaheads["Sequence"])) {
        sequence = this.createSequence();
      }
      this.expect("}");
      return new Exp62(cursor, sequence);
    } else if (this.nextMatches(Exp63.lookaheads())) {
      const standardExp = this.createStandardExp();
      return new Exp63(cursor, standardExp);
    } else if (this.nextMatches(Exp64.lookaheads())) {
      const literal = this.createLiteral();
      return new Exp64(cursor, literal);
    } else if (this.nextMatches(Exp65.lookaheads())) {
      const valueConstructor = this.createValueConstructor();
      return new Exp65(cursor, valueConstructor);
    } else if (this.nextMatches(Exp66.lookaheads())) {
      const identifier = this.createIdentifier();
      return new Exp66(cursor, identifier);
    } else throw new Error("Unexpected input");
  }
  private createValueConstructor(): ValueConstructor {
    const cursor = this.cursor;
    if (this.nextMatches(ValueConstructor0.lookaheads())) {
      const vectorConstr = this.createVectorConstr();
      return new ValueConstructor0(cursor, vectorConstr);
    } else if (this.nextMatches(ValueConstructor1.lookaheads())) {
      const imageConstr = this.createImageConstr();
      return new ValueConstructor1(cursor, imageConstr);
    } else if (this.nextMatches(ValueConstructor2.lookaheads())) {
      const subimageConstr = this.createSubimageConstr();
      return new ValueConstructor2(cursor, subimageConstr);
    } else if (this.nextMatches(ValueConstructor3.lookaheads())) {
      const pictureConstr = this.createPictureConstr();
      return new ValueConstructor3(cursor, pictureConstr);
    } else throw new Error("Unexpected input");
  }
  private createVectorConstr(): VectorConstr {
    const cursor = this.cursor;
    if (this.nextMatches(VectorConstr0.lookaheads())) {
      this.expect("vector");
      const range = this.createRange();
      this.expect("of");
      const clause = this.createClause();
      return new VectorConstr0(cursor, range, clause);
    } else if (this.nextMatches(VectorConstr1.lookaheads())) {
      this.expect("@");
      const clause = this.createClause();
      this.expect("of");
      const type = this.createType_();
      this.expect("[");
      const b = this.createClause();
      const vectorConstrFollow: VectorConstrFollow[] = [];
      while (this.nextMatches(this.lookaheads["VectorConstrFollow"])) {
        vectorConstrFollow.push(this.createVectorConstrFollow());
      }
      this.expect("]");
      return new VectorConstr1(cursor, clause, type, b, vectorConstrFollow);
    } else throw new Error("Unexpected input");
  }
  private createVectorConstrFollow(): VectorConstrFollow {
    const cursor = this.cursor;
    if (this.nextMatches(VectorConstrFollow0.lookaheads())) {
      this.expect(",");
      const clause = this.createClause();
      return new VectorConstrFollow0(cursor, clause);
    } else throw new Error("Unexpected input");
  }
  private createRange(): Range {
    const cursor = this.cursor;
    if (this.nextMatches(Range0.lookaheads())) {
      const rangeEl = this.createRangeEl();
      const rangeFollow: RangeFollow[] = [];
      while (this.nextMatches(this.lookaheads["RangeFollow"])) {
        rangeFollow.push(this.createRangeFollow());
      }
      return new Range0(cursor, rangeEl, rangeFollow);
    } else throw new Error("Unexpected input");
  }
  private createRangeFollow(): RangeFollow {
    const cursor = this.cursor;
    if (this.nextMatches(RangeFollow0.lookaheads())) {
      this.expect(",");
      const rangeEl = this.createRangeEl();
      return new RangeFollow0(cursor, rangeEl);
    } else throw new Error("Unexpected input");
  }
  private createRangeEl(): RangeEl {
    const cursor = this.cursor;
    if (this.nextMatches(RangeEl0.lookaheads())) {
      const a = this.createClause();
      this.expect("::");
      const b = this.createClause();
      return new RangeEl0(cursor, a, b);
    } else throw new Error("Unexpected input");
  }
  private createImageConstr(): ImageConstr {
    const cursor = this.cursor;
    if (this.nextMatches(ImageConstr0.lookaheads())) {
      this.expect("image");
      const image = this.createClause();
      this.expect("by");
      const by = this.createClause();
      this.expect("of");
      const of = this.createClause();
      return new ImageConstr0(cursor, image, by, of);
    } else throw new Error("Unexpected input");
  }
  private createSubimageConstr(): SubimageConstr {
    const cursor = this.cursor;
    if (this.nextMatches(SubimageConstr0.lookaheads())) {
      this.expect("limit");
      const clause = this.createClause();
      let subimageConstrMid: SubimageConstrMid | void = undefined;
      if (this.nextMatches(this.lookaheads["SubimageConstrMid"])) {
        subimageConstrMid = this.createSubimageConstrMid();
      }
      let subimageConstrEnd: SubimageConstrEnd | void = undefined;
      if (this.nextMatches(this.lookaheads["SubimageConstrEnd"])) {
        subimageConstrEnd = this.createSubimageConstrEnd();
      }
      return new SubimageConstr0(
        cursor,
        clause,
        subimageConstrMid,
        subimageConstrEnd
      );
    } else throw new Error("Unexpected input");
  }
  private createSubimageConstrMid(): SubimageConstrMid {
    const cursor = this.cursor;
    if (this.nextMatches(SubimageConstrMid0.lookaheads())) {
      this.expect("to");
      const to = this.createClause();
      this.expect("by");
      const by = this.createClause();
      return new SubimageConstrMid0(cursor, to, by);
    } else throw new Error("Unexpected input");
  }
  private createSubimageConstrEnd(): SubimageConstrEnd {
    const cursor = this.cursor;
    if (this.nextMatches(SubimageConstrEnd0.lookaheads())) {
      this.expect("at");
      const at1 = this.createClause();
      this.expect(",");
      const at2 = this.createClause();
      return new SubimageConstrEnd0(cursor, at1, at2);
    } else throw new Error("Unexpected input");
  }
  private createPictureConstr(): PictureConstr {
    const cursor = this.cursor;
    if (this.nextMatches(PictureConstr0.lookaheads())) {
      this.expect("shift");
      const clause = this.createClause();
      this.expect("by");
      const b = this.createClause();
      this.expect(",");
      const c = this.createClause();
      return new PictureConstr0(cursor, clause, b, c);
    } else if (this.nextMatches(PictureConstr1.lookaheads())) {
      this.expect("scale");
      const clause = this.createClause();
      this.expect("by");
      const b = this.createClause();
      this.expect(",");
      const c = this.createClause();
      return new PictureConstr1(cursor, clause, b, c);
    } else if (this.nextMatches(PictureConstr2.lookaheads())) {
      this.expect("rotate");
      const clause = this.createClause();
      this.expect("by");
      const b = this.createClause();
      return new PictureConstr2(cursor, clause, b);
    } else if (this.nextMatches(PictureConstr3.lookaheads())) {
      this.expect("colour");
      const clause = this.createClause();
      this.expect("in");
      const b = this.createClause();
      return new PictureConstr3(cursor, clause, b);
    } else if (this.nextMatches(PictureConstr4.lookaheads())) {
      this.expect("text");
      const clause = this.createClause();
      this.expect("from");
      const b = this.createClause();
      this.expect(",");
      const c = this.createClause();
      this.expect("to");
      const d = this.createClause();
      this.expect(",");
      const e = this.createClause();
      return new PictureConstr4(cursor, clause, b, c, d, e);
    } else if (this.nextMatches(PictureConstr5.lookaheads())) {
      this.expect("[");
      const clause = this.createClause();
      this.expect(",");
      const b = this.createClause();
      this.expect("]");
      return new PictureConstr5(cursor, clause, b);
    } else throw new Error("Unexpected input");
  }
  private createLiteral(): Literal {
    const cursor = this.cursor;
    if (this.nextMatches(Literal0.lookaheads())) {
      this.expect("nil");
      return new Literal0(cursor);
    } else if (this.nextMatches(Literal1.lookaheads())) {
      this.expect("nullfile");
      return new Literal1(cursor);
    } else if (this.nextMatches(Literal2.lookaheads())) {
      const integerLiteral = this.createIntegerLiteral();
      return new Literal2(cursor, integerLiteral);
    } else if (this.nextMatches(Literal3.lookaheads())) {
      const booleanLiteral = this.createBooleanLiteral();
      return new Literal3(cursor, booleanLiteral);
    } else if (this.nextMatches(Literal4.lookaheads())) {
      const string = this.createString_();
      return new Literal4(cursor, string);
    } else if (this.nextMatches(Literal5.lookaheads())) {
      const pixelLiteral = this.createPixelLiteral();
      return new Literal5(cursor, pixelLiteral);
    } else throw new Error("Unexpected input");
  }
  private createIntegerLiteral(): IntegerLiteral {
    const cursor = this.cursor;
    if (this.nextMatches(IntegerLiteral0.lookaheads())) {
      const number = this.createNumber_();
      return new IntegerLiteral0(cursor, number);
    } else throw new Error("Unexpected input");
  }
  private createBooleanLiteral(): BooleanLiteral {
    const cursor = this.cursor;
    if (this.nextMatches(BooleanLiteral0.lookaheads())) {
      this.expect("true");
      return new BooleanLiteral0(cursor);
    } else if (this.nextMatches(BooleanLiteral1.lookaheads())) {
      this.expect("false");
      return new BooleanLiteral1(cursor);
    } else throw new Error("Unexpected input");
  }
  private createPixelLiteral(): PixelLiteral {
    const cursor = this.cursor;
    if (this.nextMatches(PixelLiteral0.lookaheads())) {
      this.expect("on");
      let pixelLiteralFollow: PixelLiteralFollow | void = undefined;
      if (this.nextMatches(this.lookaheads["PixelLiteralFollow"])) {
        pixelLiteralFollow = this.createPixelLiteralFollow();
      }
      return new PixelLiteral0(cursor, pixelLiteralFollow);
    } else if (this.nextMatches(PixelLiteral1.lookaheads())) {
      this.expect("off");
      let pixelLiteralFollow: PixelLiteralFollow | void = undefined;
      if (this.nextMatches(this.lookaheads["PixelLiteralFollow"])) {
        pixelLiteralFollow = this.createPixelLiteralFollow();
      }
      return new PixelLiteral1(cursor, pixelLiteralFollow);
    } else throw new Error("Unexpected input");
  }
  private createPixelLiteralFollow(): PixelLiteralFollow {
    const cursor = this.cursor;
    if (this.nextMatches(PixelLiteralFollow0.lookaheads())) {
      this.expect("&");
      const pixelLiteral = this.createPixelLiteral();
      return new PixelLiteralFollow0(cursor, pixelLiteral);
    } else throw new Error("Unexpected input");
  }
  private createAddOp(): AddOp {
    const cursor = this.cursor;
    if (this.nextMatches(AddOp0.lookaheads())) {
      this.expect("+");
      return new AddOp0(cursor);
    } else if (this.nextMatches(AddOp1.lookaheads())) {
      this.expect("-");
      return new AddOp1(cursor);
    } else throw new Error("Unexpected input");
  }
  private createMultOp(): MultOp {
    const cursor = this.cursor;
    if (this.nextMatches(MultOp0.lookaheads())) {
      this.expect("++");
      return new MultOp0(cursor);
    } else if (this.nextMatches(MultOp1.lookaheads())) {
      this.expect("div");
      return new MultOp1(cursor);
    } else if (this.nextMatches(MultOp2.lookaheads())) {
      this.expect("rem");
      return new MultOp2(cursor);
    } else if (this.nextMatches(MultOp3.lookaheads())) {
      this.expect("*");
      return new MultOp3(cursor);
    } else if (this.nextMatches(MultOp4.lookaheads())) {
      this.expect("/");
      return new MultOp4(cursor);
    } else if (this.nextMatches(MultOp5.lookaheads())) {
      this.expect("^");
      return new MultOp5(cursor);
    } else if (this.nextMatches(MultOp6.lookaheads())) {
      this.expect("&");
      return new MultOp6(cursor);
    } else throw new Error("Unexpected input");
  }
  private createRelOp(): RelOp {
    const cursor = this.cursor;
    if (this.nextMatches(RelOp0.lookaheads())) {
      const eqOp = this.createEqOp();
      return new RelOp0(cursor, eqOp);
    } else if (this.nextMatches(RelOp1.lookaheads())) {
      const comparOp = this.createComparOp();
      return new RelOp1(cursor, comparOp);
    } else if (this.nextMatches(RelOp2.lookaheads())) {
      const typeOp = this.createTypeOp();
      return new RelOp2(cursor, typeOp);
    } else throw new Error("Unexpected input");
  }
  private createEqOp(): EqOp {
    const cursor = this.cursor;
    if (this.nextMatches(EqOp0.lookaheads())) {
      this.expect("=");
      return new EqOp0(cursor);
    } else if (this.nextMatches(EqOp1.lookaheads())) {
      this.expect("~=");
      return new EqOp1(cursor);
    } else throw new Error("Unexpected input");
  }
  private createComparOp(): ComparOp {
    const cursor = this.cursor;
    if (this.nextMatches(ComparOp0.lookaheads())) {
      this.expect("<=");
      return new ComparOp0(cursor);
    } else if (this.nextMatches(ComparOp1.lookaheads())) {
      this.expect("<");
      return new ComparOp1(cursor);
    } else if (this.nextMatches(ComparOp2.lookaheads())) {
      this.expect(">=");
      return new ComparOp2(cursor);
    } else if (this.nextMatches(ComparOp3.lookaheads())) {
      this.expect(">");
      return new ComparOp3(cursor);
    } else throw new Error("Unexpected input");
  }
  private createTypeOp(): TypeOp {
    const cursor = this.cursor;
    if (this.nextMatches(TypeOp0.lookaheads())) {
      this.expect("is");
      return new TypeOp0(cursor);
    } else if (this.nextMatches(TypeOp1.lookaheads())) {
      this.expect("isnt");
      return new TypeOp1(cursor);
    } else throw new Error("Unexpected input");
  }
  private createIdentifier(): Identifier {
    const cursor = this.cursor;
    if (this.nextMatches(Identifier0.lookaheads())) {
      const id = this.createId_();
      return new Identifier0(cursor, id);
    } else if (this.nextMatches(Identifier1.lookaheads())) {
      const standardId = this.createStandardId();
      return new Identifier1(cursor, standardId);
    } else throw new Error("Unexpected input");
  }
  private createStandardExp(): StandardExp {
    const cursor = this.cursor;
    if (this.nextMatches(StandardExp0.lookaheads())) {
      const standardName = this.createStandardName();
      return new StandardExp0(cursor, standardName);
    } else throw new Error("Unexpected input");
  }
  private createStandardName(): StandardName {
    const cursor = this.cursor;
    if (this.nextMatches(StandardName0.lookaheads())) {
      this.expect("upb");
      return new StandardName0(cursor);
    } else if (this.nextMatches(StandardName1.lookaheads())) {
      this.expect("lwb");
      return new StandardName1(cursor);
    } else if (this.nextMatches(StandardName2.lookaheads())) {
      this.expect("eof");
      return new StandardName2(cursor);
    } else if (this.nextMatches(StandardName3.lookaheads())) {
      this.expect("read.a.line");
      return new StandardName3(cursor);
    } else if (this.nextMatches(StandardName4.lookaheads())) {
      this.expect("read");
      return new StandardName4(cursor);
    } else if (this.nextMatches(StandardName5.lookaheads())) {
      this.expect("readi");
      return new StandardName5(cursor);
    } else if (this.nextMatches(StandardName6.lookaheads())) {
      this.expect("readr");
      return new StandardName6(cursor);
    } else if (this.nextMatches(StandardName7.lookaheads())) {
      this.expect("readb");
      return new StandardName7(cursor);
    } else if (this.nextMatches(StandardName8.lookaheads())) {
      this.expect("peek");
      return new StandardName8(cursor);
    } else if (this.nextMatches(StandardName9.lookaheads())) {
      this.expect("reads");
      return new StandardName9(cursor);
    } else if (this.nextMatches(StandardName10.lookaheads())) {
      this.expect("read.name");
      return new StandardName10(cursor);
    } else if (this.nextMatches(StandardName11.lookaheads())) {
      this.expect("read.byte");
      return new StandardName11(cursor);
    } else if (this.nextMatches(StandardName12.lookaheads())) {
      this.expect("read.16");
      return new StandardName12(cursor);
    } else if (this.nextMatches(StandardName13.lookaheads())) {
      this.expect("read.32");
      return new StandardName13(cursor);
    } else throw new Error("Unexpected input");
  }
  private createStandardId(): StandardId {
    const cursor = this.cursor;
    if (this.nextMatches(StandardId0.lookaheads())) {
      this.expect("r.w");
      return new StandardId0(cursor);
    } else if (this.nextMatches(StandardId1.lookaheads())) {
      this.expect("i.w");
      return new StandardId1(cursor);
    } else if (this.nextMatches(StandardId2.lookaheads())) {
      this.expect("s.w");
      return new StandardId2(cursor);
    } else if (this.nextMatches(StandardId3.lookaheads())) {
      this.expect("s.o");
      return new StandardId3(cursor);
    } else if (this.nextMatches(StandardId4.lookaheads())) {
      this.expect("s.i");
      return new StandardId4(cursor);
    } else if (this.nextMatches(StandardId5.lookaheads())) {
      this.expect("maxint");
      return new StandardId5(cursor);
    } else if (this.nextMatches(StandardId6.lookaheads())) {
      this.expect("maxreal");
      return new StandardId6(cursor);
    } else if (this.nextMatches(StandardId7.lookaheads())) {
      this.expect("epsilon");
      return new StandardId7(cursor);
    } else if (this.nextMatches(StandardId8.lookaheads())) {
      this.expect("pi");
      return new StandardId8(cursor);
    } else if (this.nextMatches(StandardId9.lookaheads())) {
      this.expect("cursor");
      return new StandardId9(cursor);
    } else if (this.nextMatches(StandardId10.lookaheads())) {
      this.expect("screen");
      return new StandardId10(cursor);
    } else throw new Error("Unexpected input");
  }
  private lookaheads = {
    Program: ([] as string[]).concat(Program0.lookaheads()),
    Sequence: ([] as string[]).concat(Sequence0.lookaheads()),
    SequenceFollow: ([] as string[]).concat(SequenceFollow0.lookaheads()),
    SequenceEl: ([] as string[]).concat(
      SequenceEl0.lookaheads(),
      SequenceEl1.lookaheads()
    ),
    Declaration: ([] as string[]).concat(
      Declaration0.lookaheads(),
      Declaration1.lookaheads(),
      Declaration2.lookaheads(),
      Declaration3.lookaheads()
    ),
    LetDecl: ([] as string[]).concat(LetDecl0.lookaheads()),
    InitOp: ([] as string[]).concat(InitOp0.lookaheads(), InitOp1.lookaheads()),
    StructureDecl: ([] as string[]).concat(StructureDecl0.lookaheads()),
    StructureDeclFields: ([] as string[]).concat(
      StructureDeclFields0.lookaheads()
    ),
    FieldList: ([] as string[]).concat(FieldList0.lookaheads()),
    FieldListFollow: ([] as string[]).concat(FieldListFollow0.lookaheads()),
    FieldListEl: ([] as string[]).concat(FieldListEl0.lookaheads()),
    ProcDecl: ([] as string[]).concat(ProcDecl0.lookaheads()),
    ProcDeclType: ([] as string[]).concat(ProcDeclType0.lookaheads()),
    ParameterList: ([] as string[]).concat(ParameterList0.lookaheads()),
    ParameterListFollow: ([] as string[]).concat(
      ParameterListFollow0.lookaheads()
    ),
    Parameter: ([] as string[]).concat(
      Parameter0.lookaheads(),
      Parameter1.lookaheads(),
      Parameter2.lookaheads()
    ),
    ProcType: ([] as string[]).concat(ProcType0.lookaheads()),
    ReturnTypex: ([] as string[]).concat(ReturnTypex0.lookaheads()),
    PtypeList: ([] as string[]).concat(PtypeList0.lookaheads()),
    PtypeListFollow: ([] as string[]).concat(PtypeListFollow0.lookaheads()),
    PtypeListEl: ([] as string[]).concat(
      PtypeListEl0.lookaheads(),
      PtypeListEl1.lookaheads(),
      PtypeListEl2.lookaheads()
    ),
    SDecl: ([] as string[]).concat(SDecl0.lookaheads()),
    SDeclFollow: ([] as string[]).concat(SDeclFollow0.lookaheads()),
    Forward: ([] as string[]).concat(Forward0.lookaheads()),
    IdentifierList: ([] as string[]).concat(IdentifierList0.lookaheads()),
    IdentifierListFollow: ([] as string[]).concat(
      IdentifierListFollow0.lookaheads()
    ),
    Clause: ([] as string[]).concat(
      Clause0.lookaheads(),
      Clause1.lookaheads(),
      Clause2.lookaheads(),
      Clause3.lookaheads(),
      Clause4.lookaheads(),
      Clause5.lookaheads(),
      Clause6.lookaheads(),
      Clause7.lookaheads(),
      Clause8.lookaheads()
    ),
    ClauseDo: ([] as string[]).concat(ClauseDo0.lookaheads()),
    ClauseBy: ([] as string[]).concat(ClauseBy0.lookaheads()),
    ClauseExprFollow: ([] as string[]).concat(ClauseExprFollow0.lookaheads()),
    IfClauseThen: ([] as string[]).concat(
      IfClauseThen0.lookaheads(),
      IfClauseThen1.lookaheads()
    ),
    CaseList: ([] as string[]).concat(CaseList0.lookaheads()),
    CaseListFollow: ([] as string[]).concat(CaseListFollow0.lookaheads()),
    CaseListEl: ([] as string[]).concat(CaseListEl0.lookaheads()),
    WriteClause: ([] as string[]).concat(
      WriteClause0.lookaheads(),
      WriteClause1.lookaheads(),
      WriteClause2.lookaheads(),
      WriteClause3.lookaheads(),
      WriteClause4.lookaheads()
    ),
    WriteList: ([] as string[]).concat(WriteList0.lookaheads()),
    WriteListFollow: ([] as string[]).concat(WriteListFollow0.lookaheads()),
    WriteListEl: ([] as string[]).concat(WriteListEl0.lookaheads()),
    WriteListElFollow: ([] as string[]).concat(WriteListElFollow0.lookaheads()),
    Raster: ([] as string[]).concat(Raster0.lookaheads()),
    RasterOp: ([] as string[]).concat(
      RasterOp0.lookaheads(),
      RasterOp1.lookaheads(),
      RasterOp2.lookaheads(),
      RasterOp3.lookaheads(),
      RasterOp4.lookaheads(),
      RasterOp5.lookaheads(),
      RasterOp6.lookaheads(),
      RasterOp7.lookaheads()
    ),
    ClauseList: ([] as string[]).concat(ClauseList0.lookaheads()),
    ClauseListFollow: ([] as string[]).concat(ClauseListFollow0.lookaheads()),
    Expression: ([] as string[]).concat(Expression0.lookaheads()),
    ExpressionFollow: ([] as string[]).concat(ExpressionFollow0.lookaheads()),
    Exp1: ([] as string[]).concat(Exp10.lookaheads()),
    Exp1Follow: ([] as string[]).concat(Exp1Follow0.lookaheads()),
    Exp2: ([] as string[]).concat(Exp20.lookaheads(), Exp21.lookaheads()),
    Exp2Tilde: ([] as string[]).concat(Exp2Tilde0.lookaheads()),
    Exp2Op: ([] as string[]).concat(Exp2Op0.lookaheads()),
    Exp3: ([] as string[]).concat(Exp30.lookaheads()),
    Exp3Op: ([] as string[]).concat(Exp3Op0.lookaheads()),
    Exp4: ([] as string[]).concat(Exp40.lookaheads()),
    Exp4Op: ([] as string[]).concat(Exp4Op0.lookaheads()),
    Exp5: ([] as string[]).concat(Exp50.lookaheads(), Exp51.lookaheads()),
    Exp5Follow: ([] as string[]).concat(Exp5Follow0.lookaheads()),
    ExpressionArg: ([] as string[]).concat(ExpressionArg0.lookaheads()),
    ExpressionArgFollow: ([] as string[]).concat(
      ExpressionArgFollow0.lookaheads(),
      ExpressionArgFollow1.lookaheads()
    ),
    Exp6: ([] as string[]).concat(
      Exp60.lookaheads(),
      Exp61.lookaheads(),
      Exp62.lookaheads(),
      Exp63.lookaheads(),
      Exp64.lookaheads(),
      Exp65.lookaheads(),
      Exp66.lookaheads()
    ),
    ValueConstructor: ([] as string[]).concat(
      ValueConstructor0.lookaheads(),
      ValueConstructor1.lookaheads(),
      ValueConstructor2.lookaheads(),
      ValueConstructor3.lookaheads()
    ),
    VectorConstr: ([] as string[]).concat(
      VectorConstr0.lookaheads(),
      VectorConstr1.lookaheads()
    ),
    VectorConstrFollow: ([] as string[]).concat(
      VectorConstrFollow0.lookaheads()
    ),
    Range: ([] as string[]).concat(Range0.lookaheads()),
    RangeFollow: ([] as string[]).concat(RangeFollow0.lookaheads()),
    RangeEl: ([] as string[]).concat(RangeEl0.lookaheads()),
    ImageConstr: ([] as string[]).concat(ImageConstr0.lookaheads()),
    SubimageConstr: ([] as string[]).concat(SubimageConstr0.lookaheads()),
    SubimageConstrMid: ([] as string[]).concat(SubimageConstrMid0.lookaheads()),
    SubimageConstrEnd: ([] as string[]).concat(SubimageConstrEnd0.lookaheads()),
    PictureConstr: ([] as string[]).concat(
      PictureConstr0.lookaheads(),
      PictureConstr1.lookaheads(),
      PictureConstr2.lookaheads(),
      PictureConstr3.lookaheads(),
      PictureConstr4.lookaheads(),
      PictureConstr5.lookaheads()
    ),
    Literal: ([] as string[]).concat(
      Literal0.lookaheads(),
      Literal1.lookaheads(),
      Literal2.lookaheads(),
      Literal3.lookaheads(),
      Literal4.lookaheads(),
      Literal5.lookaheads()
    ),
    IntegerLiteral: ([] as string[]).concat(IntegerLiteral0.lookaheads()),
    BooleanLiteral: ([] as string[]).concat(
      BooleanLiteral0.lookaheads(),
      BooleanLiteral1.lookaheads()
    ),
    PixelLiteral: ([] as string[]).concat(
      PixelLiteral0.lookaheads(),
      PixelLiteral1.lookaheads()
    ),
    PixelLiteralFollow: ([] as string[]).concat(
      PixelLiteralFollow0.lookaheads()
    ),
    AddOp: ([] as string[]).concat(AddOp0.lookaheads(), AddOp1.lookaheads()),
    MultOp: ([] as string[]).concat(
      MultOp0.lookaheads(),
      MultOp1.lookaheads(),
      MultOp2.lookaheads(),
      MultOp3.lookaheads(),
      MultOp4.lookaheads(),
      MultOp5.lookaheads(),
      MultOp6.lookaheads()
    ),
    RelOp: ([] as string[]).concat(
      RelOp0.lookaheads(),
      RelOp1.lookaheads(),
      RelOp2.lookaheads()
    ),
    EqOp: ([] as string[]).concat(EqOp0.lookaheads(), EqOp1.lookaheads()),
    ComparOp: ([] as string[]).concat(
      ComparOp0.lookaheads(),
      ComparOp1.lookaheads(),
      ComparOp2.lookaheads(),
      ComparOp3.lookaheads()
    ),
    TypeOp: ([] as string[]).concat(TypeOp0.lookaheads(), TypeOp1.lookaheads()),
    Identifier: ([] as string[]).concat(
      Identifier0.lookaheads(),
      Identifier1.lookaheads()
    ),
    StandardExp: ([] as string[]).concat(StandardExp0.lookaheads()),
    StandardName: ([] as string[]).concat(
      StandardName0.lookaheads(),
      StandardName1.lookaheads(),
      StandardName2.lookaheads(),
      StandardName3.lookaheads(),
      StandardName4.lookaheads(),
      StandardName5.lookaheads(),
      StandardName6.lookaheads(),
      StandardName7.lookaheads(),
      StandardName8.lookaheads(),
      StandardName9.lookaheads(),
      StandardName10.lookaheads(),
      StandardName11.lookaheads(),
      StandardName12.lookaheads(),
      StandardName13.lookaheads()
    ),
    StandardId: ([] as string[]).concat(
      StandardId0.lookaheads(),
      StandardId1.lookaheads(),
      StandardId2.lookaheads(),
      StandardId3.lookaheads(),
      StandardId4.lookaheads(),
      StandardId5.lookaheads(),
      StandardId6.lookaheads(),
      StandardId7.lookaheads(),
      StandardId8.lookaheads(),
      StandardId9.lookaheads(),
      StandardId10.lookaheads()
    ),
  };
}
export class Program0 {
  constructor(public pos: number, public sequence: Sequence) {}
  static lookaheads(): string[] {
    return [
      "let",
      "structure",
      "procedure",
      "forward",
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Program = Program0;
export class Sequence0 {
  constructor(
    public pos: number,
    public sequenceEl: SequenceEl,
    public sequenceFollow: SequenceFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "let",
      "structure",
      "procedure",
      "forward",
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Sequence = Sequence0;
export class SequenceFollow0 {
  constructor(public pos: number, public sequenceEl: SequenceEl) {}
  static lookaheads(): string[] {
    return [";"];
  }
}
export type SequenceFollow = SequenceFollow0;
export class SequenceEl0 {
  constructor(public pos: number, public declaration: Declaration) {}
  static lookaheads(): string[] {
    return ["let", "structure", "procedure", "forward"];
  }
}
export class SequenceEl1 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type SequenceEl = SequenceEl0 | SequenceEl1;
export class Declaration0 {
  constructor(public pos: number, public letDecl: LetDecl) {}
  static lookaheads(): string[] {
    return ["let"];
  }
}
export class Declaration1 {
  constructor(public pos: number, public structureDecl: StructureDecl) {}
  static lookaheads(): string[] {
    return ["structure"];
  }
}
export class Declaration2 {
  constructor(public pos: number, public procDecl: ProcDecl) {}
  static lookaheads(): string[] {
    return ["procedure"];
  }
}
export class Declaration3 {
  constructor(public pos: number, public forward: Forward) {}
  static lookaheads(): string[] {
    return ["forward"];
  }
}
export type Declaration =
  | Declaration0
  | Declaration1
  | Declaration2
  | Declaration3;
export class LetDecl0 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public initOp: InitOp,
    public clause: Clause
  ) {}
  static lookaheads(): string[] {
    return ["let"];
  }
}
export type LetDecl = LetDecl0;
export class InitOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["="];
  }
}
export class InitOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return [":="];
  }
}
export type InitOp = InitOp0 | InitOp1;
export class StructureDecl0 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public structureDeclFields: StructureDeclFields | void
  ) {}
  static lookaheads(): string[] {
    return ["structure"];
  }
}
export type StructureDecl = StructureDecl0;
export class StructureDeclFields0 {
  constructor(public pos: number, public fieldList: FieldList | void) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export type StructureDeclFields = StructureDeclFields0;
export class FieldList0 {
  constructor(
    public pos: number,
    public fieldListEl: FieldListEl,
    public fieldListFollow: FieldListFollow[]
  ) {}
  static lookaheads(): string[] {
    return ["__TYPE"];
  }
}
export type FieldList = FieldList0;
export class FieldListFollow0 {
  constructor(public pos: number, public fieldListEl: FieldListEl) {}
  static lookaheads(): string[] {
    return [";"];
  }
}
export type FieldListFollow = FieldListFollow0;
export class FieldListEl0 {
  constructor(
    public pos: number,
    public type: Type_,
    public identifierList: IdentifierList
  ) {}
  static lookaheads(): string[] {
    return ["__TYPE"];
  }
}
export type FieldListEl = FieldListEl0;
export class ProcDecl0 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public procDeclType: ProcDeclType | void,
    public clause: Clause
  ) {}
  static lookaheads(): string[] {
    return ["procedure"];
  }
}
export type ProcDecl = ProcDecl0;
export class ProcDeclType0 {
  constructor(
    public pos: number,
    public parameterList: ParameterList | void,
    public returnTypex: ReturnTypex | void
  ) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export type ProcDeclType = ProcDeclType0;
export class ParameterList0 {
  constructor(
    public pos: number,
    public parameter: Parameter,
    public parameterListFollow: ParameterListFollow[]
  ) {}
  static lookaheads(): string[] {
    return ["__TYPE", "structure", "("];
  }
}
export type ParameterList = ParameterList0;
export class ParameterListFollow0 {
  constructor(public pos: number, public parameter: Parameter) {}
  static lookaheads(): string[] {
    return [";"];
  }
}
export type ParameterListFollow = ParameterListFollow0;
export class Parameter0 {
  constructor(
    public pos: number,
    public type: Type_,
    public identifierList: IdentifierList
  ) {}
  static lookaheads(): string[] {
    return ["__TYPE"];
  }
}
export class Parameter1 {
  constructor(public pos: number, public structureDecl: StructureDecl) {}
  static lookaheads(): string[] {
    return ["structure"];
  }
}
export class Parameter2 {
  constructor(
    public pos: number,
    public procType: ProcType,
    public identifierList: IdentifierList
  ) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export type Parameter = Parameter0 | Parameter1 | Parameter2;
export class ProcType0 {
  constructor(
    public pos: number,
    public ptypeList: PtypeList | void,
    public returnTypex: ReturnTypex | void
  ) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export type ProcType = ProcType0;
export class ReturnTypex0 {
  constructor(public pos: number, public type: Type_) {}
  static lookaheads(): string[] {
    return ["->"];
  }
}
export type ReturnTypex = ReturnTypex0;
export class PtypeList0 {
  constructor(
    public pos: number,
    public ptypeListEl: PtypeListEl,
    public ptypeListFollow: PtypeListFollow[]
  ) {}
  static lookaheads(): string[] {
    return ["__TYPE", "(", "structure"];
  }
}
export type PtypeList = PtypeList0;
export class PtypeListFollow0 {
  constructor(public pos: number, public ptypeListEl: PtypeListEl) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type PtypeListFollow = PtypeListFollow0;
export class PtypeListEl0 {
  constructor(public pos: number, public type: Type_) {}
  static lookaheads(): string[] {
    return ["__TYPE"];
  }
}
export class PtypeListEl1 {
  constructor(public pos: number, public procType: ProcType) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export class PtypeListEl2 {
  constructor(public pos: number, public sDecl: SDecl) {}
  static lookaheads(): string[] {
    return ["structure"];
  }
}
export type PtypeListEl = PtypeListEl0 | PtypeListEl1 | PtypeListEl2;
export class SDecl0 {
  constructor(
    public pos: number,
    public type: Type_,
    public sDeclFollow: SDeclFollow[]
  ) {}
  static lookaheads(): string[] {
    return ["structure"];
  }
}
export type SDecl = SDecl0;
export class SDeclFollow0 {
  constructor(public pos: number, public type: Type_) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type SDeclFollow = SDeclFollow0;
export class Forward0 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public procType: ProcType | void
  ) {}
  static lookaheads(): string[] {
    return ["forward"];
  }
}
export type Forward = Forward0;
export class IdentifierList0 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public identifierListFollow: IdentifierListFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type IdentifierList = IdentifierList0;
export class IdentifierListFollow0 {
  constructor(public pos: number, public identifier: Identifier) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type IdentifierListFollow = IdentifierListFollow0;
export class Clause0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public ifClauseThen: IfClauseThen
  ) {}
  static lookaheads(): string[] {
    return ["if"];
  }
}
export class Clause1 {
  constructor(
    public pos: number,
    public repeat: Clause,
    public whilex: Clause,
    public clauseDo: ClauseDo | void
  ) {}
  static lookaheads(): string[] {
    return ["repeat"];
  }
}
export class Clause2 {
  constructor(public pos: number, public whilex: Clause, public dox: Clause) {}
  static lookaheads(): string[] {
    return ["while"];
  }
}
export class Clause3 {
  constructor(
    public pos: number,
    public identifier: Identifier,
    public from: Clause,
    public to: Clause,
    public clauseBy: ClauseBy | void,
    public dox: Clause
  ) {}
  static lookaheads(): string[] {
    return ["for"];
  }
}
export class Clause4 {
  constructor(
    public pos: number,
    public casex: Clause,
    public caseList: CaseList,
    public defaultx: Clause
  ) {}
  static lookaheads(): string[] {
    return ["case"];
  }
}
export class Clause5 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["abort"];
  }
}
export class Clause6 {
  constructor(public pos: number, public writeClause: WriteClause) {}
  static lookaheads(): string[] {
    return ["write", "output", "out.byte", "out.16", "out.32"];
  }
}
export class Clause7 {
  constructor(public pos: number, public raster: Raster) {}
  static lookaheads(): string[] {
    return ["ror", "rand", "xor", "copy", "nand", "nor", "not", "xnor"];
  }
}
export class Clause8 {
  constructor(
    public pos: number,
    public expression: Expression,
    public clauseExprFollow: ClauseExprFollow | void
  ) {}
  static lookaheads(): string[] {
    return [
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Clause =
  | Clause0
  | Clause1
  | Clause2
  | Clause3
  | Clause4
  | Clause5
  | Clause6
  | Clause7
  | Clause8;
export class ClauseDo0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["do"];
  }
}
export type ClauseDo = ClauseDo0;
export class ClauseBy0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["by"];
  }
}
export type ClauseBy = ClauseBy0;
export class ClauseExprFollow0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return [":="];
  }
}
export type ClauseExprFollow = ClauseExprFollow0;
export class IfClauseThen0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["do"];
  }
}
export class IfClauseThen1 {
  constructor(public pos: number, public then: Clause, public elsex: Clause) {}
  static lookaheads(): string[] {
    return ["then"];
  }
}
export type IfClauseThen = IfClauseThen0 | IfClauseThen1;
export class CaseList0 {
  constructor(
    public pos: number,
    public caseListEl: CaseListEl,
    public caseListFollow: CaseListFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type CaseList = CaseList0;
export class CaseListFollow0 {
  constructor(public pos: number, public caseListEl: CaseListEl) {}
  static lookaheads(): string[] {
    return [";"];
  }
}
export type CaseListFollow = CaseListFollow0;
export class CaseListEl0 {
  constructor(
    public pos: number,
    public clauseList: ClauseList,
    public clause: Clause
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type CaseListEl = CaseListEl0;
export class WriteClause0 {
  constructor(public pos: number, public writeList: WriteList) {}
  static lookaheads(): string[] {
    return ["write"];
  }
}
export class WriteClause1 {
  constructor(
    public pos: number,
    public clause: Clause,
    public writeList: WriteList
  ) {}
  static lookaheads(): string[] {
    return ["output"];
  }
}
export class WriteClause2 {
  constructor(
    public pos: number,
    public clause: Clause,
    public b: Clause,
    public c: Clause
  ) {}
  static lookaheads(): string[] {
    return ["out.byte"];
  }
}
export class WriteClause3 {
  constructor(
    public pos: number,
    public clause: Clause,
    public b: Clause,
    public c: Clause
  ) {}
  static lookaheads(): string[] {
    return ["out.16"];
  }
}
export class WriteClause4 {
  constructor(public pos: number, public clause: Clause, public b: Clause) {}
  static lookaheads(): string[] {
    return ["out.32"];
  }
}
export type WriteClause =
  | WriteClause0
  | WriteClause1
  | WriteClause2
  | WriteClause3
  | WriteClause4;
export class WriteList0 {
  constructor(
    public pos: number,
    public writeListEl: WriteListEl,
    public writeListFollow: WriteListFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type WriteList = WriteList0;
export class WriteListFollow0 {
  constructor(public pos: number, public writeListEl: WriteListEl) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type WriteListFollow = WriteListFollow0;
export class WriteListEl0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public writeListElFollow: WriteListElFollow | void
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type WriteListEl = WriteListEl0;
export class WriteListElFollow0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return [":"];
  }
}
export type WriteListElFollow = WriteListElFollow0;
export class Raster0 {
  constructor(
    public pos: number,
    public rasterOp: RasterOp,
    public thisx: Clause,
    public that: Clause
  ) {}
  static lookaheads(): string[] {
    return ["ror", "rand", "xor", "copy", "nand", "nor", "not", "xnor"];
  }
}
export type Raster = Raster0;
export class RasterOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["ror"];
  }
}
export class RasterOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["rand"];
  }
}
export class RasterOp2 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["xor"];
  }
}
export class RasterOp3 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["copy"];
  }
}
export class RasterOp4 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["nand"];
  }
}
export class RasterOp5 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["nor"];
  }
}
export class RasterOp6 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["not"];
  }
}
export class RasterOp7 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["xnor"];
  }
}
export type RasterOp =
  | RasterOp0
  | RasterOp1
  | RasterOp2
  | RasterOp3
  | RasterOp4
  | RasterOp5
  | RasterOp6
  | RasterOp7;
export class ClauseList0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public clauseListFollow: ClauseListFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type ClauseList = ClauseList0;
export class ClauseListFollow0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type ClauseListFollow = ClauseListFollow0;
export class Expression0 {
  constructor(
    public pos: number,
    public exp1: Exp1,
    public expressionFollow: ExpressionFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Expression = Expression0;
export class ExpressionFollow0 {
  constructor(public pos: number, public exp1: Exp1) {}
  static lookaheads(): string[] {
    return ["or"];
  }
}
export type ExpressionFollow = ExpressionFollow0;
export class Exp10 {
  constructor(
    public pos: number,
    public exp2: Exp2,
    public exp1Follow: Exp1Follow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp1 = Exp10;
export class Exp1Follow0 {
  constructor(public pos: number, public exp2: Exp2) {}
  static lookaheads(): string[] {
    return ["and"];
  }
}
export type Exp1Follow = Exp1Follow0;
export class Exp20 {
  constructor(
    public pos: number,
    public exp2Tilde: Exp2Tilde,
    public exp3: Exp3,
    public exp2Op: Exp2Op[]
  ) {}
  static lookaheads(): string[] {
    return ["~"];
  }
}
export class Exp21 {
  constructor(public pos: number, public exp3: Exp3, public exp2Op: Exp2Op[]) {}
  static lookaheads(): string[] {
    return [
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp2 = Exp20 | Exp21;
export class Exp2Tilde0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["~"];
  }
}
export type Exp2Tilde = Exp2Tilde0;
export class Exp2Op0 {
  constructor(public pos: number, public relOp: RelOp, public exp3: Exp3) {}
  static lookaheads(): string[] {
    return ["=", "~=", "<=", "<", ">=", ">", "is", "isnt"];
  }
}
export type Exp2Op = Exp2Op0;
export class Exp30 {
  constructor(public pos: number, public exp4: Exp4, public exp3Op: Exp3Op[]) {}
  static lookaheads(): string[] {
    return [
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp3 = Exp30;
export class Exp3Op0 {
  constructor(public pos: number, public addOp: AddOp, public exp4: Exp4) {}
  static lookaheads(): string[] {
    return ["+", "-"];
  }
}
export type Exp3Op = Exp3Op0;
export class Exp40 {
  constructor(public pos: number, public exp5: Exp5, public exp4Op: Exp4Op[]) {}
  static lookaheads(): string[] {
    return [
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp4 = Exp40;
export class Exp4Op0 {
  constructor(public pos: number, public multOp: MultOp, public exp5: Exp5) {}
  static lookaheads(): string[] {
    return ["++", "div", "rem", "*", "/", "^", "&"];
  }
}
export type Exp4Op = Exp4Op0;
export class Exp50 {
  constructor(
    public pos: number,
    public addOp: AddOp,
    public exp6: Exp6,
    public exp5Follow: Exp5Follow[]
  ) {}
  static lookaheads(): string[] {
    return ["+", "-"];
  }
}
export class Exp51 {
  constructor(
    public pos: number,
    public exp6: Exp6,
    public exp5Follow: Exp5Follow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp5 = Exp50 | Exp51;
export class Exp5Follow0 {
  constructor(public pos: number, public expressionArg: ExpressionArg) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export type Exp5Follow = Exp5Follow0;
export class ExpressionArg0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public expressionArgFollow: ExpressionArgFollow | void
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type ExpressionArg = ExpressionArg0;
export class ExpressionArgFollow0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["|"];
  }
}
export class ExpressionArgFollow1 {
  constructor(public pos: number, public clauseList: ClauseList) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type ExpressionArgFollow = ExpressionArgFollow0 | ExpressionArgFollow1;
export class Exp60 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["("];
  }
}
export class Exp61 {
  constructor(public pos: number, public sequence: Sequence | void) {}
  static lookaheads(): string[] {
    return ["begin"];
  }
}
export class Exp62 {
  constructor(public pos: number, public sequence: Sequence | void) {}
  static lookaheads(): string[] {
    return ["{"];
  }
}
export class Exp63 {
  constructor(public pos: number, public standardExp: StandardExp) {}
  static lookaheads(): string[] {
    return [
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
    ];
  }
}
export class Exp64 {
  constructor(public pos: number, public literal: Literal) {}
  static lookaheads(): string[] {
    return [
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
    ];
  }
}
export class Exp65 {
  constructor(public pos: number, public valueConstructor: ValueConstructor) {}
  static lookaheads(): string[] {
    return [
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
    ];
  }
}
export class Exp66 {
  constructor(public pos: number, public identifier: Identifier) {}
  static lookaheads(): string[] {
    return [
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Exp6 = Exp60 | Exp61 | Exp62 | Exp63 | Exp64 | Exp65 | Exp66;
export class ValueConstructor0 {
  constructor(public pos: number, public vectorConstr: VectorConstr) {}
  static lookaheads(): string[] {
    return ["vector", "@"];
  }
}
export class ValueConstructor1 {
  constructor(public pos: number, public imageConstr: ImageConstr) {}
  static lookaheads(): string[] {
    return ["image"];
  }
}
export class ValueConstructor2 {
  constructor(public pos: number, public subimageConstr: SubimageConstr) {}
  static lookaheads(): string[] {
    return ["limit"];
  }
}
export class ValueConstructor3 {
  constructor(public pos: number, public pictureConstr: PictureConstr) {}
  static lookaheads(): string[] {
    return ["shift", "scale", "rotate", "colour", "text", "["];
  }
}
export type ValueConstructor =
  | ValueConstructor0
  | ValueConstructor1
  | ValueConstructor2
  | ValueConstructor3;
export class VectorConstr0 {
  constructor(public pos: number, public range: Range, public clause: Clause) {}
  static lookaheads(): string[] {
    return ["vector"];
  }
}
export class VectorConstr1 {
  constructor(
    public pos: number,
    public clause: Clause,
    public type: Type_,
    public b: Clause,
    public vectorConstrFollow: VectorConstrFollow[]
  ) {}
  static lookaheads(): string[] {
    return ["@"];
  }
}
export type VectorConstr = VectorConstr0 | VectorConstr1;
export class VectorConstrFollow0 {
  constructor(public pos: number, public clause: Clause) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type VectorConstrFollow = VectorConstrFollow0;
export class Range0 {
  constructor(
    public pos: number,
    public rangeEl: RangeEl,
    public rangeFollow: RangeFollow[]
  ) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Range = Range0;
export class RangeFollow0 {
  constructor(public pos: number, public rangeEl: RangeEl) {}
  static lookaheads(): string[] {
    return [","];
  }
}
export type RangeFollow = RangeFollow0;
export class RangeEl0 {
  constructor(public pos: number, public a: Clause, public b: Clause) {}
  static lookaheads(): string[] {
    return [
      "if",
      "repeat",
      "while",
      "for",
      "case",
      "abort",
      "write",
      "output",
      "out.byte",
      "out.16",
      "out.32",
      "ror",
      "rand",
      "xor",
      "copy",
      "nand",
      "nor",
      "not",
      "xnor",
      "~",
      "+",
      "-",
      "(",
      "begin",
      "{",
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
      "nil",
      "nullfile",
      "__NUMBER",
      "true",
      "false",
      "__STRING",
      "on",
      "off",
      "vector",
      "@",
      "image",
      "limit",
      "shift",
      "scale",
      "rotate",
      "colour",
      "text",
      "[",
      "__ID",
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type RangeEl = RangeEl0;
export class ImageConstr0 {
  constructor(
    public pos: number,
    public image: Clause,
    public by: Clause,
    public of: Clause
  ) {}
  static lookaheads(): string[] {
    return ["image"];
  }
}
export type ImageConstr = ImageConstr0;
export class SubimageConstr0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public subimageConstrMid: SubimageConstrMid | void,
    public subimageConstrEnd: SubimageConstrEnd | void
  ) {}
  static lookaheads(): string[] {
    return ["limit"];
  }
}
export type SubimageConstr = SubimageConstr0;
export class SubimageConstrMid0 {
  constructor(public pos: number, public to: Clause, public by: Clause) {}
  static lookaheads(): string[] {
    return ["to"];
  }
}
export type SubimageConstrMid = SubimageConstrMid0;
export class SubimageConstrEnd0 {
  constructor(public pos: number, public at1: Clause, public at2: Clause) {}
  static lookaheads(): string[] {
    return ["at"];
  }
}
export type SubimageConstrEnd = SubimageConstrEnd0;
export class PictureConstr0 {
  constructor(
    public pos: number,
    public clause: Clause,
    public b: Clause,
    public c: Clause
  ) {}
  static lookaheads(): string[] {
    return ["shift"];
  }
}
export class PictureConstr1 {
  constructor(
    public pos: number,
    public clause: Clause,
    public b: Clause,
    public c: Clause
  ) {}
  static lookaheads(): string[] {
    return ["scale"];
  }
}
export class PictureConstr2 {
  constructor(public pos: number, public clause: Clause, public b: Clause) {}
  static lookaheads(): string[] {
    return ["rotate"];
  }
}
export class PictureConstr3 {
  constructor(public pos: number, public clause: Clause, public b: Clause) {}
  static lookaheads(): string[] {
    return ["colour"];
  }
}
export class PictureConstr4 {
  constructor(
    public pos: number,
    public clause: Clause,
    public b: Clause,
    public c: Clause,
    public d: Clause,
    public e: Clause
  ) {}
  static lookaheads(): string[] {
    return ["text"];
  }
}
export class PictureConstr5 {
  constructor(public pos: number, public clause: Clause, public b: Clause) {}
  static lookaheads(): string[] {
    return ["["];
  }
}
export type PictureConstr =
  | PictureConstr0
  | PictureConstr1
  | PictureConstr2
  | PictureConstr3
  | PictureConstr4
  | PictureConstr5;
export class Literal0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["nil"];
  }
}
export class Literal1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["nullfile"];
  }
}
export class Literal2 {
  constructor(public pos: number, public integerLiteral: IntegerLiteral) {}
  static lookaheads(): string[] {
    return ["__NUMBER"];
  }
}
export class Literal3 {
  constructor(public pos: number, public booleanLiteral: BooleanLiteral) {}
  static lookaheads(): string[] {
    return ["true", "false"];
  }
}
export class Literal4 {
  constructor(public pos: number, public string: String_) {}
  static lookaheads(): string[] {
    return ["__STRING"];
  }
}
export class Literal5 {
  constructor(public pos: number, public pixelLiteral: PixelLiteral) {}
  static lookaheads(): string[] {
    return ["on", "off"];
  }
}
export type Literal =
  | Literal0
  | Literal1
  | Literal2
  | Literal3
  | Literal4
  | Literal5;
export class IntegerLiteral0 {
  constructor(public pos: number, public number: Number_) {}
  static lookaheads(): string[] {
    return ["__NUMBER"];
  }
}
export type IntegerLiteral = IntegerLiteral0;
export class BooleanLiteral0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["true"];
  }
}
export class BooleanLiteral1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["false"];
  }
}
export type BooleanLiteral = BooleanLiteral0 | BooleanLiteral1;
export class PixelLiteral0 {
  constructor(
    public pos: number,
    public pixelLiteralFollow: PixelLiteralFollow | void
  ) {}
  static lookaheads(): string[] {
    return ["on"];
  }
}
export class PixelLiteral1 {
  constructor(
    public pos: number,
    public pixelLiteralFollow: PixelLiteralFollow | void
  ) {}
  static lookaheads(): string[] {
    return ["off"];
  }
}
export type PixelLiteral = PixelLiteral0 | PixelLiteral1;
export class PixelLiteralFollow0 {
  constructor(public pos: number, public pixelLiteral: PixelLiteral) {}
  static lookaheads(): string[] {
    return ["&"];
  }
}
export type PixelLiteralFollow = PixelLiteralFollow0;
export class AddOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["+"];
  }
}
export class AddOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["-"];
  }
}
export type AddOp = AddOp0 | AddOp1;
export class MultOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["++"];
  }
}
export class MultOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["div"];
  }
}
export class MultOp2 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["rem"];
  }
}
export class MultOp3 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["*"];
  }
}
export class MultOp4 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["/"];
  }
}
export class MultOp5 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["^"];
  }
}
export class MultOp6 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["&"];
  }
}
export type MultOp =
  | MultOp0
  | MultOp1
  | MultOp2
  | MultOp3
  | MultOp4
  | MultOp5
  | MultOp6;
export class RelOp0 {
  constructor(public pos: number, public eqOp: EqOp) {}
  static lookaheads(): string[] {
    return ["=", "~="];
  }
}
export class RelOp1 {
  constructor(public pos: number, public comparOp: ComparOp) {}
  static lookaheads(): string[] {
    return ["<=", "<", ">=", ">"];
  }
}
export class RelOp2 {
  constructor(public pos: number, public typeOp: TypeOp) {}
  static lookaheads(): string[] {
    return ["is", "isnt"];
  }
}
export type RelOp = RelOp0 | RelOp1 | RelOp2;
export class EqOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["="];
  }
}
export class EqOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["~="];
  }
}
export type EqOp = EqOp0 | EqOp1;
export class ComparOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["<="];
  }
}
export class ComparOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["<"];
  }
}
export class ComparOp2 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return [">="];
  }
}
export class ComparOp3 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return [">"];
  }
}
export type ComparOp = ComparOp0 | ComparOp1 | ComparOp2 | ComparOp3;
export class TypeOp0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["is"];
  }
}
export class TypeOp1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["isnt"];
  }
}
export type TypeOp = TypeOp0 | TypeOp1;
export class Identifier0 {
  constructor(public pos: number, public id: Id_) {}
  static lookaheads(): string[] {
    return ["__ID"];
  }
}
export class Identifier1 {
  constructor(public pos: number, public standardId: StandardId) {}
  static lookaheads(): string[] {
    return [
      "r.w",
      "i.w",
      "s.w",
      "s.o",
      "s.i",
      "maxint",
      "maxreal",
      "epsilon",
      "pi",
      "cursor",
      "screen",
    ];
  }
}
export type Identifier = Identifier0 | Identifier1;
export class StandardExp0 {
  constructor(public pos: number, public standardName: StandardName) {}
  static lookaheads(): string[] {
    return [
      "upb",
      "lwb",
      "eof",
      "read.a.line",
      "read",
      "readi",
      "readr",
      "readb",
      "peek",
      "reads",
      "read.name",
      "read.byte",
      "read.16",
      "read.32",
    ];
  }
}
export type StandardExp = StandardExp0;
export class StandardName0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["upb"];
  }
}
export class StandardName1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["lwb"];
  }
}
export class StandardName2 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["eof"];
  }
}
export class StandardName3 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read.a.line"];
  }
}
export class StandardName4 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read"];
  }
}
export class StandardName5 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["readi"];
  }
}
export class StandardName6 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["readr"];
  }
}
export class StandardName7 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["readb"];
  }
}
export class StandardName8 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["peek"];
  }
}
export class StandardName9 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["reads"];
  }
}
export class StandardName10 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read.name"];
  }
}
export class StandardName11 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read.byte"];
  }
}
export class StandardName12 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read.16"];
  }
}
export class StandardName13 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["read.32"];
  }
}
export type StandardName =
  | StandardName0
  | StandardName1
  | StandardName2
  | StandardName3
  | StandardName4
  | StandardName5
  | StandardName6
  | StandardName7
  | StandardName8
  | StandardName9
  | StandardName10
  | StandardName11
  | StandardName12
  | StandardName13;
export class StandardId0 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["r.w"];
  }
}
export class StandardId1 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["i.w"];
  }
}
export class StandardId2 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["s.w"];
  }
}
export class StandardId3 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["s.o"];
  }
}
export class StandardId4 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["s.i"];
  }
}
export class StandardId5 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["maxint"];
  }
}
export class StandardId6 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["maxreal"];
  }
}
export class StandardId7 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["epsilon"];
  }
}
export class StandardId8 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["pi"];
  }
}
export class StandardId9 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["cursor"];
  }
}
export class StandardId10 {
  constructor(public pos: number) {}
  static lookaheads(): string[] {
    return ["screen"];
  }
}
export type StandardId =
  | StandardId0
  | StandardId1
  | StandardId2
  | StandardId3
  | StandardId4
  | StandardId5
  | StandardId6
  | StandardId7
  | StandardId8
  | StandardId9
  | StandardId10;
