// find entries by keywords and save in another file.
// usage:
// node save.js ./note_example.md keywordsList


const fs = require('fs');
const chro = require("./libs/ChroFunc_v0.75.js");

// read file
const filePath = process.argv[2];
const fileText = fs.readFileSync(filePath, "utf8");

// construct entries array
let entriesArray = chro.stdProcess(fileText, chro.delimiter, chro.timePattern, chro.tagLinesPattern, chro.tagPattern);

// filter & output
const keywords = process.argv.slice(3);

let filteredArray = chro.filterArrayByKeywords(entriesArray, keywords, mode="any");

chro.joinAndSaveArray(filteredArray, chro.delimiterStr, "save_"+keywords.join("-")+".md");

