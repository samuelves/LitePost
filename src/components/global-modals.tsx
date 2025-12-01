import { useState, useEffect } from "react";

type ModalType = "create_folder" | "create_req" | "rename";

interface GlobalModalsProps {
  activeModal: { type: ModalType } | null;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
}

export default function GlobalModals({
  activeModal,
  onClose,
  onSubmit,
}: GlobalModalsProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (activeModal) setInputValue(""); // Limpa ao abrir
  }, [activeModal]);

  if (!activeModal) return null;

  const titles = {
    create_folder: "New Folder Name",
    create_req: "New Request Name",
    rename: "Rename Item",
  };

  const handleSubmit = () => {
    if (inputValue.trim()) onSubmit(inputValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#252526] border border-[#444] p-4 rounded shadow-2xl w-80">
        <h3 className="text-sm font-bold text-gray-200 mb-3">
          {titles[activeModal.type] || "Input"}
        </h3>
        <input
          autoFocus
          type="text"
          className="w-full bg-[#1e1e1e] text-white p-2 text-xs rounded border border-[#444] outline-none focus:border-violet-500 mb-4"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white px-3 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
