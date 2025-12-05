import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { ApiResponse } from "../types";

interface ResponsePanelProps {
  response: ApiResponse | null;
}

export default function ResponsePanel({ response }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState("body");

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-w-0 border-l border-[#27272a]">
      <div className="h-9 border-b border-[#27272a] flex items-center justify-between px-2 bg-[#09090b]">
        <div className="flex h-full">
          <button
            onClick={() => setActiveTab("body")}
            className={`px-3 text-xs h-full border-b-2 ${activeTab === "body" ? "border-violet-500 text-white" : "border-transparent text-gray-500"}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`px-3 text-xs h-full border-b-2 ${activeTab === "headers" ? "border-violet-500 text-white" : "border-transparent text-gray-500"}`}
          >
            Headers
          </button>
        </div>
        {response && (
          <div className="flex gap-3 text-[10px] font-mono">
            <span
              className={`px-1.5 py-0.5 rounded ${response.status < 300 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
            >
              {response.status}
            </span>
            <span className="text-gray-500">{response.duration}ms</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-[#09090b]">
        {activeTab === "body" && response ? (
          <Editor
            height="100%"
            defaultLanguage="json"
            theme="litePost"
            value={(() => {
              try {
                return JSON.stringify(JSON.parse(response.body), null, 2);
              } catch {
                return response.body;
              }
            })()}
            options={{
              readOnly: true, // Importante: Usuário não edita resposta
              minimap: { enabled: false },
              contextmenu: false,
              fontSize: 12,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on", // Quebra de linha automática
            }}
          />
        ) : activeTab === "headers" && response ? (
          <div className="p-0 overflow-auto h-full">
            {Object.entries(response.headers).map(([k, v]) => (
              <div
                key={k}
                className="flex text-xs border-b border-[#27272a] hover:bg-[#18181b]"
              >
                <div className="w-1/3 text-gray-500 p-2 border-r border-[#27272a] truncate select-all">
                  {k}
                </div>
                <div className="w-2/3 text-gray-300 p-2 break-all select-all font-mono">
                  {v}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-700">
            <span className="text-4xl mb-2 opacity-20">⚡</span>
            <span className="text-xs opacity-50">Send a request</span>
          </div>
        )}
      </div>
    </div>
  );
}
