// FUNTION:
// read and process chronicle note 
// AUTHOR:
// Tom & chatGPT

// UPDATES:
// 0.5 (11-04-2023):    add debug mode for parse function
// 0.6 (05-05-2023):    support to divide text containing delimiter text.
// 0.65(12-05-2023):    revise parseTimeInArray 
// 0.66(13-05-2023):    add trim mode to some parse functions
// 0.7 (14-05-2023):    add stats function
//                      add a naive assembly function: assemblyDirectAndSaveArray
// 0.71(16-06-2023):    support tags Line in assemblyDirectAndSaveArray
// 0.75(28-09-2023):	add a standard process function containing preliminary process like parse, makeID and etc.
//						add a merge function to concatenate multiple entries arrays in time ascending order.

const fs = require('fs');


// -------------------- PARSE PART --------------------

const delimiter     = /----\r*\n/;
const delimiterStr  = "----\n";

// divide/split the text by delimiter(must be regexp) 
// ... and delete the empty entries(including white spaces or newline)
// ... then store the every divided text into 'text' properties for each element
// mode: 
//      n: (default)normal mode, default behaviour. 
//      a: addition mode, add delimiter text into the text properties.
//         ... to use this mode, delimiter regexp should be wrapped by '()'
//         ... for example, delimiterYoudao = /(\d\d\d\d\s+\d+[\s\.]\d+\n)/;
function divideText(text, delimiter, mode='n'){
    const dividedElements = text.split(delimiter).filter(el => !/^[\s\n]*$/.test(el));

    let entriesArray = [];

    if (mode == "n")
        dividedElements.forEach(el => {
            entriesArray.push({text: el});
        });
    else 

    if (mode == "a"){
        let i = 0;
        while (i < dividedElements.length-1) {
            if (delimiter.test(dividedElements[i]) && !delimiter.test(dividedElements[i+1]))
                entriesArray.push({
                    text: dividedElements[i]+dividedElements[i+1]
                });

            i+=1;
        }
    }

    return entriesArray;
}

// regular expression for parsing time in [D: dd-mm-yyyy hh:mm:ss(maybe missing)]
// ?<indicator> should be used in regexp, like ?<year> ?<month> ...
const timePattern = /## \[D:\s*(?<day>\d{2})-(?<month>\d{2})-(?<year>\d{4}) (?<hour>\d{2}):(?<minute>\d{2}):?(?<second>\d{2})?\]\n/; // \s+ means 1 or more spaces

// parse time info from entriesArray's text props
// default in Chinese Standard Time
// mode: 
//      n:       default behaviour. 
//      d/debug: debug mode, if no time info found, show element's text
//      t:       trim mode,  trim(delete) parsed time info from the text.
function parseTimeInArray(entriesArray, timePattern, mode="n") {
    
    entriesArray.forEach(el => {
        let timeMatch = timePattern.exec(el.text);
        
        if (timeMatch) {
            let [matchText, year, month, day, hour, minute, second] = [timeMatch[0], timeMatch.groups.year, timeMatch.groups.month, timeMatch.groups.day, timeMatch.
			groups.hour, timeMatch.groups.minute, timeMatch.groups.second];
            
            // set the missing hour minute second with 12:00:00
            if (!hour)   {console.log("hour is undefined and set to 0"); hour = 12;}
            if (!minute) {console.log("minute is undefined and set to 0"); minute = 0;}
            if (!second) {console.log("second is undefined and set to 0"); second = 0;}
            
            let date = new Date(year, month - 1, day, hour, minute, second);
            
            // check if date is invalid
            if (isNaN(date.getTime())){
                console.log("Invalid Date, and matched text is "+ matchText);
            }
			
            el.time = date;

            // trim mode code
            if (mode.includes("t")) el.text = el.text.replace(timePattern, "");

        } else {
            console.log("No time match found");
            el.time = undefined;

            if (mode.includes("d") || mode=="debug") console.log(el.text);
        }

    });
}


// regular expression for parsing tags in "\n#tag1 #tag2\n...\n#tag3\n..."
const tagLinesPattern = /^(\s)+#[^\r\n]+/gm;
// regular expression for extracting tag's name in "#tag1 #tag2"
const tagPattern = /#(\S+)/g;

// // old tag pattern "\n@tag1 @tag2\n...\n@tag3\n..."
//const tagLinesPattern = /^@[^\r\n]+/gm;
//const tagPattern = /@(\S+)/g;


// parse tags info
// first parse lines for tags, then parse tags in these lines.
// mode: 
//      n:       default behaviour. 
//      d/debug: debug mode, if no tag line found, show element's text
//      t:       trim mode,  trim(delete) tagline from the text
function parseTagsInArray(entriesArray, tagLinesPattern, tagPattern, mode="n"){

    entriesArray.forEach(el => {

        // parse all lines for tags
        let tagLinesMatch = el.text.match(tagLinesPattern);
        
        el.tagsArray = [];
        
        // return if no tags
        if (tagLinesMatch == null){
            console.log("no tags lines found in this entry");
            if (mode.includes("d")||mode=="debug") console.log(el.text);
            return;
        }

        // parse specific tag's name in each line for tags
        tagLinesMatch.forEach(tagLine => {
            let tagMatch = tagPattern.exec(tagLine);
            
            while (tagMatch != null) {
                el.tagsArray.push(tagMatch[1]);
                tagMatch = tagPattern.exec(tagLine);
            }
        });

        // trim modes, delete tag lines from the text
        if (mode.includes("t")) el.text = el.text.replace(tagLinesPattern, "");

    
    });
}

// regular expression for parse todolist in "- [ ] something" or '* [ ] something', 
const todoPattern    = /[-\*] \[ ] (.*)/gm;
// regular expression for parse todolist in "- [*] something" or '* [*] something'
const todoFinPattern = /[-\*] \[x] (.*)/gm;
// regular expression for parse todolist in "-(or *) [ ] ~~something~~"
const todoDelPattern = /[-\*] \[ ] ~~(.*)~~/gm;

// parse todolist info
function parseTodosInArray(entriesArray, todoPattern, todoFinPattern){
    
    entriesArray.forEach(el => {
        el.todoList = [];
        // finished todo list
        el.todoFinList = [];

        let todoMatch

        while ((todoMatch = todoPattern.exec(el.text)) !== null) {
            el.todoList.push(todoMatch[1]);
            // console.log("todo: ", todoMatch[1]);
        }

        while ((todoMatch = todoFinPattern.exec(el.text)) !== null) {
            el.todoFinList.push(todoMatch[1]);
            // console.log("finished: ", todoMatch[1]);
        }

    });

}


// -------------------- CONSTRUCT PART --------------------

// make id property by time info (ddmmyyyyhhmmss)
function makeIDByTime(entriesArray){
    entriesArray.forEach(el => {
        if (!el.time){
            console.log("no time property found, id is undefined");
            return;
        }

        dateString = el.time.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }) + el.time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false  });
        
        // delete useless symbol
        dateString = dateString.replace(/[:/( AM)]/g, "");

        el.id = dateString;
    });
}

// make tags property by content of the text
function makeTagByText_TOBEEDITED(entriesArray){
    entriesArray.forEach(el => {
        el.tagsArray = [];
    });
}

// construct time info text in standard format from date object
function makeTimeTextByDate(date){
    let dd = String(date.getDate() ).padStart(2, '0');
    let MM = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = String(date.getFullYear());

    let hh = String(date.getHours()  ).padStart(2, '0');
    let mm = String(date.getMinutes()).padStart(2, '0');
    let ss = String(date.getSeconds()).padStart(2, '0');

    return `[D: ${dd}-${MM}-${yyyy} ${hh}:${mm}:${ss}]`;
}


// -------------------- PROCESS PART -----------------------

// merge multi entries arrays and sort in time order
function mergeArrays(...arrays){
	const conArray = [].concat(...arrays);
	const sortedArray = conArray.sort((a, b) => {
		try {return a.time.getTime() - b.time.getTime()}
		catch(error){return 0;}
	});
	
	return sortedArray
}	

// standard parse and makeIDByTime process bundle
function stdProcess(text, delimiter, timePattern, tagLinesPattern, tagPattern){
	let entriesArray = divideText(text, delimiter, mode="n");
	parseTimeInArray(entriesArray, timePattern, mode="n");
	parseTagsInArray(entriesArray, tagLinesPattern, tagPattern, mode="n");

	makeIDByTime(entriesArray);
	return entriesArray;
}


// -------------------- FILTER PART --------------------

// get a filtered entries according to pattern(in regular expression)
function filterEntriesByPattern(entriesArray, pattern){
    let filteredArray = entriesArray.filter(el => {
        return el.text.match(pattern);
    });

    return filteredArray;
}

// get a filtered entries according to keywords list
// mode:
//      all(default): entry need match all keywords,
//      any: entry matches any of keywords.
function filterArrayByKeywords(entriesArray, keywords, mode="all"){

    let filteredArray = entriesArray.filter(el => {
        if (mode == "all"){
            return keywords.every(key => el.text.includes(key));
        }
        else{
            return keywords.some(key => el.text.includes(key));
        }
    });

    return filteredArray;
}

// get a filtered entries according to reject keywords list
// mode:
//      all(default): entry need exclude all keywords,
//      any: entry excludes any of keywords.
function filterArrayByRejectKeywords(entriesArray, keywords, mode="all"){

    let filteredArray = entriesArray.filter(el => {
        if (mode == "all"){
            return keywords.every(key => !el.text.includes(key));
        }
        else{
            return keywords.some(key => !el.text.includes(key));
        }
    });

    return filteredArray;
}

// -------------------- OUTPUT PART --------------------

const todoTag  = "待办";
const todoTag2 = "todo";
// output entries array with todo tag and list
// save info the file if filename is given
function outputTodo(entriesArray, todoTag, filename){
    
    let todoListAll = [];
    entriesArray.forEach(en => {
        if (en.tagsArray.includes(todoTag)){
            if (en.todoList.length != 0) {

                todoListAll.push(...en.todoList.map(str => en.time.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }) + " "+ str));
            }
        }
    });

    todoText = todoListAll.join("\n");

    if (filename != undefined) {
        fs.writeFileSync(filename, todoText);
    }

    return todoText;
}

// join text directly and
// ... save entries array to file with global delimiter
function joinAndSaveArray(entriesArray, delimiter, name="output.md"){

    let text = entriesArray.map(el => el.text).join(delimiter);
    text = delimiter + text;

    // fs.writeFile(name, text, (err) => {
    //     if (err) throw err;
    //     console.log('The file has been saved!');
    // });
    fs.writeFileSync(name, text);
}

// assembly different properties of the entries into one text by default format 
// ... then save entries array to file.
function assemblyDirectAndSaveArray(entriesArray, name="output.md"){
    let text = entriesArray.map(el => {

        let delimiter = "----\n";
        
        // use template iterals
        let timeLine = `## ${makeTimeTextByDate(el.time)}\n`;
        
        // use trim to remove whitespace from both ends
        if (el.tagsArray.length >0)
            return delimiter + timeLine + el.tagsArray.map(tag=>"@"+tag).join(" ") + "\n\n" + el.text.trim();
        else    
            return delimiter + timeLine + "\n" + el.text.trim();
    
    }).join("\n\n");

    fs.writeFileSync(name, text);
}

// print some basic statistical info from the entries array
// mode: 
//      n:       default behaviour. 
//      a: 		 output all properties of entries
function stats(entriesArray, mode="n"){
    console.log('Number of entries:', entriesArray.length);
	
	if (mode == "a"){
		entriesArray.forEach(el => {
			console.log(el);
			// date object cannot shown by console.log sometimes, so it need setup seperately
			console.log("time(in string): " + el.time.toString());
			console.log("\n");
		});
	}
}


module.exports = {
    delimiter,
    delimiterStr,
    divideText,
    timePattern,
    parseTimeInArray,
    tagLinesPattern,
    tagPattern,
    parseTagsInArray,
    todoPattern,
    todoFinPattern,
    parseTodosInArray,
    makeIDByTime,
	mergeArrays,
	stdProcess,
    filterEntriesByPattern,
    filterArrayByKeywords,
    filterArrayByRejectKeywords,
    todoTag,
    outputTodo,
    joinAndSaveArray,
    assemblyDirectAndSaveArray,
    stats,
};


// --------------- Old function and vars backup --------------------------


const timePatternOld = /\[D:\s*(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):?(\d{2})?\]/; // \s* means 0 or more spaces

function parseTimeInArrayOld(entriesArray, timePattern, mode="n") {
    
    entriesArray.forEach(el => {
        let timeMatch = timePattern.exec(el.text);
        
        if (timeMatch) {
            let [matchText, day, month, year, hour, minute, second] = timeMatch;
            
            // set the missing second with 0
            if (!second){
                console.log("second is undefined and set to 0");
                second = 0;
            }
            let date = new Date(year, month - 1, day, hour, minute, second);
            
            // check if date is invalid
            if (isNaN(date.getTime())){
                console.log("Invalid Date, and matched text is "+ matchText);
            }

            el.time = date;


        } else {
            console.log("No time match found");
            el.time = undefined;

            if (mode=="d" || mode=="debug") console.log(el.text);
        }

    });
}

