export interface KeyValue {
  key: string;
  value: string;
  active: boolean;
}

export interface Auth {
  type: string; // 'none' | 'bearer' | 'basic'
  token?: string;
  username?: string;
  password?: string;
}

// Representa um Request ou uma Pasta
export interface CollectionItem {
  id: string;
  type: "folder" | "request";
  name: string;
  isOpen?: boolean; // Apenas para pastas
  children?: CollectionItem[]; // Apenas para pastas

  // Apenas para Requests
  method?: string;
  url?: string;
  body?: string;
  headers?: KeyValue[];
  queryParams?: KeyValue[];
  auth?: Auth;
}

export interface EnvVariable {
  key: string;
  value: string;
  active: boolean;
}

export interface Environment {
  id: string;
  name: string;
  vars: EnvVariable[];
}

// O que o Rust devolve
export interface ApiResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
  duration: number;
}
