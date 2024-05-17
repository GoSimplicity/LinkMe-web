"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.isIgnoredByIgnoreFilesSync = exports.isIgnoredByIgnoreFiles = exports.isGitIgnoredSync = exports.isGitIgnored = exports.GITIGNORE_FILES_PATTERN = void 0;var _nodeProcess = _interopRequireDefault(require("node:process"));
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _fastGlob = _interopRequireDefault(require("fast-glob"));
var _ignore = _interopRequireDefault(require("ignore"));
var _slash = _interopRequireDefault(require("slash"));
var _utilities = require("./utilities.js");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const ignoreFilesGlobOptions = {
  ignore: [
  '**/node_modules',
  '**/flow-typed',
  '**/coverage',
  '**/.git'],

  absolute: true,
  dot: true
};

const GITIGNORE_FILES_PATTERN = exports.GITIGNORE_FILES_PATTERN = '**/.gitignore';

const applyBaseToPattern = (pattern, base) => (0, _utilities.isNegativePattern)(pattern) ?
'!' + _nodePath.default.posix.join(base, pattern.slice(1)) :
_nodePath.default.posix.join(base, pattern);

const parseIgnoreFile = (file, cwd) => {
  const base = (0, _slash.default)(_nodePath.default.relative(cwd, _nodePath.default.dirname(file.filePath)));

  return file.content.
  split(/\r?\n/).
  filter((line) => line && !line.startsWith('#')).
  map((pattern) => applyBaseToPattern(pattern, base));
};

const toRelativePath = (fileOrDirectory, cwd) => {
  cwd = (0, _slash.default)(cwd);
  if (_nodePath.default.isAbsolute(fileOrDirectory)) {
    if ((0, _slash.default)(fileOrDirectory).startsWith(cwd)) {
      return _nodePath.default.relative(cwd, fileOrDirectory);
    }

    throw new Error(`Path ${fileOrDirectory} is not in cwd ${cwd}`);
  }

  return fileOrDirectory;
};

const getIsIgnoredPredicate = (files, cwd) => {
  const patterns = files.flatMap((file) => parseIgnoreFile(file, cwd));
  const ignores = (0, _ignore.default)().add(patterns);

  return (fileOrDirectory) => {
    fileOrDirectory = (0, _utilities.toPath)(fileOrDirectory);
    fileOrDirectory = toRelativePath(fileOrDirectory, cwd);
    return fileOrDirectory ? ignores.ignores((0, _slash.default)(fileOrDirectory)) : false;
  };
};

const normalizeOptions = (options = {}) => ({
  cwd: (0, _utilities.toPath)(options.cwd) || _nodeProcess.default.cwd(),
  suppressErrors: Boolean(options.suppressErrors),
  deep: typeof options.deep === 'number' ? options.deep : Number.POSITIVE_INFINITY
});

const isIgnoredByIgnoreFiles = async (patterns, options) => {
  const { cwd, suppressErrors, deep } = normalizeOptions(options);

  const paths = await (0, _fastGlob.default)(patterns, { cwd, suppressErrors, deep, ...ignoreFilesGlobOptions });

  const files = await Promise.all(
    paths.map(async (filePath) => ({
      filePath,
      content: await _nodeFs.default.promises.readFile(filePath, 'utf8')
    }))
  );

  return getIsIgnoredPredicate(files, cwd);
};exports.isIgnoredByIgnoreFiles = isIgnoredByIgnoreFiles;

const isIgnoredByIgnoreFilesSync = (patterns, options) => {
  const { cwd, suppressErrors, deep } = normalizeOptions(options);

  const paths = _fastGlob.default.sync(patterns, { cwd, suppressErrors, deep, ...ignoreFilesGlobOptions });

  const files = paths.map((filePath) => ({
    filePath,
    content: _nodeFs.default.readFileSync(filePath, 'utf8')
  }));

  return getIsIgnoredPredicate(files, cwd);
};exports.isIgnoredByIgnoreFilesSync = isIgnoredByIgnoreFilesSync;

const isGitIgnored = (options) => isIgnoredByIgnoreFiles(GITIGNORE_FILES_PATTERN, options);exports.isGitIgnored = isGitIgnored;
const isGitIgnoredSync = (options) => isIgnoredByIgnoreFilesSync(GITIGNORE_FILES_PATTERN, options);exports.isGitIgnoredSync = isGitIgnoredSync; /* v7-0eff28242bf3ace2 */