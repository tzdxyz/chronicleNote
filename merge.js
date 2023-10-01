// merge multiple ChronicleNotes into one, with name: merged_1stFile.md
// usage:
// node merge.js c1.md c2.md c3.md ...


const fs = require('fs');
const chro = require("./libs/ChroFunc_v0.75.js");

// read file
const filePaths = process.argv.slice(2);
const fileTexts = filePaths.map(path => fs.readFileSync(path, "utf8"));
const entriesArrays = fileTexts.map(txt => chro.stdProcess(txt, chro.delimiter, chro.timePattern, chro.tagLinesPattern, chro.tagPattern));

const mergedArray = chro.mergeArrays(...entriesArrays);

//const time = (new Date()).getTime();
chro.joinAndSaveArray(mergedArray, chro.delimiterStr, "./merged_"+filePaths[0].replace(/[\.\/\\]+/, ""));

