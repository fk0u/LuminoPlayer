"""
Lumino Player - Automatic libmpv setup script for Windows
Downloads the latest official 64-bit libmpv build and distributes the DLLs.
"""
import urllib.request
import json
import subprocess
import os
import shutil

def setup():
    print("Fetching latest mpv release from zhongfly/mpv-winbuild...")
    api_url = "https://api.github.com/repos/zhongfly/mpv-winbuild/releases/latest"
    req = urllib.request.Request(api_url, headers={"User-Agent": "LuminoPlayer-Setup"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    dl_url = None
    for asset in data.get("assets", []):
        name = asset.get("name", "")
        if name.startswith("mpv-dev-x86_64-") and name.endswith(".7z") and not "v3" in name:
            dl_url = asset.get("browser_download_url")
            break

    if not dl_url:
        for asset in data.get("assets", []):
            if "mpv-dev-x86_64" in asset.get("name", ""):
                dl_url = asset.get("browser_download_url")
                break

    if not dl_url:
        print("Could not find mpv-dev download URL.")
        return

    archive_path = "mpv-dev.7z"
    print(f"Downloading {dl_url}...")
    urllib.request.urlretrieve(dl_url, archive_path)

    print("Extracting archive...")
    subprocess.run(["tar.exe", "-xf", archive_path], check=True)

    if os.path.exists("libmpv-2.dll"):
        shutil.copyfile("libmpv-2.dll", "mpv-2.dll")
        os.makedirs("src-tauri", exist_ok=True)
        shutil.copyfile("libmpv-2.dll", os.path.join("src-tauri", "mpv-2.dll"))
        shutil.copyfile("libmpv-2.dll", os.path.join("src-tauri", "libmpv-2.dll"))
        
        target_debug = os.path.join("src-tauri", "target", "debug")
        if os.path.exists(target_debug):
            shutil.copyfile("libmpv-2.dll", os.path.join(target_debug, "mpv-2.dll"))
            shutil.copyfile("libmpv-2.dll", os.path.join(target_debug, "libmpv-2.dll"))

    if os.path.exists(archive_path):
        os.remove(archive_path)

    print("libmpv setup completed successfully!")

if __name__ == "__main__":
    setup()
