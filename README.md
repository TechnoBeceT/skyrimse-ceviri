# Localization project for Skyrim SE

Project for *re-packaging* of Skyrim SE translation into console friendly mods that can be uploaded to Bethesda.net.

## Project folders

 * `script/` - localization processing scripts
 * `shadow/` - Skyrim SE master files (`*.esm` files)
 * `source/` - game localization files (`Data/Strings` folder with target strings)
 * `target/` - target output directory

## Project scripts

Project scripts run under NodeJS. Run `npm install` to initialize dependencies (one time operation).

Existing scripts:

 * `compile.js` - creates final translation STRINGS files for the game (suitable for Xbox)
 * `modfile.js` - bakes compiled translations into ESP plugin files (suitable for PS4)

## Creating PC and XB1 modification

Run `node script/compile` to build STRINGS files inside `target` folder.
Then create empty modification inside Creation Kit and pack `interface` and `strings` files into companion BA2 archive.

## Creating PS4 modification

PS4 translation strings must be compiled with transliteration enabled via `UNACCENT=1 node script/compile`.
Create separate plugin files with baked-in translations using `node script/modfile`.
Then create single modification using [Merge Plugin](http://www.nexusmods.com/skyrim/mods/69905/) tool.
