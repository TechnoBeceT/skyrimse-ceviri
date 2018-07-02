#!/usr/bin/env node
'use strict';
/**
 * Son Mod dosyasına güncel strings dosyalarını göm.
 */
var fs = require('fs'),
    path = require('path'),
    parseSource = require('./parse/parse-source'),
    parseModfile = require('./parse/parse-modfile'),
    parseStrings = require('./parse/parse-strings'),
    modfileBake = require('./modfile/bake');

//Dizinleri Çöz
var shadowDirectory = fs.realpathSync('shadow'),
    targetDirectory = fs.realpathSync('target');

// Eklentileri tanımla
var pluginNames = ['Skyrim', 'Update', 'Dawnguard', 'HearthFires', 'Dragonborn'];

// Belirtilen isme sahip mod dizelerini oku
function readStrings(pluginName) {
    var stringsReader = new parseStrings.StringsReader();
    return ['.strings', '.dlstrings', '.ilstrings'].reduce((strings, type) => {
        var filename = path.join(targetDirectory, 'strings', pluginName.toLowerCase() + '_english' + type);
        return stringsReader.readFile(filename, null, strings);
    }, {});
}

// Verilen işleyiciyi kullanarak eklenti mod dosyasını oku
function readModfile(pluginName, handler) {
    var modfilePath = path.join(shadowDirectory, pluginName + '.esm'),
        modfileSource = new parseSource.FileSource(modfilePath),
        modfileParser = new parseModfile.ModfileParser(modfileSource);
    modfileParser.parse(handler);
    modfileSource.close();
}

pluginNames.forEach((pluginName, index) => {
    var recordBaker = new modfileBake.RecordBaker(pluginName, readStrings(pluginName)),
        resultName = 'tr0' + index + 'p.esp';
    console.log(pluginName + ' Eklentisi ' + resultName + ' olarak oluşturuldu');
    readModfile(pluginName, recordBaker);
    fs.writeFileSync(path.join(targetDirectory, resultName), recordBaker.bakePlugin('DEFAULT'));
});
