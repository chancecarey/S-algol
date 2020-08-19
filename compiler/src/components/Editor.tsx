import { ControlledEditor, monaco } from "@monaco-editor/react";
import React from "react";
import "./EditorStyles.css";

// Add syntax highlighting for S-algol
monaco.init().then((m) => {
  m.languages.register({ id: "salgol" });
  m.languages.setMonarchTokensProvider("salgol", {
    keywords: [
      "abort",
      "and",
      "at",
      "begin",
      "by",
      "c",
      "case",
      "cursor",
      "default",
      "do",
      "else",
      "end",
      "eof",
      "epsilon",
      "false",
      "for",
      "forward",
      "from",
      "i.w",
      "if",
      "in",
      "let",
      "limit",
      "lwb",
      "maxint",
      "maxreal",
      "nil",
      "nullfile",
      "of",
      "off",
      "on",
      "onto",
      "or",
      "out.16",
      "out.32",
      "out.byte",
      "output",
      "peek",
      "pi",
      "procedure",
      "r.w",
      "read",
      "read.16",
      "read.32",
      "read.a.line",
      "read.byte",
      "read.name",
      "readb",
      "readi",
      "readr",
      "reads",
      "repeat",
      "rotate",
      "s.i",
      "s.o",
      "s.w",
      "scale",
      "screen",
      "shift",
      "structure",
      "text",
      "then",
      "to",
      "true",
      "upb",
      "vector",
      "while",
      "write",
    ],

    typeKeywords: [
      "cint",
      "creal",
      "cbool",
      "cstring",
      "cpixel",
      "cpic",
      "cpntr",
      "cfile",
      "c#pixel",
      "c#cpixel",
      "colour",
      "#cpixel",
      "#pixel",
      "bool",
      "file",
      "image",
      "pic",
      "pixel",
      "pntr",
      "real",
      "int",
      "string",
    ],

    operators: [
      "&",
      "*",
      "+",
      "++",
      ",",
      "-",
      "->",
      "/",
      ":",
      "::",
      ":=",
      ";",
      "=",
      "~=",
      "<",
      "<=",
      ">",
      ">=",
      "@",
      "^",
      "~",
      "copy",
      "nand",
      "nor",
      "not",
      "rand",
      "ror",
      "xnor",
      "xor",
      "div",
      "rem",
      "is",
      "isnt",
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
      root: [
        // identifiers and keywords
        [
          /[\w.]+/,
          {
            cases: {
              "@typeKeywords": "keyword",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],

        // whitespace
        { include: "@whitespace" },

        // delimiters and operators
        [/[{}()[]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

        // @ annotations.
        // Note: message are supressed during the first load -- change some lines to see them.
        [/@\s*[\w.]+/, { token: "annotation" }],

        // numbers
        [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],

        // delimiter: after number because of .\d floats
        [/[;,.]/, "delimiter"],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        // characters
        [/'[^\\']'/, "string"],
        [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
        [/'/, "string.invalid"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/!.*$/, "comment"],
      ],
    },
  });
});

export const EditorPort = (props: {
  programCode: string;
  setProgramCode: (to: string) => void;
}) => (
  <ControlledEditor
    value={props.programCode}
    onChange={(_, v) => props.setProgramCode(v as string)}
    language="salgol"
  />
);
