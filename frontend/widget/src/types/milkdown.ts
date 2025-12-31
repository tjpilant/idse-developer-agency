export interface DocumentPayload {
  path: string;
  content: string;
}

export interface DocumentResponse extends DocumentPayload {}

export interface RenderRequest {
  content: string;
}

export interface RenderResponse {
  html: string;
}

export interface SaveResponse {
  path: string;
  saved: boolean;
  mode: string;
}
