import { genericStringFunc } from "./languages/!shared";
import {
  isCharacterDigit,
  type LanguageSupport,
  type Lexer,
  type Token,
} from "./lexer";

export const DefaultLexerLanguage: LanguageSupport = {
  identifier: (lexer) => {
    if (!lexer.isAlpha() && lexer.current() != "_") return null;

    let str = "";

    while (
      (lexer.isAlpha() || lexer.current() === "_" || lexer.isDigit()) &&
      !lexer.isEOF()
    ) {
      str += lexer.next();
    }

    return [
      {
        str,
        type: "Identifier",
      },
    ];
  },
  number: (lexer) => {
    if (!lexer.isDigit() && lexer.current() != ".") return null;
    if (lexer.current() == "." && !isCharacterDigit(lexer.peek(1))) return null;

    let str = "";

    while ((lexer.current() === "." || lexer.isDigit()) && !lexer.isEOF()) {
      str += lexer.next();
    }

    return [
      {
        str,
        type: "Number",
      },
    ];
  },
  string: (lexer) => genericStringFunc(lexer, "'", '"'),
};
