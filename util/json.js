/**
 * JSON helpers used across the viewer.
 */

/**
 * Attempt to parse JSON, returning null on failure instead of throwing.
 * @param {string} value
 * @returns {any|null}
 */
export function tryParseJson(value) {
    if (typeof value !== 'string') {
        return null;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
}

/**
 * Quick heuristic to determine if a string could be JSON.
 * @param {string} value
 * @returns {boolean}
 */
export function looksLikeJson(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const trimmed = value.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}'))
        || (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Perform a deep clone using structuredClone when available, otherwise
 * fall back to JSON serialisation.
 * @param {any} value
 * @returns {any}
 */
export function safeDeepClone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
