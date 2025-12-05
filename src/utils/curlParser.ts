export interface ParsedCurl {
  method: string;
  url: string;
  headers: { key: string; value: string; active: boolean }[];
  body: string;
}

/**
 * Um parser de cURL leve e moderno feito para o LitePost.
 * Suporta formatos do Chrome, Firefox e Terminal.
 */
export function parseCurlCommand(input: string): ParsedCurl {
  if (!input || !input.trim().startsWith("curl")) {
    throw new Error("Comando inválido. Deve começar com 'curl'.");
  }

  // 1. Limpeza inicial: remove quebras de linha de shell (\ + enter)
  const cleanInput = input
    .replace(/\\\r\n/g, " ")
    .replace(/\\\n/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim();

  // 2. Tokenização Inteligente (A mágica acontece aqui)
  // Essa Regex separa argumentos respeitando aspas:
  // - Matches "aspas duplas"
  // - Matches 'aspas simples'
  // - Matches texto sem aspas
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const args: string[] = [];
  let match;

  while ((match = regex.exec(cleanInput)) !== null) {
    // match[0] é o texto completo (com aspas).
    // match[1] é o conteúdo das aspas duplas.
    // match[2] é o conteúdo das aspas simples.
    // Se match[1] ou [2] existirem, usamos eles (remove as aspas externas).
    // Se não, usamos match[0] (texto cru).
    const value =
      match[1] !== undefined
        ? match[1]
        : match[2] !== undefined
          ? match[2]
          : match[0];
    args.push(value);
  }

  // 3. Processamento dos Argumentos
  const result: ParsedCurl = {
    method: "GET", // Default
    url: "",
    headers: [],
    body: "",
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1]; // O valor do flag

    // URL (geralmente começa com http e não é um valor de flag anterior)
    if (arg.startsWith("http") && !args[i - 1].startsWith("-")) {
      result.url = arg;
      continue;
    }

    // Método (-X POST ou --request POST)
    if (arg === "-X" || arg === "--request") {
      result.method = nextArg.toUpperCase();
      i++; // Pula o próximo
      continue;
    }

    // Headers (-H "Key: Value" ou --header)
    if (arg === "-H" || arg === "--header") {
      const headerString = nextArg;
      const separatorIndex = headerString.indexOf(":");
      if (separatorIndex !== -1) {
        const key = headerString.substring(0, separatorIndex).trim();
        const value = headerString.substring(separatorIndex + 1).trim();
        result.headers.push({ key, value, active: true });
      }
      i++;
      continue;
    }

    // Body (-d, --data, --data-raw, --data-binary)
    if (
      arg === "-d" ||
      arg === "--data" ||
      arg === "--data-raw" ||
      arg === "--data-binary"
    ) {
      // Tenta formatar se for JSON
      try {
        const jsonBody = JSON.parse(nextArg);
        result.body = JSON.stringify(jsonBody, null, 2);
        // Se tiver body, geralmente é POST (se não foi definido ainda)
        if (result.method === "GET") result.method = "POST";
      } catch {
        result.body = nextArg;
      }
      i++;
      continue;
    }

    // Auth (-u user:pass)
    if (arg === "-u" || arg === "--user") {
      const [user, pass] = nextArg.split(":");
      const token = btoa(`${user}:${pass}`);
      result.headers.push({
        key: "Authorization",
        value: `Basic ${token}`,
        active: true,
      });
      i++;
      continue;
    }

    // Compressed (--compressed)
    if (arg === "--compressed") {
      result.headers.push({
        key: "Accept-Encoding",
        value: "gzip, deflate, br",
        active: true,
      });
    }
  }

  return result;
}
