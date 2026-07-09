import os
from PIL import Image

src_img_path = r"C:\Users\14L1\.gemini\antigravity\brain\b640306e-8dec-4c64-9679-0bc16ed9bc94\cubezen_icon_1783620729680.png"
public_dir = r"c:\Users\14L1\Desktop\qqtimer-version2\public"

sizes = {
    "pwa-192x192.png": (192, 192),
    "pwa-512x512.png": (512, 512),
    "apple-touch-icon.png": (180, 180)
}

if not os.path.exists(src_img_path):
    print(f"Source image not found: {src_img_path}")
    exit(1)

img = Image.open(src_img_path)

for name, size in sizes.items():
    dest_path = os.path.join(public_dir, name)
    resized_img = img.resize(size, Image.Resampling.LANCZOS)
    resized_img.save(dest_path, "PNG")
    print(f"Saved {name} with size {size} to {dest_path}")

print("All icons successfully resized!")
