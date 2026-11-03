# hattrick
visualiseringsapp for hattrick.org

## Datakilde og historikk

Datakilden er `data/fcb.xlsx`, ikke funnet noen god løsning for å legge denne i skyen sammen med resten, 
men den oppdateres stort sett fra min pc.
Lim inn rader i `Data`-arket uten å fjerne tidligere data. `Spillere`-arket viser siste verdier, mens
`scripts/sync.py` eksporterer aktive spillere og hele historikken til`output/players.json`. 
Eksporten leser Excel-filen, men endrer den ikke.

## Oppdatering

Installer disse én gang, og kjør deretter synkroniseringen fra
prosjektroten Plog1/workspaces/hattrick etter å ha lagret nye snapshot-rader i Excel:

```sh
python -m pip install -r requirements.txt
python scripts/sync.py
```

Start den lokale webserveren fra prosjektroten for å åpne dashboardet:

```sh
python -m http.server 8000
```

Åpne `http://localhost:8000/web/` i nettleseren. Kjør synkroniseringen på nytt
etter hver Excel-oppdatering for å oppdatere dashboarddataene.
