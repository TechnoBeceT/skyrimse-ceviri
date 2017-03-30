"use strict";
var zlib = require('zlib');

var parseModfile = require('../parse/parse-modfile'),
    renderFormId = require('../utils/render-formId'),
    bakeDefs = require('./bake-defs');

var MODFILE_TYPES = new parseModfile.ModfileType([
        'TES4', 'GRUP', 'GMST', 'EDID', 'DATA', 'INFO', 'BOOK', 'REFR', 'MAST'
    ]),
    BAKED_TYPES = new parseModfile.ModfileType(Object.keys(bakeDefs)),
    WATCHED_TYPES = Object.keys(bakeDefs).reduce((watched, type) => {
        watched[BAKED_TYPES[type]] = new parseModfile.ModfileType(bakeDefs[type]);
        return watched;
    }, {}),
    CONTEXT_TYPES = new parseModfile.ModfileType([ 'QUST', 'DIAL', 'WRLD', 'CELL' ]);

var ROOT_CONTEXT = 0,
    GROUP_CONTEXT = 1,
    RECORD_CONTEXT = 2;

var STATIC_VERSION = 0xFFFF;

/**
 * HEDR field handler.
 */
class HeaderHandler {

	constructor() {
		this.parents = [];
	}

    handleField(type, size, buffer, offset) {
    	if (MODFILE_TYPES.MAST !== type) {
    		return;
    	}
    	this.parents.push(buffer.toString('ascii', offset, offset + size - 1));
    }

    parseParents(plugins, parse) {
    	var result = [];
    	parse(this);
    	this.parents.map(parent => parent.substring(0, parent.length - 4)).forEach((parent, index) => {
    		result[index] = plugins.indexOf(parent);
    		console.log(parent + ' is index ' + index + ' and mapped to ' + result[index] + '.');
    	});
    	return result;
    }

}

/**
 * ModfileHandler implementation for baking translations.
 */
class RecordBaker {

    constructor(plugins, strings, index) {
    	// Target parent plugin names
    	this.plugins = plugins;
    	// Current plugin strings
        this.strings = strings || null;
        // Current plugin index
        this.index = index || 0;
        // Mapping of local index to target indexes
        this.parents = [];
        // Baking context stack
        this.context = {
            _: ROOT_CONTEXT,
            count: 0, // number of baked records
            overrideIds: [], // record overrides
            dataIds: {}, // baked formIds
            data: [] // baked data
        };
        this.stack = [this.context];
    }

    handleGroup(type, label, parse) {
        if (type === 0 && !BAKED_TYPES[label]) {
            return; // No need to bake this top-level group
        }
        // Build group context
        this.context = {
            _: GROUP_CONTEXT,
            parent: this.stack[this.stack.length - 1],
            type: type,
            label: label,
            count: 0,
            head: null, // context record
            dataIds: {},
            data: [],
            bake: false
        };
        // Check for group context record
        if (this.context.parent.head) {
            Object.assign(this.context, this.context.parent.head);
            this.context.parent.head = null;
        }
        // Parse children
        this.stack.push(this.context)
        parse(this);
        this.context = this.stack.pop();
        // Check for bake requests
        if (this.context.bake) {
            this.context.parent.bake = true; // Mark parent for baking
            Object.assign(this.context.parent.dataIds, this.context.dataIds);
            this.context.parent.data.push(this.bakeGroup(this.context));
            this.context.parent.count += this.context.count + this.context.data.length + 1;
        }
    }

    handleRecord(type, size, flags, formId, parse) {
        // Reset group context record
        this.stack[this.stack.length - 1].head = null;
        // Parse plugin header
        if (MODFILE_TYPES.TES4 === type) {
        	this.parents = new HeaderHandler().parseParents(this.plugins, parse);
        	return;
        }
        // Check if the record needs to be processed
        if (!BAKED_TYPES[type] && !CONTEXT_TYPES[type]) {
            return; // Not a baked or context record
        }
    	// Adjust form identifier
    	formId = ((this.parents[formId >> 24] || 0) << 24) || (formId & 0x00FFFFFF);
        // Create context
        this.context = {
            _: RECORD_CONTEXT,
            parent: this.stack[this.stack.length - 1],
            type: type,
            size: size,
            flags: flags,
            formId: formId,
            watch: WATCHED_TYPES[type] || {},
            data: [],
            bake: false
        };
        // Remember last INFO
        if (MODFILE_TYPES.INFO === type) {
            this.context.previous = this.context.parent.lastInfo || 0;
            this.context.parent.lastInfo = formId; // XXX
        }
        // Parse fields
        this.stack.push(this.context);
        parse(this);
        this.context = this.stack.pop();
        // Check for bake requests
        if (this.context.bake && !this.stack[0].dataIds[formId]) {
            this.context.parent.bake = true; // Mark parent for baking
            this.context.parent.dataIds[this.context.formId] = true;
            this.context.parent.data.push(this.bakeRecord(this.context));
            if (this.context.type === MODFILE_TYPES.REFR) {
                this.stack[0].overrideIds.push(this.context.formId);
            }
        } else if (CONTEXT_TYPES[type]) {
            this.context.parent.head = {
                dataIds: {},
                data: [this.bakeRecord(this.context)]
            };
            this.context.parent.head.dataIds[formId] = true;
        }
    }

    handleField(type, size, buffer, offset) {
        // Parse EDID for GMST type recognition
        if (type === MODFILE_TYPES.EDID && this.context.type === MODFILE_TYPES.GMST) {
            if (buffer.toString('ascii', offset, offset + size - 1)[0] !== 's') {
                this.context.watch = {}; // Reset watch for non-string GMST
            }
        }
        // Check if the field is in watched set
        if (!this.context.watch[type] || size === 0) {
            this.context.data.push(buffer.slice(offset - 6, offset + size));
            return; // Non-translated field
        }
        // Get and check string reference
        var stringId = buffer.readUInt32LE(offset);
        if (!stringId) {
            this.context.data.push(buffer.slice(offset - 6, offset + size));
            return; // NULL string reference
        }
        // Fetch the translation to be baked
        var string = this.strings[stringId];
        if (string === undefined) {
        	string = 'INVALID_REF';
            console.error('[WARN] Invalid string reference in ' + renderFormId(this.context.formId) + '.');
        }
        // Remove unsafe characters
        if (this.context.type === MODFILE_TYPES.BOOK) {
            string = string.replace(/[„“]/gm, '"').replace(/[–]/gm, '-');
        }
        this.context.data.push(this.bakeField(type, string));
        this.context.bake = true; // Request baking of the whole stack
    }

    bakeField(type, string) {
        var length = Buffer.byteLength(string),
            buffer = Buffer.alloc(7 + length);
        buffer.writeUInt32LE(type);
        buffer.writeUInt16LE(length + 1, 4);
        buffer.write(string, 6);
        return buffer;
    }

    bakeRecord(record) {
        var data = Buffer.concat(record.data),
            length = data.length,
            baked = null;
        // Write data first
        if (record.flags & 0x00040000) {
            data = zlib.deflateSync(data, { level: 7 });
            baked = Buffer.alloc(28 + data.length);
            baked.writeUInt32LE(length, 24);
            data.copy(baked, 28);
        } else {
            baked = Buffer.alloc(24 + data.length);
            data.copy(baked, 24);
        }
        // Write record header
        baked.writeUInt32LE(record.type);
        baked.writeUInt32LE(baked.length - 24, 4);
        baked.writeUInt32LE(record.flags, 8);
    	baked.writeUInt32LE(record.formId, 12);
        baked.writeUInt16LE(0x83, 20);
        return baked;
    }

    bakeGroup(group) {
        var length = group.data.reduce((length, buffer) => length + buffer.length, 0),
            baked = Buffer.alloc(24 + length);
        baked.writeUInt32LE(MODFILE_TYPES.GRUP);
        baked.writeUInt32LE(baked.length, 4);
        baked.writeUInt32LE(group.label, 8);
        baked.writeUInt32LE(group.type, 12);
        baked.writeUInt16LE(STATIC_VERSION, 16);
        baked.writeUInt16LE(STATIC_VERSION, 20);
        group.data.reduce((offset, buffer) => {
            buffer.copy(baked, offset);
            return offset + buffer.length;
        }, 24);
        return baked;
    }

    bakeHeader(author, parents) {
        var root = this.stack[0],
        	data = [];
        // Write HEDR
        var hedrField = Buffer.alloc(20);
        hedrField.writeUInt32LE(MODFILE_TYPES.encode('HEDR'));
        hedrField.writeUInt16LE(12, 4)
        hedrField.writeUInt32LE(0x3F733333, 6);
        hedrField.writeInt32LE(root.count, 10);
        hedrField.writeUInt32LE(2048, 14);
        data.push(hedrField);
        // Write CNAM
        data.push(this.bakeField(MODFILE_TYPES.encode('CNAM'), author))
        // Write MAST
        parents.forEach(parent => {
        	data.push(this.bakeField(MODFILE_TYPES.encode('MAST'), parent + '.esm'));
        });
        // Write DATA
        var dataField = Buffer.alloc(12);
        dataField.writeUInt32LE(MODFILE_TYPES.encode('DATA'));
        dataField.writeUInt16LE(8, 4)
        data.push(dataField);
        // Write ONAM
        var onamField = Buffer.alloc(6 + root.overrideIds.length * 4);
        onamField.writeUInt32LE(MODFILE_TYPES.encode('ONAM'));
        onamField.writeUInt16LE(root.overrideIds.length * 4, 4);
        root.overrideIds.sort().reduce((offset, formId) => {
            onamField.writeUInt32LE(formId, offset);
            return offset + 4;
        }, 6);
        data.push(onamField);
        // Write INTV
        var intvField = Buffer.alloc(10);
        intvField.writeUInt32LE(MODFILE_TYPES.encode('INTV'));
        intvField.writeUInt16LE(4, 4);
        intvField.writeUInt32LE(1, 6);
        // Write field
        var tes4Field = Buffer.alloc(24);
        tes4Field.writeUInt32LE(MODFILE_TYPES.TES4);
        tes4Field.writeUInt32LE(data.reduce((sum, buffer) => sum + buffer.length, 0), 4);
        tes4Field.writeUInt16LE(0x83, 20);
        data.unshift(tes4Field)
        return Buffer.concat(data);
    }

}
module.exports.RecordBaker = RecordBaker;

