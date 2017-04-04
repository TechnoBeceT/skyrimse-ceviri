# Lokalizační modifikace Skyrim SE

Projekt slouží pro *re-packaging* původních originálních překladů Skyrim do modifikací vhodných pro Bethesda.net.

## Rozdělení složek

 * `script/` - NodeJS skripty pro práci s projektem
 * `shadow/` - ESM soubory Skyrim SE (použité při zapékání překladu)
 * `source/` - zdrojové překlady (složka `Data/Strings` s původními českými překlady)
 * `target/` - soubory finální modifikace
 * `update/` - nové a upravené překlady pro Skyrim SE

## Skripty v projektu

Skripty v projektu jsou NodeJS skripty. Pro spuštění skriptu je nutná instalace závislostí pomocí příkazu `npm install`.

    node script/nazev_skriptu.js [parametry]

Existující skripty (pro informace o parametrech stačí spustit s `--help`):

 * `compile.js` - vytvoří finální STRINGS soubory překladu pro vložení do hry
 * `modfile.js` - zapeče vytvořené překlady do samostatných ESP souborů
 * `strings.js` - vyhledávání v překladových STRINGS souborech

## Sestavení pro PC a XB1

Na PC a XB1 stačí zavolat skript `node script/compile`, který vytvoří STRINGS soubory do složky `target`.
Následně je potřeba v rámci Creation Kit vytvořit prázdnou modifikaci a složky `interface` a `strings` zabalit do přidruženého archivu.

## Sestavení pro PS4

Pro PS4 je potřeba nejdříve vytvořit překlady bez diakritiky pomocí `UNACCENT=1 node script/compile`.
Následně je možné skriptem `node script/modfile` sestavit oddělené modifikace se zapečenými překlady.
Vytvoření jednotného pluginu je nutné udělat přes [Merge Plugin](http://www.nexusmods.com/skyrim/mods/69905/) utilitu.
