import { DefaultLexerLanguage } from "./defaultLang";
import { Languages } from "./languages/!index";
import { Lexer } from "./lexer";

export async function doHighlighting(ext: string, sourceText: string) {
  let lang = Languages[ext] ?? DefaultLexerLanguage;

  const tokenizer = new Lexer(sourceText, lang);

  return tokenizer.tokenize();
}
