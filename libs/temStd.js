// standard template (for specific information, see ChroFunc_)
/* for examples:
----
## [D: 17-12-2022 08:57]
 #game #record

Just unlocked a rare achievement in my favorite game! Feeling like a true gaming champion right now! 

*/

const delimiter     = /----\r*\n/;
const delimiterStr  = "----\n";
const timePattern = /## \[D:\s*(?<day>\d{2})-(?<month>\d{2})-(?<year>\d{4}) (?<hour>\d{2}):(?<minute>\d{2}):?(?<second>\d{2})?\]\n/; // \s+ means 1 or more spaces
const tagLinesPattern = /^(\s)+#[^\r\n]+/gm;
const tagPattern = /#(\S+)/g;

module.exports = {
    delimiter,
    delimiterStr,
    timePattern,
    tagLinesPattern,
    tagPattern,
};
