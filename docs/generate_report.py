"""Generate a project report PDF with screenshots for course submission."""

from pathlib import Path
from fpdf import FPDF

DOCS_DIR = Path(__file__).resolve().parent
SCREENSHOTS_DIR = DOCS_DIR / "screenshots"
OUTPUT_PATH = DOCS_DIR / "InsightForge_Project_Report.pdf"


class ProjectReport(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 9)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, "InsightForge - AI-Powered Analytics Platform", align="C")
            self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def cover_page(self):
        self.add_page()
        self.ln(60)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(79, 70, 229)  # indigo-600
        self.cell(0, 15, "InsightForge", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)
        self.set_font("Helvetica", "", 16)
        self.set_text_color(71, 85, 105)  # slate-600
        self.cell(0, 10, "AI-Powered Multi-Agent Analytics Platform", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(20)
        self.set_font("Helvetica", "", 12)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, "A collaborative AI system that uses specialized agents", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "to analyze datasets and generate comprehensive insights", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(40)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(71, 85, 105)
        self.cell(0, 8, "Tech Stack: Python | FastAPI | React | Claude AI | AutoGen", align="C", new_x="LMARGIN", new_y="NEXT")

    def section_title(self, title: str):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(30, 41, 59)  # slate-800
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(3)
        self.set_draw_color(79, 70, 229)
        self.set_line_width(0.8)
        self.line(10, self.get_y(), 80, self.get_y())
        self.ln(8)

    def body_text(self, text: str):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 6, text)
        self.ln(4)

    def add_screenshot(self, image_path: Path, caption: str = ""):
        if not image_path.exists():
            self.set_font("Helvetica", "I", 10)
            self.set_text_color(200, 50, 50)
            self.cell(0, 8, f"[Screenshot not found: {image_path.name}]", new_x="LMARGIN", new_y="NEXT")
            self.ln(5)
            return

        available_width = self.w - self.l_margin - self.r_margin
        self.image(str(image_path), x=self.l_margin, w=available_width)
        self.ln(3)

        if caption:
            self.set_font("Helvetica", "I", 9)
            self.set_text_color(100, 116, 139)
            self.cell(0, 6, caption, align="C", new_x="LMARGIN", new_y="NEXT")
            self.ln(8)


def generate():
    pdf = ProjectReport()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)

    # Cover page
    pdf.cover_page()

    # Screenshots section
    pdf.add_page()
    pdf.section_title("Application Screenshots")
    pdf.body_text(
        "The following screenshots demonstrate the InsightForge platform in action, "
        "showcasing the chat interface where users interact with AI agents to analyze their data."
    )

    screenshots = sorted(SCREENSHOTS_DIR.glob("*.*"))
    image_exts = {".png", ".jpg", ".jpeg", ".gif", ".bmp"}

    if not screenshots:
        pdf.ln(20)
        pdf.set_font("Helvetica", "I", 12)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 10, "Place screenshots in docs/screenshots/ and re-run this script.", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, "Expected files:", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, "  1_dashboard.png", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, "  2_chat_upload.png", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, "  3_chat_data_quality.png", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, "  4_chat_eda.png", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, "  5_chat_report.png", new_x="LMARGIN", new_y="NEXT")
    else:
        for img in screenshots:
            if img.suffix.lower() in image_exts:
                caption = img.stem.replace("_", " ").replace("-", " ").title()
                pdf.add_screenshot(img, caption=f"Fig: {caption}")

    pdf.output(str(OUTPUT_PATH))
    print(f"Report generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    generate()
