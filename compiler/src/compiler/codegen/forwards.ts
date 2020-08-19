export const forwards = `
forward reads.prompt(string -> string)
forward readi.prompt(string -> int)
forward draw.scale(int, int)
forward draw.line(#pixel, int, int, int, int)
forward draw.image(#pixel)

forward d.nl(#pixel, int, int)
forward d.ad(#pixel, #pixel)
`;
