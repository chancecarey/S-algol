export const program = `! Escher's Square Limit.  Adapted 2020

draw.scale(610, 410)

procedure mp(-> pic)
begin
  let i = nil; let it := nil
  it := nil; d.nl(it, 0, 3); d.nl(it, 3, 4); d.nl(it, 0, 8); d.nl(it, 0, 3); d.ad(it, i)
  it := nil; d.nl(it, 0, 3); d.nl(it, 3, 4); d.nl(it, 0, 8); d.nl(it, 0, 3); d.ad(it, i)
  it := nil; d.nl(it, 6, 0); d.nl(it, 4, 4); d.ad(it, i)
  it := nil; d.nl(it, 4, 5); d.nl(it, 7, 6); d.nl(it, 4, 10); d.nl(it, 4, 5); d.ad(it, i)
  it := nil; d.nl(it, 11, 0); d.nl(it, 10, 4); d.nl(it, 9, 6); d.nl(it, 8, 8); d.nl(it, 4, 13); d.nl(it, 0, 16); d.ad(it, i)
  it := nil; d.nl(it, 11, 0); d.nl(it, 14, 2); d.nl(it, 16, 2); d.ad(it, i)
  it := nil; d.nl(it, 10, 4); d.nl(it, 13, 5); d.nl(it, 16, 4); d.ad(it, i)
  it := nil; d.nl(it, 9, 6); d.nl(it, 12, 7); d.nl(it, 16, 6); d.ad(it, i)
  it := nil; d.nl(it, 8, 8); d.nl(it, 12, 9); d.nl(it, 16, 8); d.ad(it, i)
  it := nil; d.nl(it, 8, 12); d.nl(it, 16, 10); d.ad(it, i)
  it := nil; d.nl(it, 0, 16); d.nl(it, 5, 15); d.nl(it, 8, 16); d.ad(it, i)
  it := nil; d.nl(it, 8, 16); d.nl(it, 12, 12); d.nl(it, 16, 12); d.ad(it, i)
  it := nil; d.nl(it, 10, 16); d.nl(it, 12, 14); d.nl(it, 16, 13); d.ad(it, i)
  it := nil; d.nl(it, 12, 16); d.nl(it, 13, 15); d.nl(it, 16, 14); d.ad(it, i)
  it := nil; d.nl(it, 14, 16); d.nl(it, 16, 15); d.ad(it, i)
  scale i by 1/16, 1/16
end

procedure mq(-> pic)
begin
  let i = nil; let it := nil
  it := nil; d.nl(it, 0, 12); d.nl(it, 3, 13); d.nl(it, 5, 14); d.nl(it, 7, 15); d.nl(it, 8, 16); d.ad(it, i)
  it := nil; d.nl(it, 0, 0); d.nl(it, 0, 8); d.ad(it, i)
  it := nil; d.nl(it, 0, 12); d.nl(it, 0, 16); d.ad(it, i)
  it := nil; d.nl(it, 2, 16); d.nl(it, 3, 13); d.ad(it, i)
  it := nil; d.nl(it, 4, 16); d.nl(it, 5, 14); d.ad(it, i)
  it := nil; d.nl(it, 6, 16); d.nl(it, 7, 15); d.ad(it, i)
  it := nil; d.nl(it, 0, 10); d.nl(it, 7, 11); d.ad(it, i)
  it := nil; d.nl(it, 8, 15); d.nl(it, 11, 15); d.nl(it, 9, 13); d.nl(it, 8, 15); d.ad(it, i)
  it := nil; d.nl(it, 9, 12); d.nl(it, 12, 12); d.nl(it, 10, 10); d.nl(it, 9, 12); d.ad(it, i)
  it := nil; d.nl(it, 0, 8); d.nl(it, 4, 7); d.nl(it, 6, 7); d.nl(it, 8, 8); d.nl(it, 10, 9); d.nl(it, 12, 10); d.nl(it, 16, 16); d.ad(it, i)
  it := nil; d.nl(it, 4, 7); d.nl(it, 4, 5); d.nl(it, 2, 0); d.ad(it, i)
  it := nil; d.nl(it, 6, 7); d.nl(it, 6, 5); d.nl(it, 4, 0); d.ad(it, i)
  it := nil; d.nl(it, 8, 8); d.nl(it, 8, 5); d.nl(it, 6, 0); d.ad(it, i)
  it := nil; d.nl(it, 10, 9); d.nl(it, 10, 6); d.nl(it, 8, 0); d.ad(it, i)
  it := nil; d.nl(it, 14, 11); d.nl(it, 10, 0); d.ad(it, i)
  it := nil; d.nl(it, 12, 0); d.nl(it, 13, 4); d.nl(it, 16, 8); d.nl(it, 15, 10); d.nl(it, 16, 16); d.ad(it, i)
  it := nil; d.nl(it, 13, 0); d.nl(it, 16, 6); d.ad(it, i)
  it := nil; d.nl(it, 14, 0); d.nl(it, 16, 4); d.ad(it, i)
  it := nil; d.nl(it, 15, 0); d.nl(it, 16, 2); d.ad(it, i)
  scale i by 1/16, 1/16
end

procedure mr(-> pic)
begin
  let i = nil; let it := nil
  it := nil; d.nl(it, 0, 16); d.nl(it, 1, 14); d.nl(it, 2, 12); d.nl(it, 5, 10); d.nl(it, 8, 8); d.nl(it, 14, 6); d.nl(it, 16, 4); d.ad(it, i)
  it := nil; d.nl(it, 0, 12); d.nl(it, 1, 14); d.ad(it, i)
  it := nil; d.nl(it, 0, 8); d.nl(it, 2, 12); d.ad(it, i)
  it := nil; d.nl(it, 0, 4); d.nl(it, 5, 10); d.ad(it, i)
  it := nil; d.nl(it, 0, 0); d.nl(it, 8, 8); d.ad(it, i)
  it := nil; d.nl(it, 1, 1); d.nl(it, 4, 0); d.ad(it, i)
  it := nil; d.nl(it, 2, 2); d.nl(it, 8, 0); d.ad(it, i)
  it := nil; d.nl(it, 3, 3); d.nl(it, 8, 2); d.nl(it, 12, 0); d.ad(it, i)
  it := nil; d.nl(it, 5, 5); d.nl(it, 12, 3); d.nl(it, 16, 0); d.ad(it, i)
  it := nil; d.nl(it, 6, 16); d.nl(it, 11, 10); d.nl(it, 16, 6); d.ad(it, i)
  it := nil; d.nl(it, 11, 16); d.nl(it, 12, 12); d.nl(it, 16, 8); d.ad(it, i)
  it := nil; d.nl(it, 12, 12); d.nl(it, 16, 16); d.ad(it, i)
  it := nil; d.nl(it, 13, 13); d.nl(it, 16, 10); d.ad(it, i)
  it := nil; d.nl(it, 14, 14); d.nl(it, 16, 12); d.ad(it, i)
  it := nil; d.nl(it, 15, 15); d.nl(it, 16, 14); d.ad(it, i)
  scale i by 1/16, 1/16
end

procedure ms(-> pic)
begin
  let i = nil; let it := nil
  it := nil; d.nl(it, 0, 0); d.nl(it, 4, 2); d.nl(it, 8, 2); d.nl(it, 16, 0); d.ad(it, i)
  it := nil; d.nl(it, 0, 16); d.nl(it, 8, 16); d.ad(it, i)
  it := nil; d.nl(it, 12, 16); d.nl(it, 16, 16); d.ad(it, i)
  it := nil; d.nl(it, 2, 1); d.nl(it, 0, 4); d.ad(it, i)
  it := nil; d.nl(it, 0, 6); d.nl(it, 7, 4); d.ad(it, i)
  it := nil; d.nl(it, 0, 8); d.nl(it, 8, 6); d.ad(it, i)
  it := nil; d.nl(it, 0, 10); d.nl(it, 7, 8); d.ad(it, i)
  it := nil; d.nl(it, 0, 12); d.nl(it, 7, 10); d.ad(it, i)
  it := nil; d.nl(it, 0, 14); d.nl(it, 7, 13); d.ad(it, i)
  it := nil; d.nl(it, 8, 16); d.nl(it, 7, 13); d.nl(it, 7, 8); d.nl(it, 8, 6); d.nl(it, 10, 4); d.nl(it, 16, 0); d.ad(it, i)
  it := nil; d.nl(it, 10, 16); d.nl(it, 11, 10); d.ad(it, i)
  it := nil; d.nl(it, 12, 16); d.nl(it, 13, 13); d.nl(it, 15, 9); d.nl(it, 16, 8); d.ad(it, i)
  it := nil; d.nl(it, 13, 13); d.nl(it, 16, 14); d.ad(it, i)
  it := nil; d.nl(it, 14, 11); d.nl(it, 16, 12); d.ad(it, i)
  it := nil; d.nl(it, 15, 9); d.nl(it, 16, 10); d.ad(it, i)
  it := nil; d.nl(it, 12, 4); d.nl(it, 12, 7); d.nl(it, 10, 6); d.nl(it, 12, 4); d.ad(it, i)
  it := nil; d.nl(it, 15, 5); d.nl(it, 15, 8); d.nl(it, 13, 7); d.nl(it, 15, 5); d.ad(it, i)
  scale i by 1/16, 1/16
end

procedure rot(cpic p -> pic)
  shift rotate p by -90 by 1,0

procedure beside(cint m, n; cpic p, q -> pic)
begin
  let p1 = scale p by m / (m + n), 1
  let q1 = scale q by n / (m + n), 1
  let q2 = shift q1 by m / (m + n), 0
  
  d.ad(q2, p1)
  p1
end

procedure above(cint m, n; cpic p, q -> pic)
begin
  let p1 = scale p by 1, m / (m + n)
  let q1 = scale q by 1, n / (m + n)
  let p2 = shift p1 by 0, n / (m + n)
  
  d.ad(p2, q1)
  q1
end

procedure nonet(cpic p1, p2, p3, p4, p5, p6, p7, p8, p9 -> pic)
  above(1, 2, beside(1, 2, p1, beside(1, 1, p2, p3)),
    above(1, 1, beside(1, 2, p4, beside(1, 1, p5, p6)),
      beside(1, 2, p7, beside(1, 1, p8, p9))))

procedure quartet(cpic p1, p2, p3, p4 -> pic)
  above(1, 1, beside(1, 1, p1, p2), beside(1, 1, p3, p4))

procedure cycle(cpic p1 -> pic)
  quartet(p1, rot(rot(rot(p1))), rot(p1), rot(rot(p1)))

let p = mp
let q = mq
let r = mr
let s = ms

let t = quartet(p, q, r, s)
let u = cycle(rot(q))
let side1 = quartet(nil, nil, rot(t), t)
let side2 = quartet(side1, side1, rot(t), t)
let corner1 = quartet(nil, nil, nil, u)
let corner2 = quartet(corner1, side1, rot(side1), u)
let corner = nonet(corner2, side2, side2, rot(side2), u, rot(t), rot(side2), rot(t), rot(q))
let square.limit = cycle(corner)

draw.image(square.limit)
`;
