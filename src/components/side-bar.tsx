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
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#18181b] cursor-pointer text-gray-400 select-none border-l-2 border-transparent transition-colors"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => onToggle(item.id)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <span className="text-[10px] w-3 text-gray-500">
                {item.isOpen ? "▼" : "▶"}
              </span>
              <svg
                className="w-4 h-4 text-amber-500 opacity-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-xs font-medium truncate text-gray-200 flex-1">
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
            className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer text-sm select-none border-l-2 transition-all group ${isSelected ? "bg-[#27272a] border-violet-500" : "border-transparent hover:bg-[#18181b]"}`}
            style={{ paddingLeft: `${level * 16 + 20}px` }}
          >
            <span
              className={`text-[10px] font-bold w-10 ${getMethodColor(item.method || "")}`}
            >
              {item.method}
            </span>
            <span
              className={`truncate text-xs ${isSelected ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}
            >
              {item.name}
            </span>
          </div>
        );
      }
    });

  return (
    <div className="w-full h-full bg-[#09090b] flex flex-col min-w-0 border-r border-[#27272a]">
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#27272a] shrink-0 bg-[#09090b]">
        <span className="font-bold text-violet-400 text-base tracking-wide">
          LitePost
        </span>
        <button
          onClick={onCreateFolder}
          className="text-gray-500 hover:text-white text-xs px-2.5 py-1.5 hover:bg-[#18181b] rounded transition-colors border border-transparent hover:border-[#3f3f46]"
        >
          + Folder
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {collections.length === 0 ? (
          <div className="text-xs text-gray-500 p-4 text-center">
            Right-click to create
          </div>
        ) : (
          renderTree(collections)
        )}
      </div>
    </div>
  );
}
