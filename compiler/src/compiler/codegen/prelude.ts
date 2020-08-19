export const prelude = `
const write = (...args) => window.olog.push(args.join(""));
const reads = () => prompt("Program requests string input");
const readi = () => parseInt(prompt("Program requests integer input"));
const upb = of => Math.max(...Object.keys(of).map(k=>parseInt(k)));
const lwb = of => Math.min(...Object.keys(of).map(k=>parseInt(k)));

const reads_prompt = p => prompt(p);
const readi_prompt = p => parseInt(prompt(p));
const dump = o => console.log(o);


// GRAPHICS
window._adc_wm = 20;
window._adc_hm = 15;
const draw_scale = (x, y) => {
  window._adc_wm = x;
  window._adc_hm = y;
}

const draw_line = (image, x1, y1, x2, y2) => image.push([[x1, y1], [x2, y2]]);
const draw_image = image => {
  image.forEach(line => {
    line[0][0] *= window._adc_wm;
    line[1][0] *= window._adc_wm;
    line[0][1] *= window._adc_hm;
    line[1][1] *= window._adc_hm;
  });
  window.setImg(image);
}

const d_nl = (pic, x, y) => {
  if (pic.length === 0) pic.push([[x, y], [x, y]]);
  else {
    const last = pic[pic.length - 1];
    pic.push([[last[1][0], last[1][1]], [x, y]]);
  }
};
const d_ad = (from, to) => to.push(...from.map(line=>[
  [line[0][0], line[0][1]],
  [line[1][0], line[1][1]]
]));
const _rotate_point = (angle_r, x, y) => {
  const c = Math.cos(angle_r);
  const s = Math.sin(angle_r);
  return [c * x + s * y, c * y - s * x];
}
const _d_ro = (pic, angle) => {
  const angle_r = (Math.PI / 180) * angle;
  return pic.map(line => [
    _rotate_point(angle_r, line[0][0], line[0][1]),
    _rotate_point(angle_r, line[1][0], line[1][1])
  ]);
};
const _d_sh = (pic, x, y) => pic.map(line => [
  [line[0][0] + x, line[0][1] + y],
  [line[1][0] + x, line[1][1] + y]
]);
const _d_sc = (pic, x, y) => pic.map(line => [
  [line[0][0] * x, line[0][1] * y],
  [line[1][0] * x, line[1][1] * y]
]);
`;
