'use client';

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPaperAction } from "./actions";

type Option = {
  id: number;
  label: string;
};

type CreatePaperFormProps = {
  venues: Option[];
  contacts: Option[];
  statuses: readonly string[];
};

type FormState =
  | { success: false; paperId?: undefined; error?: string }
  | { success: true; paperId: number; error?: undefined };

const initialState: FormState = { success: false };

export function CreatePaperForm({
  venues,
  contacts,
  statuses,
}: CreatePaperFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(
    createPaperAction,
    initialState,
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success && state.paperId) {
      toast.success("Paper created.");
      router.push(`/dashboard/browser/${state.paperId}`);
    }
  }, [router, state]);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Register a new manuscript
        </h2>
        <p className="text-sm text-slate-500">
          Required fields help automate downstream workflows.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Title<span className="text-rose-500">*</span>
        </label>
        <input
          name="title"
          required
          minLength={3}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="e.g., Federated Learning for Longitudinal Health Studies"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Abstract</label>
        <textarea
          name="abstract"
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="Describe the contribution..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Venue<span className="text-rose-500">*</span>
          </label>
          <select
            name="venueId"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select venue
            </option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Primary Contact<span className="text-rose-500">*</span>
          </label>
          <select
            name="primaryContactId"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select researcher
            </option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          defaultValue="Draft"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit Paper"}
    </button>
  );
}
