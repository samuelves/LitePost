import { useState } from "react";
import curlToJson from "curl-to-json-object";

type Header = {
  key: string;
  value: string;
  active: boolean;
};

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (imported: {
    method: string | "";
    url: string | "";
    headers: Header[] | [];
    body: string | "";
  }) => void;
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
      const result = curlToJson(curlText);
      // Mapeia o resultado do curlToJson para o nosso formato
      const imported = {
        method: result.method || "GET",
        url: result.url,
        headers: result.headers
          ? Object.entries(result.headers).map(([k, v]) => ({
              key: k,
              value: String(v),
              active: true,
            }))
          : [],
        body: result.data ? JSON.stringify(result.data, null, 2) : "",
      };
      onImport(imported);
      onClose();
      setCurlText("");
      setError("");
    } catch (e) {
      setError("Invalid cURL command");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#252526] border border-[#444] rounded shadow-2xl w-[500px] p-4">
        <h3 className="text-white text-sm font-bold mb-2">Import cURL</h3>
        <textarea
          className="w-full h-40 bg-[#1e1e1e] text-gray-300 text-xs p-2 border border-[#444] outline-none font-mono"
          placeholder="curl -X POST https://api.com..."
          value={curlText}
          onChange={(e) => setCurlText(e.target.value)}
        />
        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-gray-400 text-xs hover:text-white px-3 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="bg-violet-600 text-white text-xs px-4 py-1 rounded hover:bg-violet-700"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
