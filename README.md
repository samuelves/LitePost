# ⚡ LitePost

> O Client API nativo, leve e sem bloatware. Construído para desenvolvedores que cansaram de esperar o Postman abrir.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-orange)
![Rust](https://img.shields.io/badge/backend-Rust-red)

**LitePost** é uma alternativa moderna aos clientes HTTP tradicionais. Ao contrário de apps baseados em Electron que consomem 400MB+ de RAM apenas para existir, o LitePost utiliza **Tauri (Rust)** e o WebView nativo do sistema operacional, resultando em um binário minúsculo (~5MB) e consumo de memória insignificante.

![Screenshot do LitePost](./screenshot.png)
*(Coloque um print do seu app aqui e nomeie como screenshot.png)*

## 🚀 Funcionalidades

*   **Performance Nativa:** Backend em Rust para requisições HTTP ultra-rápidas.
*   **Organização:** Gerenciamento completo de Collections com pastas infinitas e aninhadas.
*   **Ambientes (Environments):** Variáveis globais e por ambiente com substituição em tempo real (`{{base_url}}`).
*   **Editor Poderoso:** Highlight de sintaxe JSON, tooltips de variáveis e input de URL inteligente.
*   **Import/Export:** Importe comandos cURL diretamente da área de transferência.
*   **Code Generation:** Gere snippets de código para Node.js, Python, cURL e mais.
*   **Privacidade:** Seus dados são salvos localmente (`%APPDATA%`), nada vai para a nuvem.

## 🛠️ Tech Stack

*   **Core:** [Tauri v2](https://tauri.app/)
*   **Backend:** Rust (reqwest, serde, tokio)
*   **Frontend:** React (Vite)
*   **Estilização:** TailwindCSS
*   **Editor:** CodeMirror 6

## 📦 Instalação e Desenvolvimento

Certifique-se de ter o ambiente Rust e Node.js configurados.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/litepost.git

# 2. Instale as dependências
npm install

# 3. Rode em modo de desenvolvimento
npm run tauri dev

# 4. Compile o binário final (Release)
npm run tauri build
