#!/home/tjpilant/projects/idse-developer-agency/.venv/bin/python
import sys
import argparse

# Force unbuffered output for better CLI experience
sys.stdout.reconfigure(line_buffering=True)

from dotenv import load_dotenv
from agency_swarm import Agency

from idse_developer_agent import idse_developer_agent

load_dotenv()


def run_simple_cli(agency: Agency) -> None:
    """Minimal interactive loop to avoid terminal_demo empty-input issues."""
    print("\n────────────────────────────────────────────────────────────────────────", flush=True)
    print("* IDSEDeveloperAgency interactive CLI (type '/exit' to quit)", flush=True)
    print("────────────────────────────────────────────────────────────────────────\n", flush=True)
    while True:
        try:
            sys.stdout.flush()  # Ensure prompt is visible before input
            user_msg = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not user_msg:
            continue
        if user_msg.lower() in {"/exit", "/quit"}:
            print("Goodbye.")
            break

        try:
            response = agency.get_response_sync(user_msg)
            print(f"\nAgent: {response}\n", flush=True)
        except Exception as exc:  # pragma: no cover - interactive path
            print(f"\n[Error] {exc}\n", flush=True)

# do not remove this method, it is used in the main.py file to deploy the agency (it has to be a method)
def create_agency(load_threads_callback=None):
    agency = Agency(
        idse_developer_agent,
        communication_flows=[],
        name="IDSEDeveloperAgency",
        shared_instructions="shared_instructions.md",
        load_threads_callback=load_threads_callback,
    )

    return agency

def run_web_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = True):
    """
    Run FastAPI web server with multi-protocol support

    Provides:
    - AG-UI protocol at /admin/ag-ui/*
    - CopilotKit protocol at /api/copilot/*

    Args:
        host: Host to bind to (default: 0.0.0.0)
        port: Port to run on (default: 8000)
        reload: Enable auto-reload for development (default: True)
    """
    import uvicorn

    print("\n" + "="*70, flush=True)
    print("🚀 Starting IDSE Developer Agency Web Server", flush=True)
    print("="*70, flush=True)
    print(f"Host: {host}:{port}", flush=True)
    print(f"AG-UI Admin: http://{host}:{port}/admin/ag-ui", flush=True)
    print(f"CopilotKit Widget: http://{host}:{port}/api/copilot", flush=True)
    print(f"API Docs: http://{host}:{port}/docs", flush=True)
    print("="*70 + "\n", flush=True)

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="IDSE Developer Agency - Multi-mode AI Agent System"
    )
    parser.add_argument(
        "--mode",
        choices=["cli", "web"],
        default="cli",
        help="Run mode: 'cli' for interactive CLI, 'web' for web server (default: cli)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host for web server mode (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port for web server mode (default: 8000)",
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reload in web server mode",
    )

    args = parser.parse_args()

    if args.mode == "web":
        # Run web server with multi-protocol support
        run_web_server(
            host=args.host,
            port=args.port,
            reload=not args.no_reload,
        )
    else:
        # Run interactive CLI (original mode)
        print("Starting agency initialization...", flush=True)
        agency = create_agency()
        print("Agency initialized successfully!", flush=True)
        run_simple_cli(agency)
