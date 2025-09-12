import { Lexer, type Token } from "../lexer";

export function CStyleComments(lexer: Lexer): Token[] | null {
  if (lexer.current() != "/") return null;
  if (lexer.peek(1) != "/" && lexer.peek(1) != "*") return null;

  let isMultiline = lexer.peek(1) == "*";
  let str = lexer.next() + lexer.next();

  if (isMultiline) {
    while (!lexer.isEOF()) {
      if (lexer.current() == "*" && lexer.current() == "/") {
        str += lexer.next() + lexer.next();
        break;
      }
      str += lexer.next();
    }
  } else {
    while (!lexer.isEOF()) {
      if (lexer.current() == "\n") {
        str += lexer.next();
        break;
      }
      str += lexer.next();
    }
  }

  return [
    {
      type: "Comment",
      str,
    },
  ];
}

export function genericStringFunc(
  lexer: Lexer,
  ...startCh: string[]
): Token[] | null {
  if (!startCh.find((v) => v == lexer.current())) return null;
  const start = lexer.next();

  let str = start;

  while (lexer.current() != start && !lexer.isEOF()) {
    if (lexer.current() == "\\") str += lexer.next();
    if (!lexer.isEOF()) str += lexer.next();
  }

  str += lexer.next();

  return [{ str, type: "String" }];
}

export function setIfBoolean(token: Token, caseInsentive = false) {
  const str = caseInsentive ? token.str.toLowerCase() : token.str;
  if (str == "true" || str == "false") token.type = "Type";
  return token;
}
