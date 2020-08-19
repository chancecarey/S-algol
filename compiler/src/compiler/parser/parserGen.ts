import { SAlgolGrammar } from "./grammar.ebnf";

// `type`is any number of * and c followed by int/real/bool/string/pixel/pic/pntr/file/#pixel/#cpixel
// `number`, `id`, `string`
// modifiers are * and ?
// real types stored as __TYPE, __NUMBER, __ID, __STRING
enum NontermType {
  ONE,
  OPTIONAL,
  MANY,
}

type Element = Nonterm | Term;
type ProductionMap = { [key: string]: Production };

class Production {
  public lookaheads: string[] = [];
  constructor(public name: string, public branches: Branch[]) {}
}
class Branch {
  public lookaheads: string[] = [];
  constructor(public elements: Element[]) {}
}
class Nonterm {
  constructor(
    public name: string,
    public as: string,
    public nontermType: NontermType
  ) {}
}
class Term {
  constructor(public value: string) {}
}

export class ParserGen {
  private grammar = SAlgolGrammar;
  private cursor = 0;

  private output: string[] = [];
  private terminals: string[] = [];
  private productions: ProductionMap = {};

  private wsR = /^\s+/;
  private productionR = /^(\w+) =/;
  private stringR = /^"(.*?)"/;
  private idR = /^\w+/;

  public gen(): string {
    while (this.next().length > 0) this.genProduction();

    this.validate();
    this.fillLookaheads();
    this.genOutput();

    return this.output.join("\n");
  }

  private genOutput(): void {
    // Add parser prelude
    this.output.push(`
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
      private numberR = /^\\d+(?:\\.\\d*)?(?:e\\d+)?/;
      private idR = /^\\w+(?:[.\\w]*\\w)?/;
      private stringR = /^"((?:'"|''|.)*?)"/;
    
      private wsR = /^\\s+/;
      private semicolonR = /^\\s*[\\n;]\\s*/;
      private symbolsR = /^[^\\s\\w]+/;
      private commentR = /![^"]*/;
    
      private cursor = 0;
      private program: string;
      constructor(private programRaw: string) {
        // Replace comments
        this.program = programRaw
          .split("\\n")
          .map(l => {
            const commentM = l.match(this.commentR);
            // Replace comments with equal length whitespace
            if (commentM)
              return l.replace(this.commentR, " ".repeat(commentM[0].length));
            else return l;
          })
          .join("\\n");
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
            // If a word, needs to totally match the entire next word \\w+
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
`);

    this.genTerminalList();

    for (const k in this.productions) {
      const v = this.productions[k];
      this.genCreate(v);
    }

    this.genLookaheads();

    this.output.push(`}`);

    for (const k in this.productions) {
      const v = this.productions[k];

      const types = v.branches.map((b, i) => {
        const name = `${v.name}${i}`;
        // Generate classes
        this.genClass(name, b);
        return name;
      });

      this.output.push(`export type ${v.name} = ${types.join(" | ")};`);
    }
  }

  private genTerminalList(): void {
    const terminals = this.terminals.map((t) => `"${t}"`).join(`, `);
    this.output.push(`private terminals = [${terminals}];`);
  }

  private genLookaheads(): void {
    this.output.push(`private lookaheads = {`);

    const all: string[] = [];
    for (const k in this.productions) {
      const v = this.productions[k];

      const lookaheads = v.branches
        .map((_, i) => `${v.name}${i}.lookaheads()`)
        .join(`, `);
      all.push(`${v.name}: ([] as string[]).concat(${lookaheads})`);
    }
    this.output.push(all.join(`,\n`));

    this.output.push(`};`);
  }

  private genCreate(p: Production): void {
    this.output.push(`private create${p.name}(): ${p.name} {`);
    this.output.push(`const cursor = this.cursor;`);

    for (let i = 0; i < p.branches.length; i++) {
      const b = p.branches[i];
      const name = `${p.name}${i}`;

      this.output.push(`if(this.nextMatches(${name}.lookaheads())) {`);

      this.genBranch(p, b, i);

      this.output.push(`}`);
      if (i !== p.branches.length - 1) this.output.push("else");
    }

    this.output.push(`else throw new Error("Unexpected input");`);

    this.output.push(`}`);
  }

  private genBranch(p: Production, b: Branch, bIndex: number): void {
    const name = `${p.name}${bIndex}`;

    const nts: string[] = [];
    for (const e of b.elements) {
      if (e instanceof Term) {
        this.output.push(`this.expect("${e.value}");`);
        continue;
      }

      this.genElement(e);
      nts.push(e.as);
    }

    this.output.push(`return new ${name}(cursor, ${nts.join(", ")});`);
  }

  private genClass(name: string, b: Branch): void {
    this.output.push(`export class ${name} {`);

    const types = b.elements
      .map((b) => {
        if (b instanceof Term) return null;
        let type = b.name;
        if (b.nontermType === NontermType.MANY) type += "[]";
        else if (b.nontermType === NontermType.OPTIONAL) type += " | void";
        return `public ${b.as}: ${type}`;
      })
      .filter((b) => b)
      .join(", ");

    this.output.push(`constructor(public pos: number, ${types}) {}`);

    this.output.push(`static lookaheads(): string[] {`);
    const lookaheads = b.lookaheads.map((s) => `"${s}"`).join(", ");
    this.output.push(`return [${lookaheads}];`);
    this.output.push(`}`);

    this.output.push(`}`);
  }

  private genElement(e: Nonterm): void {
    if (e.nontermType === NontermType.MANY) {
      this.getElementMany(e);
    } else if (e.nontermType === NontermType.OPTIONAL) {
      this.getElementOptional(e);
    } else {
      this.getElementOnce(e);
    }
  }

  private getElementMany(e: Nonterm): void {
    let nextL = "";
    const branch = this.productions[e.name].branches[0];
    if (branch.elements[0] instanceof Term && branch.elements[0].value === ";")
      nextL = `, this.lookaheads["${(branch.elements[1] as Nonterm).name}"]`;

    // Create many
    this.output.push(`const ${e.as}: ${e.name}[] = [];`);
    this.output.push(
      `while(this.nextMatches(this.lookaheads["${e.name}"]${nextL})) {`
    );
    this.output.push(`${e.as}.push(this.create${e.name}());`);
    this.output.push(`}`);
  }

  private getElementOptional(e: Nonterm): void {
    let nextL = "";
    const branch = this.productions[e.name].branches[0];
    if (branch.elements[0] instanceof Term && branch.elements[0].value === ";")
      nextL = `, this.lookaheads["${(branch.elements[1] as Nonterm).name}"]`;

    // Create optional
    this.output.push(`let ${e.as}: ${e.name} | void = undefined;`);
    this.output.push(
      `if(this.nextMatches(this.lookaheads["${e.name}"]${nextL})) {`
    );
    this.output.push(`${e.as} = this.create${e.name}();`);
    this.output.push(`}`);
  }

  private getElementOnce(e: Nonterm): void {
    // Create once
    this.output.push(`const ${e.as} = this.create${e.name}();`);
  }

  private convertName(s: string): string {
    let o = "";

    let upperNext = true;
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);

      // If underline, set upperNext and skip
      if (c === "_") {
        upperNext = true;
        continue;
      }

      if (upperNext) o += c.toUpperCase();
      else o += c;

      upperNext = false;
    }

    return o;
  }

  private downcaseFirst(s: string): string {
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  private validate(): void {
    for (const k in this.productions) {
      const v = this.productions[k];
      for (const b of v.branches) {
        // Validate nonterms `as`occur only once
        // Validate every nonterm exists or is a real type
        const nts: string[] = [];
        for (const e of b.elements) {
          if (e instanceof Term) continue;
          // Validate nonterms `as`occur only once
          if (nts.includes(e.as))
            throw new Error(`Duplicate NT ${e.as} in ${v.name}`);
          nts.push(e.as);
          // Validate type exists
          if (
            e.name === "Type" ||
            e.name === "Number" ||
            e.name === "Id" ||
            e.name === "String"
          ) {
            e.name += "_";
            continue;
          }
          if (!Object.keys(this.productions).includes(e.name))
            throw new Error(`Unknown NT ${e.name}`);
        }
      }
    }
  }

  private fillLookaheads(a: void): void {
    // Run through each production
    for (const k in this.productions) {
      const v = this.productions[k];
      v.lookaheads = this.productionLookaheads(v);
    }
  }

  private productionLookaheads(p: Production): string[] {
    if (p.lookaheads.length > 0) return p.lookaheads;

    const l: string[] = [];

    for (const b of p.branches) {
      const lookaheads = this.branchLookaheads(b);
      b.lookaheads = lookaheads;
      for (const ls of lookaheads) {
        if (l.includes(ls))
          throw new Error(
            `Duplicated lookahead ${ls} of prod ${p.name} already have ${l}`
          );
        l.push(ls);
      }
    }

    return l;
  }

  private branchLookaheads(b: Branch): string[] {
    const first = b.elements[0];

    if (first instanceof Term) return [first.value];

    if (first.name === "Type_") return ["__TYPE"];
    if (first.name === "Number_") return ["__NUMBER"];
    if (first.name === "Id_") return ["__ID"];
    if (first.name === "String_") return ["__STRING"];

    return this.productionLookaheads(this.productions[first.name]);
  }

  private next(): string {
    // Skip whitespace
    const next = this.grammar.slice(this.cursor);
    const wsM = next.match(this.wsR);
    if (wsM) this.cursor += wsM[0].length;

    return this.grammar.slice(this.cursor);
  }

  private genProduction(): void {
    // Expect line matching productionR
    const productionM = this.next().match(this.productionR)!;
    this.cursor += productionM[0].length;
    const prodName = this.convertName(productionM[1]);

    const branches: Branch[] = [];
    // Get first line
    branches.push(this.getBranch());

    while (true) {
      const next = this.next();

      // If line starts with ;, skip and break
      if (next.startsWith(";")) {
        this.cursor++;
        break;
      }
      // Skip the first |
      this.cursor++;
      branches.push(this.getBranch());
    }

    const prod = new Production(prodName, branches);
    this.productions[prod.name] = prod;
  }

  private getBranch(): Branch {
    const elements: Element[] = [];

    while (true) {
      const next = this.next();
      // If starts with ; or |, break
      if (next.startsWith(";") || next.startsWith("|")) break;

      // Check if matches string
      const stringM = next.match(this.stringR);
      if (stringM) {
        // String matches
        this.cursor += stringM[0].length;
        // Note term
        this.terminals.push(stringM[1]);
        // Add string term
        elements.push(new Term(stringM[1]));
        // Continue
        continue;
      }

      // Must ID match
      const idM = next.match(this.idR);
      if (idM) {
        // ID matches
        this.cursor += idM[0].length;

        // Check if storing as something else
        let as = this.convertName(idM[0]);
        if (this.next().startsWith(":")) {
          this.cursor++;
          const asM = this.next().match(this.idR)!;
          this.cursor += asM[0].length;
          as = this.convertName(asM[0]);
        }

        // Check if next is ?
        let ntType = NontermType.ONE;
        if (this.next().startsWith("?")) ntType = NontermType.OPTIONAL;
        else if (this.next().startsWith("*")) ntType = NontermType.MANY;
        if (ntType !== NontermType.ONE) this.cursor++;

        elements.push(
          new Nonterm(this.convertName(idM[0]), this.downcaseFirst(as), ntType)
        );

        // Continue
        continue;
      }

      throw new Error("bad parse");
    }

    return new Branch(elements);
  }
}
