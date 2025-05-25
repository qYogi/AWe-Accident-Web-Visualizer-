export function extractActiveFlags(accident, flagColumns) {
    return flagColumns
        .filter((flag) => Object.keys(accident).some((key) => key.toLowerCase() === flag && accident[key]))
        .map((flag) => flag
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "));
}
