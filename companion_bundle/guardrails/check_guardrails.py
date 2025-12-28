from __future__ import annotations

from guardrails.instruction_protection import self_test


def main():
    self_test()
    print("Guardrails patterns and checks are loaded.")


if __name__ == "__main__":
    main()
