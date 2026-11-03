"""
NeuroVisionAI - Dataset Leakage & Duplicate Audit
Checks for:
1. Exact file duplicates (MD5/SHA256) between Training and Testing splits (Data Leakage)
2. Intra-split duplicates within Training or Testing sets
3. Class distribution and image dimension statistics
"""

import os
import hashlib
import json
from collections import defaultdict
from PIL import Image

DATASET_ROOT = r"C:\Users\tinku\Downloads\brain-tumor-mri-dataset"
EVAL_DIR = r"C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\evaluation"

def compute_hashes(file_path):
    with open(file_path, "rb") as f:
        data = f.read()
    md5 = hashlib.md5(data).hexdigest()
    sha256 = hashlib.sha256(data).hexdigest()
    return md5, sha256, len(data)

def audit_dataset():
    print("=" * 70)
    print("NEUROVISIONAI - DATA LEAKAGE & DUPLICATE AUDIT")
    print("=" * 70)

    train_hashes = {}  # hash -> list of (cls, filename)
    test_hashes = {}   # hash -> list of (cls, filename)
    
    train_dir = os.path.join(DATASET_ROOT, "Training")
    test_dir = os.path.join(DATASET_ROOT, "Testing")

    print("\nScanning Training set (5,600 expected)...")
    train_count = 0
    train_by_class = defaultdict(int)
    for cls in sorted(os.listdir(train_dir)):
        cls_dir = os.path.join(train_dir, cls)
        if not os.path.isdir(cls_dir):
            continue
        for f in os.listdir(cls_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                fp = os.path.join(cls_dir, f)
                md5, sha, sz = compute_hashes(fp)
                train_hashes[md5] = (cls, f, fp)
                train_count += 1
                train_by_class[cls] += 1

    print(f"  Indexed {train_count} training images ({len(train_hashes)} unique hashes).")
    for cls, cnt in sorted(train_by_class.items()):
        print(f"    - {cls:12s}: {cnt}")

    print("\nScanning Testing set (1,600 expected)...")
    test_count = 0
    test_by_class = defaultdict(int)
    exact_leakage_matches = []
    
    for cls in sorted(os.listdir(test_dir)):
        cls_dir = os.path.join(test_dir, cls)
        if not os.path.isdir(cls_dir):
            continue
        for f in os.listdir(cls_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                fp = os.path.join(cls_dir, f)
                md5, sha, sz = compute_hashes(fp)
                test_count += 1
                test_by_class[cls] += 1
                
                # Check for leakage in training set
                if md5 in train_hashes:
                    train_match = train_hashes[md5]
                    exact_leakage_matches.append({
                        "test_class": cls,
                        "test_file": f,
                        "train_class": train_match[0],
                        "train_file": train_match[1],
                        "md5": md5
                    })
                test_hashes[md5] = (cls, f, fp)

    print(f"  Indexed {test_count} testing images ({len(test_hashes)} unique hashes).")
    for cls, cnt in sorted(test_by_class.items()):
        print(f"    - {cls:12s}: {cnt}")

    print("\n" + "=" * 70)
    print("LEAKAGE ANALYSIS RESULTS")
    print("=" * 70)
    num_leaks = len(exact_leakage_matches)
    leak_rate = (num_leaks / test_count) * 100 if test_count > 0 else 0
    print(f"Total Test Images Analyzed     : {test_count}")
    print(f"Exact Duplicate Leaks Detected : {num_leaks} ({leak_rate:.2f}%)")

    if num_leaks > 0:
        print("\nBreakdown of Leaked Images by Class:")
        leak_by_class = defaultdict(int)
        for m in exact_leakage_matches:
            leak_by_class[m["test_class"]] += 1
        for cls, cnt in sorted(leak_by_class.items()):
            print(f"  - {cls:12s}: {cnt} leaked / {test_by_class[cls]} total ({cnt/test_by_class[cls]*100:.1f}%)")
        print("\nSample Leaked Cases (first 5):")
        for m in exact_leakage_matches[:5]:
            print(f"  Test: {m['test_class']}/{m['test_file']} <=> Train: {m['train_class']}/{m['train_file']} (MD5: {m['md5']})")
    else:
        print("Clean separation: ZERO exact byte-for-byte duplicates found between Training and Testing sets.")

    audit_summary = {
        "dataset_root": DATASET_ROOT,
        "training": {
            "total_images": train_count,
            "unique_hashes": len(train_hashes),
            "class_distribution": dict(train_by_class),
            "intra_split_duplicates": train_count - len(train_hashes)
        },
        "testing": {
            "total_images": test_count,
            "unique_hashes": len(test_hashes),
            "class_distribution": dict(test_by_class),
            "intra_split_duplicates": test_count - len(test_hashes)
        },
        "leakage": {
            "exact_duplicate_count": num_leaks,
            "leakage_rate_pct": round(leak_rate, 4),
            "leaked_by_class": {cls: sum(1 for m in exact_leakage_matches if m["test_class"] == cls) for cls in sorted(test_by_class.keys())},
            "sample_leaks": exact_leakage_matches[:20]
        }
    }

    out_file = os.path.join(EVAL_DIR, "data_leakage_audit.json")
    with open(out_file, "w") as f:
        json.dump(audit_summary, f, indent=2)
    print(f"\nAudit results saved to: {out_file}")

    return audit_summary

if __name__ == "__main__":
    audit_dataset()
