"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.toPath = exports.isNegativePattern = exports.FilterStream = void 0;var _nodeUrl = require("node:url");
var _nodeStream = require("node:stream");

const toPath = (urlOrPath) => urlOrPath instanceof URL ? (0, _nodeUrl.fileURLToPath)(urlOrPath) : urlOrPath;exports.toPath = toPath;

class FilterStream extends _nodeStream.Transform {
  constructor(filter) {
    super({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(undefined, filter(data) ? data : undefined);
      }
    });
  }
}exports.FilterStream = FilterStream;

const isNegativePattern = (pattern) => pattern[0] === '!';exports.isNegativePattern = isNegativePattern; /* v7-259a918aa3543465 */