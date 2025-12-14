import { ComponentConfig } from "@measured/puck";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";

export interface ChatWidgetProps {
  apiBase?: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor: string;
  title: string;
  placeholder: string;
  publicApiKey?: string;
}

const env = (import.meta as any).env ?? {};
const fallbackApiBase = env.VITE_API_BASE ?? "http://localhost:8000";

const positionClasses: Record<ChatWidgetProps["position"], string> = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
};

export const ChatWidget: ComponentConfig<ChatWidgetProps> = {
  fields: {
    apiBase: {
      type: "text",
      label: "API Base URL",
      description: "Backend base (e.g., https://your-agency.agencii.ai)",
    },
    position: {
      type: "select",
      label: "Position",
      options: [
        { label: "Bottom Right", value: "bottom-right" },
        { label: "Bottom Left", value: "bottom-left" },
        { label: "Top Right", value: "top-right" },
        { label: "Top Left", value: "top-left" },
      ],
    },
    primaryColor: {
      type: "text",
      label: "Primary Color",
    },
    title: {
      type: "text",
      label: "Widget Title",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
    },
    publicApiKey: {
      type: "text",
      label: "Public API Key (optional)",
      description: "Needed if your CopilotKit setup requires it",
    },
  },
  defaultProps: {
    apiBase: "",
    position: "bottom-right",
    primaryColor: "#4F46E5",
    title: "IDSE Developer Agent",
    placeholder: "Ask me anything about IDSE...",
    publicApiKey: "",
  },
  render: ({
    apiBase,
    position,
    primaryColor,
    title,
    placeholder,
    publicApiKey,
  }) => {
    // Avoid rendering the popup inside the editor shell where a dedicated right-panel chat already exists.
    if (typeof window !== "undefined" && window.location.pathname.includes("editor-shell")) {
      return null;
    }

    const base = (apiBase || fallbackApiBase).replace(/\/$/, "");
    const runtimeUrl = `${base}/api/copilot`;
    const chatEndpoint = `${base}/api/copilot/chat`;
    const websocketEndpoint = `${base.replace(/^http/, "ws")}/api/copilot/ws`;
    const defaultAgent = {
      id: "default",
      name: title || "IDSE Developer Agent",
      description: "Intent-Driven Systems Engineering assistant",
      instructions: `You are ${title}. Assist users with IDSE, software delivery, and architecture.`,
    };

    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <CopilotKit
          // Use local runtime only; explicitly unset public key to avoid cloud calls
          runtimeUrl={runtimeUrl}
          publicApiKey={undefined}
          websocketEndpoint={websocketEndpoint}
          agents={[defaultAgent]}
          defaultAgentId="default"
        >
          <CopilotPopup
            instructions={`You are ${title}. Assist users with IDSE, software delivery, and architecture.`}
            defaultOpen={false}
            labels={{
              title,
              initial: `Hi! I'm ${title}. How can I help?`,
              inputPlaceholder: placeholder,
            }}
            styles={{
              palette: {
                primary: primaryColor,
              },
            }}
          />
        </CopilotKit>
      </div>
    );
  },
};
