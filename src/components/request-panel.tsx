import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import KeyValueTable from "./key-value-table";
import SmartUrlInput from "./smart-url-input";
import { EnvVariable, KeyValue } from "../types";

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
    onSend,
    onSave,
    loading,
    saveStatus,
    selectedId,
    requestName,
    activeVars,
  } = props;
  const [activeTab, setActiveTab] = useState("body");

  // Cores mais vivas
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

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#27272a]">
      {" "}
      {/* Fundo bem escuro */}
      {/* 1. URL BAR - Com mais padding (p-3) */}
      <div className="h-16 border-b border-[#27272a] flex items-center p-2 gap-3 bg-[#09090b]">
        {/* Select de Método */}
        <div className="relative">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`bg-[#27272a] font-bold text-xs h-10 pl-3 pr-8 rounded border border-[#333] outline-none cursor-pointer hover:border-[#555] appearance-none ${getMethodColor(method)}`}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
            <option>PATCH</option>
          </select>
          <div className="absolute right-2 top-3 pointer-events-none text-[10px] text-gray-500">
            ▼
          </div>
        </div>

        {/* Smart Input (Ocupa o resto) */}
        <SmartUrlInput value={url} onChange={setUrl} variables={activeVars} />

        {/* Botão Send */}
        <button
          onClick={onSend}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs h-10 px-6 rounded shadow-lg shadow-violet-900/20 transition-all flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>Send</span>
          )}
        </button>

        {/* Botão Save */}
        <button
          onClick={onSave}
          disabled={!selectedId}
          className="bg-[#18181b] hover:bg-[#27272a] border border-[#333] text-gray-400 hover:text-white h-10 w-10 flex items-center justify-center rounded transition-colors relative"
          title="Save Request (Ctrl+S)"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          {saveStatus && (
            <span className="absolute -bottom-8 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-500/20">
              {saveStatus}
            </span>
          )}
        </button>
      </div>
      {/* 2. TABS - Visual mais moderno */}
      <div className="h-10 bg-[#09090b] flex items-center px-4 gap-6 border-b border-[#27272a]">
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
      {/* 3. CONTENT AREA */}
      <div className="flex-1 overflow-auto bg-[#09090b]">
        {/* ... Mantenha o conteúdo igual, só garanta que os fundos sejam bg-[#09090b] ou transparentes ... */}
        {/* No CodeMirror do Body, se estiver com fundo branco, adicione className="bg-transparent" */}
        {activeTab === "body" && (
          <CodeMirror
            value={body}
            height="100%"
            theme={vscodeDark} // Esse tema já é escuro
            extensions={[json()]}
            onChange={(val) => setBody(val)}
            className="text-sm"
          />
        )}
        {/* Para Params, Auth e Headers, certifique que KeyValueTable use cores escuras */}
        {(activeTab === "params" || activeTab === "headers") && (
          <div className="p-0">
            {" "}
            {/* Removi padding para encostar nas bordas */}
            <KeyValueTable
              data={activeTab === "params" ? queryParams : headers}
              onChange={activeTab === "params" ? setQueryParams : setHeaders}
            />
          </div>
        )}
        {/* ... Auth Tab ... */}
        {activeTab === "auth" && (
          <div className="p-8 max-w-lg">
            {/* ... Seu form de auth. Garanta que inputs tenham bg-[#18181b] ... */}
          </div>
        )}
      </div>
    </div>
  );
}
