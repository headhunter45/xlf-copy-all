
const fs = require('fs');
const path = require('path');
const convert = require('xml-js');
const gettextParser = require('gettext-parser');

function getPoString(poStrings, id, meaning, description) {
    const foundString = poStrings.find((translation) => {
        return translation.msgid === id && translation.msgctxt === meaning && translation.comments.extracted === description;
    });

    return foundString;
}

module.exports = function (xlfFileName, poFileName, options) {
    options = options || {};
    let outputFileName = options.outputFile;
    let outputText = '';
    let xmlText = fs.readFileSync(xlfFileName);
    let xmlRoot = convert.xml2js(xmlText, {});
    let xliffElement = xmlRoot.elements[0];
    let fileElement = xliffElement.elements[0];
    let bodyElement = fileElement.elements[0];
    let transUnits = bodyElement.elements;
    let numStringsUpdated = 0;
    let poText = fs.readFileSync(poFileName);
    let poData = gettextParser.po.parse(poText);
    const flattener = function(accumulator, current) {
        if (Array.isArray(current)) {
            for (const element of current) {
                flattener(accumulator, element)
            }
        } else {
            accumulator.push(current);
        }

        return accumulator;
    };
    let poStrings = Object.values(poData.translations)
        .map(i=>Object.values(i))
        .reduce(flattener, []);

    for (transUnit of transUnits) {
        // check for transUnit.attributes.state !== 'final'
        const sourceElement = transUnit.elements.find(el => el.name === 'source');
        const sourceText = convert.js2xml(sourceElement);
        const meaningNoteElement = transUnit.elements.find(el => el.name === 'note' && el.attributes.from === 'meaning');
        const meaning = meaningNoteElement ? convert.js2xml(meaningNoteElement) : undefined;
        const descriptionNoteElement = transUnit.elements.find(el => el.name === 'note' && el.attributes.from === 'description');
        const description = descriptionNoteElement ? convert.js2xml(descriptionNoteElement) : undefined;

        // lookup sourceText in po file to get targetText
        const translatedString = getPoString(poStrings, sourceText, meaning, description);
        const targetText = translatedString && translatedString.msgstr && translatedString.msgstr.length === 1 ? translatedString.msgstr[0] : sourceText;

        transUnit.elements = transUnit.elements.filter(el => el.name !== 'target');
        transUnit.elements.push(convert.xml2js('<target>' + targetText + '</target>').elements[0]);
        numStringsUpdated++;
        // console.dir(transUnit);
    }

    outputText = convert.js2xml(xmlRoot);

    if (outputFileName) {
        const outputDirName = path.dirname(outputFileName);
        if (!fs.existsSync(outputDirName)) {
            fs.mkdirSync(path.dirname(outputFileName), {recursive: true});
        }
        fs.writeFileSync(outputFileName, outputText);
        console.log(`${numStringsUpdated} new translations added to ${outputFileName}`);
    } else {
        console.log(outputText);
    }
}
