'use strict';
/**
 * Walk through ESN and extract various data.
 */
var parseSource = require('./parse/parse-source'),
    parseModfile = require('./parse/parse-modfile'),
    parseStrings = require('./parse/parse-strings'),
    renderFormId = require('./utils/render-formId'),
    program = require('commander'),
    util = require('util'),
    path = require('path'),
    fs = require('fs');

program.
    option('-m, --modfile <file>', 'Specify modfile to use.').
    option('-s, --strings <directory>', 'Strings source directory.').
    option('-l, --language <lang>', 'Language specifier.').
    option('-o, --output <file>', 'Write output to the specified file.');

function readStrings() {
    var modfilePath = program.modfile;
    if (program.strings) {
        modfilePath = path.resolve(path.dirname(program.strings), path.basename(program.modfile));
    }
    return new parseStrings.StringsReader().readByModfile(modfilePath, program.language || 'en');
}

function readModfile(handler) {
    var modfileSource = new parseSource.FileSource(program.modfile),
        modfileParser = new parseModfile.ModfileParser(modfileSource);
    modfileParser.parse(handler);
    modfileSource.close();
    return handler;
}

function writeOutput(data) {
    if (program.output) {
        fs.writeFileSync(program.output, data);
    } else {
        console.log(data);
    }
}

function renderInnrs(innrs) {
    var rowCount = Math.max.apply(null, innrs.map(part => part.choices.length)),
        rows = [];
    innrs.forEach((part) => {
        for (let i = 0; i < part.choices.length; i++) {
            rows[i] = (rows[i] || '') + (part.choices[i].name || '') + '\t"' +
                    part.choices[i].conditions.join('\n') + '"\t';
        }
        for (let i = part.choices.length; i < rowCount; i++) {
            rows[i] = (rows[i] || '') + '\t\t';
        }
    });
    return rows.join('\n');
}

/**
 * General search command.
 */
program.
    command('find <pattern>').
    description('Find items with the defined HEX pattern in their body.').
    option('-t, --type <type>', 'Specify entry type to find.').
    action(() => {
        var modfileFind = require('./modfile/find'),
            matchExtractor = readModfile(new modfileFind.MatchExtractor(program.args[1].type, program.args[0])),
            resultData = [];
        matchExtractor.result.forEach((match) => {
            resultData.push(renderFormId(match.formId) + ' [' + parseModfile.MODFILE_TYPES.decode(match.type) + '] ' +
                    match.editorId);
        });
        writeOutput(resultData.join('\n'));
    });

/**
 * Create 'baked' modfile.
 */
program.
    command('bake').
    description('Produce modfile with baked-in translations.').
    action(() => {
        var modfileBake = require('./modfile/bake'),
            strings = readStrings(),
            baker = readModfile(new modfileBake.RecordBaker(strings));
        if (!baker.stack[0].dataIds.length) {
            throw new Error("No data to bake.");
        }
        baker.stack[0].data.unshift(baker.bakeHeader('DEFAULT', path.basename(program.modfile)));
        fs.writeFileSync(program.output || (program.modfile + '.BAKED'), Buffer.concat(baker.stack[0].data));

    });

/**
 * Fallback command.
 */
program.
    action(() => {
        console.error('[ERROR] Unknown command \'' + program.args[0] + '\'.');
    });

program.parse(process.argv);
if (!program.args.length) {
    program.help();
}
