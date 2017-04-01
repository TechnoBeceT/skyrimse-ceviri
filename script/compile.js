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
	updateDirectory = fs.realpathSync('update'),
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
            update = path.join(updateDirectory, pluginName.toLowerCase() + type + '.js'),
            strings = stringsReader.readFile(input);
        if (fs.existsSync(update)) {
        	Object.assign(strings, require(update));
        }
        stringsWriter.writeFile(strings, output);
    });
});
