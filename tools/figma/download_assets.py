import json
import os

import requests

FIGMA_TOKEN = os.environ.get("FIGMA_TOKEN", "")
FILE_KEY = "hINuFPjeXxAZVlbEQghd11"
OUTPUT_DIR = "apps/game/assets/figma"


def get_figma_file(file_key):
    headers = {"X-Figma-Token": FIGMA_TOKEN}
    url = f"https://api.figma.com/v1/files/{file_key}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def get_image_urls(file_key, ids):
    headers = {"X-Figma-Token": FIGMA_TOKEN}
    url = f"https://api.figma.com/v1/images/{file_key}"
    all_image_urls = {}

    # Batch requests to avoid URL length limits
    batch_size = 50
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i : i + batch_size]
        params = {"ids": ",".join(batch_ids)}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        all_image_urls.update(response.json()["images"])

    return all_image_urls


def find_image_refs(node, refs):
    if "fills" in node:
        for fill in node["fills"]:
            if fill.get("type") == "IMAGE" and "imageRef" in fill:
                refs.add(fill["imageRef"])
    if "children" in node:
        for child in node["children"]:
            find_image_refs(child, refs)


def download_images(image_urls, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for ref, url in image_urls.items():
        try:
            response = requests.get(url)
            response.raise_for_status()
            file_path = os.path.join(output_dir, f"{ref}.png")
            with open(file_path, "wb") as f:
                f.write(response.content)
            print(f"Downloaded {file_path}")
        except requests.exceptions.RequestException as e:
            print(f"Error downloading {url}: {e}")


if __name__ == "__main__":
    print("Fetching Figma file...")
    figma_data = get_figma_file(FILE_KEY)

    print("Finding image references...")
    image_refs = set()
    find_image_refs(figma_data["document"], image_refs)

    if not image_refs:
        print("No image references found.")
    else:
        print(f"Found {len(image_refs)} image references. Getting image URLs...")
        image_urls = get_image_urls(FILE_KEY, list(image_refs))

        print("Downloading images...")
        download_images(image_urls, OUTPUT_DIR)
        print("Done.")
