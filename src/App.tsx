import { useEffect, useState } from "react";
import Sidebar from "./components/side-bar";
import RequestPanel from "./components/request-panel";
import ResponsePanel from "./components/response-panel";
import GlobalModals from "./components/global-modals";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// Hooks Customizados
import { useCollections } from "./hooks/use-collections";
import { useRequestForm } from "./hooks/use-request-form";
import { useApiSender } from "./hooks/use-api-sender";
import type { KeyValue } from "./types";
import { useEnvironments } from "./hooks/use-environments";

import EnvManager from "./components/env-manager";
import SnippetModal from "./components/snippet-modal";
import CurlImportModal from "./components/curl-import-modal";
import { CollectionItem } from "./types";
import { setupMonacoTheme } from "./lib/monaco";

function App() {
  // 1. Hooks de Lógica
  const collections = useCollections();
  const form = useRequestForm();
  const api = useApiSender();
  const envs = useEnvironments();

  useEffect(() => {
    setupMonacoTheme();
  }, []);

  // 2. Estados de UI (Tipados)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string | null;
    type: string;
  } | null>(null);

  const [activeModal, setActiveModal] = useState<{
    type: "create_folder" | "create_req" | "rename";
    targetId: string | null;
  } | null>(null);

  const [showEnvManager, setShowEnvManager] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);
  const [showCurl, setShowCurl] = useState(false);

  // --- HANDLERS ---

  const handleSelectRequest = (item: CollectionItem) => {
    form.loadRequest(item);
    api.clearResponse();
  };

  const handleSaveRequest = () => {
    if (!form.selectedId) return;
    collections.updateRequest(form.selectedId, form.getSnapshot());
  };

  const handleSend = () => {
    api.sendRequest(form.getSnapshot(), envs.activeVars);
  };

  const handleCurlImport = (data: any) => {
    form.setMethod(data.method);
    form.setUrl(data.url);
    if (data.headers) {
      // Adiciona uma linha vazia no final para facilitar edição
      form.setHeaders([...data.headers, { key: "", value: "", active: true }]);
    }
    if (data.body) form.setBody(data.body);
  };

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CTRL + ENTER = Send
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      // CTRL + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, envs.activeVars]); // Recria o listener se o form mudar para pegar o estado atual

  // --- MENUS E MODAIS ---

  const handleContextMenu = (
    e: React.MouseEvent,
    item: CollectionItem | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      targetId: item ? item.id : null,
      type: item ? item.type : "root",
    });
  };

  const handleModalSubmit = (val: string) => {
    if (!activeModal) return;
    const { type, targetId } = activeModal;

    if (type === "create_folder") {
      collections.createItem(targetId, "folder", val);
    } else if (type === "create_req") {
      const newReq = collections.createItem(targetId, "request", val);
      form.loadRequest(newReq);
      api.clearResponse();
    } else if (type === "rename" && targetId) {
      collections.renameItem(targetId, val);
      if (form.selectedId === targetId) form.setRequestName(val);
    }
    setActiveModal(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      collections.deleteItem(id);
      if (form.selectedId === id) form.setSelectedId(null);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* HEADER */}
      <div className="h-12 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between px-4 select-none shrink-0 z-10">
        <div className="font-bold text-violet-500 text-sm tracking-wide">
          LitePost
        </div>

        <div className="flex items-center gap-4">
          {/* Env Selector */}
          <div className="flex items-center bg-[#18181b] rounded border border-[#333] h-7 px-2 hover:border-[#555] transition-colors">
            <span className="text-xs text-gray-500 font-bold mr-2 p-2">
              ENV
            </span>
            <div className="relative">
              <select
                className={`bg-[#18181b] font-bold text-xs h-10 pl-3 pr-8 rounded border border-[#333] outline-none cursor-pointer hover:border-[#555] appearance-none`}
                value={envs.activeEnvId || ""}
                onChange={(e) => envs.setActiveEnvId(e.target.value)}
              >
                {/* CSS FIX: Options escuras */}
                {envs.envs.map((e) => (
                  <option key={e.id} value={e.id} className="bg-[#18181b]">
                    {e.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-3 pointer-events-none text-[10px] text-gray-500">
                ▼
              </div>
            </div>
            <button
              onClick={() => setShowEnvManager(true)}
              className="ml-2 text-gray-500 hover:text-white text-xs p-2"
            >
              ⚙
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#333]"></div>

          {/* Tools */}
          <button
            onClick={() => setShowCurl(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <span>📥</span> Import
          </button>
          <button
            onClick={() => setShowSnippet(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <span>{"</>"}</span> Code
          </button>
        </div>
      </div>

      {/* PAINÉIS (LAYOUT PRINCIPAL) */}
      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {/* 1. SIDEBAR */}
          <Panel className="bg-[#18181b] border-r border-[#27272a] flex flex-col h-full">
            <Sidebar
              collections={collections.data}
              selectedId={form.selectedId}
              onSelect={handleSelectRequest}
              onToggle={collections.toggleFolder}
              onContextMenu={handleContextMenu}
              onCreateFolder={() =>
                setActiveModal({ type: "create_folder", targetId: null })
              }
            />
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-[#27272a] hover:bg-violet-600 transition-colors hover:w-[2px] z-50" />

          {/* 2. WORKSPACE */}
          <Panel defaultSize={50} minSize={20} className="flex flex-col h-full">
            <PanelGroup direction="horizontal">
              {/* REQUEST */}
              <Panel
                defaultSize={50}
                minSize={20}
                className="bg-[#09090b] flex flex-col h-full"
              >
                <RequestPanel
                  {...form}
                  loading={api.loading}
                  saveStatus={collections.saveStatus}
                  onSend={handleSend}
                  onSave={handleSaveRequest}
                  activeVars={envs.activeVars}
                />
              </Panel>

              <PanelResizeHandle className="w-[1px] bg-[#27272a] hover:bg-violet-600 transition-colors hover:w-[2px] z-50" />

              {/* RESPONSE */}
              <Panel
                defaultSize={50}
                minSize={20}
                className="bg-[#09090b] flex flex-col h-full"
              >
                <ResponsePanel response={api.response} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* --- FLUTUANTES --- */}

      {/* Context Menu Customizado */}
      {contextMenu && (
        <div
          className="fixed bg-[#252526] border border-[#444] rounded z-[100] py-1 w-40 shadow-xl text-gray-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {(contextMenu.type === "folder" || contextMenu.type === "root") && (
            <>
              <button
                className="block w-full text-left px-4 py-2 text-xs hover:bg-violet-600"
                onClick={() =>
                  setActiveModal({
                    type: "create_req",
                    targetId: contextMenu.targetId,
                  })
                }
              >
                New Request
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-xs hover:bg-violet-600 border-b border-[#444]"
                onClick={() =>
                  setActiveModal({
                    type: "create_folder",
                    targetId: contextMenu.targetId,
                  })
                }
              >
                New Folder
              </button>
            </>
          )}
          {contextMenu.targetId && (
            <>
              <button
                className="block w-full text-left px-4 py-2 text-xs hover:bg-violet-600"
                onClick={() =>
                  setActiveModal({
                    type: "rename",
                    targetId: contextMenu.targetId,
                  })
                }
              >
                Rename
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-xs hover:bg-red-900 text-red-400"
                onClick={() => handleDelete(contextMenu.targetId!)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Modais Globais */}
      <GlobalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={handleModalSubmit}
      />
      <EnvManager
        isOpen={showEnvManager}
        onClose={() => setShowEnvManager(false)}
        envs={envs.envs}
        activeId={envs.activeEnvId}
        setActiveId={envs.setActiveEnvId}
        onCreate={envs.addEnv}
        onUpdate={envs.updateEnvVars}
        onDelete={envs.deleteEnv}
      />
      <SnippetModal
        isOpen={showSnippet}
        onClose={() => setShowSnippet(false)}
        formState={form.getSnapshot()}
      />
      <CurlImportModal
        isOpen={showCurl}
        onClose={() => setShowCurl(false)}
        onImport={handleCurlImport}
      />
    </div>
  );
}

export default App;
