
export const Sections = {
    airing: "airing",
    popular: "bypopularity",
    upcoming: "upcoming",
} as const;

export function isSection(data: string): data is keyof typeof Sections {
    if (data === "airing") {
        return true;
    }

    if (data === "popular") {
        return true;
    }

    if (data === "upcoming") {
        return true;
    }

    return false;
}