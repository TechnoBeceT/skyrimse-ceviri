# Lokalizační modifikace Skyrim SE

Projekt slouží pro *re-packaging* původních originálních překladů Skyrim do modifikací vhodných pro Bethesda.net.

## Rozdělení složek

 * `script/` - NodeJS skripty pro práci s projektem
 * `source/` - zdrojové překlady (složka `Data/Strings` s českými překlady)
 * `target/` - soubory finální modifikace

## Skripty v projektu

Skripty v projektu jsou NodeJS skripty. Pro spuštění skriptu je nutná instalace závislostí pomocí příkazu `npm install`.

    node script/nazev_skriptu.js [parametry]

Existující skripty (pro informace o parametrech stačí spustit s `--help`):

 * `compile.js` - vytvoří finální soubory překladu pro vložení do hry
 * `modfile.js` - pokročilá manipulace s ESM soubory
 * `strings.js` - vyhledávání v překladových STRINGS souborech
