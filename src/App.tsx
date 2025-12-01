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

function App() {
  const collections = useCollections();
  const form = useRequestForm();
  const api = useApiSender();
  const envs = useEnvironments();

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

  const handleSelectRequest = (item: CollectionItem) => {
    form.loadRequest(item);
    api.clearResponse();
  };

  const handleSaveRequest = () => {
    if (!form.selectedId) return;
    collections.updateRequest(form.selectedId, form.getSnapshot());
  };

  const handleSend = () => {
    const currentVars = envs.activeVars || [];

    // Debug: Ajuda a ver se as variáveis estão chegando no console (F12)
    console.log("Enviando com variáveis:", currentVars);
    // Passa as variaveis de ambiente ativas para o Sender
    api.sendRequest(form.getSnapshot(), envs.activeVars);
  };

  const handleCurlImport = (data: {
    method: string;
    url: string;
    headers: KeyValue[];
    body: string;
  }) => {
    form.setMethod(data.method || "GET");
    form.setUrl(data.url || "");
    if (data.headers && data.headers.length > 0)
      form.setHeaders([...data.headers, { key: "", value: "", active: true }]);
    if (data.body) form.setBody(data.body);
  };

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CTRL + ENTER = SEND
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      // CTRL + S = SAVE
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, envs.activeVars]); // Dependências importantes para o Send funcionar com estado atual

  // ... (Logica de context menu e modal basico igual antes) ...
  const handleContextMenu = (
    e: React.MouseEvent,
    item: CollectionItem | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      targetId: item?.id || null,
      type: item?.type || "root",
    });
  };
  const handleModalSubmit = (val: string) => {
    if (!activeModal) return;
    const { type, targetId } = activeModal;
    if (!targetId) return;
    if (type === "create_folder")
      collections.createItem(targetId, "folder", val);
    else if (type === "create_req") {
      const r = collections.createItem(targetId, "request", val);
      form.loadRequest(r);
      api.clearResponse();
    } else if (type === "rename") {
      collections.renameItem(targetId, val);
      if (form.selectedId === targetId) form.setRequestName(val);
    }
    setActiveModal(null);
  };
  const handleDelete = (id: string) => {
    if (confirm("Delete?")) {
      collections.deleteItem(id);
      if (form.selectedId === id) form.setSelectedId(null);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* HEADER (Mantido igual) */}
      <div className="h-12 bg-[#09090b] border-b border-[#27272a] flex items-center justify-end px-4 select-none gap-4 shrink-0">
        {/* ... (Seu código do header/env selector aqui) ... */}
        <div className="bg-[#09090b] flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-bold">ENV:</span>
          <select
            className="bg-[#09090b] border border-[#333] text-xs rounded p-1 outline-none"
            value={envs.activeEnvId || ""}
            onChange={(e) => envs.setActiveEnvId(e.target.value)}
          >
            {envs.envs.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowEnvManager(true)}
            className="text-gray-500 hover:text-white"
          >
            ⚙
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCurl(true)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Import
          </button>
          <button
            onClick={() => setShowSnippet(true)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Code
          </button>
        </div>
      </div>

      {/* --- ÁREA DE PAINÉIS REDIMENSIONÁVEIS --- */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* 1. PAINEL DA ESQUERDA (SIDEBAR) */}
          <Panel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="flex flex-col"
          >
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

          {/* DIVISÓRIA 1 (Igual a outra) */}
          <PanelResizeHandle className="w-[1px] bg-[#27272a] hover:bg-violet-600 transition-colors hover:w-[2px] z-10" />

          {/* 2. PAINEL DA DIREITA (WORKSPACE) */}
          <Panel>
            <PanelGroup direction="horizontal">
              {/* 2A. REQUEST (MEIO) */}
              <Panel defaultSize={50} minSize={20}>
                <RequestPanel
                  {...form}
                  loading={api.loading}
                  saveStatus={collections.saveStatus}
                  onSend={handleSend}
                  onSave={handleSaveRequest}
                  activeVars={envs.activeVars}
                />
              </Panel>

              {/* DIVISÓRIA 2 */}
              <PanelResizeHandle className="w-[1px] bg-[#27272a] hover:bg-violet-600 transition-colors hover:w-[2px] z-10" />

              {/* 2B. RESPONSE (DIREITA) */}
              <Panel defaultSize={50} minSize={20}>
                <ResponsePanel response={api.response} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* ... Modais ... */}
      {/* (Seus modais aqui embaixo mantidos iguais) */}
      <GlobalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={handleModalSubmit}
      />
      {contextMenu && (
        <div
          className="absolute bg-[#252526] border border-[#444] rounded z-50 py-1 w-40 shadow-xl"
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
                onClick={() => handleDelete(contextMenu.targetId || "")}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
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
