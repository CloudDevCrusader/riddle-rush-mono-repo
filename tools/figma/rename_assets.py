import json
import os
import re


def sanitize_name(name):
    name = name.lower()
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"[^a-z0-9-]", "", name)
    return name


def find_node_names(node, id_to_name):
    if "id" in node and "name" in node:
        id_to_name[node["id"]] = sanitize_name(node["name"])
    if "children" in node:
        for child in node["children"]:
            find_node_names(child, id_to_name)


def rename_assets(mapping, directory):
    name_counts = {}
    for filename in os.listdir(directory):
        if not filename.endswith(".png"):
            continue

        node_id = filename.replace(".png", "")
        if node_id in mapping:
            new_name_base = mapping[node_id]

            # Handle duplicate names
            if new_name_base in name_counts:
                name_counts[new_name_base] += 1
                new_name = f"{new_name_base}-{name_counts[new_name_base]}.png"
            else:
                name_counts[new_name_base] = 1
                new_name = f"{new_name_base}.png"

            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)

            os.rename(old_path, new_path)
            print(f"Renamed {old_path} to {new_path}")
        else:
            print(f"Warning: No name found for {filename}")


if __name__ == "__main__":
    with open(".planning/figma-design.json", "r") as f:
        figma_data = json.load(f)

    id_to_name_map: dict[str, str] = {}
    find_node_names(figma_data["document"], id_to_name_map)

    rename_assets(id_to_name_map, "apps/game/assets/figma")
