import json
from datetime import datetime

import pandas as pd

EXCEL_FILE = "data/FCB.xlsx"
OUTPUT_FILE = "output/players.json"


def clean(value):

    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.strftime("%Y-%m-%d")

    return value


print("Leser Excel...")

spillere = pd.read_excel(
    EXCEL_FILE,
    sheet_name="Spillere"
)

data = pd.read_excel(
    EXCEL_FILE,
    sheet_name="Data"
)

players = []

for _, spiller in spillere.iterrows():

    speler_id = spiller["SpillerID"]

    siste_rad = int(
        spiller["Siste data-rad (auto)"]
    )

    snapshot = data.iloc[siste_rad - 1]

    historikk = data[
        data["SpillerID"] == speler_id
    ].sort_values(
        ["Sesong", "Uke"]
    )

    development = []

    for _, row in historikk.iterrows():

        development.append({
            "season": clean(row["Sesong"]),
            "week": clean(row["Uke"]),
            "snapshotDate": clean(
                row["Snapshot-dato"]
            ),
            "tsi": clean(row["TSI"])
        })

    player = {

        "id": clean(
            spiller["SpillerID"]
        ),

        "name": clean(
            spiller["Navn"]
        ),

        "nationality": clean(
            snapshot["Nasjonalitet"]
        ),

        "current": {

            "age": clean(
                spiller["År"]
            ),

            "days": clean(
                spiller["Dager"]
            ),

            "tsi": clean(
                spiller["TSI"]
            ),

            "salary": clean(
                spiller["Lønn"]
            ),

            "weeksInClub": clean(
                spiller["Uker i klubben"]
            ),

            "position": clean(
                spiller["Siste posisjon"]
            ),

            "rating": clean(
                spiller["Siste rating"]
            ),

            "form": clean(
                snapshot["Form"]
            ),

            "stamina": clean(
                snapshot["Kondisjon"]
            ),

            "experience": clean(
                snapshot["Rutine"]
            ),

            "leadership": clean(
                snapshot["Lederevne"]
            ),

            "loyalty": clean(
                snapshot["Lojalitet"]
            ),

            "speciality": clean(
                snapshot["Spesialitet"]
            )
        },

        "skills": {

            "keeper": clean(
                snapshot["Målvakt"]
            ),

            "defending": clean(
                snapshot["Forsvar"]
            ),

            "playmaking": clean(
                snapshot["Ballfordeling"]
            ),

            "winger": clean(
                snapshot["Ving"]
            ),

            "passing": clean(
                snapshot["Pasninger"]
            ),

            "scoring": clean(
                snapshot["Målskåring"]
            ),

            "setPieces": clean(
                snapshot["Dødball"]
            )
        },

        "lastMatch": {

            "date": clean(
                snapshot["Forrige kampdato"]
            ),

            "position": clean(
                snapshot["Forrige posisjon"]
            ),

            "rating": clean(
                snapshot["Forrige kamprating"]
            )
        },

        "development": development
    }

    players.append(player)

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
        indent=4
    )

print(
    f"Eksporterte {len(players)} spillere."
)