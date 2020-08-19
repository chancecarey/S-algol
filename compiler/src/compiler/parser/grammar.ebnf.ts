export const SAlgolGrammar = `

program =
  sequence
;

sequence =
  sequence_el sequence_follow* 
;

sequence_follow = 
  ";" sequence_el
;

sequence_el =
  declaration
| clause 
;

declaration =
  let_decl
| structure_decl
| proc_decl
| forward 
;

let_decl =
  "let" identifier init_op clause
;

init_op =
  "="
| ":=" 
;

structure_decl =
  "structure" identifier structure_decl_fields?
;

structure_decl_fields =
  "(" field_list? ")"
;

field_list =
  field_list_el field_list_follow* 
;

field_list_follow =
  ";" field_list_el
;

field_list_el = 
  type identifier_list 
;

proc_decl =
  "procedure" identifier proc_decl_type? ";" clause 
;

proc_decl_type =
  "(" parameter_list? return_typex? ")"
;

parameter_list =
  parameter parameter_list_follow* 
;

parameter_list_follow =
  ";" parameter
;

parameter =
  type identifier_list
| structure_decl
| proc_type identifier_list 
;

proc_type =
  "(" ptype_list? return_typex? ")" 
;

return_typex =
  "->" type
;

ptype_list =
  ptype_list_el ptype_list_follow*
;

ptype_list_follow =
  "," ptype_list_el
;

ptype_list_el =
  type
| proc_type
| s_decl 
;

s_decl =
  "structure" "(" type s_decl_follow* ")" 
;

s_decl_follow =
  "," type
;

forward =
  "forward" identifier proc_type?
;

identifier_list =
  identifier identifier_list_follow* 
;

identifier_list_follow =
  "," identifier
;

clause =
  "if" clause if_clause_then
| "repeat" clause:repeat "while" clause:whilex clause_do?
| "while" clause:whilex "do" clause:dox
| "for" identifier "=" clause:from "to" clause:to clause_by? "do" clause:dox
| "case" clause:casex "of" case_list "default" ":" clause:defaultx
| "abort"
| write_clause
| raster
| expression clause_expr_follow?
;

clause_do =
  "do" clause
;

clause_by =
  "by" clause
;

clause_expr_follow =
  ":=" clause
;

if_clause_then =
  "do" clause
| "then" clause:then "else" clause:elsex 
;

case_list =
  case_list_el case_list_follow* 
;

case_list_follow =
  ";" case_list_el
;

case_list_el = 
  clause_list ":" clause
;

write_clause =
  "write" write_list
| "output" clause "," write_list
| "out.byte" clause "," clause:b "," clause:c
| "out.16" clause "," clause:b "," clause:c
| "out.32" clause "," clause:b 
;

write_list =
  write_list_el write_list_follow* 
;

write_list_follow =
  "," write_list_el
;

write_list_el =
  clause write_list_el_follow?
;

write_list_el_follow =
  ":" clause
;

raster =
  raster_op clause:thisx "onto" clause:that 
;

raster_op =
  "ror"
| "rand"
| "xor"
| "copy"
| "nand"
| "nor"
| "not"
| "xnor" 
;

clause_list =
  clause clause_list_follow* 
;

clause_list_follow =
  "," clause
;

expression =
  exp1 expression_follow* 
;

expression_follow =
  "or" exp1
;

exp1 =
 exp2 exp1_follow* 
;

exp1_follow =
  "and" exp2
;

exp2 =
  exp2_tilde exp3 exp2_op* 
| exp3 exp2_op* 
;

exp2_tilde =
  "~"
;

exp2_op =
  rel_op exp3
;

exp3 =
  exp4 exp3_op* 
;

exp3_op =
  add_op exp4
;

exp4 =
  exp5 exp4_op* 
;

exp4_op =
  mult_op exp5
;

exp5 =
  add_op exp6 exp5_follow* 
| exp6 exp5_follow* 
;

exp5_follow =
  "(" expression_arg ")"
;

expression_arg =
  clause expression_arg_follow?
;

expression_arg_follow =
  "|" clause
| "," clause_list 
;

exp6 =
  "(" clause ")"
| "begin" sequence? "end"
| "{" sequence? "}"
| standard_exp
| literal
| value_constructor
| identifier 
;

value_constructor =
  vector_constr
| image_constr
| subimage_constr
| picture_constr 
;

vector_constr =
  "vector" range "of" clause
| "@" clause "of" type "[" clause:b vector_constr_follow* "]" 
;

vector_constr_follow =
  "," clause
;

range =
  range_el range_follow* 
;

range_follow =
  "," range_el
;

range_el =
  clause:a "::" clause:b
;

image_constr =
  "image" clause:image "by" clause:by "of" clause:of
;

subimage_constr =
  "limit" clause subimage_constr_mid? subimage_constr_end?
;

subimage_constr_mid =
  "to" clause:to "by" clause:by
;

subimage_constr_end =
  "at" clause:at1 "," clause:at2
;

picture_constr =
  "shift" clause "by" clause:b "," clause:c
| "scale" clause "by" clause:b "," clause:c
| "rotate" clause "by" clause:b
| "colour" clause "in" clause:b
| "text" clause "from" clause:b "," clause:c "to" clause:d "," clause:e
| "[" clause "," clause:b "]" 
;

literal =
  "nil"
| "nullfile"
| integer_literal
| boolean_literal
| string
| pixel_literal 
;

integer_literal =
  number 
;

boolean_literal =
  "true"
| "false" 
;

pixel_literal =
  "on" pixel_literal_follow?
| "off" pixel_literal_follow?
;

pixel_literal_follow =
  "&" pixel_literal
;

add_op =
  "+"
| "-" 
;

mult_op =
  "++"
| "div"
| "rem"
| "*"
| "/"
| "^"
| "&" 
;

rel_op =
  eq_op
| compar_op
| type_op 
;

eq_op =
  "="
| "~=" 
;

compar_op =
  "<="
| "<"
| ">="
| ">" 
;

type_op =
  "is"
| "isnt" 
;

identifier =
  id
| standard_id 
;

standard_exp =
  standard_name 
;

standard_name =
  "upb"
| "lwb"
| "eof"
| "read.a.line"
| "read"
| "readi"
| "readr"
| "readb"
| "peek"
| "reads"
| "read.name"
| "read.byte"
| "read.16"
| "read.32" 
;

standard_id =
  "r.w"
| "i.w"
| "s.w"
| "s.o"
| "s.i"
| "maxint"
| "maxreal"
| "epsilon"
| "pi"
| "cursor"
| "screen" 
;
`;
