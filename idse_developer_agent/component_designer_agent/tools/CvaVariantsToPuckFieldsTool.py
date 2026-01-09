from typing import Dict, Optional

from agency_swarm.tools import BaseTool
from pydantic import Field


class CvaVariantsToPuckFieldsTool(BaseTool):
    """
    Convert a CVA variant map to Puck-compatible field definitions.
    Each variant becomes a 'radio' field unless overridden.
    """

    variant_map: Dict[str, Dict[str, str]] = Field(
        ...,
        description="A dictionary where keys are variant names and values are dictionaries of options with class strings.",
    )
    field_overrides: Optional[Dict[str, Dict[str, str]]] = Field(
        default_factory=dict,
        description=(
            "Optional overrides for each field: label and type "
            "(e.g., {'variant': {'type': 'select', 'label': 'Style'}})"
        ),
    )

    def run(self) -> Dict[str, Dict[str, object]]:
        fields: Dict[str, Dict[str, object]] = {}
        for variant_name, options_dict in self.variant_map.items():
            override = self.field_overrides.get(variant_name, {})
            label = override.get("label", variant_name.capitalize())
            field_type = override.get("type", "radio")
            options = [
                {"label": key.capitalize(), "value": key}
                for key in options_dict.keys()
            ]
            fields[variant_name] = {
                "type": field_type,
                "label": label,
                "options": options,
            }
        return fields


if __name__ == "__main__":
    tool = CvaVariantsToPuckFieldsTool(
        variant_map={
            "variant": {
                "primary": "bg-blue-500 text-white",
                "secondary": "bg-gray-200 text-black",
            },
            "size": {
                "sm": "text-sm py-1 px-2",
                "lg": "text-lg py-3 px-4",
            },
        },
        field_overrides={
            "variant": {"type": "select", "label": "Button Style"},
        },
    )
    print(tool.run())
