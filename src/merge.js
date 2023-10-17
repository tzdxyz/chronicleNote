// merge multiple ChronicleNotes into one, with name: merged_1stFile.md
// usage:
// node merge.js config.json c1.md c2.md c3.md ...


const fs = require('fs');

// read config file
const configPath = process.argv[2];
const configJson = fs.readFileSync(configPath, "utf8");
const config     = JSON.parse(configJson);
const tpt  = require(config.template);

// read file
const filePaths = process.argv.slice(3);
const fileTexts = filePaths.map(path => fs.readFileSync(path, "utf8"));

// if only 1 file parameter, exit
if (filePaths.length == 1) {
	console.log("Only 1 file is given, exit");
	process.exit(1);
}

// process codes
const chro = require("../libs/ChroFunc_v0.78.js");
const entriesArrays = fileTexts.map(txt => chro.stdProcess(txt, tpt.delimiter, tpt.timePattern, tpt.tagLinesPattern, tpt.tagPattern));


const mergedArray = chro.mergeArrays(...entriesArrays);

mergedFilePath = chro.getNewFileName(filePaths[0], "merged_")
chro.joinAndSaveArray(mergedArray, tpt.delimiterStr, mergedFilePath);
