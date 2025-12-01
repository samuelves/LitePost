import { useState } from "react";
import KeyValueTable from "./key-value-table";
import type { Environment, EnvVariable } from "../types";

interface EnvManagerProps {
  isOpen: boolean;
  onClose: () => void;
  envs: Environment[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  onCreate: (name: string) => void;
  onUpdate: (id: string, vars: EnvVariable[]) => void;
  onDelete: (id: string) => void;
}

export default function EnvManager({
  isOpen,
  onClose,
  envs,
  activeId,
  setActiveId,
  onCreate,
  onUpdate,
  onDelete,
}: EnvManagerProps) {
  const [newEnvName, setNewEnvName] = useState("");

  if (!isOpen) return null;
  const activeEnv = envs.find((e) => e.id === activeId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#252526] border border-[#444] rounded shadow-2xl w-[600px] h-[500px] flex flex-col">
        <div className="flex h-full">
          {/* Sidebar Environments */}
          <div className="w-1/3 border-r border-[#444] flex flex-col">
            <div className="p-2 border-b border-[#444] font-bold text-gray-400 text-xs">
              Environments
            </div>
            <div className="flex-1 overflow-auto">
              {envs.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setActiveId(env.id)}
                  className={`p-2 text-xs cursor-pointer flex justify-between group ${activeId === env.id ? "bg-violet-900/50 text-white" : "text-gray-400 hover:bg-[#333]"}`}
                >
                  <span>{env.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(env.id);
                    }}
                    className="hidden group-hover:block text-red-400 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#444] flex gap-1">
              <input
                className="flex-1 bg-[#1e1e1e] text-xs p-1 rounded border border-[#444] text-white"
                placeholder="New Env..."
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
              />
              <button
                onClick={() => {
                  if (newEnvName) {
                    onCreate(newEnvName);
                    setNewEnvName("");
                  }
                }}
                className="text-xs bg-violet-600 text-white px-2 rounded"
              >
                +
              </button>
            </div>
          </div>
          {/* Variables Editor */}
          <div className="flex-1 flex flex-col p-4 bg-[#1e1e1e]">
            <h3 className="text-sm font-bold text-white mb-4">
              {activeEnv?.name} Variables
            </h3>
            {activeEnv && (
              <div className="flex-1 overflow-auto">
                <KeyValueTable
                  data={activeEnv.vars}
                  onChange={(newVars) => onUpdate(activeEnv.id, newVars)}
                />
              </div>
            )}
          </div>
        </div>
        <div className="p-2 border-t border-[#444] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#333] hover:bg-[#444] text-white px-4 py-1 text-xs rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
