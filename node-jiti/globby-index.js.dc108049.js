"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.isDynamicPattern = exports.globbySync = exports.globbyStream = exports.globby = exports.generateGlobTasksSync = exports.generateGlobTasks = void 0;Object.defineProperty(exports, "isGitIgnored", { enumerable: true, get: function () {return _ignore.isGitIgnored;} });Object.defineProperty(exports, "isGitIgnoredSync", { enumerable: true, get: function () {return _ignore.isGitIgnoredSync;} });var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _merge = _interopRequireDefault(require("merge2"));
var _fastGlob = _interopRequireDefault(require("fast-glob"));
var _dirGlob = _interopRequireDefault(require("dir-glob"));
var _ignore = require("./ignore.js");




var _utilities = require("./utilities.js");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const assertPatternsInput = (patterns) => {
  if (patterns.some((pattern) => typeof pattern !== 'string')) {
    throw new TypeError('Patterns must be a string or an array of strings');
  }
};

const toPatternsArray = (patterns) => {
  patterns = [...new Set([patterns].flat())];
  assertPatternsInput(patterns);
  return patterns;
};

const checkCwdOption = (options) => {
  if (!options.cwd) {
    return;
  }

  let stat;
  try {
    stat = _nodeFs.default.statSync(options.cwd);
  } catch {
    return;
  }

  if (!stat.isDirectory()) {
    throw new Error('The `cwd` option must be a path to a directory');
  }
};

const normalizeOptions = (options = {}) => {
  options = {
    ...options,
    ignore: options.ignore || [],
    expandDirectories: options.expandDirectories === undefined ?
    true :
    options.expandDirectories,
    cwd: (0, _utilities.toPath)(options.cwd)
  };

  checkCwdOption(options);

  return options;
};

const normalizeArguments = (fn) => async (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));
const normalizeArgumentsSync = (fn) => (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));

const getIgnoreFilesPatterns = (options) => {
  const { ignoreFiles, gitignore } = options;

  const patterns = ignoreFiles ? toPatternsArray(ignoreFiles) : [];
  if (gitignore) {
    patterns.push(_ignore.GITIGNORE_FILES_PATTERN);
  }

  return patterns;
};

const getFilter = async (options) => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && (await (0, _ignore.isIgnoredByIgnoreFiles)(ignoreFilesPatterns, options))
  );
};

const getFilterSync = (options) => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && (0, _ignore.isIgnoredByIgnoreFilesSync)(ignoreFilesPatterns, options)
  );
};

const createFilterFunction = (isIgnored) => {
  const seen = new Set();

  return (fastGlobResult) => {
    const path = fastGlobResult.path || fastGlobResult;
    const pathKey = _nodePath.default.normalize(path);
    const seenOrIgnored = seen.has(pathKey) || isIgnored && isIgnored(path);
    seen.add(pathKey);
    return !seenOrIgnored;
  };
};

const unionFastGlobResults = (results, filter) => results.flat().filter((fastGlobResult) => filter(fastGlobResult));
const unionFastGlobStreams = (streams, filter) => (0, _merge.default)(streams).pipe(new _utilities.FilterStream((fastGlobResult) => filter(fastGlobResult)));

const convertNegativePatterns = (patterns, options) => {
  const tasks = [];

  while (patterns.length > 0) {
    const index = patterns.findIndex((pattern) => (0, _utilities.isNegativePattern)(pattern));

    if (index === -1) {
      tasks.push({ patterns, options });
      break;
    }

    const ignorePattern = patterns[index].slice(1);

    for (const task of tasks) {
      task.options.ignore.push(ignorePattern);
    }

    if (index !== 0) {
      tasks.push({
        patterns: patterns.slice(0, index),
        options: {
          ...options,
          ignore: [
          ...options.ignore,
          ignorePattern]

        }
      });
    }

    patterns = patterns.slice(index + 1);
  }

  return tasks;
};

const getDirGlobOptions = (options, cwd) => ({
  ...(cwd ? { cwd } : {}),
  ...(Array.isArray(options) ? { files: options } : options)
});

const generateTasks = async (patterns, options) => {
  const globTasks = convertNegativePatterns(patterns, options);

  const { cwd, expandDirectories } = options;

  if (!expandDirectories) {
    return globTasks;
  }

  const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
  const ignoreExpandOptions = cwd ? { cwd } : undefined;

  return Promise.all(
    globTasks.map(async (task) => {
      let { patterns, options } = task;

      [
      patterns,
      options.ignore] =
      await Promise.all([
      (0, _dirGlob.default)(patterns, patternExpandOptions),
      (0, _dirGlob.default)(options.ignore, ignoreExpandOptions)]
      );

      return { patterns, options };
    })
  );
};

const generateTasksSync = (patterns, options) => {
  const globTasks = convertNegativePatterns(patterns, options);

  const { cwd, expandDirectories } = options;

  if (!expandDirectories) {
    return globTasks;
  }

  const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
  const ignoreExpandOptions = cwd ? { cwd } : undefined;

  return globTasks.map((task) => {
    let { patterns, options } = task;
    patterns = _dirGlob.default.sync(patterns, patternExpandOptions);
    options.ignore = _dirGlob.default.sync(options.ignore, ignoreExpandOptions);
    return { patterns, options };
  });
};

const globby = exports.globby = normalizeArguments(async (patterns, options) => {
  const [
  tasks,
  filter] =
  await Promise.all([
  generateTasks(patterns, options),
  getFilter(options)]
  );
  const results = await Promise.all(tasks.map((task) => (0, _fastGlob.default)(task.patterns, task.options)));

  return unionFastGlobResults(results, filter);
});

const globbySync = exports.globbySync = normalizeArgumentsSync((patterns, options) => {
  const tasks = generateTasksSync(patterns, options);
  const filter = getFilterSync(options);
  const results = tasks.map((task) => _fastGlob.default.sync(task.patterns, task.options));

  return unionFastGlobResults(results, filter);
});

const globbyStream = exports.globbyStream = normalizeArgumentsSync((patterns, options) => {
  const tasks = generateTasksSync(patterns, options);
  const filter = getFilterSync(options);
  const streams = tasks.map((task) => _fastGlob.default.stream(task.patterns, task.options));

  return unionFastGlobStreams(streams, filter);
});

const isDynamicPattern = exports.isDynamicPattern = normalizeArgumentsSync(
  (patterns, options) => patterns.some((pattern) => _fastGlob.default.isDynamicPattern(pattern, options))
);

const generateGlobTasks = exports.generateGlobTasks = normalizeArguments(generateTasks);
const generateGlobTasksSync = exports.generateGlobTasksSync = normalizeArgumentsSync(generateTasksSync); /* v7-5fbae7b710226867 */