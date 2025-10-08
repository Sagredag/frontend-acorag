import ky from "ky";

const API = ky.create({ prefixUrl: import.meta.env.VITE_API_URL || "http://localhost:8000" });

export interface SearchRow {
  document_id: string;
  title: string;
  number: string;
  category: string;
  doc_type: string;
  revision: string;
  filename: string;
  date_modified: string | null;
  snippet: string | null;
  score: number;
}

export async function search(params: {
  query: string; project_id?: string; top_k?: number; probes?: number;
}): Promise<SearchRow[]> {
  return API.post("search", { json: params }).json<SearchRow[]>();
}

export interface ChatResponse {
  question: string;
  answer: string;
  sources: SearchRow[];
  context_used: string;
}

export async function chat(params: {
  question: string; max_context_docs?: number;
}): Promise<ChatResponse> {
  return API.post("chat", { json: params }).json<ChatResponse>();
}
