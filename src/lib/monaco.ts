import { loader } from "@monaco-editor/react";

export const setupMonacoTheme = () => {
  loader.init().then((monaco) => {
    monaco.editor.defineTheme("litePost", {
      base: "vs-dark", // Importante: base escura
      inherit: true,
      rules: [
        { background: "09090b" }, // Cor de fundo dos tokens
      ],
      colors: {
        "editor.background": "#09090b", // Fundo Principal (Zinc 950)
        "editor.foreground": "#e4e4e7", // Texto Principal
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#a1a1aa",
        "editorCursor.foreground": "#a78bfa", // Cursor Roxo
        "editor.selectionBackground": "#5b21b655", // Seleção Roxa
        "editor.inactiveSelectionBackground": "#5b21b633",
        "editorIndentGuide.background": "#27272a",
        "editorIndentGuide.activeBackground": "#52525b",
        "editor.lineHighlightBackground": "#18181b", // Linha ativa sutil
      },
    });
  });
};
