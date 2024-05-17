"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _unbuild = require("unbuild");var _default = exports.default =

(0, _unbuild.defineBuildConfig)({
  clean: true,
  entries: ['src/index'],
  declaration: true,
  rollup: {
    emitCJS: true
  }
}); /* v7-e617738d05bbbbdb */