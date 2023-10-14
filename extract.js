// extract entries by keywords from original file and store in another file.
// usage:
// node extract.js ./config.json ./note_example.md keywordsList


const fs = require('fs');

// read config file
const configPath = process.argv[2];
const configJson = fs.readFileSync(configPath, "utf8");
const config     = JSON.parse(configJson);
const tpt  = require(config.template);

// read file
const filePath = process.argv[3];
const fileText = fs.readFileSync(filePath, "utf8");


const chro = require("./libs/ChroFunc_v0.78.js");

let entriesArray = chro.stdProcess(fileText, tpt.delimiter, tpt.timePattern, tpt.tagLinesPattern, tpt.tagPattern);

const keywords = process.argv.slice(3);
let filteredArray = chro.filterArrayByKeywords(entriesArray, keywords, mode="any");

extractedArray = entriesArray.filter( el => !filteredArray.includes( el ) );
chro.joinAndSaveArray(extractedArray, tpt.delimiterStr, filePath);

extractFilePath = chro.getNewFileName(filePath, "extracted_")
chro.joinAndSaveArray(filteredArray, tpt.delimiterStr, extractFilePath);
