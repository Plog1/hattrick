# hattrick
visualiseringsapp for hattrick.org

## Datakilde og historikk

`data/fcb.xlsx` er kilden til dataene. Arbeidsboken holdes lokal og er ignorert
av Git; legg din egen fil på denne stien. Legg nye spillerbilder til i `Data`-arket
uten å fjerne tidligere rader. `Spillere`-arket viser siste verdier, mens
`scripts/sync.py` eksporterer aktive spillere og hele historikken til
`output/players.json`. Eksporten leser Excel-filen, men endrer den ikke.

## Oppdatering

Installer avhengighetene én gang, og kjør deretter synkroniseringen fra
prosjektroten etter at du har lagret nye snapshot-rader i Excel:

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
