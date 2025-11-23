export const PAPER_STATUSES = [
  "Draft",
  "Submitted",
  "UnderReview",
  "Accepted",
  "Published",
  "Rejected",
  "Withdrawn",
] as const;

export type PaperStatus = (typeof PAPER_STATUSES)[number];
