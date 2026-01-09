from typing import Dict, List

from agency_swarm.tools import BaseTool
from pydantic import Field


class CvaVariantsToSafelistTool(BaseTool):
    """
    Extract all Tailwind classes used in a set of CVA variant class maps.
    Input can be one or more mappings of variants → class strings.
    """

    class_maps: List[Dict[str, str]] = Field(
        ...,
        description=(
            "A list of variant-to-class mappings "
            "(e.g., [{'primary': 'bg-blue-500 text-white'}])"
        ),
    )

    def run(self) -> List[str]:
        classes = set()
        for mapping in self.class_maps:
            for class_str in mapping.values():
                for cls in class_str.strip().split():
                    if cls:
                        classes.add(cls.strip())
        return sorted(classes)


if __name__ == "__main__":
    tool = CvaVariantsToSafelistTool(
        class_maps=[
            {
                "primary": "bg-blue-500 text-white",
                "secondary": "bg-gray-100 text-black",
            },
            {
                "sm": "text-sm px-2 py-1",
                "lg": "text-lg px-4 py-3",
            },
        ]
    )
    print(tool.run())
