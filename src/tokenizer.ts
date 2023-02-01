export class Tokenizer {
    public text: string = "";
    public pos: number = 0;
    constructor(text: string) {
        this.text = text;
    }
    getNext(): string {
        return this.getToken().text;        
    }
    getToken(): TokenData {
        // Remove leading whitespace
        if (this.text[this.pos] == " ") while (this.pos < this.text.length && this.text[++this.pos] === " ") { }
        // Scan single character tokens
        switch (this.text[this.pos]) {
            case ";": {
                return new TokenData(Token.Semi, this.text.slice(this.pos, ++this.pos));
            }
            case "=": {
                return new TokenData(Token.Equals, this.text.slice(this.pos, ++this.pos));
            }
            case "\n": {
                return new TokenData(Token.EOF, "");
            }
        }
        if (this.pos > this.text.length) {
            return new TokenData(Token.EOF, "");
        }
        // Scan multi-character tokens
        const start = this.pos;
        let data = this.text[this.pos];
        if (data == "\"") {
            while (this.text[++this.pos] != "\"") { }
            return new TokenData(Token.String, this.text.slice(start, ++this.pos));
        } else {
            while (this.pos < this.text.length && this.text[++this.pos] != " ") { }
            return new TokenData(Token.Identifier, this.text.slice(start, this.pos));
        }
    }
}

export class TokenData {
    public text: string;
    public token: Token;
    constructor(token: Token, text: string) {
        this.token = token;
        this.text = text;
    }
}

export enum Token {
    Identifier,
    Number,
    String,
    Semi,
    Equals,
    EOF
}