import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def inspect_pdf(filepath):
    print(f"Inspecting PDF: {filepath}")
    with open(filepath, "rb") as f:
        content = f.read()

    # Find pages
    pages = re.findall(rb"/Type\s*/Page\b", content)
    print(f"Total Page Objects: {len(pages)}")

    # Extract text from BT ... ET blocks
    text_blocks = re.findall(rb"BT\s*(.*?)\s*ET", content, re.DOTALL)
    print(f"Total Text Blocks (BT...ET): {len(text_blocks)}")

    all_texts = []
    for block in text_blocks:
        # Match (string) Tj or [(str1)(str2)] TJ
        matches = re.findall(rb"\((.*?)\)\s*Tj", block)
        for m in matches:
            decoded = m.decode("latin1", errors="ignore").replace(r"\(", "(").replace(r"\)", ")")
            all_texts.append(decoded)
        
        tj_array_matches = re.findall(rb"\[(.*?)\]\s*TJ", block)
        for arr in tj_array_matches:
            sub_matches = re.findall(rb"\((.*?)\)", arr)
            line = "".join(sm.decode("latin1", errors="ignore") for sm in sub_matches)
            if line:
                all_texts.append(line)

    print(f"Extracted {len(all_texts)} text strings from PDF:")
    for t in all_texts:
        if t.strip():
            print(f"  • {t.strip()}")

    # Check for key sections
    page1_checks = [
        "NeuroVisionAI",
        "EXECUTIVE SCAN ANALYSIS REPORT",
        "Fine-Tuned ResNet-50",
        "Fine-Tuned VGG-16",
        "MODEL DISCREPANCY DETECTED" if "MODEL DISCREPANCY DETECTED" in "".join(all_texts) else "CONVERGENT PREDICTION",
        "Softmax Categorical Score Distribution",
        "Spatial Explainability Triad",
        "Page 1 of 2",
    ]
    page2_checks = [
        "Independent Benchmark Performance",
        "Independent Model Benchmark Results",
        "91.06%",
        "91.63%",
        "McNemar",
        "GLIOMA RECALL BOTTLENECK",
        "7,200 TOTAL BRAIN MRI SCANS",
        "0.00% exact cross-split duplication",
        "Patient-Level Independence Caveat",
        "MANDATORY MEDICAL SAFETY & REGULATORY DISCLAIMER",
        "Page 2 of 2",
    ]

    print("\n--- PAGE 1 VERIFICATION ---")
    full_text = " ".join(all_texts)
    for c in page1_checks:
        found = c in full_text
        print(f"  {'[PASS]' if found else '[FAIL]'} {c}")

    print("\n--- PAGE 2 VERIFICATION ---")
    for c in page2_checks:
        found = c in full_text
        print(f"  {'[PASS]' if found else '[FAIL]'} {c}")

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.abspath(__file__))
    default_path = os.path.join(project_dir, "evaluation", "NeuroVisionAI_Generated_Report.pdf")
    target = sys.argv[1] if len(sys.argv) > 1 else default_path
    inspect_pdf(target)
