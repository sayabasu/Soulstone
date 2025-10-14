"""Utility to combine Markdown files into a professionally formatted PDF.

This module exposes a command line interface. Example usage:
    python pdf_generator.py output.pdf section1.md section2.md
"""
from __future__ import annotations

import argparse
import datetime as _dt
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple
from xml.sax.saxutils import escape

try:
    import markdown
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import (BaseDocTemplate, Frame, HRFlowable,
                                    ListFlowable, ListItem, PageBreak,
                                    PageTemplate, Paragraph, Preformatted,
                                    Spacer, Table, TableStyle)
except ImportError as exc:  # pragma: no cover - defensive, import fail handled in CLI
    raise SystemExit(
        "Both reportlab and markdown are required. Install them with 'pip install reportlab markdown'."
    ) from exc


Section = Tuple[str, str]


def _parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate a professionally formatted PDF that concatenates the"
            " content of the provided Markdown files with headers, footers,"
            " and page numbers."
        )
    )
    parser.add_argument(
        "output",
        type=Path,
        help="Output PDF file path.",
    )
    parser.add_argument(
        "inputs",
        type=Path,
        nargs="+",
        help="One or more Markdown files whose contents will populate the PDF.",
    )
    parser.add_argument(
        "--title",
        default="Document",
        help="Document title to display in the header.",
    )
    parser.add_argument(
        "--footer",
        default=None,
        help="Optional footer text. Defaults to the file generation timestamp.",
    )
    return parser.parse_args(argv)


def _load_content(files: Iterable[Path]) -> List[Section]:
    sections: List[Section] = []
    for file in files:
        if not file.exists():
            raise FileNotFoundError(f"Input file not found: {file}")
        if file.suffix.lower() != ".md":
            raise ValueError(f"Input file must be a Markdown file (.md): {file}")
        sections.append((file.stem.replace("_", " "), file.read_text(encoding="utf-8")))
    return sections


def _inner_html(element: ET.Element) -> str:
    parts: List[str] = []
    if element.text:
        parts.append(element.text)
    for child in element:
        parts.append(ET.tostring(child, encoding="unicode", method="html"))
    return "".join(parts).strip()


def _convert_table(element: ET.Element, *, body_style: ParagraphStyle) -> Table | None:
    rows: List[List[Paragraph]] = []
    header_style = ParagraphStyle(
        "MarkdownTableHeader",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    for row in element.findall(".//tr"):
        cells: List[Paragraph] = []
        for cell in list(row):
            cell_html = _inner_html(cell)
            if cell_html:
                cell_style = header_style if cell.tag.lower() == "th" else body_style
                cells.append(Paragraph(cell_html, cell_style))
            else:
                cells.append(Paragraph("", body_style))
        if cells:
            rows.append(cells)

    if not rows:
        return None

    table = Table(rows, repeatRows=1)
    table_style = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), header_style.fontName),
            ("FONTNAME", (0, 1), (-1, -1), body_style.fontName),
            ("FONTSIZE", (0, 0), (-1, -1), body_style.fontSize),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
    )
    table.setStyle(table_style)
    return table


def _convert_list(element: ET.Element, *, styles, bullet_type: str) -> ListFlowable:
    items: List[ListItem] = []
    body_style: ParagraphStyle = styles["MarkdownBody"]

    for li in element.findall("li"):
        item_flowables: List = []
        text_parts: List[str] = []
        if li.text and li.text.strip():
            text_parts.append(li.text)

        for child in list(li):
            tag = child.tag.lower()
            if tag in {"ul", "ol"}:
                item_flowables.extend(
                    _markdown_element_to_flowables(child, styles=styles)
                )
            elif tag == "p":
                text_parts.append(_inner_html(child))
            else:
                item_flowables.extend(
                    _markdown_element_to_flowables(child, styles=styles)
                )
            if child.tail and child.tail.strip():
                text_parts.append(child.tail.strip())

        text_html = "".join(text_parts).strip()
        if text_html:
            item_flowables.insert(0, Paragraph(text_html, body_style))

        if item_flowables:
            items.append(
                ListItem(item_flowables if len(item_flowables) > 1 else item_flowables[0])
            )

    return ListFlowable(
        items,
        bulletType=bullet_type,
        start="1" if bullet_type == "1" else None,
        leftIndent=18,
        spaceBefore=4,
        spaceAfter=4,
    )


def _markdown_element_to_flowables(element: ET.Element, *, styles) -> List:
    tag = element.tag.lower()
    body_style: ParagraphStyle = styles["MarkdownBody"]
    heading_styles = {
        "h1": styles.get("Heading1"),
        "h2": styles.get("Heading2"),
        "h3": styles.get("Heading3"),
        "h4": styles.get("Heading4"),
        "h5": styles.get("Heading5"),
        "h6": styles.get("Heading6"),
    }

    if tag in heading_styles and heading_styles[tag] is not None:
        return [Paragraph(_inner_html(element), heading_styles[tag])]

    if tag == "p":
        html_content = _inner_html(element)
        if not html_content:
            return []
        html_content = html_content.replace("<code>", '<font face="Courier">').replace(
            "</code>", "</font>"
        )
        return [Paragraph(html_content, body_style)]

    if tag == "blockquote":
        return [Paragraph(_inner_html(element), styles["MarkdownBlockQuote"])]

    if tag == "pre":
        code_element = element.find("code")
        code_text = code_element.text if code_element is not None else element.text
        return [Preformatted(code_text or "", styles["MarkdownCode"])]

    if tag == "ul":
        return [_convert_list(element, styles=styles, bullet_type="bullet")]

    if tag == "ol":
        return [_convert_list(element, styles=styles, bullet_type="1")]

    if tag == "table":
        table = _convert_table(element, body_style=body_style)
        return [table] if table is not None else []

    if tag == "hr":
        return [HRFlowable(width="100%", thickness=0.75, color=colors.grey)]

    flowables: List = []
    for child in element:
        flowables.extend(_markdown_element_to_flowables(child, styles=styles))
    return flowables


def _markdown_to_flowables(markdown_text: str, styles) -> List:
    html = markdown.markdown(
        markdown_text,
        extensions=[
            "extra",
            "sane_lists",
            "tables",
            "fenced_code",
        ],
        output_format="html5",
    )

    wrapped_html = f"<root>{html}</root>"
    try:
        root = ET.fromstring(wrapped_html)
    except ET.ParseError as exc:
        raise ValueError("Failed to parse Markdown content into HTML.") from exc

    flowables: List = []
    for element in list(root):
        flowables.extend(_markdown_element_to_flowables(element, styles=styles))
        flowables.append(Spacer(1, 0.3 * cm))

    if flowables and isinstance(flowables[-1], Spacer):
        flowables.pop()
    return flowables


def _build_story(sections: Sequence[Section], styles) -> List:
    story: List = []
    section_heading_style: ParagraphStyle = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading1"],
        spaceAfter=12,
    )
    styles.add(
        ParagraphStyle(
            "MarkdownBody",
            parent=styles["BodyText"],
            leading=16,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            "MarkdownBlockQuote",
            parent=styles["BodyText"],
            leftIndent=18,
            textColor=colors.grey,
            italic=True,
            spaceBefore=6,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            "MarkdownCode",
            parent=styles["BodyText"],
            fontName="Courier",
            fontSize=9,
            leading=11,
            backColor=colors.whitesmoke,
            leftIndent=6,
            rightIndent=6,
            spaceBefore=6,
            spaceAfter=6,
        )
    )

    for idx, (title, block) in enumerate(sections, start=1):
        display_title = escape(title) if title else f"Section {idx}"
        story.append(Paragraph(f"{idx}. {display_title}", section_heading_style))
        story.append(Spacer(1, 0.5 * cm))

        story.extend(_markdown_to_flowables(block, styles))

        if idx != len(sections):
            story.append(PageBreak())
    return story


def generate_pdf(output: Path, sections: Sequence[Section], *, title: str, footer: str | None) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    story = _build_story(sections, styles)

    doc = BaseDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=3 * cm,
        bottomMargin=2.5 * cm,
        title=title,
    )

    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="normal",
    )

    footer_text = footer or f"Generated {_dt.datetime.now().strftime('%Y-%m-%d %H:%M')}"

    def _header_footer(canvas, document):
        del document  # unused but kept for signature compatibility
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 11)
        canvas.drawString(doc.leftMargin, doc.pagesize[1] - 1.5 * cm, title)

        canvas.setFont("Helvetica", 9)
        canvas.drawString(doc.leftMargin, 1.2 * cm, footer_text)
        canvas.drawRightString(
            doc.pagesize[0] - doc.rightMargin,
            1.2 * cm,
            f"Page {canvas.getPageNumber()}",
        )
        canvas.restoreState()

    template = PageTemplate(id="template", frames=[frame], onPage=_header_footer)
    doc.addPageTemplates([template])
    doc.build(story)


def main(argv: Iterable[str] | None = None) -> None:
    args = _parse_args(argv)
    sections = _load_content(args.inputs)
    generate_pdf(
        args.output,
        sections,
        title=args.title,
        footer=args.footer,
    )


if __name__ == "__main__":
    main()
