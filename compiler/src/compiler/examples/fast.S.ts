export const program = `! Fast Murray Polygon.  4/11/87.  Adapted 2020
! Click run at the top, and use values 2, 2, 3, 5, 5, 5

procedure change.parities(*bool p; int start)
begin
    for i = start to 1 by -2 do p(i) := ~p(i)
end

procedure increment(*int d, r; int i -> int)
begin
    if d(i) < r(i) - 1 then {d(i) := d(i) + 1; i}
    else {d(i) := 0; increment(d, r, i + 1)}
end

procedure get.rads(*int digits, radices; int x.rad, y.rad)
begin
    for i = 1 to 2 * x.rad by 2 do radices(i) := readi.prompt("X radices")
    for i = 2 to 2 * y.rad by 2 do radices(i) := readi.prompt("Y radices")
end 

procedure number.pts(*int r; int start, inc -> int)
begin
    let res := 1
    for j = start to upb(r) - 1 by inc do res := res * r(j)
    res 
end 

let x.rad = readi.prompt("Number of X radices")
let y.rad = readi.prompt("Number of Y radices")

let max.rad = if x.rad > y.rad then x.rad else y.rad
let complexity = 2 * max.rad
let digits = vector 1 :: complexity + 1 of 0
let radices = vector 1 :: complexity + 1 of 1
let parities = vector 1 :: complexity + 1 of true

get.rads(digits, radices, x.rad, y.rad)
let no.pts := number.pts(radices, 1, 1)
let nx := number.pts(radices, 1, 2)
let ny := number.pts(radices, 2, 2)

let width = if nx > ny then nx else ny
let x1 := 0
let y1 := 0
let x2 := 0
let y2 := 0
let next.seg := nil

for itr = 1 to no.pts - 1 do
begin
    let i = increment(digits, radices, 1)
    change.parities(parities, i)
    let inc = if parities(i + 1) then 1 else -1
    if i rem 2 = 1 then x2 := x2 + inc else y2 := y2 + inc
    draw.line(next.seg, x1, y1, x2, y2)
    if i rem 2 = 1 then x1 := x2 else y1 := y2
end
draw.image(next.seg)
`;
