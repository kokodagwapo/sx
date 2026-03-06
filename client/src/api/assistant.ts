export type AssistantLoanPlan = {
  q: string;
  sort?: string;
  filters?: Record<string, string[]>;
  ranges?: Record<string, Array<[number, number]>>;
};

export type AssistantLoanResponse = {
  answer: string;
  plan: AssistantLoanPlan;
  summary?: { total: number; totalUpb: number; wac: number; waFico: number };
  preview?: Array<Record<string, unknown>>;
};

export async function assistantLoanSearch(query: string): Promise<AssistantLoanResponse> {
  const res = await fetch("/api/assistant/loans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as AssistantLoanResponse;
}

export async function cohiChat(query: string): Promise<{ answer: string }> {
  const res = await fetch("/api/cohi/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as { answer: string };
}

export async function cohiTts(text: string): Promise<Blob> {
  const res = await fetch("/api/cohi/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.blob();
}

