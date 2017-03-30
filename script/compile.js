'use strict';
/**
 * Compile translations into final STRINGS files.
 */
var fs = require('fs'),
    path = require('path'),
    latinize = require('latinize'),
    parseStrings = require('./parse/parse-strings');

//Resolve directories
var sourceDirectory = fs.realpathSync('source'),
	shadowDirectory = fs.realpathSync('shadow'),
    targetDirectory = fs.realpathSync('target');

// Define plugins
var pluginNames = ['Skyrim', 'Update', 'Dawnguard', 'HearthFires', 'Dragonborn'];

// Prepare reader and writer
var stringsReader = new parseStrings.StringsReader('cp1250'),
    stringsWriter = new parseStrings.StringsWriter('utf-8');

// Copy source to target
pluginNames.forEach(pluginName => {
    ['.strings', '.dlstrings', '.ilstrings'].forEach(type => {
        var input = path.join(sourceDirectory, pluginName + '_czech' + type),
            output = path.join(targetDirectory, 'Strings', pluginName.toLowerCase() + '_english' + type),
            strings = stringsReader.readFile(input);
        stringsWriter.writeFile(strings, output);
    });
});
