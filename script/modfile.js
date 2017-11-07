#!/usr/bin/env node
'use strict';
/**
 * Bake strings into final MODFILE.
 */
var fs = require('fs'),
    path = require('path'),
    parseSource = require('./parse/parse-source'),
    parseModfile = require('./parse/parse-modfile'),
    parseStrings = require('./parse/parse-strings'),
    modfileBake = require('./modfile/bake');

// Resolve directories
var shadowDirectory = fs.realpathSync('shadow'),
    targetDirectory = fs.realpathSync('target');

//Define plugins
var pluginNames = ['Skyrim', 'Update', 'Dawnguard', 'HearthFires', 'Dragonborn'];

// Read strings for plugin with the specified name
function readStrings(pluginName) {
    var stringsReader = new parseStrings.StringsReader();
    return ['.strings', '.dlstrings', '.ilstrings'].reduce((strings, type) => {
        var filename = path.join(targetDirectory, 'strings', pluginName.toLowerCase() + '_english' + type);
        return stringsReader.readFile(filename, null, strings);
    }, {});
}

// Read plugin modfile using the given handler
function readModfile(pluginName, handler) {
    var modfilePath = path.join(shadowDirectory, pluginName + '.esm'),
        modfileSource = new parseSource.FileSource(modfilePath),
        modfileParser = new parseModfile.ModfileParser(modfileSource);
    modfileParser.parse(handler);
    modfileSource.close();
}

pluginNames.forEach((pluginName, index) => {
    var recordBaker = new modfileBake.RecordBaker(pluginName, readStrings(pluginName)),
        resultName = 'cze0' + index + 'p.esp';
    console.log('Baking plugin ' + pluginName + ' as ' + resultName + '.');
    readModfile(pluginName, recordBaker);
    fs.writeFileSync(path.join(targetDirectory, resultName), recordBaker.bakePlugin('DEFAULT'));
});
