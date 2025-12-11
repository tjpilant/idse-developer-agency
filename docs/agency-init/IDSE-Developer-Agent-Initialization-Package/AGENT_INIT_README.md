# 🧠 IDSE Developer Agent Initialization Package

**Version:** 1.0.0
**Author:** IDSE Developer Framework
**Target Runtime:** Agency Swarm (Single-Agent Mode with MCP Tool Access)

---

## 📘 1. AGENT_INIT_README.md

### Overview

The **IDSE Developer Agent** is a self-governing, intent-driven software engineering system built on the **Intent-Driven Systems Engineering (IDSE)** methodology.
It operates as a single autonomous agent capable of performing the entire IDSE pipeline:

> **Intent → Context → Spec → Plan → Tasks → Implementation → Feedback**

Unlike standard Agency Swarm multi-agent setups, this system embeds each functional sub-agent (Intent, Context, Spec, etc.) as **callable internal tools**, preserving autonomy while simplifying orchestration.

The IDSE Developer Agent:

* Interacts with humans to establish **Intent**
* Confirms **Context** and constraints
* Generates engineering documentation and artifacts
* Validates its outputs constitutionally
* Audits itself for compliance and continuous improvement
* Exposes tools and reasoning via **MCP Server** for integration with IDEs, Codex, Claude, or other systems.

---

### Agent Identity

| Field                | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Name**             | IDSE Developer Agent                                                                     |
| **Version**          | 1.0.0                                                                                    |
| **Mode**             | Single-Agent (Tool-Consolidated)                                                         |
| **Primary Model**    | OpenAI GPT-5                                                                             |
| **Access Layer**     | MCP Server                                                                               |
| **Orchestrator**     | Agency Swarm / Agencii Platform                                                          |
| **Knowledge Base**   | `/docs/01–08-idse-docs/`                                                                 |
| **Governance**       | IDSE Constitution Articles I–IX                                                          |
| **Validation Stack** | Artifact Validator, Compliance Checker, Feedback Auditor                                 |
| **Execution Path**   | `idse_runner.py` → `validate-artifacts.py` → `check-compliance.py` → `audit-feedback.py` |

---

### Behavior Summary

| Stage                       | Behavior                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| **Startup**                 | Loads all IDSE documentation, validates constitutional integrity. |
| **Human Interaction**       | Prompts for project intent, success criteria, and constraints.    |
| **Pipeline Execution**      | Sequentially executes IDSE phases using its internal tools.       |
| **Validation & Governance** | Runs self-checks via integrated governance scripts.               |
| **MCP Exposure**            | Exposes its tools and reasoning capabilities via MCP endpoints.   |

---

### Required Files

| File                                 | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `idse-developer-agent.manifest.yaml` | Defines agent’s cognitive manifest    |
| `idse-agent-tools.json`              | Defines callable internal tools       |
| `idse-agent-init-sequence.md`        | Defines the initialization logic      |
| `idse-agent-access.md`               | Defines MCP and integration endpoints |
