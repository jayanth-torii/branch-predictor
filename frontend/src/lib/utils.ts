export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/* ══════════════════════════════════════════════════════════════════════════
   COUNTS IN PROSE

   Copy that states a count has gone stale three times in this project: the
   landing page promised twenty-five questions after the quest became ten, the
   page metadata claimed thirty-four courses while the catalogue held twelve,
   and a hero chip disagreed with the footer beside it.

   The cause each time was the same — the number lives in `QUESTIONS.length`
   and was retyped into a sentence, so the sentence had no way to follow it.
   `spellNumber(QUESTIONS.length)` costs the same to write and cannot drift.
   ══════════════════════════════════════════════════════════════════════════ */

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** 10 -> "ten". Falls back to digits above twenty, which reads fine in prose. */
export function spellNumber(value: number): string {
  return NUMBER_WORDS[value] ?? String(value);
}

/** For a count that opens a sentence: 10 -> "Ten". */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** ["a", "b", "c"] -> "a, b and c". */
export function listPhrase(items: string[]): string {
  if (items.length < 2) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
