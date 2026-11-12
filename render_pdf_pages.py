import fitz # PyMuPDF
import sys
import os
import shutil

sys.stdout.reconfigure(encoding='utf-8')

def render_and_inspect_pdf(pdf_path, artifact_dir):
    print(f"Opening PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    print(f"Page Count: {len(doc)}")
    assert len(doc) == 2, f"Expected exactly 2 pages, got {len(doc)}"

    for i, page in enumerate(doc):
        page_num = i + 1
        print(f"\n================ PAGE {page_num} TEXT DUMP ================")
        text = page.get_text()
        print(text)

        # Render to image at 150 DPI for crisp visual inspection
        pix = page.get_pixmap(dpi=150)
        img_filename = f"pdf_page_{page_num}.png"
        img_path = os.path.join(os.path.dirname(pdf_path), img_filename)
        pix.save(img_path)
        print(f"Saved page render to: {img_path} ({pix.width}x{pix.height} px)")

        # Copy to artifact dir
        if os.path.exists(artifact_dir):
            dest = os.path.join(artifact_dir, img_filename)
            shutil.copy2(img_path, dest)
            print(f"Copied to artifact directory: {dest}")

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_file = os.path.join(project_dir, "evaluation", "NeuroVisionAI_Generated_Report.pdf")
    artifact_dir = r"C:\Users\tinku\.gemini\antigravity\brain\6f468673-ebc2-42f0-bea0-92482d2e5de2"
    render_and_inspect_pdf(pdf_file, artifact_dir)
