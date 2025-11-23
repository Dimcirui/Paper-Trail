const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  "http://localhost:3000";

const API_TOKEN =
  process.env.API_AUTH_TOKEN ?? process.env.NEXT_PUBLIC_API_AUTH_TOKEN;

type ApiInit = RequestInit & { bypassAuth?: boolean };

async function fetchFromApi<T>(path: string, init?: ApiInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!init?.bypassAuth) {
    if (!API_TOKEN) {
      throw new Error(
        "API_AUTH_TOKEN must be configured to call backend endpoints.",
      );
    }
    headers.set("authorization", `Bearer ${API_TOKEN}`);
    const role =
      process.env.NEXT_PUBLIC_USER_ROLE ??
      process.env.USER_ROLE ??
      "viewer";
    headers.set("x-user-role", role);
  }

  const response = await fetch(`${APP_URL}${path}`, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed");
  }
  return data as T;
}

export function getRecentPapers() {
  return fetchFromApi<{ papers: unknown[] }>("/api/papers");
}

export type PaperOverviewResponse = {
  paper: {
    id: number;
    title: string;
    status: string;
    submissionDate?: string | null;
    publicationDate?: string | null;
    primaryContactName?: string | null;
    venueName?: string | null;
  } | null;
  authors: Array<{
    userName: string;
    email?: string | null;
    authorOrder: number;
    contributionNotes?: string | null;
  }>;
  revisions: Array<{
    versionLabel: string;
    notes?: string | null;
    createdAt?: string | null;
  }>;
  activityLog: Array<{
    actionType: string;
    actionDetail?: string | null;
    timestamp?: string | null;
    userName?: string | null;
  }>;
};

export function getPaperOverview(id: string | number) {
  return fetchFromApi<PaperOverviewResponse>(`/api/papers/${id}`);
}

export async function postPaper(payload: unknown) {
  return fetchFromApi<{ paper: { id: number } }>("/api/papers", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function patchPaper(id: number, payload: unknown) {
  return fetchFromApi<{ paper: { id: number } }>(`/api/papers/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
