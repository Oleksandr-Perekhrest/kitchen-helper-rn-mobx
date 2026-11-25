// Hermes does not guarantee crypto.randomUUID, ids are local and not security-sensitive
export function createId(): string {
    const hex = "0123456789abcdef";
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        const v = c === "x" ? r : (r % 4) + 8;
        return hex.charAt(v);
    });
}
