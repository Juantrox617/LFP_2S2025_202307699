import express from "express";
import cors from "cors";
import { Lexer } from "./Lexer/Lexer.js";
import { Parser } from "./Paser/Parser.js";

const app = express();
const PORT = 4000; 

app.use(express.json());
app.use(cors());

app.post("/analizar", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "No se envió código a analizar" });
  }

  try {
    const lexer = new Lexer(code);
    const tokens = lexer.analizar();
    const errors = lexer.errors;

    const parser = new Parser(tokens);
    const parseResult = parser.analizar();

    return res.json({
      tokens,
      lexicalErrors: errors,
      syntaxErrors: parseResult.errors,
      pythonCode: parseResult.python,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno al analizar" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});