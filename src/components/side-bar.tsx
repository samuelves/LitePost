import React from "react";
import { CollectionItem } from "../types";

interface SidebarProps {
  collections: CollectionItem[];
  selectedId: string | null;
  onSelect: (item: CollectionItem) => void;
  onToggle: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: CollectionItem | null) => void;
  onCreateFolder: () => void;
}
export default function Sidebar({
  collections,
  selectedId,
  onSelect,
  onToggle,
  onContextMenu,
  onCreateFolder,
}: SidebarProps) {
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
      default:
        return "text-gray-400";
    }
  };

  const renderTree = (items: CollectionItem[], level = 0): React.ReactNode =>
    items.map((item) => {
      if (item.type === "folder") {
        return (
          <div key={item.id}>
            <div
              className="flex items-center gap-1 p-1 hover:bg-[#2e2e2e] cursor-pointer text-gray-400 select-none border-l-2 border-transparent"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => onToggle(item.id)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <span className="text-[10px] w-3 opacity-70">
                {item.isOpen ? "▼" : "▶"}
              </span>
              <svg
                className="w-4 h-4 text-yellow-600 opacity-80"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-xs font-semibold truncate text-gray-300 flex-1">
                {item.name}
              </span>
            </div>
            {item.isOpen && item.children && (
              <div>{renderTree(item.children, level + 1)}</div>
            )}
          </div>
        );
      } else {
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            onContextMenu={(e) => onContextMenu(e, item)}
            className={`flex items-center gap-2 p-1.5 cursor-pointer text-sm select-none border-l-2 transition-colors group ${isSelected ? "bg-[#333] border-violet-500" : "border-transparent hover:bg-[#2e2e2e]"}`}
            style={{ paddingLeft: `${level * 12 + 20}px` }}
          >
            <span
              className={`text-[9px] font-bold w-8 ${getMethodColor(item.method || "")}`}
            >
              {item.method}
            </span>
            <span
              className={`truncate text-xs ${isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
            >
              {item.name}
            </span>
          </div>
        );
      }
    });

  return (
    <div className="w-full h-full bg-[#09090b] flex flex-col min-w-0">
      <div className="h-12 flex items-center justify-between px-3 border-b border-[#27272a] shrink-0">
        <span className="font-bold text-violet-500 text-sm tracking-wide">
          Aero Client
        </span>
        <button
          onClick={onCreateFolder}
          className="text-gray-400 hover:text-white text-xs px-2 hover:bg-[#27272a] rounded py-1 transition-colors"
        >
          + Folder
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar pb-20">
        {collections.length === 0 ? (
          <div className="text-xs text-gray-500 p-4 text-center">
            Right click to start
          </div>
        ) : (
          renderTree(collections)
        )}
      </div>
    </div>
  );
}
