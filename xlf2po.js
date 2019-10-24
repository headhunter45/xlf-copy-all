
const fs = require('fs');
const convert = require('xml-js');

function poEncode(rawString) {
    return rawString
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '"\n"')
    ;
}

//
module.exports = function (xlfFileName, poFileName) {
    let xmlText = fs.readFileSync(xlfFileName);
    let xmlRoot = convert.xml2js(xmlText, {});
    
    let xliffElement = xmlRoot.elements[0];
    let fileElement = xliffElement.elements[0];
    let bodyElement = fileElement.elements[0];
    let transUnits = bodyElement.elements;
    let numTransUnitsWritten = 0;

    let poText = '';
    
    for (transUnit of transUnits) {
        let transId = transUnit.attributes.id;
        let sourceElement = transUnit.elements.find((element)=>element.name==='source');
        let noteElements = transUnit.elements.filter((element)=>element.name==='note');
        let meaningElement = noteElements && noteElements.find((element)=>element.attributes.from==='meaning');
        let meaningText = meaningElement ? meaningElement.elements[0].text : '';
        let descriptionElement = noteElements && noteElements.find((element)=>element.attributes.from==='description');
        let descriptionText = descriptionElement ? descriptionElement.elements[0].text : '';
        let targetText = convert.js2xml(sourceElement);

        if (descriptionText) {
            poText += '#. ' + poEncode(descriptionText) + '\n';
        }

        if (transId) {
            poText += '#: ' + transId + '\n';
        }

        if (meaningText) {
            poText += 'msgctxt "' + poEncode(meaningText) + '"\n';
        }

        poText += 'msgid "' + poEncode(targetText) + '"\n\n';

        numTransUnitsWritten++;
    }

    fs.writeFileSync(poFileName, poText);

    console.log(`${numTransUnitsWritten} trans-units written to ${poFileName}`);
}
