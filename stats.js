// show some basic info about note
// usage:
// node stats.js ./note_example.md

const chro = require("./libs/ChroFunc_v0.75.js");
const fs = require("fs");

const filePath = process.argv[2];
const fileText = fs.readFileSync(filePath, "utf8");

let entriesArray = chro.divideText(fileText, chro.delimiter);
chro.parseTimeInArray(entriesArray, chro.timePattern, mode="n");
chro.parseTagsInArray(entriesArray, chro.tagLinesPattern, chro.tagPattern, mode="n");

chro.stats(entriesArray, mode="n");
