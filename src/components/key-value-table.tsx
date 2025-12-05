import { KeyValue } from "../types";

interface KeyValueTableProps {
  data: KeyValue[];
  onChange: (newData: KeyValue[]) => void;
}
export default function KeyValueTable({ data, onChange }: KeyValueTableProps) {
  // data = [{ key, value, active }]

  const handleRowChange = (
    index: number,
    field: keyof KeyValue,
    newValue: string | boolean,
  ) => {
    const newData = [...data];
    // @ts-ignore - TS luta um pouco com tipos dinâmicos em objetos tipados, mas aqui é seguro
    newData[index][field] = newValue;
    onChange(newData);

    if (
      index === data.length - 1 &&
      (newData[index].key || newData[index].value)
    ) {
      onChange([...newData, { key: "", value: "", active: true }]);
    }
  };

  const removeRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData.length ? newData : [{ key: "", value: "", active: true }]);
  };

  return (
    <div className="w-full flex flex-col text-xs font-mono h-full bg-[#09090b]">
      <div className="flex border-b border-[#27272a] text-gray-500 font-semibold bg-[#18181b] sticky top-0 z-10 text-[10px] uppercase tracking-wider">
        <div className="w-12 p-2.5 text-center"></div>
        <div className="flex-1 p-2.5 border-r border-[#27272a]">Key</div>
        <div className="flex-1 p-2.5 border-r border-[#27272a]">Value</div>
        <div className="w-10"></div>
      </div>

      {data.map((row, index) => (
        <div
          key={index}
          className="flex border-b border-[#27272a] group hover:bg-[#18181b]/50 transition-colors"
        >
          <div className="w-12 flex items-center justify-center border-r border-[#27272a]">
            <input
              type="checkbox"
              checked={row.active}
              onChange={(e) =>
                handleRowChange(index, "active", e.target.checked)
              }
              className="accent-violet-600 cursor-pointer"
            />
          </div>
          <div className="flex-1 border-r border-[#27272a]">
            <input
              type="text"
              placeholder="Enter key..."
              className="w-full bg-transparent p-2.5 outline-none text-gray-200 placeholder-gray-700 focus:bg-[#18181b]/30"
              value={row.key}
              onChange={(e) => handleRowChange(index, "key", e.target.value)}
            />
          </div>
          <div className="flex-1 border-r border-[#27272a]">
            <input
              type="text"
              placeholder="Enter value..."
              className="w-full bg-transparent p-2.5 outline-none text-gray-200 placeholder-gray-700 focus:bg-[#18181b]/30"
              value={row.value}
              onChange={(e) => handleRowChange(index, "value", e.target.value)}
            />
          </div>
          <div className="w-10 flex items-center justify-center">
            {index !== data.length - 1 && (
              <button
                onClick={() => removeRow(index)}
                className="text-gray-700 hover:text-red-400 font-bold text-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Remove row"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
