import requests
from bs4 import BeautifulSoup
import json
import time
import os

BASE_URL = "https://www.ammps.gov.ma/recherche-medicaments"
OUTPUT_FILE = "ammps_medicines.json"
PROGRESS_FILE = "ammps_progress.json"
TOTAL_PAGES = 822

HEADERS = {
    "User-Agent": "Mozilla/5.0 (academic research project - Bangor University MSc)"
}

FIELD_MAP = {
    "Substance active": "active_ingredient",
    "EPI": "manufacturer",
    "Dosage": "dosage",
    "Forme": "form",
    "Présentation": "presentation",
    "Statut commercialisation": "status",
    "PPV": "price_ppv",
    "PH": "price_hospital",
}


def parse_page(html):
    soup = BeautifulSoup(html, "html.parser")
    medicines = []

    for modal in soup.select(".modal.fade"):
        h5 = modal.select_one("h5.modal-title")
        if not h5:
            continue

        data = {"name": h5.get_text(strip=True)}

        body = modal.select_one(".modal-body")
        if not body:
            medicines.append(data)
            continue

        for item in body.select(".ammps-modal-item"):
            label_el = item.select_one(".ammps-modal-label")
            value_el = item.select_one(".ammps-modal-value")
            if not label_el or not value_el:
                continue
            label = label_el.get_text(strip=True)
            value = value_el.get_text(strip=True)
            key = FIELD_MAP.get(label)
            if key:
                data[key] = value

        medicines.append(data)

    return medicines


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"last_completed_page": 0, "medicines": []}


def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main():
    print("=" * 50)
    print("ammps.gov.ma Scraper")
    print("=" * 50)

    progress = load_progress()
    start_page = progress["last_completed_page"] + 1
    medicines = progress["medicines"]

    if start_page > 1:
        print(f"\nResuming from page {start_page} ({len(medicines)} medicines already collected)")
    else:
        start_page = 1

    print(f"\nScraping pages {start_page} to {TOTAL_PAGES}...")

    for page in range(start_page, TOTAL_PAGES + 1):
        url = f"{BASE_URL}?page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code} on page {page}, retrying once...", flush=True)
                time.sleep(2)
                resp = requests.get(url, headers=HEADERS, timeout=30)
                if resp.status_code != 200:
                    print(f"  Still failing, skipping page {page}", flush=True)
                    continue

            page_medicines = parse_page(resp.text)
            medicines.extend(page_medicines)

        except Exception as e:
            print(f"  Error on page {page}: {e}", flush=True)
            time.sleep(2)
            try:
                resp = requests.get(url, headers=HEADERS, timeout=30)
                if resp.status_code == 200:
                    page_medicines = parse_page(resp.text)
                    medicines.extend(page_medicines)
            except Exception:
                print(f"  Retry also failed, skipping page {page}", flush=True)
                continue

        if page % 10 == 0 or page == TOTAL_PAGES:
            progress["last_completed_page"] = page
            progress["medicines"] = medicines
            save_progress(progress)
            print(f"  [page {page}/{TOTAL_PAGES}] {len(medicines)} medicines collected", flush=True)

        time.sleep(0.5)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(medicines, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(medicines)} medicines saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
