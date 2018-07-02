#!/usr/bin/env node
'use strict';
/**
 * Çevirileri güncel STRINGS dosyalarına derleyin.
 */
var fs = require('fs'),
    path = require('path'),
    latinize = require('latinize'),
    parseStrings = require('./parse/parse-strings');

//Dizinleri Çöz
var sourceDirectory = fs.realpathSync('source'),
    shadowDirectory = fs.realpathSync('shadow'),
    updateDirectory = fs.realpathSync('update'),
    targetDirectory = fs.realpathSync('target');

// Eklentileri tanımla
var pluginNames = ['Skyrim', 'Update', 'Dawnguard', 'HearthFires', 'Dragonborn'];

// Okuma ve yazma kodlamasını ayarla
var stringsReader = new parseStrings.StringsReader('cp1254'),
    stringsWriter = new parseStrings.StringsWriter('utf-8');

/* Dizelerden kaldırılması gereken türkçe karakter olup olmadığını belirleme. 
Çift ünlem türkçe karakterli, tek ünlem türkçe karakterleri kaldırır.*/
var unaccent = !!process.env.UNACCENT;
if (unaccent) {
    console.log('Türkçe Karakter düzeltme opsiyonu tespit edildi...');
}

// Kaynağı hedefe kopyala
pluginNames.forEach(pluginName => {
    ['.strings', '.dlstrings', '.ilstrings'].forEach(type => {
        var input = path.join(sourceDirectory, pluginName + '_turkish' + type),
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
