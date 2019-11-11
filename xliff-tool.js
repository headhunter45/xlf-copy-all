#!/usr/bin/env node

const { description, version } = require('./package.json');
const program = require('commander');

program
    .description(description)
    .version(version, '-v, --version')
    // .command('extract <xlfFile>')
    .command('extract', 'extract strings to po format').alias('e')
    .command('update <baseXlfFile> <poFile>', 'stuff')    
    .parse(process.argv)
;

console.log('done');
