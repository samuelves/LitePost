import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { CollectionItem } from "../types";
import { generateCode } from "../utils/codeGenerator"; // <--- Importe nosso gerador

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  formState: CollectionItem; // O estado atual do request
}

export default function SnippetModal({
  isOpen,
  onClose,
  formState,
}: SnippetModalProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"node" | "python" | "curl">("curl");

  // Regenera o código sempre que abrir ou trocar a linguagem
  useEffect(() => {
    if (!isOpen) return;
    try {
      const generated = generateCode(formState, language);
      setCode(generated);
    } catch (e) {
      setCode("// Error generating code");
      console.error(e);
    }
  }, [isOpen, language, formState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[#252526] border border-[#444] rounded shadow-2xl w-[700px] h-[500px] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="h-12 border-b border-[#444] bg-[#1e1e1e] flex justify-between items-center px-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-200">
              Generate Code
            </span>

            {/* SELECTOR DE LINGUAGEM */}
            <select
              className="bg-[#252526] text-xs text-white border border-[#444] rounded p-1 outline-none cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="curl">cURL (Bash)</option>
              <option value="node">Node.js (Fetch)</option>
              <option value="python">Python (Requests)</option>
              <option value="javascript">JavaScript (Browser)</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* EDITOR (READ ONLY) */}
        <div className="flex-1 bg-[#1e1e1e] relative">
          <Editor
            height="100%"
            theme="litePost" // Usa o tema que criamos antes
            language={language === "python" ? "python" : "javascript"} // Highlight básico
            value={code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', monospace",
              padding: { top: 16 },
            }}
          />

          {/* BOTÃO COPIAR */}
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="absolute top-4 right-6 bg-[#252526] hover:bg-violet-600 text-xs text-white px-3 py-1.5 rounded border border-[#444] transition-all shadow-lg z-10"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
