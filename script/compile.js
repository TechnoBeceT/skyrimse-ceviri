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

// Determine whether the strings should have accents removed
var unaccent = !!process.env.UNACCENT;
if (unaccent) {
    console.log('UNACCENT option detected...');
}

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
        if (unaccent) {
            Object.keys(strings).forEach(key => {
                strings[key] = latinize(strings[key]);
            });
        }
        stringsWriter.writeFile(strings, output);
    });
});
