export const TokenTypes = [
  "Comment",
  "Keyword",
  "Identifier",
  "Type",
  "Number",
  "String",
  "Ignored",
  "Whitespace",
] as const;
export type TokenType = (typeof TokenTypes)[number];

export type Token = {
  str: string;
  type: TokenType;
};

export interface LanguageSupport {
  [key: string]: (lexer: Lexer) => Token[] | null;
}

export function isCharacterDigit(current: string): boolean {
  return /[0-9]/.test(current);
}

export function isCharacterAlpha(current: string): boolean {
  return current.toUpperCase() !== current.toLowerCase();
}

export function isCharacterWhite(current: string): boolean {
  return current.trim().length === 0;
}

export class Lexer {
  public input: string;

  public pos: number;

  public languageSupport: LanguageSupport;
  public lines: Array<Array<Token>>;
  public currentLine: Array<Token>;

  constructor(input: string, languageSupport: LanguageSupport) {
    this.pos = 0;
    this.languageSupport = languageSupport;

    this.lines = new Array();
    this.currentLine = new Array();

    // fix issue of code editors replacing tabs by spaces...
    /***
     * But seriously! there's a lot of idiotic editors that do this no matter what
     * this is a bad practice, tabs pretty much fix most issues because.. oh look, they're variable in size!
     * This function is a very basic algorithm that should undo the process VSCode does to replace tabs by spaces
     */
    this.input = input
      .split("\n")
      .map((v) => {
        if (v.startsWith("\t")) return v;
        let tabCount = 0;
        for (let i = 0; i < v.length && v[i] == " "; i++) {
          tabCount++;
        }
        return "\t".repeat(tabCount / 2) + v.trimStart();
      })
      .join("\n");
  }

  public current(): string {
    return this.input[this.pos] || "";
  }

  public next(): string {
    const cr = this.current();
    this.pos++;
    return cr;
  }

  public peek(distance: number) {
    return this.input[this.pos + distance] || "";
  }

  public isEOF(): boolean {
    return this.pos > this.input.length;
  }

  public isDigit(): boolean {
    return isCharacterDigit(this.current());
  }

  public isAlpha(): boolean {
    return isCharacterAlpha(this.current());
  }

  public isWhite(): boolean {
    return isCharacterWhite(this.current());
  }

  /***
   * Returns an actual line array of tokens;
   */
  public tokenize() {
    const append = (...args: Token[]) => {
      for (let arg of args) {
        if (arg.str.includes("\n")) {
          let lines = arg.str.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const tokenStr = lines[i];
            const token: Token = { str: tokenStr, type: arg.type };

            this.currentLine.push(token);

            // If not the last line, push currentLine and start a new one
            if (i < lines.length - 1) {
              this.lines.push(this.currentLine);
              this.currentLine = [];
            }
          }
        } else {
          this.currentLine.push(arg);
        }
      }
    };
    const consumeWhitespace = () => {
      if (this.isWhite() && !this.isEOF()) {
        let str = "";
        while (this.isWhite() && !this.isEOF()) str += this.next();
        append({ str, type: "Whitespace" });
      }
    };
    while (this.pos < this.input.length) {
      consumeWhitespace();
      let foundMatch = false;
      for (const langFunc of Object.entries(this.languageSupport)) {
        let rt = langFunc[1](this);

        if (rt) {
          append(...rt);
          foundMatch = true;
          break;
        }
      }

      if (foundMatch) continue;

      if (!this.isEOF())
        append({
          str: this.next(),
          type: "Ignored",
        });
    }

    this.lines.push(this.currentLine);
    return this.lines.map((v) => {
      if (v.length > 1 && v[0].str.length == 0) v.shift();
      return v;
    });
  }
}
