#!/usr/bin/env python3
"""Récupère les sondages du premier tour de la présidentielle 2027 sur Wikipédia,
garde le scénario de référence de chaque sondage et calcule la moyenne par semaine.
Écrit data/sondages.json. À lancer chaque semaine : python3 scripts/update_sondages.py"""
import json, re, sys, urllib.parse, urllib.request
from datetime import date, timedelta
from html.parser import HTMLParser
from pathlib import Path

PAGE = "Liste de sondages sur l'élection présidentielle française de 2027"
API = "https://fr.wikipedia.org/w/api.php"
UA = "nuances2027-sondages/1.0 (mhumbble@gmail.com)"
FIRST_YEAR = 2026
OUT = Path(__file__).resolve().parent.parent / "data" / "sondages.json"
MOIS = {"janv": 1, "févr": 2, "fevr": 2, "mars": 3, "avr": 4, "mai": 5, "juin": 6, "juil": 7,
        "août": 8, "aout": 8, "sept": 9, "oct": 10, "nov": 11, "déc": 12, "dec": 12}


def fetch_html():
    q = urllib.parse.urlencode({"action": "parse", "page": PAGE, "prop": "text", "format": "json"})
    req = urllib.request.Request(f"{API}?{q}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)["parse"]["text"]["*"]


class Parser(HTMLParser):
    """Liste les tableaux du premier tour avec le titre de section qui les précède."""
    def __init__(self):
        super().__init__()
        self.tables, self.heading, self.in_heading = [], "", None
        self.cur = self.row = self.cell = None
        self.skip = 0
        self.zone = False
        self.buf = ""

    def handle_starttag(self, t, a):
        a = dict(a)
        if t in ("h2", "h3", "h4", "h5", "h6"):
            self.in_heading = t; self.buf = ""
        elif t == "table" and self.cur is None and "wikitable" in (a.get("class") or ""):
            self.cur = {"heading": self.heading, "rows": []}
        elif t == "tr" and self.cur is not None:
            self.row = []; self.cur["rows"].append(self.row)
        elif t in ("td", "th") and self.row is not None:
            self.cell = []; self.row.append(self.cell)
        elif t in ("style", "script", "sup"):
            self.skip += 1

    def handle_endtag(self, t):
        if t == self.in_heading:
            txt = re.sub(r"\s+", " ", self.buf).strip()
            self.in_heading = None
            if t == "h2":
                self.zone = "premier tour" in txt.lower()
            else:
                self.heading = txt
        elif t in ("style", "script", "sup"):
            self.skip -= 1
        elif t in ("td", "th"):
            self.cell = None
        elif t == "table" and self.cur is not None:
            if self.zone:
                self.tables.append(self.cur)
            self.cur = self.row = None

    def handle_data(self, d):
        if self.in_heading:
            self.buf += d
        if self.cell is not None and not self.skip:
            self.cell.append(d)


def text(cell):
    return re.sub(r"\s+", " ", "".join(cell)).strip()


def number(s):
    s = s.replace(" ", "").replace("\xa0", "").replace(" ", "")
    if s in ("", "—", "–", "-"):
        return None
    m = re.match(r"^(<)?(\d+(?:,\d+)?)", s)
    if not m:
        return None
    v = float(m.group(2).replace(",", "."))
    return 0.5 if (m.group(1) and v <= 1) else v


def end_date(label, year):
    found = re.findall(r"(\d{1,2})(?:er)?\s*(janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|oct|nov|déc|dec)", label.lower())
    if not found:
        return None
    d, m = found[-1]
    return date(year, MOIS[m], int(d))


def parse_table(tbl):
    year = int((re.findall(r"20\d\d", tbl["heading"]) or [0])[-1])
    if year < FIRST_YEAR:
        return []
    rows = tbl["rows"]
    head = next((r for r in rows[1:4] if len(r) >= 5 and all("(" in text(c) for c in r[:3])), None)
    if head is None:
        return []
    cands = []
    for c in head:
        m = re.match(r"^(.*?)\((.*?)\)$", text(c))
        name, party = (m.group(1).strip(), m.group(2).strip()) if m else (text(c), "")
        cands.append((re.sub(r"^Candidat(?=[A-Z])", "Candidat ", name), party))
    n = len(cands)
    polls = []
    for r in rows:
        cells = [text(c) for c in r]
        if len(cells) == n + 1 + 3 and re.search(r"\d", cells[1]):
            d = end_date(cells[1], year)
            if d is None:
                continue
            vals = {}
            for (name, party), raw in zip(cands, cells[3:3 + n]):
                v = number(raw)
                if v is not None:
                    vals[name] = {"party": party, "value": v}
            if vals:
                polls.append({"pollster": cells[0], "date": d.isoformat(),
                              "sample": int(re.sub(r"\D", "", cells[2]) or 0), "values": vals})
    return polls


def weekly(polls):
    weeks = {}
    for p in polls:
        d = date.fromisoformat(p["date"])
        monday = (d - timedelta(days=d.weekday())).isoformat()
        weeks.setdefault(monday, []).append(p)
    out = []
    for monday in sorted(weeks, reverse=True):
        ps = weeks[monday]
        acc = {}
        for p in ps:
            for name, v in p["values"].items():
                acc.setdefault(name, {"party": v["party"], "vals": []})["vals"].append(v["value"])
        avg = {n: {"party": a["party"], "value": round(sum(a["vals"]) / len(a["vals"]), 1), "n": len(a["vals"])}
               for n, a in acc.items()}
        out.append({"week": monday, "polls": len(ps),
                    "pollsters": sorted({p["pollster"] for p in ps}), "average": avg})
    return out


def candidates(polls):
    """Candidats cités dans les sondages (hors hypothèses génériques), pour repérer les nouveaux."""
    out = {}
    for p in polls:
        for name, v in p["values"].items():
            if name.startswith("Candidat "):
                continue
            c = out.setdefault(name, {"name": name, "party": v["party"], "polls": 0, "last": p["date"], "max": 0})
            c["polls"] += 1
            c["last"] = max(c["last"], p["date"])
            c["max"] = max(c["max"], v["value"])
    return sorted(out.values(), key=lambda c: (-c["polls"], c["name"]))


def main():
    parser = Parser()
    parser.feed(fetch_html())
    polls = []
    for t in parser.tables:
        polls += parse_table(t)
    polls.sort(key=lambda p: p["date"], reverse=True)
    data = {"updated": date.today().isoformat(),
            "source": "https://fr.wikipedia.org/wiki/Liste_de_sondages_sur_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2027",
            "method": "Scénario de référence (première ligne) de chaque sondage ; moyenne par semaine (lundi-dimanche) de la date de fin de terrain.",
            "candidates": candidates(polls), "weeks": weekly(polls), "polls": polls}
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(polls)} sondages, {len(data['weeks'])} semaines -> {OUT}")


if __name__ == "__main__":
    sys.exit(main())
