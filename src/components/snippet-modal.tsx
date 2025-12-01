import { useState, useEffect } from "react";
import { HTTPSnippet } from "httpsnippet-lite";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import type { KeyValue } from "../types";

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  formState: {
    method?: string;
    url?: string;
    headers?: KeyValue[];
    queryParams?: KeyValue[];
    body?: string;
  };
}

export default function SnippetModal({
  isOpen,
  onClose,
  formState,
}: SnippetModalProps) {
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("node");
  const [client, setClient] = useState<string>("fetch");

  useEffect(() => {
    if (!isOpen) return;
    try {
      // Converte o formState para o formato HAR que o snippet entende
      const har = {
        method: formState.method || "GET",
        url: formState.url || "",
        headers: (formState.headers || [])
          .filter((h) => h.active && h.key)
          .map((h) => ({ name: h.key, value: h.value })),
        queryString: (formState.queryParams || [])
          .filter((p) => p.active && p.key)
          .map((p) => ({ name: p.key, value: p.value })),
        postData:
          formState.method !== "GET"
            ? { mimeType: "application/json", text: formState.body || "" }
            : undefined,
      };
      const snippet = new HTTPSnippet(har);
      const result = snippet.convert(target, client);
      setCode(result || "Error generating code");
    } catch (e) {
      setCode("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  }, [isOpen, target, client, formState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#252526] border border-[#444] rounded shadow-2xl w-[600px] h-[400px] flex flex-col">
        <div className="p-3 border-b border-[#444] flex justify-between items-center">
          <div className="flex gap-2">
            <select
              className="bg-[#1e1e1e] text-white text-xs border border-[#444] rounded p-1"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setClient("fetch");
              }}
            >
              <option value="node">Node.js</option>
              <option value="python">Python</option>
              <option value="shell">Shell / cURL</option>
              <option value="javascript">JavaScript (Browser)</option>
            </select>
            <select
              className="bg-[#1e1e1e] text-white text-xs border border-[#444] rounded p-1"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              {target === "node" && (
                <>
                  <option value="fetch">Fetch</option>
                  <option value="axios">Axios</option>
                </>
              )}
              {target === "python" && (
                <option value="requests">Requests</option>
              )}
              {target === "shell" && <option value="curl">cURL</option>}
              {target === "javascript" && <option value="fetch">Fetch</option>}
            </select>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={code}
            height="100%"
            theme={vscodeDark}
            extensions={[javascript()]}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
