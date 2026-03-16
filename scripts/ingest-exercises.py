#!/usr/bin/env python3
"""
Ingest extracted exercise/solution text into CryptoEx JSON format.

Usage:
  python scripts/ingest-exercises.py --exercises E-1.txt --solutions S-1.txt --id E-1 --title-en "Exercise Set 1" --title-no "Oppgavesett 1" -o src/data/exercises/E-1.json

Input format (E-n.txt):
  Each exercise is separated by a blank line. The first non-blank line of each
  block is treated as the exercise text (may span multiple lines until the next
  blank-line separator).

Input format (S-n.txt):
  Same structure — each solution block corresponds 1:1 with the exercise blocks.

Output:
  A JSON array with one ExerciseSet object, ready for import in exercises.ts.
"""

import argparse
import json
import re
import sys
from pathlib import Path


def parse_blocks(text: str) -> list[str]:
    """Split text into blocks separated by one or more blank lines."""
    blocks: list[str] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.strip() == "":
            if current:
                blocks.append("\n".join(current).strip())
                current = []
        else:
            current.append(line)
    if current:
        blocks.append("\n".join(current).strip())
    return blocks


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert E/S text files to CryptoEx exercise JSON.")
    parser.add_argument("--exercises", "-e", required=True, help="Path to exercises text file (E-n.txt)")
    parser.add_argument("--solutions", "-s", required=True, help="Path to solutions text file (S-n.txt)")
    parser.add_argument("--id", required=True, help="Exercise set ID (e.g. E-1)")
    parser.add_argument("--title-en", required=True, help="English title")
    parser.add_argument("--title-no", required=True, help="Norwegian title")
    parser.add_argument("--desc-en", default="", help="English description (optional)")
    parser.add_argument("--desc-no", default="", help="Norwegian description (optional)")
    parser.add_argument("-o", "--output", required=True, help="Output JSON file path")
    args = parser.parse_args()

    exercises_text = Path(args.exercises).read_text(encoding="utf-8")
    solutions_text = Path(args.solutions).read_text(encoding="utf-8")

    ex_blocks = parse_blocks(exercises_text)
    sol_blocks = parse_blocks(solutions_text)

    if len(ex_blocks) != len(sol_blocks):
        print(
            f"Warning: {len(ex_blocks)} exercises but {len(sol_blocks)} solutions. "
            "Pairing by index; extras will be dropped.",
            file=sys.stderr,
        )

    count = min(len(ex_blocks), len(sol_blocks))
    items = []
    for i in range(count):
        items.append({
            "id": f"{args.id}-{i + 1}",
            "text": ex_blocks[i],
            "solution": sol_blocks[i],
        })

    exercise_set = {
        "id": args.id,
        "title": {"en": args.title_en, "no": args.title_no},
    }
    if args.desc_en or args.desc_no:
        exercise_set["description"] = {"en": args.desc_en, "no": args.desc_no}
    exercise_set["exercises"] = items

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps([exercise_set], indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {count} exercises to {output_path}")


if __name__ == "__main__":
    main()
