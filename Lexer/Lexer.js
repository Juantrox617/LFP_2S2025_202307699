import { Token, ReservedWords } from "../Token/token.js";
import { Error } from "../Error/Error.js";

export class Lexer {
    constructor(texto) {
        this.texto = texto;
        this.pos = 0;
        this.linea = 1;
        this.columna = 1;
        this.tokens = [];
        this.errors = [];
        this.recorrido = [];
    }

    avanzar() {
        this.pos++;
        this.columna++;
    }

    analizar() {
        while (this.pos < this.texto.length) {
            let char = this.texto[this.pos];

            if (char === " " || char === "\t") { this.avanzar(); continue; }
            if (char === "\n") { this.linea++; this.columna = 1; this.avanzar(); continue; }

            if (this.esLetra(char)) {
                this.recorrerIdentificador();
                continue;
            }

            if (this.esDigito(char)) {
                this.recorrerNumero();
                continue;
            }

            if (char === '"') {
                this.recorrerCadena();
                continue;
            }

            if (char === "'") {
                this.recorrerCaracter();
                continue;
            }

            if (char === "/" && this.texto[this.pos + 1] === "/") {
                this.recorrerComentarioLinea();
                continue;
            }

            if (char === "/" && this.texto[this.pos + 1] === "*") {
                this.recorrerComentarioBloque();
                continue;
            }

            if (this.esSimbolo(char)) {
                this.recorrerSimbolo();
                continue;
            }

            this.errors.push(new Error("Léxico", char, "Carácter no reconocido", this.linea, this.columna));
            this.avanzar();
        }

        return this.tokens;
    }

    recorrerIdentificador() {
        let inicioCol = this.columna;
        let buffer = "";
    
        while (
            this.pos < this.texto.length &&
            (this.esLetra(this.texto[this.pos]) || this.esDigito(this.texto[this.pos]))
        ) {
            buffer += this.texto[this.pos];
            this.recorrido.push({
                estado: "ID",
                char: this.texto[this.pos],
                next: "ID"
            });
            this.avanzar();
        }
    
        let esReservada = false;
        let tipoReservada = "";
    
        for (let palabra in ReservedWords) {
            if (palabra === buffer) {
                esReservada = true;
                tipoReservada = ReservedWords[palabra];
                break; 
            }
        }
    
        if (esReservada) {
            this.tokens.push(new Token(tipoReservada, buffer, this.linea, inicioCol));
        } else {
            this.tokens.push(new Token("IDENTIFICADOR", buffer, this.linea, inicioCol));
        }
    }
    
    recorrerNumero() {
        let inicioCol = this.columna;
        let buffer = "";
        let esDecimal = false;
        while (this.pos < this.texto.length && (this.esDigito(this.texto[this.pos]) || this.texto[this.pos] === ".")) {
            if (this.texto[this.pos] === ".") {
                if (esDecimal) break;
                esDecimal = true;
            }
            buffer += this.texto[this.pos];
            this.recorrido.push({ estado: "NUM", char: this.texto[this.pos], next: "NUM" });
            this.avanzar();
        }
        this.tokens.push(new Token(esDecimal ? "DOUBLE" : "INT", buffer, this.linea, inicioCol));
    }

    recorrerCadena() {
        let inicioCol = this.columna;
        let buffer = "";
        this.avanzar(); 
        while (this.pos < this.texto.length && this.texto[this.pos] !== '"') {
            buffer += this.texto[this.pos];
            this.avanzar();
        }
        if (this.pos >= this.texto.length) {
            this.errors.push(new Error("Léxico", buffer, "Cadena sin cerrar", this.linea, inicioCol));
            return;
        }
        this.avanzar();
        this.tokens.push(new Token("STRING", buffer, this.linea, inicioCol));
    }

    recorrerCaracter() {
        let inicioCol = this.columna;
        let buffer = "";
        this.avanzar();
        if (this.pos < this.texto.length) {
            buffer = this.texto[this.pos];
            this.avanzar();
        }
        if (this.texto[this.pos] !== "'") {
            this.errors.push(new Error("Léxico", buffer, "Carácter mal formado", this.linea, inicioCol));
            return;
        }
        this.avanzar();
        this.tokens.push(new Token("CHAR", buffer, this.linea, inicioCol));
    }

    recorrerComentarioLinea() {
        while (this.pos < this.texto.length && this.texto[this.pos] !== "\n") {
            this.avanzar();
        }
    }

    recorrerComentarioBloque() {
        this.avanzar();
        this.avanzar();
        while (this.pos < this.texto.length) {
            if (this.texto[this.pos] === "\n") {
                this.linea++;
                this.columna = 0;
            }
            if (this.texto[this.pos] === "*" && this.texto[this.pos + 1] === "/") {
                this.avanzar();
                this.avanzar();
                return;
            }
            this.avanzar();
        }
    }

    recorrerSimbolo() {
        let inicioCol = this.columna;
        let char = this.texto[this.pos];
        let next = this.texto[this.pos + 1] || "";

        if ((char === "=" && next === "=") || (char === "!" && next === "=") ||
            (char === ">" && next === "=") || (char === "<" && next === "=") ||
            (char === "+" && next === "+") || (char === "-" && next === "-") ||
            (char === "&" && next === "&") || (char === "|" && next === "|")) {
            this.tokens.push(new Token("OPERADOR", char + next, this.linea, inicioCol));
            this.avanzar();
            this.avanzar();
            return;
        }

        if (char === "=" || char === "+" || char === "-" || 
            char === "*" || char === "/" || char === "%" || 
            char === ">" || char === "<" || char === "!") {
            this.tokens.push(new Token("OPERADOR", char, this.linea, inicioCol));
            this.avanzar();
            return;
        }
        this.tokens.push(new Token("SIMBOLO", char, this.linea, inicioCol));
        this.avanzar();
    }

    esSimbolo(c) {
        switch (c) {
            case '{': case '}':
            case '(': case ')':
            case '[': case ']':
            case ';': case ',':
            case '.': case ':':
            case '=': case '+':
            case '-': case '*':
            case '/': case '%':
            case '^': case '&':
            case '|': case '!':
            case '>': case '<':
                return true;
            default:
                return false;
        }
    }
    
    esLetra(c) { return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z"); }
    esDigito(c) { return (c >= "0" && c <= "9"); }
}