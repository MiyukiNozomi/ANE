import { DefaultLexerLanguage } from "../defaultLang";
import type { LanguageSupport } from "../lexer";
import { setIfBoolean } from "./!shared";

export const JSONLanguage: LanguageSupport = {
  ...DefaultLexerLanguage,
  identifier: (lexer) => {
    const rt = DefaultLexerLanguage["identifier"](lexer);
    if (rt) {
      rt.forEach((v) => setIfBoolean(v));
    }
    return rt;
  },
};
