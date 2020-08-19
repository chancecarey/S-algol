import React, { useEffect, useRef } from "react";
import { ImageType } from "../App";

export const Image = (props: { image: ImageType }) => {
  // Reference to canvas objec
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update canvas when the image changes
  useEffect(() => {
    // Fetch reference
    const c = canvasRef.current!;
    // Get 2d context
    const ctx = c.getContext("2d")!;

    // Clear existing
    ctx.clearRect(0, 0, c.width, c.height);
    // Prep for path work
    ctx.beginPath();
    // Draw lines between coords
    for (const el of props.image) {
      ctx.moveTo(el[0][0], el[0][1]);
      ctx.lineTo(el[1][0], el[1][1]);
    }
    // Stroke line
    ctx.stroke();
  }, [props.image]);

  return <canvas width="600" height="400" ref={canvasRef} />;
};
