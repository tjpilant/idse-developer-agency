import type { Data } from "@measured/puck";

/**
 * Serialize Puck Data into a JSON string suitable for storage/export.
 * Strips non-serializable fields (functions/react nodes) by relying on JSON.stringify.
 * Optionally pretty-prints with 2-space indentation.
 */
export function exportPageData(data: Data, pretty = false): string {
  const replacer = (_key: string, value: unknown) => {
    // Drop functions or undefined values that can’t be serialized cleanly.
    if (typeof value === "function" || value === undefined) return undefined;
    return value;
  };
  return JSON.stringify(data, replacer, pretty ? 2 : 0);
}
