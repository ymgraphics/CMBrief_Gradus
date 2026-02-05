const fs = require('fs');
const pdfParsing = require('pdf-parse');

console.log('Exported:', pdfParsing);

const dataBuffer = fs.readFileSync('/Volumes/X9 Pro/Gradus/Brief Generator/BRIEF RAMADAN 7CIEL.pdf');

try {
    pdfParsing(dataBuffer).then(function (data) {
        console.log(data.text);
    });
} catch (e) {
    console.error(e);
}
