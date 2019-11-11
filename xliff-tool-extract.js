#!/usr/bin/env node

const { description, version } = require('./package.json');
const program = require('commander');

const xlf2po = require('./xlf2po.js');

function printUsageAndExit() {
    program.outputHelp();
    process.exit(1);
}

let xlfFileName;
let poFileName;

program
    .description(description)
    .version(version, '-v, --version')
    .arguments('<xlfFile>')
    .action(function (xlfFile, poFile) {
        xlfFileName = xlfFile;
    })
    .option(
        '-w --normalize-whitespace',
        'Normalizes whitespace to a single space character and trims leading and trailing whitespace.',
    )
    .option(
        '-o --output-file <outputFile>',
        'Redirects output to a file.'
    )
    .option(
        '--enable-angular-optimizations',
        'Enable some optimizations to work around specific angular issues.',
    )
    .parse(process.argv)
;

if (!xlfFileName) {
    printUsageAndExit();
}

let options = {
    normalizeWhitespace: program.normalizeWhitespace || false,
    outputFile: program.outputFile || false,
};

xlf2po(xlfFileName, options);
