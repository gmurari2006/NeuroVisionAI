import os
from collections import Counter
from PIL import Image

DATASET_ROOT = r"C:\Users\tinku\Downloads\brain-tumor-mri-dataset"

def inspect_split(split_name):
    split_dir = os.path.join(DATASET_ROOT, split_name)
    if not os.path.exists(split_dir):
        print(f"Directory not found: {split_dir}")
        return None
    
    print(f"\n{'='*20} {split_name} Split {'='*20}")
    classes = sorted(os.listdir(split_dir))
    total_images = 0
    split_info = {}
    
    for cls in classes:
        cls_dir = os.path.join(split_dir, cls)
        if not os.path.isdir(cls_dir):
            continue
        files = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        count = len(files)
        total_images += count
        
        # Sample image formats and sizes
        sizes = []
        modes = []
        for f in files[:20]:
            try:
                with Image.open(os.path.join(cls_dir, f)) as img:
                    sizes.append(img.size)
                    modes.append(img.mode)
            except Exception:
                pass
        
        mode_counts = Counter(modes)
        print(f"  Class: {cls:12s} | Count: {count:5d} | Sample Modes: {dict(mode_counts)} | Sample Sizes: {sizes[:3]}")
        split_info[cls] = count
        
    print(f"Total {split_name} images: {total_images}")
    return split_info

if __name__ == "__main__":
    train_info = inspect_split("Training")
    test_info = inspect_split("Testing")
