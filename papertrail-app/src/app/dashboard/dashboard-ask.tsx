"use client";

import Link from "next/link";
import { useState } from "react";

type PaperSummary = {
  id: number;
  title: string;
  abstract: string | null;
  status: string;
  authors: string[];
};

type AskResponse = {
  answer: string;
  sources: PaperSummary[];
};

type Props = {
  apiToken: string;
  userRole: string;
};

export function DashboardAsk({ apiToken, userRole }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/papers/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
          "x-user-role": userRole,
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Request failed.");
        return;
      }

      const data: AskResponse = await res.json();
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Ask AI</span>
          <span className="text-xs text-slate-400">Ask a question about your papers</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which papers study transformer architectures?"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || question.trim().length < 3}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Ask"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                {result.answer}
              </div>

              {result.sources.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    Sources
                  </p>
                  <ul className="space-y-2">
                    {result.sources.map((paper) => (
                      <li key={paper.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-slate-300">•</span>
                        <div>
                          <Link
                            href={`/dashboard/browser/${paper.id}`}
                            className="font-medium text-indigo-700 hover:text-indigo-500"
                          >
                            {paper.title}
                          </Link>
                          <span className="ml-2 text-xs text-slate-400">{paper.status}</span>
                          {paper.authors.length > 0 && (
                            <p className="text-xs text-slate-400">{paper.authors.join(", ")}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
