"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.build = build;exports.defineBuildConfig = defineBuildConfig;exports.definePreset = definePreset;var _nodeModule = _interopRequireDefault(require("node:module"));
var _nodeFs = require("node:fs");
var _pathe = require("pathe");
var _chalk = _interopRequireDefault(require("chalk"));
var _consola = require("consola");
var _defu = require("defu");
var _hookable = require("hookable");
var _prettyBytes = _interopRequireDefault(require("pretty-bytes"));
var _globby = require("globby");
var _promises = _interopRequireWildcard(require("node:fs/promises"));
var _jiti = _interopRequireDefault(require("jiti"));
var _nodeUrl = require("node:url");
var _rollup = require("rollup");
var _pluginCommonjs = _interopRequireDefault(require("@rollup/plugin-commonjs"));
var _pluginNodeResolve = require("@rollup/plugin-node-resolve");
var _pluginAlias = _interopRequireDefault(require("@rollup/plugin-alias"));
var _rollupPluginDts = _interopRequireDefault(require("rollup-plugin-dts"));
var _pluginReplace = _interopRequireDefault(require("@rollup/plugin-replace"));
var _mlly = require("mlly");
var _esbuild = require("esbuild");
var _pluginutils = require("@rollup/pluginutils");
var _pluginJson = _interopRequireDefault(require("@rollup/plugin-json"));
var _magicString = _interopRequireDefault(require("magic-string"));
var _untyped = require("untyped");
var _babelPlugin = _interopRequireDefault(require("untyped/babel-plugin"));
var _scule = require("scule");
var _mkdist = require("mkdist");function _getRequireWildcardCache(e) {if ("function" != typeof WeakMap) return null;var r = new WeakMap(),t = new WeakMap();return (_getRequireWildcardCache = function (e) {return e ? t : r;})(e);}function _interopRequireWildcard(e, r) {if (!r && e && e.__esModule) return e;if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };var t = _getRequireWildcardCache(r);if (t && t.has(e)) return t.get(e);var n = { __proto__: null },a = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];}return n.default = e, t && t.set(e, n), n;}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function defineBuildConfig(config) {
  return (Array.isArray(config) ? config : [config]).filter(Boolean);
}
function definePreset(preset) {
  return preset;
}

const autoPreset = definePreset(() => {
  return {
    hooks: {
      "build:prepare"(ctx) {
        if (!ctx.pkg || ctx.options.entries.length > 0) {
          return;
        }
        const sourceFiles = listRecursively((0, _pathe.join)(ctx.options.rootDir, "src"));
        const res = inferEntries(ctx.pkg, sourceFiles, ctx.options.rootDir);
        for (const message of res.warnings) {
          warn(ctx, message);
        }
        ctx.options.entries.push(...res.entries);
        if (res.cjs) {
          ctx.options.rollup.emitCJS = true;
        }
        if (res.dts) {
          ctx.options.declaration = res.dts;
        }
        _consola.consola.info(
          "Automatically detected entries:",
          _chalk.default.cyan(
            ctx.options.entries.map(
              (e) => _chalk.default.bold(
                e.input.replace(ctx.options.rootDir + "/", "").replace(/\/$/, "/*")
              )
            ).join(", ")
          ),
          _chalk.default.gray(
            ["esm", res.cjs && "cjs", res.dts && "dts"].filter(Boolean).map((tag) => `[${tag}]`).join(" ")
          )
        );
      }
    }
  };
});
function inferEntries(pkg, sourceFiles, rootDir) {
  const warnings = [];
  sourceFiles.sort((a, b) => a.split("/").length - b.split("/").length);
  const outputs = extractExportFilenames(pkg.exports);
  if (pkg.bin) {
    const binaries = typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin);
    for (const file of binaries) {
      outputs.push({ file });
    }
  }
  if (pkg.main) {
    outputs.push({ file: pkg.main });
  }
  if (pkg.module) {
    outputs.push({ type: "esm", file: pkg.module });
  }
  if (pkg.types || pkg.typings) {
    outputs.push({ file: pkg.types || pkg.typings });
  }
  const isESMPkg = pkg.type === "module";
  for (const output of outputs.filter((o) => !o.type)) {
    const isJS = output.file.endsWith(".js");
    if (isESMPkg && isJS || output.file.endsWith(".mjs")) {
      output.type = "esm";
    } else if (!isESMPkg && isJS || output.file.endsWith(".cjs")) {
      output.type = "cjs";
    }
  }
  let cjs = false;
  let dts = false;
  const entries = [];
  for (const output of outputs) {
    const outputSlug = output.file.replace(
      /(\*[^/\\]*|\.d\.(m|c)?ts|\.\w+)$/,
      ""
    );
    const isDir = outputSlug.endsWith("/");
    if (isDir && ["./", "/"].includes(outputSlug)) {
      continue;
    }
    const possiblePaths = getEntrypointPaths(outputSlug);
    const input = possiblePaths.reduce((source, d) => {
      if (source) {
        return source;
      }
      const SOURCE_RE = new RegExp(`(?<=/|$)${d}${isDir ? "" : "\\.\\w+"}$`);
      return sourceFiles.find((i) => SOURCE_RE.test(i))?.replace(/(\.d\.(m|c)?ts|\.\w+)$/, "");
    }, void 0);
    if (!input) {
      if (!(0, _nodeFs.existsSync)((0, _pathe.resolve)(rootDir || ".", output.file))) {
        warnings.push(`Could not find entrypoint for \`${output.file}\``);
      }
      continue;
    }
    if (output.type === "cjs") {
      cjs = true;
    }
    const entry = entries.find((i) => i.input === input) || entries[entries.push({ input }) - 1];
    if (/\.d\.(m|c)?ts$/.test(output.file)) {
      dts = true;
    }
    if (isDir) {
      entry.outDir = outputSlug;
      entry.format = output.type;
    }
  }
  return { entries, cjs, dts, warnings };
}
const getEntrypointPaths = (path) => {
  const segments = (0, _pathe.normalize)(path).split("/");
  return segments.map((_, index) => segments.slice(index).join("/")).filter(Boolean);
};

async function ensuredir(path) {
  await _promises.default.mkdir((0, _pathe.dirname)(path), { recursive: true });
}
function warn(ctx, message) {
  if (ctx.warnings.has(message)) {
    return;
  }
  _consola.consola.debug("[unbuild] [warn]", message);
  ctx.warnings.add(message);
}
async function symlink(from, to, force = true) {
  await ensuredir(to);
  if (force) {
    await _promises.default.unlink(to).catch(() => {
    });
  }
  await _promises.default.symlink(from, to, "junction");
}
function dumpObject(obj) {
  return "{ " + Object.keys(obj).map((key) => `${key}: ${JSON.stringify(obj[key])}`).join(", ") + " }";
}
function getpkg(id = "") {
  const s = id.split("/");
  return s[0][0] === "@" ? `${s[0]}/${s[1]}` : s[0];
}
async function rmdir(dir) {
  await _promises.default.unlink(dir).catch(() => {
  });
  await _promises.default.rm(dir, { recursive: true, force: true }).catch(() => {
  });
}
function listRecursively(path) {
  const filenames = /* @__PURE__ */new Set();
  const walk = (path2) => {
    const files = (0, _nodeFs.readdirSync)(path2);
    for (const file of files) {
      const fullPath = (0, _pathe.resolve)(path2, file);
      if ((0, _nodeFs.statSync)(fullPath).isDirectory()) {
        filenames.add(fullPath + "/");
        walk(fullPath);
      } else {
        filenames.add(fullPath);
      }
    }
  };
  walk(path);
  return [...filenames];
}
function tryRequire(id, rootDir = process.cwd()) {
  const _require = (0, _jiti.default)(rootDir, { interopDefault: true, esmResolve: true });
  try {
    return _require(id);
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") {
      console.error(`Error trying import ${id} from ${rootDir}`, error);
    }
    return {};
  }
}
function tryResolve(id, rootDir = process.cwd()) {
  const _require = (0, _jiti.default)(rootDir, { interopDefault: true, esmResolve: true });
  try {
    return _require.resolve(id);
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") {
      console.error(`Error trying import ${id} from ${rootDir}`, error);
    }
    return id;
  }
}
function resolvePreset(preset, rootDir) {
  if (preset === "auto") {
    preset = autoPreset;
  } else if (typeof preset === "string") {
    preset = tryRequire(preset, rootDir) || {};
  }
  if (typeof preset === "function") {
    preset = preset();
  }
  return preset;
}
function inferExportType(condition, previousConditions = [], filename = "") {
  if (filename) {
    if (filename.endsWith(".d.ts")) {
      return "esm";
    }
    if (filename.endsWith(".mjs")) {
      return "esm";
    }
    if (filename.endsWith(".cjs")) {
      return "cjs";
    }
  }
  switch (condition) {
    case "import":{
        return "esm";
      }
    case "require":{
        return "cjs";
      }
    default:{
        if (previousConditions.length === 0) {
          return "esm";
        }
        const [newCondition, ...rest] = previousConditions;
        return inferExportType(newCondition, rest, filename);
      }
  }
}
function extractExportFilenames(exports, conditions = []) {
  if (!exports) {
    return [];
  }
  if (typeof exports === "string") {
    return [{ file: exports, type: "esm" }];
  }
  return Object.entries(exports).filter(([subpath]) => !subpath.endsWith(".json")).flatMap(
    ([condition, exports2]) => typeof exports2 === "string" ? {
      file: exports2,
      type: inferExportType(condition, conditions, exports2)
    } : extractExportFilenames(exports2, [...conditions, condition])
  );
}
function arrayIncludes(arr, searchElement) {
  return arr.some(
    (entry) => entry instanceof RegExp ? entry.test(searchElement) : entry === searchElement
  );
}
function removeExtension(filename) {
  return filename.replace(/\.(js|mjs|cjs|ts|mts|cts|json|jsx|tsx)$/, "");
}

function validateDependencies(ctx) {
  const usedDependencies = /* @__PURE__ */new Set();
  const unusedDependencies = new Set(
    Object.keys(ctx.pkg.dependencies || {})
  );
  const implicitDependencies = /* @__PURE__ */new Set();
  for (const id of ctx.usedImports) {
    unusedDependencies.delete(id);
    usedDependencies.add(id);
  }
  if (Array.isArray(ctx.options.dependencies)) {
    for (const id of ctx.options.dependencies) {
      unusedDependencies.delete(id);
    }
  }
  for (const id of usedDependencies) {
    if (!arrayIncludes(ctx.options.externals, id) && !id.startsWith("chunks/") && !ctx.options.dependencies.includes(getpkg(id)) && !ctx.options.peerDependencies.includes(getpkg(id))) {
      implicitDependencies.add(id);
    }
  }
  if (unusedDependencies.size > 0) {
    warn(
      ctx,
      "Potential unused dependencies found: " + [...unusedDependencies].map((id) => _chalk.default.cyan(id)).join(", ")
    );
  }
  if (implicitDependencies.size > 0 && !ctx.options.rollup.inlineDependencies) {
    warn(
      ctx,
      "Potential implicit dependencies found: " + [...implicitDependencies].map((id) => _chalk.default.cyan(id)).join(", ")
    );
  }
}
function validatePackage(pkg, rootDir, ctx) {
  if (!pkg) {
    return;
  }
  const filenames = new Set(
    [
    ...(typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin || {})),
    pkg.main,
    pkg.module,
    pkg.types,
    pkg.typings,
    ...extractExportFilenames(pkg.exports).map((i) => i.file)].
    map((i) => i && (0, _pathe.resolve)(rootDir, i.replace(/\/[^/]*\*.*$/, "")))
  );
  const missingOutputs = [];
  for (const filename of filenames) {
    if (filename && !filename.includes("*") && !(0, _nodeFs.existsSync)(filename)) {
      missingOutputs.push(filename.replace(rootDir + "/", ""));
    }
  }
  if (missingOutputs.length > 0) {
    warn(
      ctx,
      `Potential missing package.json files: ${missingOutputs.map((o) => _chalk.default.cyan(o)).join(", ")}`
    );
  }
}

const DefaultLoaders = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".ts": "ts",
  ".mts": "ts",
  ".cts": "ts",
  ".tsx": "tsx",
  ".jsx": "jsx"
};
function esbuild(options) {
  const {
    include = /\.(ts|js|tsx|jsx)$/,
    exclude = /node_modules/,
    loaders: loaderOptions,
    ...esbuildOptions
  } = options;
  const loaders = { ...DefaultLoaders };
  if (loaderOptions) {
    for (const [key, value] of Object.entries(loaderOptions)) {
      if (typeof value === "string") {
        loaders[key] = value;
      } else if (value === false) {
        delete loaders[key];
      }
    }
  }
  const getLoader = (id = "") => {
    return loaders[(0, _pathe.extname)(id)];
  };
  const filter = (0, _pluginutils.createFilter)(include, exclude);
  return {
    name: "esbuild",
    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      const loader = getLoader(id);
      if (!loader) {
        return null;
      }
      const result = await (0, _esbuild.transform)(code, {
        ...esbuildOptions,
        loader,
        sourcefile: id
      });
      printWarnings(id, result, this);
      return result.code && {
        code: result.code,
        map: result.map || null
      };
    },
    async renderChunk(code, { fileName }) {
      if (!options.minify) {
        return null;
      }
      if (/\.d\.(c|m)?tsx?$/.test(fileName)) {
        return null;
      }
      const loader = getLoader(fileName);
      if (!loader) {
        return null;
      }
      const result = await (0, _esbuild.transform)(code, {
        ...esbuildOptions,
        loader,
        sourcefile: fileName,
        minify: true
      });
      if (result.code) {
        return {
          code: result.code,
          map: result.map || null
        };
      }
    }
  };
}
function printWarnings(id, result, plugin) {
  if (result.warnings) {
    for (const warning of result.warnings) {
      let message = "[esbuild]";
      if (warning.location) {
        message += ` (${(0, _pathe.relative)(process.cwd(), id)}:${warning.location.line}:${warning.location.column})`;
      }
      message += ` ${warning.text}`;
      plugin.warn(message);
    }
  }
}

const EXPORT_DEFAULT = "export default ";
function JSONPlugin(options) {
  const plugin = (0, _pluginJson.default)(options);
  return {
    ...plugin,
    name: "unbuild-json",
    transform(code, id) {
      const res = plugin.transform.call(this, code, id);
      if (res && typeof res !== "string" && "code" in res && res.code && res.code.startsWith(EXPORT_DEFAULT)) {
        res.code = res.code.replace(EXPORT_DEFAULT, "module.exports = ");
      }
      return res;
    }
  };
}

const defaults = {
  include: [/\.(md|txt|css|htm|html)$/],
  exclude: []
};
function rawPlugin(opts = {}) {
  opts = { ...opts, ...defaults };
  const filter = (0, _pluginutils.createFilter)(opts.include, opts.exclude);
  return {
    name: "unbuild-raw",
    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null
        };
      }
    }
  };
}

function cjsPlugin(_opts) {
  return {
    name: "unbuild-cjs",
    renderChunk(code, _chunk, opts) {
      if (opts.format === "es") {
        return CJSToESM(code);
      }
      return null;
    }
  };
}
const CJSyntaxRe = /__filename|__dirname|require\(|require\.resolve\(/;
const CJSShim = `

// -- Unbuild CommonJS Shims --
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
`;
function CJSToESM(code) {
  if (code.includes(CJSShim) || !CJSyntaxRe.test(code)) {
    return null;
  }
  const lastESMImport = (0, _mlly.findStaticImports)(code).pop();
  const indexToAppend = lastESMImport ? lastESMImport.end : 0;
  const s = new _magicString.default(code);
  s.appendRight(indexToAppend, CJSShim);
  return {
    code: s.toString(),
    map: s.generateMap()
  };
}

const SHEBANG_RE = /^#![^\n]*/;
function shebangPlugin(options = {}) {
  const shebangs = /* @__PURE__ */new Map();
  return {
    name: "unbuild-shebang",
    // @ts-ignore temp workaround
    _options: options,
    transform(code, mod) {
      let shebang;
      code = code.replace(SHEBANG_RE, (match) => {
        shebang = match;
        return "";
      });
      if (!shebang) {
        return null;
      }
      shebangs.set(mod, shebang);
      return { code, map: null };
    },
    renderChunk(code, chunk, { sourcemap }) {
      if (options.preserve === false) {
        return null;
      }
      const shebang = shebangs.get(chunk.facadeModuleId);
      if (!shebang) {
        return null;
      }
      const s = new _magicString.default(code);
      s.prepend(`${shebang}
`);
      return {
        code: s.toString(),
        map: sourcemap ? s.generateMap({ hires: true }) : null
      };
    },
    async writeBundle(options2, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== "chunk") {
          continue;
        }
        if (output.code?.match(SHEBANG_RE)) {
          const outFile = (0, _pathe.resolve)(options2.dir, fileName);
          await makeExecutable(outFile);
        }
      }
    }
  };
}
async function makeExecutable(filePath) {
  await _nodeFs.promises.chmod(
    filePath,
    493
    /* rwx r-x r-x */
  ).catch(() => {
  });
}
function getShebang(code, append = "\n") {
  const m = code.match(SHEBANG_RE);
  return m ? m + append : "";
}

const DEFAULT_EXTENSIONS = [
".ts",
".tsx",
".mjs",
".cjs",
".js",
".jsx",
".json"];

async function rollupBuild(ctx) {
  if (ctx.options.stub) {
    const jitiPath = await (0, _mlly.resolvePath)("jiti", { url: "file:///Users/wangzijian/GolandProjects/LinkMe-fe/node_modules/.pnpm/unbuild@2.0.0_sass@1.75.0_typescript@5.4.5/node_modules/unbuild/dist/index.mjs" });
    const serializedJitiOptions = JSON.stringify(
      {
        ...ctx.options.stubOptions.jiti,
        alias: {
          ...resolveAliases(ctx),
          ...ctx.options.stubOptions.jiti.alias
        }
      },
      null,
      2
    );
    for (const entry of ctx.options.entries.filter(
      (entry2) => entry2.builder === "rollup"
    )) {
      const output = (0, _pathe.resolve)(
        ctx.options.rootDir,
        ctx.options.outDir,
        entry.name
      );
      const resolvedEntry = (0, _pathe.normalize)(
        tryResolve(entry.input, ctx.options.rootDir) || entry.input
      );
      const resolvedEntryWithoutExt = resolvedEntry.slice(
        0,
        Math.max(0, resolvedEntry.length - (0, _pathe.extname)(resolvedEntry).length)
      );
      const code = await _nodeFs.promises.readFile(resolvedEntry, "utf8");
      const shebang = getShebang(code);
      await (0, _promises.mkdir)((0, _pathe.dirname)(output), { recursive: true });
      if (ctx.options.rollup.emitCJS) {
        await (0, _promises.writeFile)(
          output + ".cjs",
          `${shebang}module.exports = require(${JSON.stringify(
            jitiPath
          )})(null, ${serializedJitiOptions})(${JSON.stringify(
            resolvedEntry
          )})`
        );
      }
      const namedExports = await (0, _mlly.resolveModuleExportNames)(
        resolvedEntry,
        {
          extensions: DEFAULT_EXTENSIONS
        }
      ).catch((error) => {
        warn(ctx, `Cannot analyze ${resolvedEntry} for exports:` + error);
        return [];
      });
      const hasDefaultExport = namedExports.includes("default") || namedExports.length === 0;
      await (0, _promises.writeFile)(
        output + ".mjs",
        shebang + [
        `import jiti from ${JSON.stringify((0, _nodeUrl.pathToFileURL)(jitiPath).href)};`,
        "",
        `/** @type {import(${JSON.stringify(resolvedEntryWithoutExt)})} */`,
        `const _module = jiti(null, ${serializedJitiOptions})(${JSON.stringify(
          resolvedEntry
        )});`,
        hasDefaultExport ? "\nexport default _module;" : "",
        ...namedExports.filter((name) => name !== "default").map((name) => `export const ${name} = _module.${name};`)].
        join("\n")
      );
      await (0, _promises.writeFile)(
        output + ".d.ts",
        [
        `export * from ${JSON.stringify(resolvedEntryWithoutExt)};`,
        hasDefaultExport ? `export { default } from ${JSON.stringify(
          resolvedEntryWithoutExt
        )};` : ""].
        join("\n")
      );
      if (shebang) {
        await makeExecutable(output + ".cjs");
        await makeExecutable(output + ".mjs");
      }
    }
    await ctx.hooks.callHook("rollup:done", ctx);
    return;
  }
  const rollupOptions = getRollupOptions(ctx);
  await ctx.hooks.callHook("rollup:options", ctx, rollupOptions);
  if (Object.keys(rollupOptions.input).length === 0) {
    return;
  }
  const buildResult = await (0, _rollup.rollup)(rollupOptions);
  await ctx.hooks.callHook("rollup:build", ctx, buildResult);
  const allOutputOptions = rollupOptions.output;
  for (const outputOptions of allOutputOptions) {
    const { output } = await buildResult.write(outputOptions);
    const chunkFileNames = /* @__PURE__ */new Set();
    const outputChunks = output.filter(
      (e) => e.type === "chunk"
    );
    for (const entry of outputChunks) {
      chunkFileNames.add(entry.fileName);
      for (const id of entry.imports) {
        ctx.usedImports.add(id);
      }
      if (entry.isEntry) {
        ctx.buildEntries.push({
          chunks: entry.imports.filter(
            (i) => outputChunks.find((c) => c.fileName === i)
          ),
          modules: Object.entries(entry.modules).map(([id, mod]) => ({
            id,
            bytes: mod.renderedLength
          })),
          path: entry.fileName,
          bytes: Buffer.byteLength(entry.code, "utf8"),
          exports: entry.exports
        });
      }
    }
    for (const chunkFileName of chunkFileNames) {
      ctx.usedImports.delete(chunkFileName);
    }
  }
  if (ctx.options.declaration) {
    rollupOptions.plugins = rollupOptions.plugins || [];
    const shebangPlugin2 = rollupOptions.plugins.find(
      (p) => p && p.name === "unbuild-shebang"
    );
    shebangPlugin2._options.preserve = false;
    rollupOptions.plugins.push((0, _rollupPluginDts.default)(ctx.options.rollup.dts));
    await ctx.hooks.callHook("rollup:dts:options", ctx, rollupOptions);
    const typesBuild = await (0, _rollup.rollup)(rollupOptions);
    await ctx.hooks.callHook("rollup:dts:build", ctx, typesBuild);
    if (ctx.options.rollup.emitCJS) {
      await typesBuild.write({
        dir: (0, _pathe.resolve)(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: "[name].d.cts",
        chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.cts")
      });
    }
    await typesBuild.write({
      dir: (0, _pathe.resolve)(ctx.options.rootDir, ctx.options.outDir),
      entryFileNames: "[name].d.mts",
      chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.mts")
    });
    if (ctx.options.declaration === true || ctx.options.declaration === "compatible") {
      await typesBuild.write({
        dir: (0, _pathe.resolve)(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: "[name].d.ts",
        chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.ts")
      });
    }
  }
  await ctx.hooks.callHook("rollup:done", ctx);
}
const getChunkFilename = (ctx, chunk, ext) => {
  if (chunk.isDynamicEntry) {
    return `chunks/[name].${ext}`;
  }
  return `shared/${ctx.options.name}.[hash].${ext}`;
};
function getRollupOptions(ctx) {
  return {
    input: Object.fromEntries(
      ctx.options.entries.filter((entry) => entry.builder === "rollup").map((entry) => [
      entry.name,
      (0, _pathe.resolve)(ctx.options.rootDir, entry.input)]
      )
    ),
    output: [
    ctx.options.rollup.emitCJS && {
      dir: (0, _pathe.resolve)(ctx.options.rootDir, ctx.options.outDir),
      entryFileNames: "[name].cjs",
      chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "cjs"),
      format: "cjs",
      exports: "auto",
      interop: "compat",
      generatedCode: { constBindings: true },
      externalLiveBindings: false,
      freeze: false,
      sourcemap: ctx.options.sourcemap,
      ...ctx.options.rollup.output
    },
    {
      dir: (0, _pathe.resolve)(ctx.options.rootDir, ctx.options.outDir),
      entryFileNames: "[name].mjs",
      chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "mjs"),
      format: "esm",
      exports: "auto",
      generatedCode: { constBindings: true },
      externalLiveBindings: false,
      freeze: false,
      sourcemap: ctx.options.sourcemap,
      ...ctx.options.rollup.output
    }].
    filter(Boolean),
    external(id) {
      const pkg = getpkg(id);
      const isExplicitExternal = arrayIncludes(ctx.options.externals, pkg) || arrayIncludes(ctx.options.externals, id);
      if (isExplicitExternal) {
        return true;
      }
      if (ctx.options.rollup.inlineDependencies || id[0] === "." || (0, _pathe.isAbsolute)(id) || /src[/\\]/.test(id) || id.startsWith(ctx.pkg.name)) {
        return false;
      }
      if (!isExplicitExternal) {
        warn(ctx, `Inlined implicit external ${id}`);
      }
      return isExplicitExternal;
    },
    onwarn(warning, rollupWarn) {
      if (!warning.code || !["CIRCULAR_DEPENDENCY"].includes(warning.code)) {
        rollupWarn(warning);
      }
    },
    plugins: [
    ctx.options.rollup.replace && (0, _pluginReplace.default)({
      ...ctx.options.rollup.replace,
      values: {
        ...ctx.options.replace,
        ...ctx.options.rollup.replace.values
      }
    }),
    ctx.options.rollup.alias && (0, _pluginAlias.default)({
      ...ctx.options.rollup.alias,
      entries: resolveAliases(ctx)
    }),
    ctx.options.rollup.resolve && (0, _pluginNodeResolve.nodeResolve)({
      extensions: DEFAULT_EXTENSIONS,
      ...ctx.options.rollup.resolve
    }),
    ctx.options.rollup.json && JSONPlugin({
      ...ctx.options.rollup.json
    }),
    shebangPlugin(),
    ctx.options.rollup.esbuild && esbuild({
      sourcemap: ctx.options.sourcemap,
      ...ctx.options.rollup.esbuild
    }),
    ctx.options.rollup.commonjs && (0, _pluginCommonjs.default)({
      extensions: DEFAULT_EXTENSIONS,
      ...ctx.options.rollup.commonjs
    }),
    // Preserve dynamic imports for CommonJS
    {
      renderDynamicImport() {
        return { left: "import(", right: ")" };
      }
    },
    ctx.options.rollup.cjsBridge && cjsPlugin(),
    rawPlugin()].
    filter(Boolean)
  };
}
function resolveAliases(ctx) {
  const aliases = {
    [ctx.pkg.name]: ctx.options.rootDir,
    ...ctx.options.alias
  };
  if (ctx.options.rollup.alias) {
    if (Array.isArray(ctx.options.rollup.alias.entries)) {
      Object.assign(
        aliases,
        Object.fromEntries(
          ctx.options.rollup.alias.entries.map((entry) => {
            return [entry.find, entry.replacement];
          })
        )
      );
    } else {
      Object.assign(
        aliases,
        ctx.options.rollup.alias.entries || ctx.options.rollup.alias
      );
    }
  }
  return aliases;
}

async function typesBuild(ctx) {
  const entries = ctx.options.entries.filter(
    (entry) => entry.builder === "untyped"
  );
  await ctx.hooks.callHook("untyped:entries", ctx, entries);
  for (const entry of entries) {
    const options = {
      jiti: {
        esmResolve: true,
        interopDefault: true,
        transformOptions: {
          babel: {
            plugins: [_babelPlugin.default]
          }
        }
      }
    };
    await ctx.hooks.callHook("untyped:entry:options", ctx, entry, options);
    const _require = (0, _jiti.default)(ctx.options.rootDir, options.jiti);
    const distDir = entry.outDir;
    const srcConfig = _require((0, _pathe.resolve)(ctx.options.rootDir, entry.input));
    const defaults = entry.defaults || {};
    const schema = await (0, _untyped.resolveSchema)(srcConfig, defaults);
    await ctx.hooks.callHook("untyped:entry:schema", ctx, entry, schema);
    const outputs = {
      markdown: {
        fileName: (0, _pathe.resolve)(distDir, `${entry.name}.md`),
        contents: (0, _untyped.generateMarkdown)(schema)
      },
      schema: {
        fileName: `${entry.name}.schema.json`,
        contents: JSON.stringify(schema, null, 2)
      },
      defaults: {
        fileName: `${entry.name}.defaults.json`,
        contents: JSON.stringify(defaults, null, 2)
      },
      declaration: entry.declaration ? {
        fileName: `${entry.name}.d.ts`,
        contents: (0, _untyped.generateTypes)(schema, {
          interfaceName: (0, _scule.pascalCase)(entry.name + "-schema")
        })
      } : void 0
    };
    await ctx.hooks.callHook("untyped:entry:outputs", ctx, entry, outputs);
    for (const output of Object.values(outputs)) {
      await (0, _promises.writeFile)(
        (0, _pathe.resolve)(distDir, output.fileName),
        output.contents,
        "utf8"
      );
    }
  }
  await ctx.hooks.callHook("untyped:done", ctx);
}

async function mkdistBuild(ctx) {
  const entries = ctx.options.entries.filter(
    (e) => e.builder === "mkdist"
  );
  await ctx.hooks.callHook("mkdist:entries", ctx, entries);
  for (const entry of entries) {
    const distDir = entry.outDir;
    if (ctx.options.stub) {
      await rmdir(distDir);
      await symlink(entry.input, distDir);
    } else {
      const mkdistOptions = {
        rootDir: ctx.options.rootDir,
        srcDir: entry.input,
        distDir,
        cleanDist: false,
        ...entry
      };
      await ctx.hooks.callHook(
        "mkdist:entry:options",
        ctx,
        entry,
        mkdistOptions
      );
      const output = await (0, _mkdist.mkdist)(mkdistOptions);
      ctx.buildEntries.push({
        path: distDir,
        chunks: output.writtenFiles.map((p) => (0, _pathe.relative)(ctx.options.outDir, p))
      });
      await ctx.hooks.callHook("mkdist:entry:build", ctx, entry, output);
    }
  }
  await ctx.hooks.callHook("mkdist:done", ctx);
}

async function build(rootDir, stub, inputConfig = {}) {
  rootDir = (0, _pathe.resolve)(process.cwd(), rootDir || ".");
  const _buildConfig = tryRequire("./build.config", rootDir) || {};
  const buildConfigs = (Array.isArray(_buildConfig) ? _buildConfig : [_buildConfig]).filter(Boolean);
  const pkg = tryRequire("./package.json", rootDir) || {};
  const cleanedDirs = [];
  for (const buildConfig of buildConfigs) {
    await _build(rootDir, stub, inputConfig, buildConfig, pkg, cleanedDirs);
  }
}
async function _build(rootDir, stub, inputConfig = {}, buildConfig, pkg, cleanedDirs) {
  const preset = resolvePreset(
    buildConfig.preset || pkg.unbuild?.preset || pkg.build?.preset || inputConfig.preset || "auto",
    rootDir
  );
  const options = (0, _defu.defu)(
    buildConfig,
    pkg.unbuild || pkg.build,
    inputConfig,
    preset,
    {
      name: (pkg?.name || "").split("/").pop() || "default",
      rootDir,
      entries: [],
      clean: true,
      declaration: false,
      outDir: "dist",
      stub,
      stubOptions: {
        /**
         * See https://github.com/unjs/jiti#options
         */
        jiti: {
          esmResolve: true,
          interopDefault: true,
          alias: {}
        }
      },
      externals: [
      ..._nodeModule.default.builtinModules,
      ..._nodeModule.default.builtinModules.map((m) => "node:" + m)],

      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      alias: {},
      replace: {},
      failOnWarn: true,
      sourcemap: false,
      rollup: {
        emitCJS: false,
        cjsBridge: false,
        inlineDependencies: false,
        // Plugins
        replace: {
          preventAssignment: true
        },
        alias: {},
        resolve: {
          preferBuiltins: true
        },
        json: {
          preferConst: true
        },
        commonjs: {
          ignoreTryCatch: true
        },
        esbuild: { target: "es2020" },
        dts: {
          // https://github.com/Swatinem/rollup-plugin-dts/issues/143
          compilerOptions: { preserveSymlinks: false },
          respectExternal: true
        }
      }
    }
  );
  options.outDir = (0, _pathe.resolve)(options.rootDir, options.outDir);
  const ctx = {
    options,
    warnings: /* @__PURE__ */new Set(),
    pkg,
    buildEntries: [],
    usedImports: /* @__PURE__ */new Set(),
    hooks: (0, _hookable.createHooks)()
  };
  if (preset.hooks) {
    ctx.hooks.addHooks(preset.hooks);
  }
  if (inputConfig.hooks) {
    ctx.hooks.addHooks(inputConfig.hooks);
  }
  if (buildConfig.hooks) {
    ctx.hooks.addHooks(buildConfig.hooks);
  }
  await ctx.hooks.callHook("build:prepare", ctx);
  options.entries = options.entries.map(
    (entry) => typeof entry === "string" ? { input: entry } : entry
  );
  for (const entry of options.entries) {
    if (typeof entry.name !== "string") {
      let relativeInput = (0, _pathe.isAbsolute)(entry.input) ? (0, _pathe.relative)(rootDir, entry.input) : (0, _pathe.normalize)(entry.input);
      if (relativeInput.startsWith("./")) {
        relativeInput = relativeInput.slice(2);
      }
      entry.name = removeExtension(relativeInput.replace(/^src\//, ""));
    }
    if (!entry.input) {
      throw new Error("Missing entry input: " + dumpObject(entry));
    }
    if (!entry.builder) {
      entry.builder = entry.input.endsWith("/") ? "mkdist" : "rollup";
    }
    if (options.declaration !== void 0 && entry.declaration === void 0) {
      entry.declaration = options.declaration;
    }
    entry.input = (0, _pathe.resolve)(options.rootDir, entry.input);
    entry.outDir = (0, _pathe.resolve)(options.rootDir, entry.outDir || options.outDir);
  }
  options.dependencies = Object.keys(pkg.dependencies || {});
  options.peerDependencies = Object.keys(pkg.peerDependencies || {});
  options.devDependencies = Object.keys(pkg.devDependencies || {});
  options.externals.push(...options.dependencies, ...options.peerDependencies);
  await ctx.hooks.callHook("build:before", ctx);
  _consola.consola.info(
    _chalk.default.cyan(`${options.stub ? "Stubbing" : "Building"} ${options.name}`)
  );
  if (process.env.DEBUG) {
    _consola.consola.info(`${_chalk.default.bold("Root dir:")} ${options.rootDir}
  ${_chalk.default.bold("Entries:")}
  ${options.entries.map((entry) => "  " + dumpObject(entry)).join("\n  ")}
`);
  }
  if (options.clean) {
    for (const dir of new Set(
      options.entries.map((e) => e.outDir).filter(Boolean).sort()
    )) {
      if (cleanedDirs.some((c) => dir.startsWith(c))) {
        continue;
      }
      cleanedDirs.push(dir);
      _consola.consola.info(
        `Cleaning dist directory: \`./${(0, _pathe.relative)(process.cwd(), dir)}\``
      );
      await rmdir(dir);
      await _nodeFs.promises.mkdir(dir, { recursive: true });
    }
  }
  await typesBuild(ctx);
  await mkdistBuild(ctx);
  await rollupBuild(ctx);
  if (options.stub) {
    await ctx.hooks.callHook("build:done", ctx);
    return;
  }
  _consola.consola.success(_chalk.default.green("Build succeeded for " + options.name));
  const outFiles = await (0, _globby.globby)("**", { cwd: options.outDir });
  for (const file of outFiles) {
    let entry = ctx.buildEntries.find((e) => e.path === file);
    if (!entry) {
      entry = {
        path: file,
        chunk: true
      };
      ctx.buildEntries.push(entry);
    }
    if (!entry.bytes) {
      const stat = await _nodeFs.promises.stat((0, _pathe.resolve)(options.outDir, file));
      entry.bytes = stat.size;
    }
  }
  const rPath = (p) => (0, _pathe.relative)(process.cwd(), (0, _pathe.resolve)(options.outDir, p));
  for (const entry of ctx.buildEntries.filter((e) => !e.chunk)) {
    let totalBytes = entry.bytes || 0;
    for (const chunk of entry.chunks || []) {
      totalBytes += ctx.buildEntries.find((e) => e.path === chunk)?.bytes || 0;
    }
    let line = `  ${_chalk.default.bold(rPath(entry.path))} (` + [
    totalBytes && `total size: ${_chalk.default.cyan((0, _prettyBytes.default)(totalBytes))}`,
    entry.bytes && `chunk size: ${_chalk.default.cyan((0, _prettyBytes.default)(entry.bytes))}`,
    entry.exports?.length && `exports: ${_chalk.default.gray(entry.exports.join(", "))}`].
    filter(Boolean).join(", ") + ")";
    if (entry.chunks?.length) {
      line += "\n" + entry.chunks.map((p) => {
        const chunk = ctx.buildEntries.find((e) => e.path === p) || {};
        return _chalk.default.gray(
          "  \u2514\u2500 " + rPath(p) + _chalk.default.bold(
            chunk.bytes ? ` (${(0, _prettyBytes.default)(chunk?.bytes)})` : ""
          )
        );
      }).join("\n");
    }
    if (entry.modules?.length) {
      line += "\n" + entry.modules.filter((m) => m.id.includes("node_modules")).sort((a, b) => (b.bytes || 0) - (a.bytes || 0)).map((m) => {
        return _chalk.default.gray(
          "  \u{1F4E6} " + rPath(m.id) + _chalk.default.bold(m.bytes ? ` (${(0, _prettyBytes.default)(m.bytes)})` : "")
        );
      }).join("\n");
    }
    _consola.consola.log(entry.chunk ? _chalk.default.gray(line) : line);
  }
  console.log(
    "\u03A3 Total dist size (byte size):",
    _chalk.default.cyan(
      (0, _prettyBytes.default)(ctx.buildEntries.reduce((a, e) => a + (e.bytes || 0), 0))
    )
  );
  validateDependencies(ctx);
  validatePackage(pkg, rootDir, ctx);
  await ctx.hooks.callHook("build:done", ctx);
  _consola.consola.log("");
  if (ctx.warnings.size > 0) {
    _consola.consola.warn(
      "Build is done with some warnings:\n\n" + [...ctx.warnings].map((msg) => "- " + msg).join("\n")
    );
    if (ctx.options.failOnWarn) {
      _consola.consola.error(
        "Exiting with code (1). You can change this behavior by setting `failOnWarn: false` ."
      );
      process.exit(1);
    }
  }
} /* v7-3b6eca811e065baf */