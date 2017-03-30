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

var recordBaker = new modfileBake.RecordBaker(pluginNames);
pluginNames.slice().reverse().forEach(pluginName => {
	recordBaker.strings = readStrings(pluginName);
	recordBaker.index = pluginNames.indexOf(pluginName);
	console.log('Baking plugin ' + pluginName + ' as index ' + recordBaker.index + '.');
	readModfile(pluginName, recordBaker);
});
recordBaker.stack[0].data.unshift(recordBaker.bakeHeader('DEFAULT', pluginNames));
fs.writeFileSync(path.join(targetDirectory, 'czeskyrimp.esm'), Buffer.concat(recordBaker.stack[0].data));
