import os
import urllib.parse
from pathlib import Path

SITE_DIR = Path("/home/agent/avir/site")

def fix_filenames():
    print("Fixing filenames in site/ directory...")
    for root, dirs, files in os.walk(SITE_DIR):
        for name in files:
            if '%' in name:
                old_path = Path(root) / name
                new_name = urllib.parse.unquote(name)
                new_path = Path(root) / new_name
                if old_path != new_path:
                    print(f"  Renaming: {name} -> {new_name}")
                    try:
                        os.rename(old_path, new_path)
                    except Exception as e:
                        print(f"    ❌ Failed: {e}")

if __name__ == "__main__":
    fix_filenames()
