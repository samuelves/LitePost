import { CollectionItem, EnvVariable } from "../types";

export const replaceVariables = (
  text: string | undefined,
  variables: EnvVariable[],
): string => {
  if (!text) return "";
  return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const found = variables.find((v) => v.key === key.trim() && v.active);
    return found ? found.value : match;
  });
};

export const processRequestWithEnv = (
  formState: CollectionItem,
  variables: EnvVariable[],
): CollectionItem => {
  const processed = { ...formState };

  if (processed.url) processed.url = replaceVariables(processed.url, variables);
  if (processed.body)
    processed.body = replaceVariables(processed.body, variables);

  if (processed.headers) {
    processed.headers = processed.headers.map((h) => ({
      ...h,
      key: replaceVariables(h.key, variables),
      value: replaceVariables(h.value, variables),
    }));
  }

  if (processed.queryParams) {
    processed.queryParams = processed.queryParams.map((p) => ({
      ...p,
      key: replaceVariables(p.key, variables),
      value: replaceVariables(p.value, variables),
    }));
  }

  if (processed.auth && processed.auth.token) {
    processed.auth.token = replaceVariables(processed.auth.token, variables);
  }

  return processed;
};
