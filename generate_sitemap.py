import json
import os

def main():
    data_path = "src/data/verbsData.json"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    roots = [root["id"] for root in data.get("roots", [])]
    print(f"Found {len(roots)} roots.")

    # Using a placeholder domain. The user can update this once they purchase one.
    DOMAIN = "https://quranicroots.com"

    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    # Add home page
    xml.append(f'  <url>\n    <loc>{DOMAIN}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>')

    # Add individual root pages
    for r in roots:
        xml.append(f'  <url>\n    <loc>{DOMAIN}/?root={r}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>')

    xml.append("</urlset>")

    with open("public/sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(xml))

    print("Generated public/sitemap.xml successfully.")

if __name__ == "__main__":
    main()
