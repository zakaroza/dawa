import requests
from bs4 import BeautifulSoup
import json
import time
import re

BASE_URL = "https://www.ammps.gov.ma/repertoire-medicaments-generiques"
OUTPUT_FILE = "ammps_barcodes.json"
TOTAL_PAGES = 16

HEADERS = {
    "User-Agent": "Mozilla/5.0 (academic research project - Bangor University MSc)"
}


def parse_page(html):
    soup = BeautifulSoup(html, "html.parser")
    entries = []

    for card in soup.select(".rmmg-substance-card"):
        group_el = card.select_one(".rmmg-group-title")
        if not group_el:
            continue
        group_text = group_el.get_text(strip=True)
        active_ingredient = re.sub(r"^Groupe\s+g[ée]n[ée]rique\s*:\s*", "", group_text, flags=re.IGNORECASE).strip()

        for row in card.select("tbody tr"):
            cells = row.find_all("td")
            if len(cells) < 4:
                continue

            badge = cells[0].select_one(".type-badge")
            entry = {
                "ean13": cells[3].get_text(strip=True),
                "name": cells[1].get_text(strip=True),
                "active_ingredient": active_ingredient,
                "manufacturer": cells[2].get_text(strip=True),
                "type": badge.get_text(strip=True) if badge else "",
            }
            entries.append(entry)

    return entries


def main():
    print("=" * 50)
    print("ammps.gov.ma Barcode Scraper")
    print("=" * 50)

    all_entries = []

    for page in range(1, TOTAL_PAGES + 1):
        url = f"{BASE_URL}?page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code} on page {page}, skipping", flush=True)
                continue
            page_entries = parse_page(resp.text)
            all_entries.extend(page_entries)
        except Exception as e:
            print(f"  Error on page {page}: {e}", flush=True)
            continue

        if page % 5 == 0 or page == TOTAL_PAGES:
            print(f"  [page {page}/{TOTAL_PAGES}] {len(all_entries)} entries collected", flush=True)

        time.sleep(0.5)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)

    valid_barcodes = sum(1 for e in all_entries if re.match(r"^\d{13}$", e["ean13"]))
    print(f"\nDone! {len(all_entries)} entries saved to {OUTPUT_FILE}")
    print(f"  {valid_barcodes} with valid EAN-13 barcode")
    print(f"  {len(all_entries) - valid_barcodes} without barcode (- or empty)")


if __name__ == "__main__":
    main()
