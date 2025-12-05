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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#18181b] border border-[#3f3f46] p-5 rounded-lg shadow-2xl w-96">
        <h3 className="text-sm font-semibold text-gray-100 mb-4">
          {titles[activeModal.type] || "Input"}
        </h3>
        <input
          autoFocus
          type="text"
          className="w-full bg-[#09090b] text-white px-3 py-2 text-sm rounded border border-[#3f3f46] outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 mb-5 transition-all"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter name..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 hover:bg-[#27272a] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-4 py-2 rounded transition-colors shadow-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
