import { DefaultLexerLanguage } from "../defaultLang";
import type { LanguageSupport, Token } from "../lexer";
import { CStyleComments } from "./!shared";

export const AshenLanguage: LanguageSupport = {
  ...DefaultLexerLanguage,
  types: (lexer) => {
    if (lexer.current() != ":") return null;
    let tokens: Token[] = [{ str: lexer.next(), type: "Identifier" }];

    while (lexer.isWhite() && !lexer.isEOF()) tokens[0].str += lexer.next();

    let next = DefaultLexerLanguage["identifier"](lexer);
    if (next) {
      if (next[0]) next[0].type = "Type";
      return tokens.concat(next);
    }
    return tokens;
  },
  runes: (lexer) => {
    if (lexer.current() != '@') return null;
    var txt = lexer.next();

    while ((lexer.isAlpha() || lexer.isDigit() || lexer.current() == '_')&& !lexer.isEOF())
      txt += lexer.next();
    
    return [
      {
        str: txt,
        type: "Marker"
      }
    ];
  },
  identifier: (lexer) => {
    let rt = DefaultLexerLanguage["identifier"](lexer);
    if (rt) {
      rt.forEach((v) =>
        keywords.includes(v.str)
          ? (v.type = "Keyword")
          : values.includes(v.str)
            ? (v.type = "Number")
            : "",
      );
    }
    return rt;
  },
  comment: CStyleComments,
};

const values = ["this", "null", "false", "true"];

const keywords = [
  "const",
  "let",
  "var",
  "abstract",
  "proc",
  "extern",
  "import",
  "new",
  "alloc",
  "if",
  "instanceof",
  "then",
  "else",
  "while",
  "do",
  "for",
  "in",
  "as",
  "return",
  "struct",
  "case",
  "default",
  "break",
  "continue",
  "sizeof",
  "#if",
  "#else",
  "#end",
];
