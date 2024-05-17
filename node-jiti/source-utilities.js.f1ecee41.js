"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.stringEncaseCRLFWithFirstIndex = stringEncaseCRLFWithFirstIndex;exports.stringReplaceAll = stringReplaceAll; // TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }

  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = '';
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);

  returnValue += string.slice(endIndex);
  return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = '';
  do {
    const gotCR = string[index - 1] === '\r';
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
    endIndex = index + 1;
    index = string.indexOf('\n', endIndex);
  } while (index !== -1);

  returnValue += string.slice(endIndex);
  return returnValue;
} /* v7-255e1aba69efb0ea */