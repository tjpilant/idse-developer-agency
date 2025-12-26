# 🧠 IDSE Developer Agency

A working, governed implementation of the **Intent-Driven Systems Engineering (IDSE)** framework — hosted as a multi-agent system using the [Agency Swarm](https://github.com/VRSEN/agency-swarm) orchestration framework.

> 🔧 **Based on:** [Agency Swarm Starter Template](https://github.com/VRSEN/agency-starter-template) for [Agencii Cloud](https://agencii.ai/)  
> 🧭 **Governed by:** [IDSE Developer Agent](https://github.com/tjpilant/idse-developer-agent) — constitutional design, seven-stage pipeline, and principled agent behavior.

---

## 📜 About IDSE

**Intent-Driven Systems Engineering (IDSE)** builds complex software through structured reasoning, documentation, and constitutional governance.

**Core Principles**

- **Intent Supremacy** – all work flows from explicit intent.  
- **Constitutional Governance** – behavior is shaped by documents, not ad-hoc logic.  
- **Seven Stages** – `Intent → Context → Specification → Plan → Tasks → Implementation → Feedback`.  
- **Feedback Loops** – artifacts must be validated, audited, and traceable.  
- **Simplicity & Atomicity** – every component should be small, testable, and clear.

Full philosophy: see [`/docs/`](./docs/).

---

## 🏗️ Repository Overview

| Path | Description |
|------|--------------|
| `agency.py` | Entry point that runs the IDSE Developer Agent. |
| `idse_developer_agent/` | Tools and logic for the seven IDSE stages. |
| `docs/` | IDSE Constitution, pipeline, prompting guide, and patterns. |
| `.cursor/` | Cursor IDE automation and task scripts. |
| `idse-governance/` | **IDE Governance Layer** – Claude ↔ Codex coordination system. |
| `backend/services/git_service.py` | GitHub commit + repository_dispatch integration (Phase 0). |
| `.vscode/` | Tasks integrating governance commands. |
| `.env` | Environment keys. |
| `requirements.txt` | Dependencies for Agency Swarm + IDSE tools. |

---

## ⚙️ Running the IDSE Developer Agency

```bash
git clone https://github.com/your-username/your-idse-agency.git
cd your-idse-agency
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python agency.py
This launches the IDSE Developer Agent locally and enters the seven-stage loop.

🧠 Using the IDSE Agent with VS Code + Claude + Codex + Cursor
🧩 The Dual-Governance System
This workspace includes a self-governing IDE automation layer that:

Manages state, handoffs, and roles for LLM collaboration.

Automates all IDSE processes (stage, role, and handoff changes).

Validates compliance via CI scripts and boundary enforcement.

Documents itself with auto-generated feedback artifacts.

References IDSE Constitutional Articles dynamically at runtime.

💡 This transforms VS Code from a text editor into an intent-driven governance workspace.

🧭 Governance Lifecycle
1️⃣ Intent → Context → Specification → Plan → Tasks → Implementation → Feedback
Each IDE agent transition mirrors these seven IDSE stages.

2️⃣ Claude ↔ Codex Alternation

Claude builds → handoff → Codex reviews → feedback → Claude refines.

Each loop = one constitutional cycle, timestamped and tracked in handoff_cycle_id.

All handoffs, stage transitions, and role changes are logged automatically in
idse-governance/state/state.json and accompanied by Markdown summaries in
idse-governance/feedback/.

🧩 Dual-Governance Workflow Diagram
mermaid
Copy code
flowchart TD
    subgraph IDSE_Cycle["IDSE Development Lifecycle"]
        A1(Intent) --> A2(Context)
        A2 --> A3(Specification)
        A3 --> A4(Plan)
        A4 --> A5(Tasks)
        A5 --> A6(Implementation)
        A6 --> A7(Feedback)
        A7 --> A1
    end

    subgraph Governance["Claude ↔ Codex Governance Layer"]
        C1[Claude\n(Builder / Planner)] -->|Builds & documents| C2[Codex\n(Reviewer / Implementer)]
        C2 -->|Feedback & handoff| C1
    end

    A6 -. "handoff" .-> C1
    C1 -. "review" .-> C2
    C2 -. "feedback" .-> A7
    A7 -. "refinement" .-> A1

    style IDSE_Cycle fill:#e0f7fa,stroke:#00acc1,stroke-width:2px
    style Governance fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
This diagram visualizes how Claude and Codex alternate through the seven IDSE stages, forming a constitutional feedback loop between creative generation and critical validation.

⚙️ Using the IDE Tasks
Open VS Code / Cursor → Ctrl + Shift + P → “Tasks: Run Task”

Category	Tasks	Description
Handoffs	Handoff to Codex, Handoff to Claude, Acknowledge Handoff	Exchange control between LLMs.
Role Changes	Change Role to Builder / Planner / Implementer / Reviewer	Switch governance role — auto-links to Constitution Articles IV, VII, VIII, IX.
Stage Management	Change IDSE Stage	Choose any of the seven IDSE stages.
Utilities	View IDSE State, Validate Governance Layer	Display or validate current governance status.

🧮 Example Workflow
Claude (Builder) completes a feature and runs
Handoff to Codex → reason: "Feature ready for review".

Creates idse-governance/feedback/handoff_claude_to_codex_<timestamp>.md.

Updates state.json: active_llm → codex_gpt, awaiting_handoff → true.

Codex (Reviewer) runs Acknowledge Handoff, reviews changes, and after approval executes
Handoff to Claude → reason: "Review complete, recommendations logged".

The system records the cycle and advances to the next IDSE stage automatically.

🧩 Building and Extending
✍️ Want to Build Your Own Agency?
You can fork this repository to create your own custom IDSE agency. Then:

Replace the logic in idse_developer_agent/ with your own tools and processes.

Update agency.py and instructions.md to define your unique workflow.

Follow the IDSE pipeline (Intent → Context → Spec → Plan → Tasks → Implementation → Feedback) to scaffold your system.

Use Claude and Codex in VS Code + Cursor for dual-agent design, implementation, and review.

🌐 Optional: Cloud Deployment with Agencii
You can deploy your agency directly to the Agencii Cloud:

Sign up at https://agencii.ai

Install the Agencii GitHub App

Push to main — Agencii will auto-deploy your agency

Your live agency will be available via a secure API endpoint

🧰 Development Workflow
Tool	Purpose
🧠 agency.py	Launch the IDSE Developer Agent.
🤖 idse_developer_agent/	Implements each pipeline stage.
🧩 idse-governance/	Dual-LLM coordination — governance scripts, state, and handoff templates.
🧪 .cursor/tasks/governance.py	Automation of handoffs, role changes, and stage transitions.
🧱 .cursor/tasks/validate-idse-layer.sh	CI validation of boundaries and config integrity.
🖥️ .vscode/tasks.json	IDE-integrated task runner for governance commands.

🧪 Validation
Run:

bash
Copy code
bash .cursor/tasks/validate-idse-layer.sh
Checks:

Boundary notices and markers.

Governance config validity.

Schema compliance for state.json.

Absence of governance artifacts in protected paths.

Output example:

pgsql
Copy code
✔ Governance layer notice found
✔ Config valid
✔ State file in governance layer
✔ No governance artifacts in code
✅ IDSE Governance Layer validation passed!
📚 References
IDSE Constitution: docs/02-idse-constitution.md

Pipeline: docs/03-idse-pipeline.md

Agency Swarm Framework: GitHub → VRSEN/agency-swarm

Governance Layer: idse-governance/

Automation Scripts: .cursor/tasks/

Validation & Testing: .vscode/tasks.json, validate-idse-layer.sh

Cloud Deployment: Agencii Platform

🤝 Contributing
Fork the repository

Create a feature branch

Run validation scripts before PR submission

Submit a PR with a clear description and stage reference

⚡ TL;DR
This repository is both:

a governed multi-agent system (Agency Swarm v1.0.0)

and a self-governing IDE automation layer (Claude ↔ Codex Governance System)

Together, they form a constitutional workspace where:

Code, documentation, and feedback are all governed artifacts.

Every action traces back to Intent, every decision to Context, and every correction to Feedback.

🏛️ Governed by IDSE, scaffolded by Agency Swarm, automated by VS Code + Claude + Codex + Cursor.
Your IDE is now a constitutional engineering environment.
