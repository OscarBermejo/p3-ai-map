#!/usr/bin/env python3
"""Smoke test: load config/.env and call OpenAI once. Run from repo root:
    python agent/tools/ping_openai.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
_ENV = ROOT / "config" / ".env"


def main() -> int:
    try:
        from dotenv import load_dotenv
        from openai import OpenAI
    except ImportError:
        print("Install deps: pip install -r agent/requirements.txt", file=sys.stderr)
        return 1

    if not _ENV.is_file():
        print(f"Missing {_ENV} — copy from config/.env.example", file=sys.stderr)
        return 1

    load_dotenv(_ENV)
    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not set in config/.env", file=sys.stderr)
        return 1

    client = OpenAI()
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    r = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "Reply in one short sentence."},
            {"role": "user", "content": "Say OK if you can read this."},
        ],
        max_tokens=80,
    )
    text = (r.choices[0].message.content or "").strip()
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
