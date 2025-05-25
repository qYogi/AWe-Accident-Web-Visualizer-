import type { Accident } from "../types/types.js";

export function extractActiveFlags(
  accident: Accident,
  flagColumns: string[],
): string[] {
  return flagColumns
    .filter((flag) =>
      Object.keys(accident).some(
        (key) => key.toLowerCase() === flag && accident[key as keyof Accident],
      ),
    )
    .map((flag) =>
      flag
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    );
}
