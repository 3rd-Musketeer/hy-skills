import { create } from "zustand";
import { devtools } from "zustand/middleware";

type Step = "intro" | "summon" | "retrieve" | "askPick" | "result" | "done";

type StoryState = {
  step: Step;
  submittedQuery: string | null;
  pickedOption: string | null;

  next: () => void;
  prev: () => void;
  submitQuery: (text: string) => void;
  pickOption: (id: string) => void;
  reset: () => void;
};

const STEP_ORDER: Step[] = ["intro", "summon", "retrieve", "askPick", "result", "done"];

function neighbor(step: Step, delta: 1 | -1): Step {
  const i = STEP_ORDER.indexOf(step);
  const next = Math.max(0, Math.min(STEP_ORDER.length - 1, i + delta));
  return STEP_ORDER[next];
}

export const useStoryStore = create<StoryState>()(
  devtools(
    (set) => ({
      step: "intro",
      submittedQuery: null,
      pickedOption: null,

      next: () => set((s) => ({ step: neighbor(s.step, 1) })),
      prev: () => set((s) => ({ step: neighbor(s.step, -1) })),
      submitQuery: (text) => set({ submittedQuery: text, step: "retrieve" }),
      pickOption: (id) => set({ pickedOption: id, step: "result" }),
      reset: () => set({ step: "intro", submittedQuery: null, pickedOption: null }),
    }),
    { name: "story-store" }
  )
);
