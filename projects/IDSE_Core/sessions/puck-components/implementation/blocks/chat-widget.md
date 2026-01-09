# Block: ChatWidgetBlock (Task 1.21)

Purpose: Wrap existing ChatWidget component for reuse in Puck. Uses external data hooks from existing implementation.

## Props (example)
```typescript
interface ChatWidgetProps {
  id: string;
  title?: string;
  welcomeMessage?: string;
  placeholder?: string;
}
```

## ComponentConfig
```typescript
export const ChatWidgetBlock: ComponentConfig<ChatWidgetProps> = {
  label: 'Chat Widget',
  category: 'Widgets',
  fields: {
    id: { type: 'text', label: 'ID' },
    title: { type: 'text', label: 'Title' },
    welcomeMessage: { type: 'textarea', label: 'Welcome message' },
    placeholder: { type: 'text', label: 'Input placeholder' },
  },
  defaultProps: {
    id: 'ChatWidget-1',
    title: 'Need help?',
    welcomeMessage: 'Ask us anything about the dashboard.',
    placeholder: 'Type your question…',
  },
  render: ({ title, welcomeMessage, placeholder }) => (
    <ChatWidget
      title={title}
      welcomeMessage={welcomeMessage}
      placeholder={placeholder}
    />
  ),
};
```

## Notes
- Reference existing implementation at `frontend/widget/src/puck/components/ChatWidget.tsx` for prop names and behavior; adjust fields if the actual component API differs.
- If the widget requires external services or providers, document those dependencies in the block description and ensure default props are safe when services are unavailable.
