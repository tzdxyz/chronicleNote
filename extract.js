// extract entries by keywords from original file and store in another file.
// usage:
// node extract.js ./note_example.md keywordsList


const fs = require('fs');
const chro = require("./libs/ChroFunc_v0.75.js");

// read file
const filePath = process.argv[2];
const fileText = fs.readFileSync(filePath, "utf8");

// construct entries array
let entriesArray = chro.stdProcess(fileText, chro.delimiter, chro.timePattern, chro.tagLinesPattern, chro.tagPattern);


const keywords = process.argv.slice(3);
let filteredArray = chro.filterArrayByKeywords(entriesArray, keywords, mode="any");

// remove elements in filteredArray from entriesArray
entriesArray = entriesArray.filter( el => !filteredArray.includes( el ) );

chro.joinAndSaveArray(entriesArray, chro.delimiterStr, filePath);
chro.joinAndSaveArray(filteredArray, chro.delimiterStr, "extract_"+keywords.join("-")+".md");
