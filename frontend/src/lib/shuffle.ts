/* ══════════════════════════════════════════════════════════════════════════
   PER-STUDENT QUESTION ORDER

   Two students sitting next to each other should not see the same questions
   in the same order with the same options in the same places. Copying an
   answer off the next desk stops being useful, and a batch's results stop
   carrying the order effect where whatever sat in slot A collected more
   picks than it earned.

   Three properties this has to have, and the reason for each:

   1. DETERMINISTIC from a stored seed, never `Math.random()` at render time.
      A student who refreshes mid-assessment must get the same board back; a
      re-roll on every render would move the card under their finger.

   2. ORDER-ONLY. Nothing here touches an option's `id`, `weights` or
      `correctId`. Scoring looks every answer up by id, so a shuffled board
      and the canonical bank produce byte-identical profiles — which also
      means answers stored before this shipped stay comparable.

   3. SEED 0 MEANS "LEAVE IT ALONE". A run already in progress when this
      deploys has no seed persisted, so it keeps the order it started with
      instead of being reshuffled halfway through.
   ══════════════════════════════════════════════════════════════════════════ */

/** FNV-1a. Gives each question a stable offset so its options are shuffled
    independently of its neighbours' — otherwise every question on the page
    would permute the same way. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32: small, fast, and good enough for shuffling six cards. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates, seeded. Returns a new array; the input is never mutated,
 * because the input here is the shared question bank.
 */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice();
  if (!seed || out.length < 2) return out;
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The shape both banks share: an id, and a list of options to reorder. */
type Askable<O> = { id: string; options: O[] };

/**
 * Shuffles a bank and every question's options inside it.
 *
 * `salt` separates the two rounds, so a student does not meet stage 2 in a
 * permutation derived from the same number that ordered stage 1.
 */
export function shuffleBank<O, T extends Askable<O>>(
  bank: readonly T[],
  seed: number,
  salt = 0,
): T[] {
  if (!seed) return bank.slice();
  const runSeed = (seed ^ salt) >>> 0;
  return shuffled(bank, runSeed).map((item) => ({
    ...item,
    // The question's own id is mixed in, so adding or removing a question
    // does not reshuffle the options of the ones around it.
    options: shuffled(item.options, (runSeed ^ hashString(item.id)) >>> 0),
  }));
}

/** Salt for the stream round. Any constant works; this one is just not 0. */
export const STREAM_SALT = 0x9e3779b9;

/**
 * A fresh seed for one student's run.
 *
 * Call this from an event handler only — never during render or module
 * evaluation, where a server value and a client value would disagree.
 */
export function newRunSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}

/** Positional labels for the option badge. The badge shows where a card sits
    on screen, not which option it is — after shuffling, an option's own id
    would read as a jumbled A, D, C, F down the page. */
export const OPTION_LETTERS = "ABCDEFGHIJ".split("");
