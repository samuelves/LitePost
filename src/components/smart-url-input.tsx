import Editor from "react-simple-code-editor";
import { EnvVariable } from "../types";

const highlightWithVars = (code: string, variables: EnvVariable[]) => {
  const parts = code.split(/(\{\{.*?\}\})/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(/^\{\{.*?\}\}$/)) {
          const varKey = part.slice(2, -2).trim();
          const exists = variables.find((v) => v.key === varKey && v.active);
          // Retorna o span colorido
          return (
            <span
              key={i}
              style={{
                color: exists ? "#fde047" : "#f87171", // Amarelo ou Vermelho
                fontWeight: "bold",
              }}
              title={exists ? `Value: ${exists.value}` : "Variable not found"}
            >
              {part}
            </span>
          );
        }
        // Texto normal
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

interface SmartUrlInputProps {
  value: string;
  onChange: (val: string) => void;
  variables?: EnvVariable[];
}

export default function SmartUrlInput({
  value,
  onChange,
  variables = [],
}: SmartUrlInputProps) {
  return (
    <div className="flex-1 h-full bg-[#18181b] border border-[#333] rounded overflow-hidden flex items-center focus-within:border-violet-500 transition-colors relative">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlightWithVars(code, variables)}
        padding={10}
        className="font-mono text-sm text-gray-200"
        textareaClassName="focus:outline-none"
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 13,
          width: "100%",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
