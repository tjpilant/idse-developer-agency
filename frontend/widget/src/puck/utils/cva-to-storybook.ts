import type { ArgTypes } from "@storybook/react";

type CVAVariants = Record<string, Record<string, unknown>>;
type ControlType = "radio" | "select" | "inline-radio";

/**
 * Generate Storybook argTypes for CVA variant keys.
 * Defaults to radio controls; overrides can specify control type per variant.
 */
export function cvaVariantsToArgTypes<T extends CVAVariants>(
  cvaConfig: { variants: T },
  controlOverrides: Partial<Record<keyof T, ControlType>> = {}
): ArgTypes {
  const argTypes: ArgTypes = {};

  for (const [variantName, variantOptions] of Object.entries(cvaConfig.variants)) {
    const options = Object.keys(variantOptions);
    const control = controlOverrides[variantName as keyof T] || "radio";

    argTypes[variantName] = {
      control,
      options,
      description: `${variantName.charAt(0).toUpperCase() + variantName.slice(1)} variant`,
    };
  }

  return argTypes;
}
