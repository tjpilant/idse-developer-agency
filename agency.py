#!/home/tjpilant/projects/idse-developer-agency/.venv/bin/python
import sys
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

if __name__ == "__main__":
    print("Starting agency initialization...", flush=True)
    agency = create_agency()
    print("Agency initialized successfully!", flush=True)
    # Always launch the interactive CLI for local testing using a simple loop.
    run_simple_cli(agency)
