'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  updatePaperDetailsAction,
  addAuthorAction,
  removeAuthorAction,
  reorderAuthorAction,
  linkGrantAction,
  unlinkGrantAction,
  deletePaperAction,
  hardDeletePaperAction,
} from "./actions";

type Author = {
  id: number;
  userId: number;
  name: string;
  email: string;
  authorOrder: number;
  notes: string;
};

type LinkedGrant = {
  grantId: number;
  grantName: string;
  sponsor: string;
};

type Option = {
  id: number;
  label: string;
};

type ManagePaperPanelProps = {
  paper: {
    id: number;
    title: string;
    abstract: string;
    status: string;
  };
  authors: Author[];
  currentGrants: LinkedGrant[];
  availableGrants: Option[];
  statuses: readonly string[];
  availableAuthors: Option[];
};

export function ManagePaperPanel({
  paper,
  authors,
  currentGrants,
  availableGrants,
  statuses,
  availableAuthors,
}: ManagePaperPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(paper.title);
  const [abstract, setAbstract] = useState(paper.abstract);
  const [status, setStatus] = useState(paper.status);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [authorOrder, setAuthorOrder] = useState<number | null>(null);
  const [selectedGrantId, setSelectedGrantId] = useState<number | null>(null);

  const handlePaperUpdate = () => {
    startTransition(async () => {
      const result = await updatePaperDetailsAction({
        id: paper.id,
        title,
        abstract,
        status,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Metadata updated.");
        router.refresh();
      }
    });
  };

  const handleAddAuthor = () => {
    if (!selectedAuthorId) {
      toast.error("Select a researcher to add.");
      return;
    }
    startTransition(async () => {
      const result = await addAuthorAction({
        paperId: paper.id,
        userId: selectedAuthorId,
        authorOrder: authorOrder ?? undefined,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Author linked.");
        setSelectedAuthorId(null);
        setAuthorOrder(null);
        router.refresh();
      }
    });
  };

  const handleRemoveAuthor = (authorshipId: number) => {
    startTransition(async () => {
      const result = await removeAuthorAction({
        paperId: paper.id,
        authorshipId,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Author removed.");
        router.refresh();
      }
    });
  };

  const handleReorder = (authorshipId: number, nextOrder: number) => {
    startTransition(async () => {
      const result = await reorderAuthorAction({
        paperId: paper.id,
        authorshipId,
        authorOrder: Math.max(1, nextOrder),
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Author order updated.");
        router.refresh();
      }
    });
  };

  const handleLinkGrant = () => {
    if (!selectedGrantId) {
      toast.error("Select a grant to link.");
      return;
    }
    startTransition(async () => {
      const result = await linkGrantAction({
        paperId: paper.id,
        grantId: selectedGrantId,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Grant linked successfully.");
        setSelectedGrantId(null);
        router.refresh();
      }
    });
  };

  const handleUnlinkGrant = (grantId: number) => {
    if (!confirm("Are you sure you want to unlink this grant?")) {
      return;
    }

    startTransition(async () => {
      const result = await unlinkGrantAction({
        paperId: paper.id,
        grantId: grantId,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Grant unlinked.");
        router.refresh();
      }
    });
  };

  const handleDeletePaper = () => {
    if (!confirm("Are you sure you want to DELETE this paper?")) return;

    startTransition(async () => {
      const result = await deletePaperAction(paper.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Paper deleted.");
        router.push("/dashboard");
      }
    });
  };

  const userRole =
    (process.env.NEXT_PUBLIC_USER_ROLE ?? "viewer").toLowerCase();
  const canHardDelete = userRole === "admin";

  const handleHardDeletePaper = () => {
    if (
      !confirm(
        "Hard delete removes this paper, its authorships, grants, and logs permanently. Proceed?",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await hardDeletePaperAction(paper.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Paper permanently removed.");
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Manuscript metadata
            </h2>
            <p className="text-sm text-slate-500">
              Update fields shared with collaborators across the workflow.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleDeletePaper}
              disabled={pending}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? "Deleting..." : "Delete"}
            </button>
            {canHardDelete && (
              <button
                type="button"
                onClick={handleHardDeletePaper}
                disabled={pending}
                className="ml-3 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {pending ? "Hard deleting..." : "Hard delete"}
              </button>
            )}
            <button
              type="button"
              onClick={handlePaperUpdate}
              disabled={pending}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">
              Abstract
            </label>
            <textarea
              value={abstract}
              onChange={(event) => setAbstract(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Funding & Grants</h2>
            <p className="text-sm text-slate-500">
              Link funding sources to this research output.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {currentGrants.map((grant) => (
            <div key={grant.grantId} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  {grant.grantName}
                </p>
                <p className="text-xs text-emerald-600">
                  Sponsor: {grant.sponsor}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUnlinkGrant(grant.grantId)}
                disabled={pending}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-white disabled:opacity-40"
              >
                Unlink
              </button>
            </div>
          ))}
          {currentGrants.length === 0 && (
            <p className="text-sm italic text-slate-400">
              No grants linked yet.
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <select
            value={selectedGrantId ?? ""}
            onChange={(e) => setSelectedGrantId(Number(e.target.value))}
            className="flex-grow rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select a grant to link...</option>
            {availableGrants.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
            </select>
          <button
            type="button"
            onClick={handleLinkGrant}
            disabled={pending || !selectedGrantId}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
          >
            Link
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Authorship management
            </h2>
            <p className="text-sm text-slate-500">
              Maintain order-sensitive authorship aligned with journal
              requirements.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {authors.map((author, index) => (
            <div
              key={author.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  #{author.authorOrder} · {author.name}
                </p>
                <p className="text-xs text-slate-500">{author.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    handleReorder(author.id, author.authorOrder - 1)
                  }
                  disabled={index === 0 || pending}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleReorder(author.id, author.authorOrder + 1)
                  }
                  disabled={index === authors.length - 1 || pending}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveAuthor(author.id)}
                  disabled={pending}
                  className="rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600 hover:border-rose-300 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {authors.length === 0 && (
            <p className="text-sm italic text-slate-400">
              No authors linked yet.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Researcher
              </label>
              <select
                value={selectedAuthorId ?? ""}
                onChange={(event) =>
                  setSelectedAuthorId(Number(event.target.value))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select collaborator</option>
                {availableAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Author order
              </label>
              <input
                type="number"
                min={1}
                value={authorOrder ?? ""}
                onChange={(event) =>
                  setAuthorOrder(
                    event.target.value
                      ? Number(event.target.value)
                      : null,
                  )
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Auto"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddAuthor}
            disabled={pending}
            className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
          >
            {pending ? "Processing..." : "Link author"}
          </button>
        </div>
      </section>
    </div>
  );
}
