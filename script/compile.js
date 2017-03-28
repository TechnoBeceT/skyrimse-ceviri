'use strict';
/**
 * Compile translations into final STRINGS files.
 */
var fs = require('fs'),
    path = require('path'),
    latinize = require('latinize'),
    parseStrings = require('./parse/parse-strings');

// Resolve directories
var shadowDirectory = fs.realpathSync('shadow'),
    sourceDirectory = fs.realpathSync('source'),
    targetDirectory = fs.realpathSync('target');

// Resolve plugin names
var plugins = fs.readdirSync(shadowDirectory).
        filter(file => file.toLowerCase().endsWith('.esm')).
        map(file => file.substring(0, file.indexOf('.'))).
        map(plugin => plugin.toLowerCase());

// Prepare reader and writer
var stringsReader = new parseStrings.StringsReader('cp1250'),
    stringsWriter = new parseStrings.StringsWriter('utf-8');

// Copy source to target
plugins.forEach(plugin => {
    ['.strings', '.dlstrings', '.ilstrings'].forEach(type => {
        var input = path.join(sourceDirectory, plugin + '_czech' + type),
            output = path.join(targetDirectory, 'Strings', plugin + '_english' + type),
            strings = stringsReader.readFile(input);
        stringsWriter.writeFile(strings, output);
    });
});

//// XXX TODO FIXME Bordel nize...
//
//
//var UNACCENT_TYPES = [];
//function renderString(string) {
//    var result = string.Dest[0].normalize('NFC'),
//        type = typeof string.REC[0] === 'string' ? string.REC[0] : string.REC[0]._,
//        unaccent = program.unaccent && (
//                UNACCENT_TYPES.some(unaccentType => type.startsWith(unaccentType)) ||
//                UNACCENT_EDIDS.indexOf(string.EDID[0]) > -1
//            );
//    return unaccent ? latinize(result) : result;
//}
//
//var source
//    sourcePrefix = xmlObject.SSTXMLRessources.Content[0].String,
//    targetDirectory = program.target || path.join(__dirname, '..', 'target/Strings'),
//    targetPrefix = path.join(targetDirectory, inputParams.Addon[0] + '_' + inputParams.Source[0] + '.');
//
//['STRINGS', 'DLSTRINGS', 'ILSTRINGS'].forEach((type, index) => {
//    var strings = inputStrings.
//            filter((string) => string.$.List == index).
//            reduce((result, string) => {
//                result[parseInt(string.$.sID, 16)] =  renderString(string);
//                return result;
//            }, {});
//    if (program.shadow) {
//        applyShadow(strings, path.join(program.shadow, inputParams.Addon[0] + '_' + inputParams.Source[0] + '.' + type));
//    }
//    if (program.debug) {
//        applyDebug(strings);
//    }
//    new parseStrings.StringsWriter().writeFile(strings, targetPrefix + type);
//});
