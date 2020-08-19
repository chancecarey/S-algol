export const program = `! S-algol Javascript Compiler (2020)

!! CURRENTLY SUPPORTED FEATURES
!! ============================
!! Function definition (+nested), calling, with/without parameters
!! Variable assignment, reassignment, lookup
!! Control flow: IF, WHILE, FOR, CASE
!! Structure creation, modification, lookup
!! Type 1 vector creation with upb/lwb, assignment, lookup
!! Vector graphics
!! Basic IO

!! STDLIB
!! ======
!! write(...args)                            Write to REPL output
!! reads(->string)                           Read string from user
!! readi(->int)                              Read int from user
!! upb(->int)                                Get upper bound of vector
!! lwb(->int)                                Get lower bound of vector

!! reads.prompt(string->string)              Prompt user for string input
!! readi.prompt(string->int)                 Prompt user for int input
!! draw.scale(int, int)                      Set the canvas scale
!! draw.line(#pixel, int, int, int, int)     Draw a line on a picture
!! draw.image(#pixel)                        Render the picture
!! d.nl(#pixel, int, int)                    Add a point to an image
!! d.ad(#pixel, #pixel)                      Merge two images
!! dump(nonvoid)                             Dump object to browser console



! Test while control flow
procedure while.test(-> int)
begin
     let x := 13
     while x < 20 do x := x + 1
     x
end
write "test while, expect 20 -> ", while.test



! Test vectors
procedure gen.vector(-> *int)
begin
     let v := vector 1 :: 10 of 1
     v(5) := 5
     v
end
procedure vector.access.test(-> int)
begin
     let v := gen.vector
     v(1) + v(5)
end
write "test vector access, expect 6 -> ", vector.access.test



! Test structures
structure some.struct(bool works; int count)
procedure struct.int.test(-> int)
begin
     let s := some.struct(true, 10)
     s(count)
end
procedure struct.bool.test(-> bool)
begin
     let s := some.struct(true, 10)
     s(works)
end
procedure struct.assign.test(-> int)
begin
     let s := some.struct(true, 10)
     s(count) := 20
     s(count)
end
write "test struct int, expect 10 -> ", struct.int.test
write "test struct bool, expect true -> ", struct.bool.test
write "test struct assign, expect 20 -> ", struct.assign.test



! Test if control flow
procedure if.test(int x -> int)
begin
     if x < 20 then x else x + 1
end
write "test if, expect 10 -> ", if.test(10)
write "test if, expect 21 -> ", if.test(20)



! Test for control flow
procedure for.test(-> int)
begin
     let x := 0
     for y = 0 to 10 by 2 do x := x + 1
     x
end
write "test for, expect 6 -> ", for.test



! Test case control flow
procedure case.test(string x -> int)
     case x of 
     "1": 3
     "2": 2
     "3": 1
     default: 4
write "test case, expect 3 -> ", case.test("1")
write "test case, expect 2 -> ", case.test("2")
write "test case, expect 1 -> ", case.test("3")
write "test case, expect 4 -> ", case.test("10")



! Test function calls and nesting control flow
procedure returns.3(->int)
     3
procedure returns.inner.call(->int)
begin
     procedure ret(->int); returns.3
     ret
end
write "test calls, expect 3 -> ", returns.inner.call`;
