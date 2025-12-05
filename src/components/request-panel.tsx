import React, { useRef, useState } from "react";
import Editor, { loader, Monaco, OnMount } from "@monaco-editor/react"; // <--- O Poderoso Monaco
import KeyValueTable from "./key-value-table";
import SmartUrlInput from "./smart-url-input";
import { KeyValue, Auth, EnvVariable } from "../types";

interface RequestPanelProps {
  method: string;
  setMethod: (m: string) => void;
  url: string;
  setUrl: (u: string) => void;
  body: string;
  setBody: (b: string) => void;
  headers: KeyValue[];
  setHeaders: (h: KeyValue[]) => void;
  queryParams: KeyValue[];
  setQueryParams: (q: KeyValue[]) => void;
  auth: Auth;
  setAuth: (a: Auth) => void;
  onSend: () => void;
  onSave: () => void;
  loading: boolean;
  saveStatus: string;
  selectedId: string | null;
  requestName: string;
  activeVars: EnvVariable[];
}

export default function RequestPanel(props: RequestPanelProps) {
  const {
    method,
    setMethod,
    url,
    setUrl,
    body,
    setBody,
    headers,
    setHeaders,
    queryParams,
    setQueryParams,
    auth,
    setAuth,
    onSend,
    onSave,
    loading,
    saveStatus,
    selectedId,
    requestName,
    activeVars,
  } = props;

  const [activeTab, setActiveTab] = useState("body");

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET":
        return "text-violet-400";
      case "POST":
        return "text-emerald-400";
      case "PUT":
        return "text-orange-400";
      case "DELETE":
        return "text-rose-400";
      case "PATCH":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const formatJSON = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 bg-[#09090b]">
      {/* 1. URL BAR */}
      <div className="h-16 border-b border-[#27272a] flex items-center p-3 gap-3 bg-[#09090b] shrink-0">
        <div className="relative">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`bg-[#18181b] font-bold text-xs h-10 pl-3 pr-8 rounded border border-[#333] outline-none cursor-pointer hover:border-[#555] appearance-none ${getMethodColor(method)}`}
          >
            {/* CSS FIX: option com fundo escuro */}
            <option className="bg-[#18181b]">GET</option>
            <option className="bg-[#18181b]">POST</option>
            <option className="bg-[#18181b]">PUT</option>
            <option className="bg-[#18181b]">DELETE</option>
            <option className="bg-[#18181b]">PATCH</option>
          </select>
          <div className="absolute right-2 top-3 pointer-events-none text-[10px] text-gray-500">
            ▼
          </div>
        </div>

        <div className="flex-1 h-10">
          <SmartUrlInput value={url} onChange={setUrl} variables={activeVars} />
        </div>

        <button
          onClick={onSend}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs h-10 px-6 rounded transition-all flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>Send</span>
          )}
        </button>
        <button
          onClick={onSave}
          disabled={!selectedId}
          className="bg-[#18181b] hover:bg-[#27272a] border border-[#333] text-gray-400 hover:text-white h-10 w-10 flex items-center justify-center rounded transition-colors relative"
        >
          💾{" "}
          {saveStatus && (
            <span className="absolute -bottom-8 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-500/20">
              {saveStatus}
            </span>
          )}
        </button>
      </div>

      {/* 2. TABS */}
      <div className="h-10 bg-[#09090b] flex items-center px-4 gap-6 border-b border-[#27272a] shrink-0">
        {["body", "params", "auth", "headers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-full text-xs font-medium border-b-2 transition-all capitalize ${activeTab === tab ? "border-violet-500 text-gray-100" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            {tab}
          </button>
        ))}
        {selectedId && (
          <span className="ml-auto text-[10px] text-gray-600 font-mono">
            {requestName}
          </span>
        )}
      </div>

      {/* 3. CONTEÚDO */}
      <div className="flex-1 min-h-0 overflow-hidden bg-[#09090b] relative flex flex-col group">
        {activeTab === "body" && (
          <div className="flex-1 h-full w-full relative">
            <Editor
              height="100%"
              width="100%"
              defaultLanguage="json"
              theme="litePost"
              onMount={handleEditorDidMount} // Pegar referencia
              value={body}
              onChange={(val) => setBody(val || "")}
              options={{
                contextmenu: false, // <--- DESATIVA MENU DIREITO
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'Fira Code', monospace",
                padding: { top: 16 },
              }}
            />
            {/* Botão de Formatar Flutuante (Aparece no Hover) */}
            <button
              onClick={formatJSON}
              className="absolute top-4 right-6 bg-[#27272a] text-xs text-gray-400 px-3 py-1 rounded border border-[#444] hover:text-white hover:border-violet-500 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              Format JSON
            </button>
          </div>
        )}

        {(activeTab === "params" || activeTab === "headers") && (
          <div className="p-0 overflow-auto h-full">
            <KeyValueTable
              data={activeTab === "params" ? queryParams : headers}
              onChange={activeTab === "params" ? setQueryParams : setHeaders}
            />
          </div>
        )}

        {activeTab === "auth" && (
          <div className="p-8 max-w-lg">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-gray-400 font-bold">Auth Type</span>
              <div className="relative w-full">
                <select
                  value={auth.type}
                  onChange={(e) => setAuth({ ...auth, type: e.target.value })}
                  className="bg-[#18181b] w-full font-bold text-xs p-2 rounded border border-[#333] outline-none cursor-pointer hover:border-[#555] appearance-none text-violet-400"
                >
                  <option value="none" className="bg-[#18181b]">
                    No Auth
                  </option>
                  <option value="bearer" className="bg-[#18181b]">
                    Bearer Token
                  </option>
                </select>
                <div className="absolute right-2 top-3 pointer-events-none text-[10px] text-gray-500">
                  ▼
                </div>
              </div>
            </label>
            {auth.type === "bearer" && (
              <label className="flex flex-col gap-2 mt-4">
                <span className="text-xs text-gray-400 font-bold">Token</span>
                <input
                  type="text"
                  value={auth.token}
                  onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                  className="bg-[#18181b] border border-[#333] text-gray-200 text-sm p-2 rounded outline-none hover:border-[#555] focus:border-violet-500 transition-colors"
                  placeholder="eyJhbG..."
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
