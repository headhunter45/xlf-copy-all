
const fs = require('fs');
const convert = require('xml-js');

function createPoString(sourceText, meaningText, descriptionText, transId) {
    let poText = '';

    if (descriptionText) {
        poText += '#. ' + poEncode(descriptionText) + '\n';
    }

    if (transId) {
        poText += '#: ' + transId + '\n';
    }

    if (meaningText) {
        poText += 'msgctxt "' + poEncode(meaningText) + '"\n';
    }

    poText += 'msgid "' + poEncode(sourceText) + '"\n\n';

    return poText;
}

function poEncode(rawString) {
    return rawString
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '"\n"')
    ;
}

function normalizeWhitespace(rawString) {
    return rawString
        .replace(/\s+/g, ' ')
        .trim()
    ;
}


//
module.exports = function (xlfFileName, poFileName, options) {
    options = options || {};
    let xmlText = fs.readFileSync(xlfFileName);
    let xmlRoot = convert.xml2js(xmlText, {});
    
    let xliffElement = xmlRoot.elements[0];
    let fileElement = xliffElement.elements[0];
    let bodyElement = fileElement.elements[0];
    let transUnits = bodyElement.elements;
    let numTransUnitsWritten = 0;
    let poText = '';
    let foundStrings = new Set();

    let hasFoundPlural = false;
    const pluralExpression = /^<x id="(ICU.*?)" equiv-text="\{.+?, plural, (=1|one) \{...\} other \{...\}\}"\/>$/;
    let hasFoundGenderSelect = false;
    const genderSelectExpression = /^<x id="(ICU.*?)" equiv-text="\{.+?, select, m \{...\} f \{...\}\}"\/>$/;

    for (transUnit of transUnits) {
        let transId = transUnit.attributes.id;
        let sourceElement = transUnit.elements.find((element)=>element.name==='source');
        let noteElements = transUnit.elements.filter((element)=>element.name==='note');
        let meaningElement = noteElements && noteElements.find((element)=>element.attributes.from==='meaning');
        let meaningText = meaningElement ? meaningElement.elements[0].text : '';
        let descriptionElement = noteElements && noteElements.find((element)=>element.attributes.from==='description');
        let descriptionText = descriptionElement ? descriptionElement.elements[0].text : '';
        let sourceText = convert.js2xml(sourceElement);

        if (options.normalizeWhitespace) {
            sourceText = normalizeWhitespace(sourceText);
        }

        let uniqueStringId = sourceText + '|:' + meaningText + '|:' + descriptionText;

        if (sourceText.match(pluralExpression)) {
            if (!hasFoundPlural) {
                hasFoundPlural = true;
                let matches = sourceText.match(pluralExpression);
                sourceText = '<x id="' + matches[1] + '" equiv-text="{num, plural, one {...} other {...}}"/>';
                poText += createPoString(sourceText, meaningText, descriptionText, transId);
                numTransUnitsWritten++;
            }
        } else if (sourceText.match(genderSelectExpression)) {
            if (!hasFoundGenderSelect) {
                hasFoundGenderSelect = true;
                let matches = sourceText.match(genderSelectExpression);
                sourceText = '<x id="' + matches[1] + '" equiv-text="{gender, select, m {...} f {...}}"/>';
                poText += createPoString(sourceText, meaningText, descriptionText, transId);
                numTransUnitsWritten++;
            }
        } else {
            if (foundStrings.has(uniqueStringId)) {
                console.warn('Found duplicate string: ' + uniqueStringId);
            } else {
                foundStrings.add(uniqueStringId);
                poText += createPoString(sourceText, meaningText, descriptionText, transId);
                numTransUnitsWritten++;
            }
        }
    }

    fs.writeFileSync(poFileName, poText);

    console.log(`${numTransUnitsWritten} trans-units written to ${poFileName}`);
}
