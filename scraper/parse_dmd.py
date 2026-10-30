"""
NHS dm+d Parser
Converts NHS dm+d XML files into two JSON files for the Darija Medical Assistant app:
  - nhs_medicines.json  (medicine name + active ingredient + form + manufacturer)
  - nhs_barcodes.json   (ean13 + name + active_ingredient + manufacturer)

Usage:
  python parse_dmd.py <path_to_extracted_dmd_folder>

Output files are written to the same folder as this script.
"""

import xml.etree.ElementTree as ET
import json
import sys
import os
import re

def parse_file(path):
    print(f"Parsing {os.path.basename(path)}...")
    return ET.parse(path).getroot()

def normalize_gtin_to_ean13(gtin):
    """Convert various GTIN formats to 13-digit EAN-13 string, or None if not possible."""
    gtin = gtin.strip()
    if len(gtin) == 13 and gtin.isdigit():
        return gtin
    if len(gtin) == 14 and gtin.isdigit():
        # GTIN-14 with leading 0 → strip it
        if gtin[0] == '0':
            return gtin[1:]
    return None

def main(dmd_folder):
    # 1. VTM: vtmid → ingredient name
    vtm_file = next(f for f in os.listdir(dmd_folder) if f.startswith('f_vtm2'))
    root = parse_file(os.path.join(dmd_folder, vtm_file))
    vtm_map = {}  # vtmid -> name
    for vtm in root.iter('VTM'):
        vtmid = vtm.findtext('VTMID')
        nm    = vtm.findtext('NM')
        if vtmid and nm:
            vtm_map[vtmid] = nm
    print(f"  {len(vtm_map)} active ingredients loaded")

    # 2. VMP: vpid → {name, active_ingredient}
    vmp_file = next(f for f in os.listdir(dmd_folder) if f.startswith('f_vmp2'))
    root = parse_file(os.path.join(dmd_folder, vmp_file))
    vmp_map = {}  # vpid -> {name, active_ingredient}
    for vmp in root.iter('VMP'):
        vpid  = vmp.findtext('VPID')
        nm    = vmp.findtext('NM') or ''
        vtmid = vmp.findtext('VTMID')
        ingredient = vtm_map.get(vtmid, '') if vtmid else ''
        if vpid:
            vmp_map[vpid] = {'name': nm, 'active_ingredient': ingredient}
    print(f"  {len(vmp_map)} virtual medicinal products loaded")

    # 3. AMP: apid → {name, vpid, manufacturer_code}
    amp_file = next(f for f in os.listdir(dmd_folder) if f.startswith('f_amp2'))
    root = parse_file(os.path.join(dmd_folder, amp_file))
    amp_map = {}  # apid -> {name, vpid, suppcd}
    for amp in root.iter('AMP'):
        apid   = amp.findtext('APID')
        nm     = amp.findtext('NM') or ''
        desc   = amp.findtext('DESC') or ''
        vpid   = amp.findtext('VPID')
        suppcd = amp.findtext('SUPPCD') or ''
        # Extract manufacturer from DESC: "Medicine name (Manufacturer Ltd)"
        mfr = ''
        m = re.search(r'\((.+?)\)$', desc)
        if m:
            mfr = m.group(1)
        if apid:
            amp_map[apid] = {'name': nm, 'vpid': vpid, 'manufacturer': mfr}
    print(f"  {len(amp_map)} actual medicinal products loaded")

    # 4. AMPP: appid → apid
    ampp_file = next(f for f in os.listdir(dmd_folder) if f.startswith('f_ampp2'))
    root = parse_file(os.path.join(dmd_folder, ampp_file))
    ampp_map = {}  # appid -> apid
    for ampp in root.iter('AMPP'):
        appid = ampp.findtext('APPID')
        apid  = ampp.findtext('APID')
        if appid and apid:
            ampp_map[appid] = apid
    print(f"  {len(ampp_map)} actual medicinal product packs loaded")

    # 5. GTIN: amppid → list of EAN-13 barcodes
    gtin_file = next(f for f in os.listdir(dmd_folder) if f.startswith('f_gtin2'))
    root = parse_file(os.path.join(dmd_folder, gtin_file))
    gtin_map = {}  # amppid -> ean13 (take the latest active one without an ENDDT)
    for ampp in root.iter('AMPP'):
        amppid = ampp.findtext('AMPPID')
        if not amppid:
            continue
        # Prefer GTINs with no end date (still active)
        active_gtins = []
        all_gtins = []
        for gd in ampp.iter('GTINDATA'):
            gtin = gd.findtext('GTIN') or ''
            enddt = gd.findtext('ENDDT')
            ean13 = normalize_gtin_to_ean13(gtin)
            if ean13:
                all_gtins.append(ean13)
                if not enddt:
                    active_gtins.append(ean13)
        chosen = active_gtins[-1] if active_gtins else (all_gtins[-1] if all_gtins else None)
        if chosen:
            gtin_map[amppid] = chosen
    print(f"  {len(gtin_map)} GTINs (EAN-13 barcodes) loaded")

    # 6. Build nhs_medicines.json
    # One entry per unique (name, active_ingredient) pair from AMP+VMP
    seen = set()
    medicines = []
    for apid, amp in amp_map.items():
        vmp = vmp_map.get(amp['vpid'], {}) if amp['vpid'] else {}
        name       = amp['name']
        ingredient = vmp.get('active_ingredient', '')
        mfr        = amp['manufacturer']
        # Parse dosage + form from VMP name (e.g. "Paracetamol 500mg tablets")
        vmp_name = vmp.get('name', '')
        key = (name.upper(), ingredient.upper())
        if key in seen:
            continue
        seen.add(key)
        medicines.append({
            'name': name,
            'active_ingredient': ingredient,
            'manufacturer': mfr,
            'vmp_name': vmp_name,
            'source': 'NHS dm+d',
        })
    print(f"  {len(medicines)} unique medicines built")

    # 7. Build nhs_barcodes.json
    barcodes = []
    seen_ean = set()
    for amppid, ean13 in gtin_map.items():
        apid = ampp_map.get(amppid)
        if not apid:
            continue
        amp = amp_map.get(apid)
        if not amp:
            continue
        vmp = vmp_map.get(amp['vpid'], {}) if amp['vpid'] else {}
        if ean13 in seen_ean:
            continue
        seen_ean.add(ean13)
        barcodes.append({
            'ean13': ean13,
            'name': amp['name'],
            'active_ingredient': vmp.get('active_ingredient', ''),
            'manufacturer': amp['manufacturer'],
            'type': 'UK',
            'source': 'NHS dm+d',
        })
    print(f"  {len(barcodes)} barcode entries built")

    # 8. Write output files
    out_dir = os.path.dirname(os.path.abspath(__file__))
    meds_path = os.path.join(out_dir, 'nhs_medicines.json')
    barcodes_path = os.path.join(out_dir, 'nhs_barcodes.json')

    with open(meds_path, 'w', encoding='utf-8') as f:
        json.dump(medicines, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {len(medicines)} medicines to {meds_path}")

    with open(barcodes_path, 'w', encoding='utf-8') as f:
        json.dump(barcodes, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(barcodes)} barcodes to {barcodes_path}")
    print("\nDone.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        # Default: assume extracted folder is next to this script
        folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dmd_extract')
    else:
        folder = sys.argv[1]

    if not os.path.isdir(folder):
        print(f"Error: folder not found: {folder}")
        sys.exit(1)

    main(folder)
