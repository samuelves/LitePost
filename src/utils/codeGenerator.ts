import { CollectionItem } from "../types";

type LangTarget = "curl" | "node" | "python" | "javascript";

export function generateCode(
  request: CollectionItem,
  lang: LangTarget,
): string {
  const { method, url, body, headers, auth } = request;

  // 1. Preparar Headers
  const headerObj: Record<string, string> = {};
  headers?.forEach((h) => {
    if (h.active && h.key) headerObj[h.key] = h.value;
  });
  if (auth?.type === "bearer" && auth.token) {
    headerObj["Authorization"] = `Bearer ${auth.token}`;
  }

  // 2. Preparar Body (evitar undefined)
  const hasBody = method !== "GET" && method !== "HEAD" && body;
  const safeBody = hasBody ? body : "";

  switch (lang) {
    case "curl":
      return generateCurl(method || "GET", url || "", headerObj, safeBody);
    case "node":
    case "javascript":
      return generateNodeFetch(method || "GET", url || "", headerObj, safeBody);
    case "python":
      return generatePythonRequests(
        method || "GET",
        url || "",
        headerObj,
        safeBody,
      );
    default:
      return "// Language not supported";
  }
}

// --- GERADORES INDIVIDUAIS ---

function generateCurl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
): string {
  let snippet = `curl -X ${method} "${url}"`;

  // Headers
  Object.entries(headers).forEach(([key, val]) => {
    snippet += ` \\\n  -H "${key}: ${val}"`;
  });

  // Body
  if (body) {
    // Escapa aspas duplas dentro do JSON para não quebrar o bash
    const escapedBody = body.replace(/"/g, '\\"');
    snippet += ` \\\n  -d "${escapedBody}"`;
  }

  return snippet;
}

function generateNodeFetch(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
): string {
  const hasBody = !!body;

  let snippet = `const headers = {\n`;
  Object.entries(headers).forEach(([key, val]) => {
    snippet += `  "${key}": "${val}",\n`;
  });
  snippet += `};\n\n`;

  snippet += `fetch("${url}", {\n`;
  snippet += `  method: "${method}",\n`;
  snippet += `  headers: headers,\n`;
  if (hasBody) {
    snippet += `  body: JSON.stringify(${body})\n`;
  }
  snippet += `})\n`;
  snippet += `.then(response => response.json())\n`;
  snippet += `.then(data => console.log(data));`;

  return snippet;
}

function generatePythonRequests(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
): string {
  let snippet = `import requests\nimport json\n\n`;

  snippet += `url = "${url}"\n\n`;

  snippet += `payload = json.dumps(${body || "{}"})\n`;

  snippet += `headers = {\n`;
  Object.entries(headers).forEach(([key, val]) => {
    snippet += `  '${key}': '${val}',\n`;
  });
  snippet += `}\n\n`;

  snippet += `response = requests.request("${method}", url, headers=headers, data=payload)\n\n`;
  snippet += `print(response.text)`;

  return snippet;
}
