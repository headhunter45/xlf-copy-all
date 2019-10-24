#!/usr/bin/env node

const { description, version } = require('./package.json');
const program = require('commander');
const xlf2po = require('./xlf2po.js')

function getFileExtension(fileName) {
    const segments = fileName.split('/');
    const lastSegment = segments[segments.length-1];
    const lastPeriod = lastSegment.lastIndexOf('.');

    return lastSegment.substr(lastPeriod+1);
};

function printUsageAndExit() {
    program.outputHelp();
    process.exit(1);
}

let inputXlfFileName;
let outputPoFileName;

program
    .description(description)
    .version(version, '-v, --version')
    .arguments('<xlfFile> <poFile>')
    .action(function (xlfFile, poFile) {
        inputXlfFileName = xlfFile;
        outputPoFileName = poFile;
    })
    .parse(process.argv)
;

if (!inputXlfFileName || !outputPoFileName) {
    printUsageAndExit();
}

console.log(inputXlfFileName);
console.log(outputPoFileName);

let fromExt = getFileExtension(inputXlfFileName);
let toExt = getFileExtension(outputPoFileName);

switch (fromExt.toLowerCase()) {
    case 'xlf':
        switch (toExt.toLowerCase()) {
            case 'po':
            case 'pot':
                xlf2po(inputXlfFileName, outputPoFileName);
                break;
            default:
                printUsageAndExit();
                break;
        }
        break;
    default:
        printUsageAndExit();
        break;
}
