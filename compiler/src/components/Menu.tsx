import React from "react";
import { program as escherS } from "../compiler/examples/escher.S";
import { program as fastS } from "../compiler/examples/fast.S";
import { program as testS } from "../compiler/examples/tests.S";

const Button = (props: { clicked: () => void; text: string }) => (
  <div
    onClick={props.clicked}
    className="px-2 m-1 py-1 border rounded cursor-pointer hover:bg-gray-100"
  >
    {props.text}
  </div>
);

export const Menu = (props: {
  loadFile: () => void;
  saveFile: () => void;
  compile: (includePrelude: boolean) => void;
  compileAndRun: () => void;
  setAndCompile: (prog: string) => void;
}) => {
  const preloadedFiles = [
    ["tests.S", testS],
    ["fast.S", fastS],
    ["escher.S", escherS],
  ];

  return (
    <div className="border-b px-5 flex">
      <div className="p-2 font-semibold">S-algol Compiler</div>
      <div className="pl-5 flex">
        {preloadedFiles.map((item) => (
          <Button
            key={item[0]}
            clicked={() => props.setAndCompile(item[1])}
            text={`Load ${item[0]}`}
          />
        ))}
        <Button clicked={() => props.loadFile()} text="Load file" />
        <Button clicked={() => props.saveFile()} text="Save file" />
        <Button clicked={() => props.compile(false)} text="Compile" />
        <Button clicked={() => props.compileAndRun()} text="Run" />
      </div>
    </div>
  );
};
