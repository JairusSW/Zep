export class Tokenizer {
    constructor(text) {
        this.text = "";
        this.pos = 0;
        this.text = text;
    }
    getNext() {
        return this.getToken().text;
    }
    getToken() {
        // Remove leading whitespace
        if (this.text[this.pos] == " ")
            while (this.pos < this.text.length && this.text[++this.pos] === " ") { }
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
        }
        else {
            while (this.pos < this.text.length && this.text[++this.pos] != " ") { }
            return new TokenData(Token.Identifier, this.text.slice(start, this.pos));
        }
    }
}
export class TokenData {
    constructor(token, text) {
        this.token = token;
        this.text = text;
    }
}
export var Token;
(function (Token) {
    Token[Token["Identifier"] = 0] = "Identifier";
    Token[Token["Number"] = 1] = "Number";
    Token[Token["String"] = 2] = "String";
    Token[Token["Semi"] = 3] = "Semi";
    Token[Token["Equals"] = 4] = "Equals";
    Token[Token["EOF"] = 5] = "EOF";
})(Token = Token || (Token = {}));
