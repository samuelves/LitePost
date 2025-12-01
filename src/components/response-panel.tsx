import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

type ResponsePanelProps = {
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  } | null;
};

export default function ResponsePanel({ response }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState("body");

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-w-0 border-l border-[#333]">
      <div className="h-9 border-b border-[#333] flex items-center justify-between px-2 bg-[#09090b]">
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
          <span
            className={`text-xs px-2 ${response.status < 300 ? "text-green-400" : "text-red-400"}`}
          >
            {response.status} OK
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#09090b]">
        {activeTab === "body" && response ? (
          <CodeMirror
            value={(() => {
              try {
                return JSON.stringify(JSON.parse(response.body), null, 2);
              } catch {
                return response.body;
              }
            })()}
            height="100%"
            theme={vscodeDark}
            extensions={[json()]}
            editable={false}
            className="text-xs"
          />
        ) : activeTab === "headers" && response ? (
          <div className="p-2 space-y-1">
            {Object.entries(response.headers).map(([k, v]) => (
              <div key={k} className="flex text-[10px] border-b border-[#333]">
                <div className="w-1/3 text-gray-400 p-1">{k}</div>
                <div className="w-2/3 text-gray-200 p-1 break-all">{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-600 text-xs">
            No response yet
          </div>
        )}
      </div>
    </div>
  );
}
