import json
from datetime import date, datetime
from pathlib import Path

import pandas as pd

PROJECT_DIR = Path(__file__).resolve().parent.parent
EXCEL_FILE = PROJECT_DIR / "data" / "fcb.xlsx"
OUTPUT_FILE = PROJECT_DIR / "output" / "players.json"

HISTORY_CURRENT_FIELDS = {
    "age": "Alder",
    "days": "Dager",
    "tsi": "TSI",
    "salary": "Lønn",
    "weeksInClub": "Uker i klubben",
    "experience": "Rutine",
    "leadership": "Lederevne",
    "loyalty": "Lojalitet",
    "form": "Form",
    "stamina": "Kondisjon",
    "nationality": "Nasjonalitet",
    "shirtNumber": "Draktnummer",
    "trainer": "Trener",
    "speciality": "Spesialitet",
    "homegrownBonus": "Moderklubb-bonus",
    "injuries": "Skader",
    "warnings": "Advarsler",
    "forSale": "Til salgs",
}

SKILL_FIELDS = {
    "keeper": "Målvakt",
    "defending": "Forsvar",
    "playmaking": "Ballfordeling",
    "winger": "Ving",
    "passing": "Pasninger",
    "scoring": "Målskåring",
    "setPieces": "Dødball",
}

LAST_MATCH_FIELDS = {
    "date": "Forrige kampdato",
    "position": "Forrige posisjon",
    "rating": "Forrige kamprating",
}


def clean(value):
    if pd.isna(value):
        return None

    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.strftime("%Y-%m-%d")

    if hasattr(value, "item"):
        return value.item()

    return value


def build_snapshot(row):
    return {
        "season": clean(row["Sesong"]),
        "week": clean(row["Uke"]),
        "snapshotDate": clean(row["Snapshot-dato"]),
        "current": {
            key: clean(row[column])
            for key, column in HISTORY_CURRENT_FIELDS.items()
        },
        "skills": {
            key: clean(row[column])
            for key, column in SKILL_FIELDS.items()
        },
        "lastMatch": {
            key: clean(row[column])
            for key, column in LAST_MATCH_FIELDS.items()
        },
    }


print("Leser Excel...")

roster = pd.read_excel(
    EXCEL_FILE,
    sheet_name="Spillere",
    header=1,
).dropna(subset=["SpillerID"])

data = pd.read_excel(
    EXCEL_FILE,
    sheet_name="Data",
).dropna(subset=["SpillerID", "Snapshot-dato"])

history_by_player = {
    player_id: history.sort_values(
        ["Snapshot-dato", "Sesong", "Uke"]
    )
    for player_id, history in data.groupby("SpillerID")
}

players = []

for _, roster_player in roster.iterrows():
    history = history_by_player.get(roster_player["SpillerID"])
    development = (
        [build_snapshot(row) for _, row in history.iterrows()]
        if history is not None
        else []
    )
    latest = development[-1] if development else None
    current = latest["current"].copy() if latest else {}

    current.update({
        "age": clean(roster_player["År"]),
        "days": clean(roster_player["Dager"]),
        "tsi": clean(roster_player["TSI"]),
        "salary": clean(roster_player["Lønn"]),
        "weeksInClub": clean(roster_player["Uker i klubben"]),
        "position": clean(roster_player["Siste posisjon"]),
        "rating": clean(roster_player["Siste rating"]),
    })

    players.append({
        "id": clean(roster_player["SpillerID"]),
        "name": clean(roster_player["Navn"]),
        "nationality": latest["current"]["nationality"] if latest else None,
        "current": current,
        "skills": latest["skills"] if latest else {
            key: None for key in SKILL_FIELDS
        },
        "lastMatch": latest["lastMatch"] if latest else {
            key: None for key in LAST_MATCH_FIELDS
        },
        "development": development,
    })

result = {

    "generated": datetime.now().strftime(
        "%Y-%m-%d %H:%M"
    ),

    "playerCount": len(players),

    "players": players
}

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        result,
        f,
        ensure_ascii=False,
        indent=4,
        allow_nan=False,
    )

print(
    f"Eksporterte {len(players)} spillere."
)