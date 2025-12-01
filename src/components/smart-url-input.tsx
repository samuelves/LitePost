import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import {
  EditorView,
  ViewUpdate,
  Decoration,
  MatchDecorator,
  ViewPlugin,
  hoverTooltip,
} from "@codemirror/view";
import { EnvVariable } from "../types";

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
  const varHighlightPlugin = useMemo(() => {
    const decorator = new MatchDecorator({
      regexp: /\{\{(.*?)\}\}/g,
      decoration: (match) => {
        const varName = match[1];
        const exists = variables.find((v) => v.key === varName && v.active);
        return Decoration.mark({
          class: "cm-variable-highlight",
          attributes: {
            style: `color: ${exists ? "#fde047" : "#f87171"}; font-weight: bold;`,
          },
        });
      },
    });
    return ViewPlugin.fromClass(
      class {
        decorations: any;
        constructor(view: EditorView) {
          this.decorations = decorator.createDeco(view);
        }
        update(update: ViewUpdate) {
          this.decorations = decorator.updateDeco(update, this.decorations);
        }
      },
      { decorations: (v) => v.decorations },
    );
  }, [variables]);

  const varTooltip = useMemo(
    () =>
      hoverTooltip((view, pos) => {
        const { from, to, text } = view.state.doc.lineAt(pos);
        let start = pos,
          end = pos;
        while (start > from && /[\w{}]/.test(text[start - from - 1])) start--;
        while (end < to && /[\w{}]/.test(text[end - from])) end++;

        const word = text.slice(start - from, end - from);
        const match = word.match(/^\{\{(.*?)\}\}$/);

        if (match) {
          const varKey = match[1];
          const found = variables.find((v) => v.key === varKey && v.active);
          return {
            pos: start,
            end,
            above: true,
            create() {
              const dom = document.createElement("div");
              dom.className =
                "bg-[#18181b] text-xs text-gray-200 px-3 py-2 rounded border border-[#333] shadow-xl z-50 font-mono";
              if (found)
                dom.innerHTML = `<span class="text-gray-500">val:</span> <span class="text-emerald-400">${found.value}</span>`;
              else
                dom.innerHTML = `<span class="text-red-400">Not found</span>`;
              return { dom };
            },
          };
        }
        return null;
      }),
    [variables],
  );

  return (
    <div className="flex-1 h-10 bg-[#18181b] border border-[#333] rounded overflow-hidden flex items-center focus-within:border-violet-500">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[varHighlightPlugin, varTooltip, EditorView.lineWrapping]} // Adicione seu theme aqui
        basicSetup={false}
        height="100%"
        className="w-full text-sm bg-[#18181b]"
      />
    </div>
  );
}
