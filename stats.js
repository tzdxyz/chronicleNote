// show some basic info about note
// usage:
// node stats.js ./config.json ./note_example.md

const fs = require("fs");

// read config file
const configPath = process.argv[2];
const configJson = fs.readFileSync(configPath, "utf8");
const config     = JSON.parse(configJson);
const tpt  = require(config.template);

// read note
const filePath = process.argv[3];
const fileText = fs.readFileSync(filePath, "utf8");

const chro = require("./libs/ChroFunc_v0.78.js");
let entriesArray = chro.divideText(fileText, tpt.delimiter);
chro.parseTimeInArray(entriesArray, tpt.timePattern, mode="n");
chro.parseTagsInArray(entriesArray, tpt.tagLinesPattern, tpt.tagPattern, mode="n");

chro.stats(entriesArray, mode="n");

