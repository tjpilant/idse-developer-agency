import { ComponentConfig } from "@measured/puck";
import { useEffect, useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  body?: string;
}

export interface AccordionBlockProps {
  id: string;
  type: "single" | "multiple";
  collapsible: boolean;
  items: AccordionItem[];
}

export const AccordionBlock: ComponentConfig<{ props: AccordionBlockProps }> = {
  label: "Accordion",
  fields: {
    id: { type: "text", label: "ID" },
    type: {
      type: "radio",
      label: "Type",
      options: [
        { label: "Single", value: "single" },
        { label: "Multiple", value: "multiple" },
      ],
    },
    collapsible: {
      type: "select",
      label: "Allow closing all items",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    items: {
      type: "array",
      label: "Items",
      arrayFields: {
        id: { type: "text", label: "Item ID" },
        title: { type: "text", label: "Title" },
        body: { type: "textarea", label: "Body" },
      },
      defaultItemProps: { id: "item-1", title: "Item 1", body: "Answer" },
    },
  },
  defaultProps: {
    id: "accordion_1",
    type: "single",
    collapsible: true,
    items: [
      { id: "item-1", title: "Question 1", body: "Answer 1" },
      { id: "item-2", title: "Question 2", body: "Answer 2" },
    ],
  },
  render: (props) => <AccordionComponent {...props} />,
};

function AccordionComponent({ items, type, collapsible }: AccordionBlockProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const idSet = new Set<string>();
  const normalizedItems = safeItems.map((item, idx) => {
    const base = item.id || `item-${idx + 1}`;
    let candidate = base;
    let suffix = 1;
    while (idSet.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    idSet.add(candidate);
    return { ...item, id: candidate };
  });

  // Start closed by default; we only track open state locally.
  const initialOpen: string[] = [];
  const [openIds, setOpenIds] = useState<string[]>(initialOpen);

  // Keep open state in sync with items/type changes (e.g., when adding/removing items)
  useEffect(() => {
    const ids = normalizedItems.map((i) => i.id);
    setOpenIds((prev) => {
      const filtered = prev.filter((id) => ids.includes(id));
      // Always start closed after data changes; require user to open.
      return filtered;
    });
  }, [normalizedItems.map((i) => i.id).join("|"), type]);

  const isOpen = (id: string) => openIds.includes(id);

  const toggle = (id: string) => {
    if (type === "single") {
      if (isOpen(id)) {
        setOpenIds(collapsible ? [] : [id]);
      } else {
        setOpenIds([id]);
      }
    } else {
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  };

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {normalizedItems.map((item) => (
        <div key={item.id} className="group">
          <button
            type="button"
            onClick={() => toggle(item.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-left"
            aria-expanded={isOpen(item.id)}
          >
            <span>{item.title}</span>
            <span className={`transition ${isOpen(item.id) ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {isOpen(item.id) && (
            <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
              {item.body ? <p>{item.body}</p> : <p className="italic text-muted-foreground">No content</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
