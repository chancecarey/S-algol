import jsBeautify from "js-beautify";
import React, { useEffect, useState } from "react";
import { Analyzer, AnalyzerError } from "./compiler/analyzer/analyzer";
import { CodeGen } from "./compiler/codegen/codegen";
import { forwards } from "./compiler/codegen/forwards";
import { prelude } from "./compiler/codegen/prelude";
import { program as escherS } from "./compiler/examples/escher.S";
import { Parser, Program } from "./compiler/parser/parser";
import { EditorPort } from "./components/Editor";
import { Image } from "./components/Image";
import { Menu } from "./components/Menu";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-eval */

export type ImageType = [[number, number], [number, number]][];

const genAST = (
  program: string
): { ast: Program } | { error: string; pos: number } => {
  try {
    const p = new Parser(program);
    return { ast: p.parse() };
  } catch (e) {
    return { error: e.message, pos: e.pos };
  }
};

const typeCheck = (
  ast: Program
): { error: string; pos: number } | undefined => {
  try {
    const a = new Analyzer(ast);
    a.run();
  } catch (e) {
    if (e instanceof AnalyzerError) return { error: e.message, pos: e.pos };
    throw e;
  }
};

const genCode = (ast: Program) => {
  const cg = new CodeGen(ast);
  const code = cg.generate();
  const prettyCode = jsBeautify.js_beautify(code);
  return prettyCode;
};

const prettyError = (code: string, msg: string, pos: number): string => {
  const lineNum = code.slice(0, pos).split("\n").length;

  return `Error on line ${lineNum}: ${msg}`;
};

export const App = () => {
  const [programCode, setProgramCode] = useState(escherS);
  const [errMsg, setErrMsg] = useState("");
  const [output, setOutput] = useState("");
  const [img, setImg] = useState<ImageType>([]);
  (window as any).setImg = (i: any) => setImg(i);

  const compile = (includePrelude: boolean, pCode = programCode) => {
    setErrMsg("");
    setOutput("");
    setImg([]);

    const ast = genAST(forwards + pCode);

    if ("error" in ast)
      setErrMsg(prettyError(programCode, ast.error, ast.pos - forwards.length));
    else {
      const typeCheckErr = typeCheck(ast.ast);
      if (typeCheckErr)
        setErrMsg(
          prettyError(
            programCode,
            typeCheckErr.error,
            typeCheckErr.pos - forwards.length
          )
        );
      else {
        const code = (includePrelude ? prelude : "") + genCode(ast.ast);
        if (!includePrelude) setOutput(code);
        return code;
      }
    }
  };

  const compileAndRun = () => {
    const code = compile(true);
    if (code) {
      (window as any).olog = [];
      eval(code);
      const output_log = (window as any).olog;
      const out = output_log.join("\n");
      setOutput(out);
    }
  };

  const setAndCompile = (program: string) => {
    setProgramCode(program);
    // Have to pass in program as setProgramCode is delayed
    compile(false, program);
  };

  const loadFile = () => {
    const input = document.createElement("input");
    const handleFiles = () => {
      if (!input.files) return;
      const reader = new FileReader();
      reader.onload = () => setAndCompile(reader.result as any);
      reader.readAsText(input.files[0]);
      input.remove();
    };

    input.type = "file";
    input.addEventListener("change", handleFiles);
    input.click();
  };
  const saveFile = () => {
    const blob = new Blob([programCode], { type: "text/s-algol" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "program.S";
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    compile(false);
  }, []);

  return (
    <div className="h-screen grid grid-cols-3">
      <div className="col-span-3">
        <Menu
          {...{ loadFile, saveFile, compile, compileAndRun, setAndCompile }}
        />
      </div>

      <div className="col-span-2 border-r">
        <EditorPort {...{ programCode, setProgramCode }} />
      </div>

      <div className="overflow-y-scroll">
        {errMsg.length > 0 ? (
          <pre className="m-2 p-2 bg-red-400 text-white font-semibold">
            {errMsg}
          </pre>
        ) : (
          <div className="m-2 p-2 bg-green-400 text-white font-semibold">
            Success
          </div>
        )}
        {img.length > 0 && (
          <div className="m-2">
            <Image image={img} />
          </div>
        )}
        {output.length > 0 && (
          <pre className="m-2 p-2 bg-gray-100">{output}</pre>
        )}
      </div>
    </div>
  );
};
