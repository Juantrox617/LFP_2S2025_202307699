import { useState, useRef } from "react";
import { apiService } from "./services/service";

function App() {
  const [code, setCode] = useState(`int numero = 10;`);
  const [tokens, setTokens] = useState([]);
  const [lexicalErrors, setLexicalErrors] = useState([]);
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [pythonCode, setPythonCode] = useState("");
  const [currentFileName, setCurrentFileName] = useState("Sin título");
  const fileInputRef = useRef(null);

  const handleAnalizar = async () => {
    try {
      const { data } = await apiService.analyzer(code);
      setTokens(data.tokens);
      setLexicalErrors(data.lexicalErrors);
      setSyntaxErrors(data.syntaxErrors);
      setPythonCode(data.pythonCode);
    } catch (err) {
      alert("Error al analizar el código");
    }
  };

  const handleNuevo = () => {
    if (code.trim() !== "" && !window.confirm("¿Desea crear un nuevo archivo? Se perderán los cambios no guardados.")) {
      return;
    }
    setCode("");
    setTokens([]);
    setLexicalErrors([]);
    setSyntaxErrors([]);
    setPythonCode("");
    setCurrentFileName("Sin título");
  };

  const handleAbrir = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
        setCurrentFileName(file.name);
        // Limpiar resultados anteriores
        setTokens([]);
        setLexicalErrors([]);
        setSyntaxErrors([]);
        setPythonCode("");
      };
      reader.readAsText(file);
    }
  };

  const handleGuardar = () => {
    if (!pythonCode) {
      alert("Primero debe generar la traducción");
      return;
    }
    
    const blob = new Blob([pythonCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName.replace(/\.(java|txt)$/i, ".py") || "traduccion.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGuardarComo = () => {
    if (!pythonCode) {
      alert("Primero debe generar la traducción");
      return;
    }

    const fileName = prompt("Ingrese el nombre del archivo (sin extensión):", "traduccion");
    if (fileName) {
      const blob = new Blob([pythonCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.py`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSalir = () => {
    if (window.confirm("¿Está seguro que desea salir?")) {
      window.close();
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto space-y-2">
        <h1 className="text-white text-2xl font-bold text-center">
          Proyecto 2 — JavaBridge
        </h1>
        <p className="text-indigo-400 font-semibold">
          Lenguajes Formales y de Programación — Sección B-
        </p>
        <p className="text-gray-400 text-sm">Archivo: {currentFileName}</p>
      </div>

      {/* Input oculto para cargar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".java,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Barra de botones */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={handleNuevo}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          📄 Nuevo
        </button>
        <button
          onClick={handleAbrir}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          📂 Abrir
        </button>
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          💾 Guardar
        </button>
        <button
          onClick={handleGuardarComo}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          💾 Guardar Como
        </button>
        <button
          onClick={handleAnalizar}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          ▶️ Analizar
        </button>
        <button
          onClick={handleSalir}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition ml-auto"
        >
          ❌ Salir
        </button>
      </div>

      <textarea
        className="w-full p-3 rounded bg-gray-800 text-white mt-6 font-mono"
        rows="10"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Escribe o carga tu código Java aquí..."
      />

      {tokens.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <h2 className="text-white text-xl mb-2">Tokens</h2>
          <table className="table-auto w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th>#</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Línea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((tok, index) => (
                <tr key={index} className="bg-gray-100 text-gray-900">
                  <td>{index}</td>
                  <td>{tok.type}</td>
                  <td>{tok.value}</td>
                  <td>{tok.line}</td>
                  <td>{tok.column}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lexicalErrors.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <h2 className="text-red-400 text-xl font-bold mb-2">Errores Léxicos</h2>
          <table className="table-auto w-full border-collapse border border-red-700">
            <thead className="bg-red-800 text-white">
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Mensaje</th>
                <th>Línea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {lexicalErrors.map((err, index) => (
                <tr key={index} className="bg-red-100 text-red-900">
                  <td>{index}</td>
                  <td>{err.type}</td>
                  <td>{err.value}</td>
                  <td>{err.message}</td>
                  <td>{err.line}</td>
                  <td>{err.column}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {syntaxErrors.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <h2 className="text-yellow-400 text-xl font-bold mb-2">Errores Sintácticos</h2>
          <table className="table-auto w-full border-collapse border border-yellow-700">
            <thead className="bg-yellow-800 text-white">
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Mensaje</th>
                <th>Línea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {syntaxErrors.map((err, index) => (
                <tr key={index} className="bg-yellow-100 text-yellow-900">
                  <td>{index}</td>
                  <td>{err.type}</td>
                  <td>{err.value}</td>
                  <td>{err.message}</td>
                  <td>{err.line}</td>
                  <td>{err.column}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pythonCode && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-white">
          <h2 className="text-green-400 text-xl font-bold mb-2">
            Traducción a Python
          </h2>
          <pre className="bg-gray-900 p-3 rounded text-green-300 overflow-auto">
            {pythonCode}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;