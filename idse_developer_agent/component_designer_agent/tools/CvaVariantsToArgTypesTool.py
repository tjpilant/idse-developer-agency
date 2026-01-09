from typing import Dict, Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class CvaVariantsToArgTypesTool(BaseTool):
    """
    Convert a CVA variant map to Storybook argTypes.
    Each variant gets a control (default 'radio'), with override support.
    """

    variant_map: Dict[str, Dict[str, str]] = Field(
        ...,
        description="A dictionary where keys are variant names and values are option:class mappings.",
    )
    control_overrides: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description=(
            "Override control types per variant. Options: 'radio', 'select', 'inline-radio'."
        ),
    )

    def run(self) -> Dict[str, Dict[str, object]]:
        arg_types: Dict[str, Dict[str, object]] = {}
        for variant_name, options_dict in self.variant_map.items():
            control_type = self.control_overrides.get(variant_name, "radio")
            options = list(options_dict.keys())
            arg_types[variant_name] = {
                "control": control_type,
                "options": options,
                "description": f"{variant_name.capitalize()} variant",
            }
        return arg_types


if __name__ == "__main__":
    tool = CvaVariantsToArgTypesTool(
        variant_map={
            "tone": {
                "info": "text-blue-500",
                "error": "text-red-500",
            },
            "size": {
                "md": "text-base",
                "xl": "text-xl",
            },
        },
        control_overrides={
            "tone": "select",
        },
    )
    print(tool.run())
