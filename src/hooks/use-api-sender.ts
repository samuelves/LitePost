import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import JSON5 from "json5";
import { processRequestWithEnv } from "../utils/replacer";
import { ApiResponse, CollectionItem, EnvVariable } from "../types";

export function useApiSender() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const clearResponse = () => setResponse(null);

  const sendRequest = async (
    formState: CollectionItem,
    envVars: EnvVariable[] = [],
  ) => {
    setLoading(true);
    setResponse(null);

    const processedForm = processRequestWithEnv(formState, envVars);
    const { url, method, body, headers, auth } = processedForm;

    let finalUrl = url || "";

    const headersMap: Record<string, string> = {};
    (headers || []).forEach((h) => {
      if (h.active && h.key) headersMap[h.key] = h.value;
    });

    if (auth?.type === "bearer" && auth.token) {
      headersMap["Authorization"] = `Bearer ${auth.token}`;
    }

    let finalBody: string | null = null;
    if (method !== "GET" && body) {
      try {
        finalBody = JSON.stringify(JSON5.parse(body));
      } catch {
        finalBody = body;
      }
    }

    try {
      const res = await invoke<ApiResponse>("api_request", {
        method,
        url: finalUrl,
        body: finalBody,
        headers: headersMap,
      });
      setResponse(res);
    } catch (error) {
      setResponse({
        body: "Error: " + String(error),
        status: 0,
        headers: {},
        duration: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, response, sendRequest, clearResponse };
}
