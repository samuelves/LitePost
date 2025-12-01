use std::collections::HashMap;
use std::fs;
use std::time::Instant;
use serde::Serialize;
use tauri::Manager;

// --- ESTRUTURA DA RESPOSTA HTTP ---
#[derive(Serialize)]
struct ApiResponse {
    status: u16,
    body: String,
    headers: HashMap<String, String>,
    duration: u128,
}

// --- DADOS DE EXEMPLO (APIs PÚBLICAS) ---
// Isso será usado se o arquivo não existir no disco
const DEFAULT_COLLECTIONS: &str = r#"[
  {
    "id": "folder-examples",
    "type": "folder",
    "name": "Exemplos de Recursos",
    "isOpen": true,
    "children": [
      {
        "id": "req-query",
        "type": "request",
        "method": "GET",
        "name": "Query Params (Busca)",
        "url": "https://dummyjson.com/products/search",
        "queryParams": [
            { "key": "q", "value": "phone", "active": true },
            { "key": "limit", "value": "5", "active": true }
        ],
        "headers": [],
        "body": ""
      },
      {
        "id": "req-auth",
        "type": "request",
        "method": "GET",
        "name": "Auth (Bearer Token)",
        "url": "https://httpbin.org/bearer",
        "auth": { "type": "bearer", "token": "meu-token-secreto" },
        "body": ""
      },
      {
        "id": "req-headers",
        "type": "request",
        "method": "GET",
        "name": "Custom Headers",
        "url": "https://httpbin.org/headers",
        "headers": [
            { "key": "X-Meu-Client", "value": "AeroClient/1.0", "active": true }
        ],
        "body": ""
      }
    ]
  }
]"#;

// --- COMANDO: FAZER REQUISIÇÃO HTTP ---
#[tauri::command]
async fn api_request(
    method: String,
    url: String,
    body: Option<String>,
    headers: Option<HashMap<String, String>> // <--- NOVO ARGUMENTO
) -> Result<ApiResponse, String> {
    let client = reqwest::Client::new();
    let start = Instant::now();

    let mut request_builder = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        _ => return Err("Método não suportado".to_string()),
    };

    // Adiciona Headers Customizados
    if let Some(h_map) = headers {
        for (k, v) in h_map {
            request_builder = request_builder.header(k, v);
        }
    }

    if let Some(data) = body {
        if !data.is_empty() {
             request_builder = request_builder
                .header("Content-Type", "application/json")
                .body(data);
        }
    }

    match request_builder.send().await {
        Ok(response) => {
            let duration = start.elapsed().as_millis();
            let status = response.status().as_u16();

            let mut res_headers = HashMap::new();
            for (key, value) in response.headers() {
                res_headers.insert(key.to_string(), value.to_str().unwrap_or("").to_string());
            }
            let body_text = response.text().await.unwrap_or_default();

            Ok(ApiResponse { status, body: body_text, headers: res_headers, duration })
        }
        Err(e) => Err(format!("Erro: {}", e)),
    }
}


// --- COMANDO: SALVAR DADOS NO DISCO ---
#[tauri::command]
fn save_data(app: tauri::AppHandle, data: String) -> Result<String, String> {
    // 1. Pega o caminho da pasta de dados do app (ex: AppData/Roaming/com.aero.client)
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // 2. Garante que a pasta existe (se for a primeira vez, cria)
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    }

    // 3. Define o caminho do arquivo
    let file_path = app_dir.join("collections.json");

    // 4. Salva
    match fs::write(file_path, data) {
        Ok(_) => Ok("Salvo com sucesso!".to_string()),
        Err(e) => Err(format!("Erro ao salvar: {}", e)),
    }
}

// --- COMANDO: CARREGAR DADOS (CORRIGIDO PARA APPDATA) ---
#[tauri::command]
fn load_data(app: tauri::AppHandle) -> String {
    // 1. Pega o caminho
    let app_dir = match app.path().app_data_dir() {
        Ok(path) => path,
        Err(_) => return DEFAULT_COLLECTIONS.to_string(),
    };

    let file_path = app_dir.join("collections.json");

    // 2. Tenta ler. Se falhar (arquivo não existe), retorna o padrão
    match fs::read_to_string(file_path) {
        Ok(content) => content,
        Err(_) => DEFAULT_COLLECTIONS.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // REGISTRE OS 3 COMANDOS AQUI
        .invoke_handler(tauri::generate_handler![api_request, save_data, load_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
