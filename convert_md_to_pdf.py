import pypandoc
from pathlib import Path
import re

# ----- HEADER STYLING (headers, footers, section spacing) -----
header_includes = r"""
\usepackage{titlesec}
\usepackage{sectsty}
\usepackage[compact]{titlesec}
\usepackage{fancyhdr}

\widowpenalty=10000
\clubpenalty=10000
\raggedbottom

% ----- Header / Footer -----
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\nouppercase{\leftmark}}
\fancyhead[R]{\thepage}
\fancyfoot[L]{Innovista}
\fancyfoot[R]{\today}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}

% ----- Header Spacing -----
\titlespacing*{\section}{0pt}{1.5ex plus 1ex minus .2ex}{0.8ex}
\titlespacing*{\subsection}{0pt}{1.3ex plus 1ex minus .2ex}{0.6ex}
\titlespacing*{\subsubsection}{0pt}{1ex plus 1ex minus .2ex}{0.5ex}

% ----- Header Font Sizes -----
\sectionfont{\fontsize{16}{18}\selectfont\bfseries}
\subsectionfont{\fontsize{14}{16}\selectfont\bfseries}
\subsubsectionfont{\fontsize{12}{14}\selectfont\bfseries}
"""

# ----- COVER PAGE -----
cover_page = r"""
\begin{titlepage}
    \centering
    \vspace*{4cm}
    {\Huge\bfseries \thetitle \par}
    \vspace{1.5cm}
    {\Large \theauthor \par}
    \vspace{0.5cm}
    {\large \today \par}
    \vfill
    {\Large \textbf{Innovista}}
\end{titlepage}
"""

# Write LaTeX helpers to disk
Path("header.tex").write_text(header_includes, encoding="utf-8")
Path("cover.tex").write_text(cover_page, encoding="utf-8")


# ----- Markdown cleaner -----
def clean_markdown(content: str) -> str:
    # Collapses multiple blank lines to a single one to avoid big gaps in PDF
    return re.sub(r'\n\s*\n\s*\n+', '\n\n', content)


# ----- Main converter -----
def convert_md_to_pdf(input_dir: str, output_dir: str, author="Author Name"):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    md_files = list(input_path.glob("*.md"))
    if not md_files:
        print(f"No markdown files found in {input_dir}")
        return

    for md_file in md_files:
        # Read and clean markdown content
        content = clean_markdown(md_file.read_text(encoding="utf-8"))

        # Use filename as the document title (replace underscores with spaces)
        title = md_file.stem.replace("_", " ").title()

        # Build output path
        pdf_filepath = output_path / (md_file.stem + ".pdf")

        # Convert to PDF with Pandoc
        try:
            pypandoc.convert_text(
                content,
                to='pdf',
                format='md',
                outputfile=str(pdf_filepath),
                extra_args=[
                    '--standalone',
                    '--pdf-engine=xelatex',
                    '--variable', 'mainfont=Georgia',
                    '--variable', 'geometry:margin=1in',
                    '--variable', 'fontsize=12pt',
                    '--variable', 'parskip=0pt',
                    '--variable', 'secnumdepth=3',
                    '--include-in-header=header.tex',
                    '--include-before-body=cover.tex',
                    f'--metadata=title:{title}',
                    f'--metadata=author:{author}'
                ]
            )
            print(f"✅ Converted: {md_file.name} → {pdf_filepath.name}")
        except Exception as e:
            print(f"❌ Failed to convert {md_file.name}: {e}")

    print(f"\n📂 All PDFs saved to: {output_path.resolve()}")


# ----- Entry point -----
if __name__ == "__main__":
    # You can change these defaults or pass arguments if you like
    input_folder = "input"
    output_folder = "output"
    author_name = "Jane Doe"

    convert_md_to_pdf(input_folder, output_folder, author=author_name)
