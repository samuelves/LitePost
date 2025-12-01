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
    <div className="w-full flex flex-col text-xs font-mono">
      <div className="flex border-b border-[#333] text-gray-500 font-bold bg-[#1e1e1e]">
        <div className="w-8 p-2 text-center"></div>
        <div className="flex-1 p-2 border-r border-[#333]">Key</div>
        <div className="flex-1 p-2 border-r border-[#333]">Value</div>
        <div className="w-8"></div>
      </div>

      {data.map((row, index) => (
        <div
          key={index}
          className="flex border-b border-[#333] group hover:bg-[#252526]"
        >
          <div className="w-8 flex items-center justify-center border-r border-[#333]">
            <input
              type="checkbox"
              checked={row.active}
              onChange={(e) =>
                handleRowChange(index, "active", e.target.checked)
              }
              className="accent-violet-600"
            />
          </div>
          <div className="flex-1 border-r border-[#333]">
            <input
              type="text"
              placeholder="Key"
              className="w-full bg-transparent p-2 outline-none text-gray-300 placeholder-gray-600"
              value={row.key}
              onChange={(e) => handleRowChange(index, "key", e.target.value)}
            />
          </div>
          <div className="flex-1 border-r border-[#333]">
            <input
              type="text"
              placeholder="Value"
              className="w-full bg-transparent p-2 outline-none text-gray-300 placeholder-gray-600"
              value={row.value}
              onChange={(e) => handleRowChange(index, "value", e.target.value)}
            />
          </div>
          <div className="w-8 flex items-center justify-center">
            {index !== data.length - 1 && (
              <button
                onClick={() => removeRow(index)}
                className="text-gray-600 hover:text-red-500 font-bold"
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
