import type { Field } from "@measured/puck";

type CVAVariants = Record<string, Record<string, unknown>>;

type FieldOverride = {
  label?: string;
  type?: Field["type"];
};

/**
 * Generate Puck field definitions from CVA variant keys.
 * Defaults to radio controls; overrides can change label/type.
 */
export function cvaVariantsToPuckFields<T extends CVAVariants>(
  cvaConfig: { variants: T },
  fieldOverrides: Partial<Record<keyof T, FieldOverride>> = {}
): Record<string, Field> {
  const fields: Record<string, Field> = {};

  for (const [variantName, variantOptions] of Object.entries(cvaConfig.variants)) {
    const override = fieldOverrides[variantName as keyof T] || {};
    const options = Object.keys(variantOptions).map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: key,
    }));

    fields[variantName] = {
      type: override.type || "radio",
      label: override.label || variantName.charAt(0).toUpperCase() + variantName.slice(1),
      options,
    } as Field;
  }

  return fields;
}
