// delete old notes except for some tags according to configuration file.
// usage:
// node perish.js ./config.json ./note_example.md

const fs = require("fs");

// read config file
const configPath = process.argv[2];
const configJson = fs.readFileSync(configPath, "utf8");
const config     = JSON.parse(configJson);
const tpt  = require(config.template);

// read note
const filePath = process.argv[3];
const fileText = fs.readFileSync(filePath, "utf8");

// preliminary process of note
const chro = require("../libs/ChroFunc_v0.78.js");
let entriesArray = chro.stdProcess(fileText, tpt.delimiter, tpt.timePattern, tpt.tagLinesPattern, tpt.tagPattern);

// filter the entries that shoule be perish
const perishDatetime = new Date(new Date() - config.perishHours*60*60*1000);
let filteredArray1 = chro.filterArrayBeforeDatetime(entriesArray, perishDatetime);
const rejectTags = config.stayTags.map(tagname => "#"+tagname);console.log(rejectTags);
let perishArray = chro.filterArrayByRejectKeywords(filteredArray1, rejectTags);

// save entries
if (perishArray.length>0){
	const perishPath = chro.getNewFileName(filePath, "perish_"); 
	chro.joinAndSaveArray(perishArray, tpt.delimiterStr, perishPath);
}

let stayArray = entriesArray.filter( el => !perishArray.includes( el ) );
chro.joinAndSaveArray(stayArray, tpt.delimiterStr, filePath);

console.log("stay entries:");
chro.stats(stayArray, mode="n");
console.log("perish entries:");
chro.stats(perishArray, mode="n");


