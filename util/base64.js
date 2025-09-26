/**
 * Base64 utility helpers for the NFC IPS viewer.
 * These functions mirror the pre-merge implementations so the codec pipeline
 * and legacy payload handlers continue to work without modification.
 */

/**
 * Normalise a base64 string so its length is a multiple of four and uses
 * standard characters.
 * @param {string} value - Base64 or base64url encoded string.
 * @returns {string}
 */
export function normaliseBase64(value = '') {
    const trimmed = String(value).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    const remainder = trimmed.length % 4;
    if (remainder === 0) {
        return trimmed;
    }
    return trimmed + '='.repeat(4 - remainder);
}

/**
 * Decode a base64/base64url string into a Uint8Array.
 * @param {string} value
 * @returns {Uint8Array}
 */
export function base64ToUint8Array(value) {
    const normalised = normaliseBase64(value);
    const binary = typeof atob === 'function'
        ? atob(normalised)
        : Buffer.from(normalised, 'base64').toString('binary');

    const output = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        output[i] = binary.charCodeAt(i);
    }
    return output;
}

/**
 * Decode a base64/base64url string into a UTF-8 string.
 * @param {string} value
 * @returns {string}
 */
export function base64ToString(value) {
    const bytes = base64ToUint8Array(value);
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder().decode(bytes);
    }
    return Buffer.from(bytes).toString('utf8');
}
