import { useState } from "react";
import { CollectionItem, KeyValue, Auth } from "../types";

export function useRequestForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestName, setRequestName] = useState("");

  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");

  const [queryParams, setQueryParams] = useState<KeyValue[]>([
    { key: "", value: "", active: true },
  ]);
  const [headers, setHeaders] = useState<KeyValue[]>([
    { key: "", value: "", active: true },
  ]);
  const [auth, setAuth] = useState<Auth>({ type: "none", token: "" });

  const loadRequest = (req: CollectionItem) => {
    setSelectedId(req.id);
    setRequestName(req.name);
    setMethod(req.method || "GET");
    setUrl(req.url || "");
    setBody(req.body || "");

    setQueryParams(req.queryParams || [{ key: "", value: "", active: true }]);
    setHeaders(req.headers || [{ key: "", value: "", active: true }]);
    setAuth(req.auth || { type: "none", token: "" });
  };

  const getSnapshot = (): CollectionItem => ({
    id: selectedId || "",
    type: "request",
    name: requestName,
    method,
    url,
    body,
    queryParams,
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
    setUrl,
    body,
    setBody,
    queryParams,
    setQueryParams,
    headers,
    setHeaders,
    auth,
    setAuth,
    loadRequest,
    getSnapshot,
  };
}
