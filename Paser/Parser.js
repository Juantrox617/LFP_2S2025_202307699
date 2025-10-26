import { Error } from "../Error/Error.js";

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.errors = [];
    this.pythonCode = "";
    this.indent = "";
    this.className = this.extractClassName(tokens);
  }

  extractClassName(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "CLASS" && tokens[i + 1]?.type === "IDENTIFICADOR") {
        return tokens[i + 1].value;
      }
    }
    return "Unknown";
  }

  analizar() {
    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];

      switch (token.type) {
        case "INT_TYPE":
        case "DOUBLE_TYPE":
        case "CHAR_TYPE":
        case "STRING_TYPE":
        case "BOOLEAN_TYPE":
          this.declaracionVariable();
          break;

        case "IF":
          this.traducirIf();
          break;

        case "FOR":
          this.traducirFor();
          break;

        case "WHILE":
          this.traducirWhile();
          break;

        case "SYSTEM":
          this.traducirPrint();
          break;

        case "IDENTIFICADOR":
          this.asignacionVariable();
          break;

        case "CLASS":
        case "PUBLIC":
        case "STATIC":
        case "VOID":
        case "LLAVE_ABRE":
        case "LLAVE_CIERRA":
          this.pos++;
          break;

        default:
          if (token.value === "main" || token.value === "String" || token.value === "[" || token.value === "]") {
            this.pos++;
          } else {
            this.errors.push(
              new Error(
                "Sintáctico",
                token.value,
                "Instrucción no válida",
                token.line,
                token.column
              )
            );
            this.pos++;
          }
          break;
      }
    }
    return { errors: this.errors, python: this.pythonCode };
  }

  declaracionVariable() {
    const tipo = this.tokens[this.pos].type;
    const tipoOriginal = this.tokens[this.pos].value;
    this.pos++;

    const id = this.tokens[this.pos];
    if (!id || id.type !== "IDENTIFICADOR") {
      this.errors.push(
        new Error(
          "Sintáctico",
          id?.value || "EOF",
          "Se esperaba un identificador",
          id?.line || 0,
          id?.column || 0
        )
      );
      return;
    }

    this.pos++;

    const siguiente = this.tokens[this.pos];
    
    if (siguiente?.value === ";") {
      let valorDefecto = "None";
      if (tipo === "INT_TYPE" || tipo === "DOUBLE_TYPE") {
        valorDefecto = "0";
      } else if (tipo === "BOOLEAN_TYPE") {
        valorDefecto = "False";
      } else if (tipo === "STRING_TYPE") {
        valorDefecto = '""';
      } else if (tipo === "CHAR_TYPE") {
        valorDefecto = '""';
      }
      
      this.pythonCode += `${this.indent}${id.value} = ${valorDefecto}\n`;
      this.pos++;
      return;
    }

    if (!siguiente || siguiente.value !== "=") {
      this.errors.push(
        new Error(
          "Sintáctico",
          siguiente?.value || "EOF",
          "Se esperaba '=' o ';'",
          siguiente?.line || 0,
          siguiente?.column || 0
        )
      );
      return;
    }
    this.pos++;

    const valor = this.tokens[this.pos];
    if (!valor) {
      this.errors.push(
        new Error(
          "Sintáctico",
          "EOF",
          "Falta valor en asignación",
          id.line,
          id.column
        )
      );
      return;
    }

    let traduccion = valor.value;

    if (tipo === "BOOLEAN_TYPE") {
      if (valor.value === "true") traduccion = "True";
      else if (valor.value === "false") traduccion = "False";
    }
    else if (tipo === "STRING_TYPE" || tipo === "CHAR_TYPE") {
      traduccion = `"${valor.value}"`;
    }

    this.pythonCode += `${this.indent}${id.value} = ${traduccion}\n`;
    this.pos++;

    const fin = this.tokens[this.pos];
    if (fin && fin.value === ";") this.pos++;
    else
      this.errors.push(
        new Error(
          "Sintáctico",
          fin?.value || "EOF",
          "Se esperaba ';'",
          id.line,
          id.column
        )
      );
  }

  asignacionVariable() {
    const id = this.tokens[this.pos];
    this.pos++;

    const siguiente = this.tokens[this.pos];
    
    if (siguiente?.value === "++") {
      this.pythonCode += `${this.indent}${id.value} += 1\n`;
      this.pos++;
      if (this.tokens[this.pos]?.value === ";") this.pos++;
      return;
    }
    
    if (siguiente?.value === "--") {
      this.pythonCode += `${this.indent}${id.value} -= 1\n`;
      this.pos++;
      if (this.tokens[this.pos]?.value === ";") this.pos++;
      return;
    }

    if (!siguiente || siguiente.value !== "=") {
      this.errors.push(
        new Error(
          "Sintáctico",
          siguiente?.value || "EOF",
          "Se esperaba '=', '++' o '--'",
          siguiente?.line || 0,
          siguiente?.column || 0
        )
      );
      return;
    }
    this.pos++;

    let expresion = "";
    while (this.pos < this.tokens.length && this.tokens[this.pos].value !== ";") {
      const tok = this.tokens[this.pos];
      if (tok.type === "STRING") {
        expresion += `"${tok.value}" `;
      } else if (tok.type === "CHAR") {
        expresion += `"${tok.value}" `;
      } else if (tok.value === "true") {
        expresion += "True ";
      } else if (tok.value === "false") {
        expresion += "False ";
      } else {
        expresion += tok.value + " ";
      }
      this.pos++;
    }

    this.pythonCode += `${this.indent}${id.value} = ${expresion.trim()}\n`;

    if (this.tokens[this.pos]?.value === ";") this.pos++;
    else
      this.errors.push(
        new Error(
          "Sintáctico",
          this.tokens[this.pos]?.value || "EOF",
          "Se esperaba ';'",
          id.line,
          id.column
        )
      );
  }

  traducirIf() {
    this.pos++;

    if (!this.tokens[this.pos] || this.tokens[this.pos].value !== "(") {
      this.errors.push(
        new Error("Sintáctico", "if", "Se esperaba '(' después de if", 0, 0)
      );
      return;
    }

    this.pos++;
    let condicion = "";

    while (this.pos < this.tokens.length && this.tokens[this.pos].value !== ")") {
      const val = this.tokens[this.pos].value;

      if (val === "=" && condicion.trim().endsWith("=")) {
        this.pos++;
        continue;
      }

      condicion += val + " ";
      this.pos++;
    }

    if (this.tokens[this.pos]?.value !== ")") {
      this.errors.push(
        new Error("Sintáctico", "if", "Falta ')' en condición", 0, 0)
      );
      return;
    }
    this.pos++;

    this.pythonCode += `${this.indent}if ${condicion.trim()}:\n`;

    if (this.tokens[this.pos]?.value !== "{") {
      this.errors.push(
        new Error("Sintáctico", "if", "Se esperaba '{' después de if", 0, 0)
      );
      return;
    }
    this.pos++;

    this.indent += "    ";
    while (
      this.pos < this.tokens.length &&
      this.tokens[this.pos].value !== "}"
    ) {
      this.traducirLineaBloque();
    }
    this.indent = this.indent.slice(0, -4);

    if (this.tokens[this.pos]?.value !== "}") {
      this.errors.push(
        new Error("Sintáctico", "if", "Se esperaba '}' al final del bloque if", 0, 0)
      );
      return;
    }
    this.pos++;

    if (this.tokens[this.pos]?.type === "ELSE") {
      this.pos++;

      if (this.tokens[this.pos]?.value !== "{") {
        this.errors.push(
          new Error("Sintáctico", "else", "Se esperaba '{' después de else", 0, 0)
        );
        return;
      }

      this.pos++;
      this.pythonCode += `${this.indent}else:\n`;

      this.indent += "    ";
      while (
        this.pos < this.tokens.length &&
        this.tokens[this.pos].value !== "}"
      ) {
        this.traducirLineaBloque();
      }
      this.indent = this.indent.slice(0, -4);

      if (this.tokens[this.pos]?.value === "}") this.pos++;
      else
        this.errors.push(
          new Error(
            "Sintáctico",
            "else",
            "Se esperaba '}' al final del bloque else",
            0,
            0
          )
        );
    }
  }

  traducirFor() {
    this.pos++;
    if (this.tokens[this.pos]?.value !== "(") return;
    this.pos++;

    this.pos++;
    const variable = this.tokens[this.pos++];
    this.pos++;
    const inicio = this.tokens[this.pos++];
    this.pos++;

    this.pos++;
    this.pos++;
    const limite = this.tokens[this.pos++];
    this.pos++;

    this.pos++;
    if (this.tokens[this.pos]?.value === "++") this.pos++;
    if (this.tokens[this.pos]?.value === "+") this.pos++;

    if (this.tokens[this.pos]?.value === ")") this.pos++;
    if (this.tokens[this.pos]?.value === "{") this.pos++;

    this.pythonCode += `${this.indent}for ${variable.value} in range(${inicio.value}, ${limite.value}):\n`;
    this.indent += "    ";

    while (
      this.pos < this.tokens.length &&
      this.tokens[this.pos].value !== "}"
    ) {
      this.traducirLineaBloque();
    }

    this.indent = this.indent.slice(0, -4);
    if (this.tokens[this.pos]?.value === "}") this.pos++;
  }

  traducirWhile() {
    this.pos++;
    if (!this.tokens[this.pos] || this.tokens[this.pos].value !== "(") {
      this.errors.push(
        new Error("Sintáctico", "while", "Se esperaba '(' después de while", 0, 0)
      );
      return;
    }

    this.pos++;
    let condicion = "";

    while (this.pos < this.tokens.length && this.tokens[this.pos].value !== ")") {
      const val = this.tokens[this.pos].value;

      if (val === "=" && condicion.trim().endsWith("=")) {
        this.pos++;
        continue;
      }

      condicion += val + " ";
      this.pos++;
    }

    if (this.tokens[this.pos]?.value !== ")") {
      this.errors.push(
        new Error("Sintáctico", "while", "Falta ')' en condición", 0, 0)
      );
      return;
    }
    this.pos++;

    this.pythonCode += `${this.indent}while ${condicion.trim()}:\n`;

    if (this.tokens[this.pos]?.value !== "{") {
      this.errors.push(
        new Error("Sintáctico", "while", "Se esperaba '{' después de while", 0, 0)
      );
      return;
    }
    this.pos++;

    this.indent += "    ";
    while (
      this.pos < this.tokens.length &&
      this.tokens[this.pos].value !== "}"
    ) {
      this.traducirLineaBloque();
    }
    this.indent = this.indent.slice(0, -4);

    if (this.tokens[this.pos]?.value === "}") this.pos++;
    else
      this.errors.push(
        new Error(
          "Sintáctico",
          "while",
          "Se esperaba '}' al final del bloque while",
          0,
          0
        )
      );
  }

  traducirPrint() {
    this.pos++;
    this.pos += 3;
    const println = this.tokens[this.pos];
    if (!println || println.value !== "println") return;

    this.pos++;
    if (this.tokens[this.pos]?.value !== "(") return;
    this.pos++;

    let partes = [];
    let esConcatenacion = false;

    while (this.pos < this.tokens.length && this.tokens[this.pos].value !== ")") {
      const tok = this.tokens[this.pos];
      
      if (tok.value === "+") {
        esConcatenacion = true;
        this.pos++;
        continue;
      }

      if (tok.type === "STRING") {
        partes.push(`"${tok.value}"`);
      } else if (tok.type === "CHAR") {
        partes.push(`"${tok.value}"`);
      } else if (tok.value === "true") {
        partes.push("True");
      } else if (tok.value === "false") {
        partes.push("False");
      } else if (tok.type === "IDENTIFICADOR" && esConcatenacion) {
        partes.push(`str(${tok.value})`);
      } else if (tok.type === "NUMERO" && esConcatenacion) {
        partes.push(`str(${tok.value})`);
      } else {
        partes.push(tok.value);
      }
      this.pos++;
    }

    this.pos++;
    if (this.tokens[this.pos]?.value === ";") this.pos++;

    if (esConcatenacion) {
      this.pythonCode += `${this.indent}print(${partes.join(" + ")})\n`;
    } else {
      this.pythonCode += `${this.indent}print(${partes.join(", ")})\n`;
    }
  }

  traducirLineaBloque() {
    const actual = this.tokens[this.pos];
    switch (actual.type) {
      case "INT_TYPE":
      case "DOUBLE_TYPE":
      case "CHAR_TYPE":
      case "STRING_TYPE":
      case "BOOLEAN_TYPE":
        this.declaracionVariable();
        break;
      case "IF":
        this.traducirIf();
        break;
      case "FOR":
        this.traducirFor();
        break;
      case "WHILE":
        this.traducirWhile();
        break;
      case "SYSTEM":
        this.traducirPrint();
        break;
      case "IDENTIFICADOR":
        this.asignacionVariable();
        break;
      default:
        this.pos++;
        break;
    }
  }
}
