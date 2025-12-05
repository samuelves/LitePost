import React, { useState } from "react";
import { parseCurlCommand } from "../utils/curlParser"; // <--- Importe nosso módulo

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function CurlImportModal({
  isOpen,
  onClose,
  onImport,
}: CurlImportModalProps) {
  const [curlText, setCurlText] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      if (!curlText.trim()) return;

      // Chama nosso parser feito à mão
      const result = parseCurlCommand(curlText);

      onImport(result);
      onClose();
      setCurlText("");
      setError("");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao processar cURL.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[#252526] border border-[#444] rounded shadow-2xl w-[600px] p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-gray-200 text-sm font-bold">Import cURL</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>

        <div className="relative">
          <textarea
            className="w-full h-64 bg-[#09090b] text-gray-300 text-xs p-3 border border-[#333] outline-none font-mono rounded resize-none focus:border-violet-500 transition-colors"
            placeholder={`curl -X POST https://api.com/v1 \\ \n  -H "Content-Type: application/json" \\ \n  -d '{"foo": "bar"}'`}
            value={curlText}
            onChange={(e) => {
              setCurlText(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 p-2 rounded flex items-center gap-2">
            <span className="text-red-400 text-xs font-bold">Error:</span>
            <span className="text-red-300 text-xs">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-gray-400 text-xs hover:text-white px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="bg-violet-600 text-white text-xs font-bold px-6 py-2 rounded hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/20"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
