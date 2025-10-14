"""Convert Markdown documents in the repository into standalone PDF files.

This module is a thin wrapper around :mod:`pdf_generator` that iterates over
Markdown sources and emits one PDF per file.  By default it scans the repository
root for ``.md`` files and writes the generated PDFs into ``docs/``.

Example
-------
    python convert_md_to_pdf.py

It can also accept explicit source/output directories::

    python convert_md_to_pdf.py --source notes --destination build/docs
"""
from __future__ import annotations

import argparse
from pathlib import Path

from pdf_generator import generate_pdf


def _read_markdown(file_path: Path) -> tuple[str, str]:
    """Return a ``(title, body)`` tuple for *file_path*.

    The title is derived from the filename using a human-friendly format, while
    the body is the raw Markdown content read as UTF-8.
    """

    if not file_path.exists():
        raise FileNotFoundError(f"Markdown file not found: {file_path}")
    if file_path.suffix.lower() != ".md":
        raise ValueError(f"Expected a Markdown file (.md): {file_path}")

    title = file_path.stem.replace("_", " ").replace("-", " ").strip().title()
    content = file_path.read_text(encoding="utf-8")
    return title or "Document", content


def _convert_single_markdown(markdown_path: Path, output_dir: Path) -> Path:
    """Convert *markdown_path* into a PDF stored under *output_dir*.

    Returns the path to the generated PDF.
    """

    title, body = _read_markdown(markdown_path)

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{markdown_path.stem}.pdf"

    generate_pdf(
        output=output_path,
        sections=[(title, body)],
        title=title,
        footer=None,
    )
    return output_path


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=Path.cwd(),
        help="Directory that will be scanned for Markdown files (default: CWD).",
    )
    parser.add_argument(
        "--destination",
        type=Path,
        default=Path.cwd() / "docs",
        help="Directory where generated PDFs will be saved (default: ./docs).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    markdown_files = sorted(p for p in args.source.glob("*.md") if p.is_file())
    if not markdown_files:
        raise SystemExit(f"No Markdown files found in {args.source}")

    for markdown_file in markdown_files:
        _convert_single_markdown(markdown_file, args.destination)


if __name__ == "__main__":
    main()
