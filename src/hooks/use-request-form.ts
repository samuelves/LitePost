import { useState, useCallback } from "react";
import { CollectionItem, KeyValue, Auth } from "../types";

export function useRequestForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestName, setRequestName] = useState("");

  const [method, setMethod] = useState("GET");
  const [url, setUrlState] = useState(""); // Renomeado para State interno
  const [body, setBody] = useState("");

  const [queryParams, setQueryParamsState] = useState<KeyValue[]>([
    { key: "", value: "", active: true },
  ]);
  const [headers, setHeaders] = useState<KeyValue[]>([
    { key: "", value: "", active: true },
  ]);
  const [auth, setAuth] = useState<Auth>({ type: "none", token: "" });

  // --- LÓGICA DE SINCRONIZAÇÃO URL <-> PARAMS ---

  // Helper: Converte Array -> String (Query String)
  const buildUrlFromParams = (baseUrl: string, params: KeyValue[]) => {
    const activeParams = params.filter((p) => p.key && p.active);
    if (activeParams.length === 0) return baseUrl;

    const queryString = activeParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");

    // Remove query antiga se existir e adiciona a nova
    const cleanBase = baseUrl.split("?")[0];
    return `${cleanBase}?${queryString}`;
  };

  // Helper: Converte String (URL) -> Array
  const parseParamsFromUrl = (newUrl: string) => {
    try {
      // Hack para parsear query params mesmo se a URL for inválida/parcial
      const dummyBase = "http://dummy.com";
      const urlObj = new URL(
        newUrl.includes("://") ? newUrl : `${dummyBase}/${newUrl}`,
      );

      const newParams: KeyValue[] = [];
      urlObj.searchParams.forEach((value, key) => {
        newParams.push({ key, value, active: true });
      });

      // Adiciona linha vazia no final para edição
      newParams.push({ key: "", value: "", active: true });
      return newParams;
    } catch (e) {
      return [{ key: "", value: "", active: true }];
    }
  };

  // 1. Quando o usuário digita na URL
  const setUrl = (newUrl: string) => {
    setUrlState(newUrl);
    // Se tiver '?', atualiza a tabela
    if (newUrl.includes("?")) {
      setQueryParamsState(parseParamsFromUrl(newUrl));
    }
  };

  // 2. Quando o usuário mexe na Tabela de Params
  const setQueryParams = (newParams: KeyValue[]) => {
    setQueryParamsState(newParams);
    // Reconstrói a URL
    const cleanUrl = url.split("?")[0];
    const newFullUrl = buildUrlFromParams(cleanUrl, newParams);
    setUrlState(newFullUrl);
  };

  // --- RESTO DO HOOK (Load e Snapshot) ---

  const loadRequest = (req: CollectionItem) => {
    setSelectedId(req.id);
    setRequestName(req.name);
    setMethod(req.method || "GET");
    setUrlState(req.url || "");
    setBody(req.body || "");

    // Se o request salvo já tiver params, usa eles, senão tenta extrair da URL
    if (req.queryParams && req.queryParams.length > 0) {
      setQueryParamsState(req.queryParams);
    } else if (req.url) {
      setQueryParamsState(parseParamsFromUrl(req.url));
    } else {
      setQueryParamsState([{ key: "", value: "", active: true }]);
    }

    setHeaders(req.headers || [{ key: "", value: "", active: true }]);
    setAuth(req.auth || { type: "none", token: "" });
  };

  const getSnapshot = (): CollectionItem => ({
    id: selectedId || "",
    type: "request",
    name: requestName,
    method,
    url, // Usa a URL atualizada
    body,
    queryParams, // Usa os params sincronizados
    headers,
    auth,
  });

  return {
    selectedId,
    setSelectedId,
    requestName,
    setRequestName,
    method,
    setMethod,
    url,
    setUrl, // Exporta nosso setter inteligente
    body,
    setBody,
    queryParams,
    setQueryParams, // Exporta nosso setter inteligente
    headers,
    setHeaders, // Headers já funcionam com add/remove nativo do KeyValueTable
    auth,
    setAuth,
    loadRequest,
    getSnapshot,
  };
}
