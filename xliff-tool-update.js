#!/usr/bin/env node

const { description, version } = require('./package.json');
const program = require('commander');

const po2xlf = require('./po2xlf.js');

function printUsageAndExit() {
    program.outputHelp();
    process.exit(1);
}

let xlfFileName;
let poFileName;

program
    .description(description)
    .version(version, '-v, --version')
    .arguments('<xlfFile> <poFile>')
    .action(function (xlfFile, poFile) {
        xlfFileName = xlfFile;
        poFileName = poFile;
    })
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

po2xlf(xlfFileName, poFileName, options);
