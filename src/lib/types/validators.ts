export function isValidUsername(username: unknown): { valid: true } | { valid: false; reason: string } {
    if (typeof username !== "string") {
        return { valid: false, reason: "Username must be a string" }
    }

    if (username === "") {
        return { valid: false, reason: "Username must not be empty" };
    }
    if (username.length < 3) {
        return {
            valid: false,
            reason: "Username must be at least 3 characters long",
        };
    }

    if (username.length > 15) {
        return {
            valid: false,
            reason: "Username must be at most 8 characters long",
        };
    }

    if (username !== username.trim()) {
        return {
            valid: false,
            reason: "Username must not contain leading or trailing whitespace",
        };
    }

    if (username.search(/[^A-Za-z0-9-_ ]+/) >= 0) {
        return {
            valid: false,
            reason: "Username must not have special characters",
        };
    }

    return { valid: true };
}