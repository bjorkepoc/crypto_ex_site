import { ExerciseSet } from "@/types";
import e1 from "./exercises/E-1.json";
import e2 from "./exercises/E-2.json";
import e3 from "./exercises/E-3.json";
import e4 from "./exercises/E-4.json";
import e5 from "./exercises/E-5.json";
import e6 from "./exercises/E-6.json";
import e7 from "./exercises/E-7.json";
import e8 from "./exercises/E-8.json";

const allSets: ExerciseSet[] = [
  ...e1 as unknown as ExerciseSet[],
  ...e2 as unknown as ExerciseSet[],
  ...e3 as unknown as ExerciseSet[],
  ...e4 as unknown as ExerciseSet[],
  ...e5 as unknown as ExerciseSet[],
  ...e6 as unknown as ExerciseSet[],
  ...e7 as unknown as ExerciseSet[],
  ...e8 as unknown as ExerciseSet[],
];

export function getAllExerciseSets(): ExerciseSet[] {
  return allSets;
}

export function getExerciseSetById(id: string): ExerciseSet | undefined {
  return allSets.find((s) => s.id === id);
}
