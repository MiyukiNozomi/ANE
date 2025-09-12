import type { LanguageSupport } from "../lexer";
import { SUPPORTED_LANGUAGES_BY_EXTENSION } from "$lib/shared/constants";
import { TypeScriptLanguage } from "./typescript";
import { JSONLanguage } from "./json";

// personally i believe this is pretty clever
// it lets me map the same language mappings from the file viewer into a record without
// loosing type safety inside of the constant, while also being able to look through it with any string.
export const Languages: Partial<Record<string, LanguageSupport>> = {
  ts: TypeScriptLanguage,
  json: JSONLanguage,
  tsconfig: JSONLanguage,
} satisfies Partial<
  Record<keyof typeof SUPPORTED_LANGUAGES_BY_EXTENSION, LanguageSupport>
>;
