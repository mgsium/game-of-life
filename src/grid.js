
var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};



// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign

// See https://caniuse.com/mdn-javascript_builtins_bigint64array

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise(function(resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_main","___getTypeName","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  if (e && typeof e == 'object' && e.stack) {
    toLog = [e, e.stack];
  }
  err('exiting due to exception: ' + toLog);
}

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      const data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    let data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = function readAsync(f, onload, onerror) {
    setTimeout(() => onload(readBinary(f)), 0);
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      logExceptionOnExit(toThrow);
      quit(status);
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js


  read_ = (url) => {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WORKER, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");




var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': case 'u8': return 1;
    case 'i16': case 'u16': return 2;
    case 'i32': case 'u32': return 4;
    case 'i64': case 'u64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length - 1] === '*') {
        return POINTER_SIZE;
      }
      if (type[0] === 'i') {
        const bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      }
      return 0;
    }
  }
}

// include: runtime_debug.js


function legacyModuleProp(prop, newName) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function() {
        abort('Module.' + prop + ' has been replaced with plain ' + newName + ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)');
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort('`Module.' + prop + '` was supplied but `' + prop + '` not included in INCOMING_MODULE_JS_API');
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = '`' + sym + '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line';
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=" + librarySymbol + ")";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function() {
        var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// end include: runtime_debug.js


// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');
var noExitRuntime = Module['noExitRuntime'] || true;legacyModuleProp('noExitRuntime', 'noExitRuntime');

// include: wasm2js.js


// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var
WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  /** @constructor */
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  /** @constructor */
  Instance: function(module, info) {
    // TODO: use the module and info somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(info) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "AAAAAAEAAAAAAAAA/////wEAAAAAAAAAAQAAAAEAAAABAAAA//////////8AAAAA/////wEAAAD//////////y0rICAgMFgweAAtMFgrMFggMFgtMHgrMHggMHgAdW5zaWduZWQgc2hvcnQAdW5zaWduZWQgaW50AGZsb2F0AHVpbnQ2NF90AHZlY3RvcgB1bnNpZ25lZCBjaGFyAG8AZG9UdXJuAHN0ZDo6ZXhjZXB0aW9uAG5hbgBib29sAGVtc2NyaXB0ZW46OnZhbABiYWRfYXJyYXlfbmV3X2xlbmd0aAB1bnNpZ25lZCBsb25nAHN0ZDo6d3N0cmluZwBiYXNpY19zdHJpbmcAc3RkOjpzdHJpbmcAc3RkOjp1MTZzdHJpbmcAc3RkOjp1MzJzdHJpbmcAaW5mAGlzQWN0aXZlAEdyaWRUZW1wbGF0ZQBsb2FkVGVtcGxhdGUAdG9nZ2xlAGRvdWJsZQBzaG93R3JpZABleHBvcnRHcmlkAHNldEdyaWQAY2xlYXJHcmlkAEdhbWVHcmlkAHZvaWQAc3RkOjpiYWRfYWxsb2MAUElQRV9EUkVBTVMAU0lNS0lOX0dMSURFUl9HVU4AQklfR1VOAE5BTgBJTkYAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBBSzk0AC4ALQAsAChudWxsKQAlcyAAKCVkLCAlZCkgAExvYWRpbmcgVGVtcGxhdGUuLi4KAApHUklECi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoARGVmYXVsdCBDYXNlIQoANEdyaWQAAFwSAAChCAAAUDRHcmlkAADgEgAAsAgAAAAAAACoCAAAUEs0R3JpZADgEgAAyAgAAAEAAACoCAAAaWkAdgB2aQC4CAAAAAAAAGQRAAC4CAAArBEAAKwRAABpaWlpaQAAAAAAAAAAAAAATBEAALgIAACsEQAArBEAAHZpaWlpAAAATBEAALgIAABYCQAATlN0M19fMjVhcnJheUlOUzBfSWlMbTgwRUVFTG04MEVFRQAAXBIAADQJAAB2aWlpAAAAALAJAAC4CAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUUAAFwSAABwCQAAaWlpAEwRAAC4CAAAdmlpAEwRAAC4CAAA5AkAADEyR3JpZFRlbXBsYXRlAAAQEgAA1AkAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAABcEgAA7AkAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAABcEgAANAoAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAAXBIAAHwKAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRGlOU18xMWNoYXJfdHJhaXRzSURpRUVOU185YWxsb2NhdG9ySURpRUVFRQAAAFwSAADICgAATjEwZW1zY3JpcHRlbjN2YWxFAABcEgAAFAsAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWNFRQAAXBIAADALAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lhRUUAAFwSAABYCwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaEVFAABcEgAAgAsAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXNFRQAAXBIAAKgLAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUAAFwSAADQCwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaUVFAABcEgAA+AsAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWpFRQAAXBIAACAMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUAAFwSAABIDAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbUVFAABcEgAAcAwAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWZFRQAAXBIAAJgMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAAFwSAADADAAAAAAAAAAAAAAZAAoAGRkZAAAAAAUAAAAAAAAJAAAAAAsAAAAAAAAAABkAEQoZGRkDCgcAAQAJCxgAAAkGCwAACwAGGQAAABkZGQAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAZAAoNGRkZAA0AAAIACQ4AAAAJAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAEwAAAAATAAAAAAkMAAAAAAAMAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA8AAAAEDwAAAAAJEAAAAAAAEAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAARAAAAABEAAAAACRIAAAAAABIAABIAABoAAAAaGhoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAABoaGgAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAABcAAAAAFwAAAAAJFAAAAAAAFAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWAAAAAAAAAAAAAAAVAAAAABUAAAAACRYAAAAAABYAABYAADAxMjM0NTY3ODlBQkNERUYwMDAxMDIwMzA0MDUwNjA3MDgwOTEwMTExMjEzMTQxNTE2MTcxODE5MjAyMTIyMjMyNDI1MjYyNzI4MjkzMDMxMzIzMzM0MzUzNjM3MzgzOTQwNDE0MjQzNDQ0NTQ2NDc0ODQ5NTA1MTUyNTM1NDU1NTY1NzU4NTk2MDYxNjI2MzY0NjU2NjY3Njg2OTcwNzE3MjczNzQ3NTc2Nzc3ODc5ODA4MTgyODM4NDg1ODY4Nzg4ODk5MDkxOTI5Mzk0OTU5Njk3OTg5OQAAAAAAAAAAAAAAAAoAAABkAAAA6AMAABAnAACghgEAQEIPAICWmAAA4fUFAMqaO04xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAIQSAADIDwAAABQAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAIQSAAD4DwAA7A8AAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQAAAIQSAAAoEAAA7A8AAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAIQSAABYEAAATBAAAE4xMF9fY3h4YWJpdjEyMF9fZnVuY3Rpb25fdHlwZV9pbmZvRQAAAACEEgAAiBAAAOwPAABOMTBfX2N4eGFiaXYxMjlfX3BvaW50ZXJfdG9fbWVtYmVyX3R5cGVfaW5mb0UAAACEEgAAvBAAAEwQAAAAAAAAPBEAAB4AAAAfAAAAIAAAACEAAAAiAAAATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAIQSAAAUEQAA7A8AAHYAAAAAEQAASBEAAERuAAAAEQAAVBEAAGIAAAAAEQAAYBEAAGMAAAAAEQAAbBEAAGgAAAAAEQAAeBEAAGEAAAAAEQAAhBEAAHMAAAAAEQAAkBEAAHQAAAAAEQAAnBEAAGkAAAAAEQAAqBEAAGoAAAAAEQAAtBEAAGwAAAAAEQAAwBEAAG0AAAAAEQAAzBEAAHgAAAAAEQAA2BEAAHkAAAAAEQAA5BEAAGYAAAAAEQAA8BEAAGQAAAAAEQAA/BEAAAAAAABIEgAAHgAAACMAAAAgAAAAIQAAACQAAABOMTBfX2N4eGFiaXYxMTZfX2VudW1fdHlwZV9pbmZvRQAAAACEEgAAJBIAAOwPAAAAAAAAHBAAAB4AAAAlAAAAIAAAACEAAAAmAAAAJwAAACgAAAApAAAAAAAAAMwSAAAeAAAAKgAAACAAAAAhAAAAJgAAACsAAAAsAAAALQAAAE4xMF9fY3h4YWJpdjEyMF9fc2lfY2xhc3NfdHlwZV9pbmZvRQAAAACEEgAApBIAABwQAAAAAAAAfBAAAB4AAAAuAAAAIAAAACEAAAAvAAAAAAAAAFgTAAAVAAAAMAAAADEAAAAAAAAAgBMAABUAAAAyAAAAMwAAAAAAAABAEwAAFQAAADQAAAA1AAAAU3Q5ZXhjZXB0aW9uAAAAAFwSAAAwEwAAU3Q5YmFkX2FsbG9jAAAAAIQSAABIEwAAQBMAAFN0MjBiYWRfYXJyYXlfbmV3X2xlbmd0aAAAAACEEgAAZBMAAFgTAAAAAAAAsBMAABQAAAA2AAAANwAAAFN0MTFsb2dpY19lcnJvcgCEEgAAoBMAAEATAAAAAAAA5BMAABQAAAA4AAAANwAAAFN0MTJsZW5ndGhfZXJyb3IAAAAAhBIAANATAACwEwAAU3Q5dHlwZV9pbmZvAAAAAFwSAADwEwAA");
  base64DecodeToExistingUint8Array(bufferView, 5128, "BQAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAABkAAABoFQAAAAQAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAP////8KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBQAACAcUAAFAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAHQAAABQcAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAA//////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgFAAA");
  base64DecodeToExistingUint8Array(bufferView, 5440, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);
  
  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }
      
  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }
      
  function wasm2js_scratch_load_f64() {
    return f64ScratchView[0];
  }
      
  function wasm2js_scratch_store_f64(value) {
    f64ScratchView[0] = value;
  }
      function wasm2js_trap() { throw new Error('abort'); }

function asmFunc(importObject) {
 var env = importObject.env || importObject;
 var memory = env.memory;
 var buffer = memory.buffer;
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var nan = NaN;
 var infinity = Infinity;
 var fimport$0 = env._embind_register_class;
 var fimport$1 = env._embind_register_enum;
 var fimport$2 = env._embind_register_enum_value;
 var fimport$3 = env._embind_register_class_constructor;
 var fimport$4 = env._embind_register_class_function;
 var fimport$5 = env.__cxa_allocate_exception;
 var fimport$6 = env.__cxa_throw;
 var fimport$7 = env._embind_register_void;
 var fimport$8 = env._embind_register_bool;
 var fimport$9 = env._embind_register_integer;
 var fimport$10 = env._embind_register_float;
 var fimport$11 = env._embind_register_std_string;
 var fimport$12 = env._embind_register_std_wstring;
 var fimport$13 = env._embind_register_emval;
 var fimport$14 = env._embind_register_memory_view;
 var fimport$15 = env.emscripten_memcpy_big;
 var fimport$16 = env.fd_write;
 var fimport$17 = env.emscripten_resize_heap;
 var fimport$18 = env.abort;
 var fimport$19 = env.fd_close;
 var fimport$20 = env._embind_register_bigint;
 var fimport$21 = env.fd_seek;
 var global$0 = 5250080;
 var global$1 = 0;
 var global$2 = 0;
 var global$3 = 0;
 var __wasm_intrinsics_temp_i64 = 0;
 var __wasm_intrinsics_temp_i64$hi = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  $417();
  $239();
  $245();
  $284();
 }
 
 function $1($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $17_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $17_1 = (HEAP32[($3($2(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0;
  global$0 = $5_1 + 16 | 0;
  return $17_1 | 0;
 }
 
 function $2($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return (HEAP32[($4_1 + 12 | 0) >> 2] | 0) + Math_imul(HEAP32[($4_1 + 8 | 0) >> 2] | 0, 320) | 0 | 0;
 }
 
 function $3($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return (HEAP32[($4_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 2 | 0) | 0 | 0;
 }
 
 function $4($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0, $19_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $19_1 = ((HEAP32[($3($2($6_1 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0;
  HEAP32[($3($2($6_1 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0) >> 2] = $19_1;
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $5($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  $246(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $1_1 | 0, 25600 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $6($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 76816 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 76812 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 76812 | 0) >> 2] | 0;
  $247($3_1 + 51208 | 0 | 0, 0 | 0, 25600 | 0) | 0;
  $246($3_1 + 25608 | 0 | 0, $3_1 + 51208 | 0 | 0, 25600 | 0) | 0;
  $246($3_1 + 8 | 0 | 0, $3_1 + 25608 | 0 | 0, 25600 | 0) | 0;
  $5($4_1 | 0, $3_1 + 8 | 0 | 0);
  global$0 = $3_1 + 76816 | 0;
  return;
 }
 
 function $7($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 25616 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 25612 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 25612 | 0) >> 2] | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[$3_1 >> 2] = 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[$3_1 >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
       break label$3
      }
      $8($4_1 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0, HEAP32[$3_1 >> 2] | 0 | 0, $3_1 + 8 | 0 | 0);
      HEAP32[$3_1 >> 2] = (HEAP32[$3_1 >> 2] | 0) + 1 | 0;
      continue label$4;
     };
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  $246($4_1 | 0, $3_1 + 8 | 0 | 0, 25600 | 0) | 0;
  global$0 = $3_1 + 25616 | 0;
  return;
 }
 
 function $8($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $7_1 = 0, $161_1 = 0, $168_1 = 0, $175_1 = 0, $182_1 = 0, $189_1 = 0, $196_1 = 0, $200_1 = 0, $204_1 = 0;
  $6_1 = global$0 - 112 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 108 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 104 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 100 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 96 | 0) >> 2] = $3_1;
  $7_1 = HEAP32[($6_1 + 108 | 0) >> 2] | 0;
  HEAP32[($6_1 + 92 | 0) >> 2] = 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1080 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1084 | 0) >> 2] | 0;
  $161_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $6_1 + 72 | 0;
  HEAP32[i64toi32_i32$0 >> 2] = $161_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1072 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1076 | 0) >> 2] | 0;
  $168_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $6_1 + 64 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $168_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1064 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1068 | 0) >> 2] | 0;
  $175_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $6_1 + 56 | 0;
  HEAP32[i64toi32_i32$0 >> 2] = $175_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1056 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1060 | 0) >> 2] | 0;
  $182_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $6_1 + 48 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $182_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1048 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1052 | 0) >> 2] | 0;
  $189_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $6_1 + 40 | 0;
  HEAP32[i64toi32_i32$0 >> 2] = $189_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1040 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1044 | 0) >> 2] | 0;
  $196_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $6_1 + 32 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $196_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1032 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1036 | 0) >> 2] | 0;
  $200_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $6_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $200_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1024 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1028 | 0) >> 2] | 0;
  $204_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $6_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $204_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($6_1 + 12 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($6_1 + 12 | 0) >> 2] | 0 | 0) < (8 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[(($6_1 + 16 | 0) + ((HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0) | 0) >> 2] | 0;
    HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[((($6_1 + 16 | 0) + ((HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0) | 0) + 4 | 0) >> 2] | 0;
    label$3 : {
     if (((HEAP32[($6_1 + 104 | 0) >> 2] | 0) + (HEAP32[($6_1 + 8 | 0) >> 2] | 0) | 0 | 0) < (0 | 0) & 1 | 0) {
      break label$3
     }
     if (((HEAP32[($6_1 + 100 | 0) >> 2] | 0) + (HEAP32[($6_1 + 4 | 0) >> 2] | 0) | 0 | 0) < (0 | 0) & 1 | 0) {
      break label$3
     }
     if (((HEAP32[($6_1 + 104 | 0) >> 2] | 0) + (HEAP32[($6_1 + 8 | 0) >> 2] | 0) | 0 | 0) >= (80 | 0) & 1 | 0) {
      break label$3
     }
     if (((HEAP32[($6_1 + 100 | 0) >> 2] | 0) + (HEAP32[($6_1 + 4 | 0) >> 2] | 0) | 0 | 0) >= (80 | 0) & 1 | 0) {
      break label$3
     }
     if (!(($1($7_1 | 0, (HEAP32[($6_1 + 104 | 0) >> 2] | 0) + (HEAP32[($6_1 + 8 | 0) >> 2] | 0) | 0 | 0, (HEAP32[($6_1 + 100 | 0) >> 2] | 0) + (HEAP32[($6_1 + 4 | 0) >> 2] | 0) | 0 | 0) | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($6_1 + 92 | 0) >> 2] = (HEAP32[($6_1 + 92 | 0) >> 2] | 0) + 1 | 0;
    }
    HEAP32[($6_1 + 12 | 0) >> 2] = (HEAP32[($6_1 + 12 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  label$4 : {
   label$5 : {
    label$6 : {
     if ((HEAP32[($6_1 + 92 | 0) >> 2] | 0 | 0) == (3 | 0) & 1 | 0) {
      break label$6
     }
     if (!((HEAP32[($6_1 + 92 | 0) >> 2] | 0 | 0) == (2 | 0) & 1 | 0)) {
      break label$5
     }
     if (!(($1($7_1 | 0, HEAP32[($6_1 + 104 | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 100 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
      break label$5
     }
    }
    HEAP32[($3($2(HEAP32[($6_1 + 96 | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 104 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($6_1 + 100 | 0) >> 2] | 0 | 0) | 0) >> 2] = 1;
    break label$4;
   }
   HEAP32[($3($2(HEAP32[($6_1 + 96 | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 104 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($6_1 + 100 | 0) >> 2] | 0 | 0) | 0) >> 2] = 0;
  }
  global$0 = $6_1 + 112 | 0;
  return;
 }
 
 function $9($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $29_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $248(2159 | 0, 0 | 0) | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       label$6 : {
        if (!(($1($4_1 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
         break label$6
        }
        $29_1 = 1115;
        break label$5;
       }
       $29_1 = 1181;
      }
      HEAP32[$3_1 >> 2] = $29_1;
      $248(2124 | 0, $3_1 | 0) | 0;
      HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
      continue label$4;
     };
    }
    $248(2207 | 0, 0 | 0) | 0;
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  $248(2207 | 0, 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $10($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $5_1 = 0, $7_1 = 0, $16_1 = 0, $20_1 = 0, $30_1 = 0, $40_1 = 0, $50_1 = 0, $60_1 = 0, $70_1 = 0, $80_1 = 0, $90_1 = 0, $100_1 = 0, $110_1 = 0, $120_1 = 0, $130_1 = 0, $140_1 = 0, $150_1 = 0, $160_1 = 0, $170_1 = 0, $180_1 = 0, $190_1 = 0, $200_1 = 0, $210_1 = 0, $220_1 = 0, $230_1 = 0, $240_1 = 0, $250_1 = 0, $260_1 = 0, $270_1 = 0, $280_1 = 0, $290_1 = 0, $300_1 = 0, $310_1 = 0, $320_1 = 0, $330_1 = 0, $340_1 = 0, $350_1 = 0, $360_1 = 0, $419_1 = 0, $429 = 0, $439 = 0, $449 = 0, $459 = 0, $469 = 0, $479 = 0, $489 = 0, $499 = 0, $509 = 0, $519 = 0, $529 = 0, $539 = 0, $549 = 0, $559 = 0, $569 = 0, $579 = 0, $589 = 0, $599 = 0, $609 = 0, $619 = 0, $629 = 0, $639 = 0, $649 = 0, $659 = 0, $669 = 0, $679 = 0, $689 = 0, $699 = 0, $709 = 0, $719 = 0, $729 = 0, $739 = 0, $749 = 0, $759 = 0, $769 = 0, $779 = 0, $789 = 0, $799 = 0, $809 = 0, $819 = 0, $829 = 0, $839 = 0, $896 = 0, $906 = 0, $916 = 0, $926 = 0, $936 = 0, $946 = 0, $956 = 0, $966 = 0, $976 = 0, $986 = 0, $996 = 0, $1006 = 0, $1016 = 0, $1026 = 0, $1036 = 0, $1046 = 0, $1056 = 0, $1066 = 0, $1076 = 0, $1086 = 0, $1096 = 0, $1106 = 0, $1116 = 0, $1126 = 0, $1136 = 0, $1146 = 0, $1156 = 0, $1166 = 0, $1176 = 0, $1186 = 0, $1196 = 0, $1206 = 0, $1216 = 0, $1226 = 0, $1236 = 0, $1246 = 0, $1256 = 0, $1266 = 0, $1276 = 0, $1286 = 0, $1296 = 0, $1306 = 0, $1316 = 0, $1373 = 0, $1383 = 0, $1393 = 0, $1403 = 0, $1413 = 0, $1423 = 0, $1433 = 0, $1443 = 0, $1453 = 0, $1463 = 0, $1473 = 0, $1483 = 0, $1493 = 0, $1503 = 0, $1513 = 0, $1523 = 0, $1533 = 0, $1543 = 0, $1553 = 0, $1563 = 0, $1573 = 0, $1583 = 0, $1593 = 0, $1603 = 0, $1613 = 0, $1623 = 0, $1633 = 0, $1643 = 0, $1653 = 0, $1663 = 0, $1673 = 0, $1683 = 0, $1693 = 0, $1703 = 0, $1713 = 0, $1770 = 0, $1780 = 0, $1790 = 0, $1800 = 0, $1810 = 0, $1820 = 0, $1830 = 0, $1840 = 0, $1850 = 0, $1860 = 0, $1870 = 0, $1880 = 0, $1890 = 0, $1900 = 0, $1910 = 0, $1920 = 0, $1930 = 0, $1940 = 0, $1950 = 0, $1960 = 0, $1970 = 0, $1980 = 0, $1990 = 0, $2000 = 0, $2010 = 0, $2020 = 0, $2030 = 0, $2040 = 0, $2050 = 0, $2060 = 0, $2070 = 0, $2080 = 0, $2090 = 0, $2100 = 0, $2110 = 0, $2120 = 0, $2130 = 0, $2140 = 0, $2150 = 0, $2160 = 0, $2170 = 0, $2180 = 0, $2190 = 0, $2200 = 0, $2210 = 0, $2220 = 0, $2230 = 0, $2240 = 0, $2250 = 0, $2260 = 0, $2270 = 0, $2280 = 0, $2290 = 0, $2300 = 0, $2310 = 0, $2320 = 0, $2330 = 0, $2340 = 0, $2350 = 0, $2360 = 0, $2370 = 0, $2380 = 0, $2390 = 0, $2400 = 0, $2410 = 0, $2420 = 0, $2430 = 0, $2440 = 0, $2450 = 0, $2460 = 0, $2470 = 0, $2480 = 0, $2490 = 0, $2500 = 0, $2510 = 0, $2520 = 0, $2530 = 0, $2540 = 0, $2550 = 0, $2560 = 0, $2570 = 0, $2580 = 0, $2590 = 0, $2600 = 0, $2610 = 0, $2620 = 0, $2630 = 0, $2640 = 0, $2650 = 0, $2660 = 0, $2670 = 0, $2680 = 0, $2690 = 0, $2700 = 0, $2710 = 0, $2720 = 0, $2730 = 0, $2740 = 0, $2750 = 0, $2760 = 0, $2770 = 0, $2780 = 0, $2790 = 0, $2800 = 0, $2810 = 0, $2820 = 0, $2830 = 0, $2840 = 0, $2850 = 0, $2860 = 0, $2870 = 0, $2880 = 0, $2890 = 0, $2900 = 0, $2910 = 0, $2920 = 0, $2930 = 0, $2940 = 0, $2950 = 0, $2960 = 0, $2970 = 0, $2980 = 0, $2990 = 0, $3000 = 0, $3010 = 0, $3020 = 0, $3030 = 0, $3040 = 0, $3050 = 0, $3060 = 0, $3070 = 0, $3080 = 0, $3090 = 0, $3100 = 0, $3110 = 0, $3120 = 0, $3130 = 0, $3140 = 0, $3150 = 0, $3160 = 0, $3170 = 0, $3180 = 0, $3190 = 0, $3200 = 0, $3210 = 0, $3220 = 0, $3230 = 0, $3240 = 0, $3250 = 0, $3260 = 0, $3270 = 0, $3280 = 0, $3290 = 0, $3300 = 0, $3310 = 0, $3320 = 0, $3330 = 0, $3340 = 0, $3350 = 0, $3360 = 0, $3370 = 0, $3380 = 0, $3390 = 0, $3400 = 0, $3410 = 0, $3420 = 0, $3430 = 0, $3440 = 0, $3450 = 0, $3460 = 0, $3470 = 0, $3480 = 0, $3490 = 0, $3500 = 0, $3510 = 0, $3520 = 0, $3530 = 0, $3540 = 0, $3550 = 0, $3560 = 0, $3570 = 0, $3580 = 0, $3590 = 0, $3600 = 0, $3610 = 0, $3620 = 0, $3630 = 0, $3640 = 0, $3650 = 0, $3660 = 0, $3670 = 0, $3680 = 0, $3690 = 0, $3700 = 0, $3710 = 0, $3720 = 0, $3730 = 0, $3740 = 0, $3750 = 0, $3760 = 0, $3770 = 0, $3780 = 0, $3790 = 0, $3800 = 0, $3810 = 0, $3820 = 0, $3830 = 0, $3840 = 0, $3850 = 0, $3860 = 0, $3870 = 0, $3880 = 0, $3890 = 0, $3900 = 0, $3910 = 0, $3920 = 0, $3930 = 0, $3940 = 0, $3950 = 0, $3960 = 0, $3970 = 0, $3980 = 0, $3990 = 0, $4000 = 0, $4010 = 0, $4020 = 0, $4030 = 0, $4851 = 0, $4879 = 0, $4891 = 0, $5778 = 0, $5802 = 0, $5814 = 0, $6701 = 0, $6725 = 0, $6737 = 0, $7472 = 0, $7496 = 0, $7508 = 0, $11891 = 0, $11919 = 0, $11931 = 0;
  $4_1 = global$0 - 262496 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 262492 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 262488 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 262492 | 0) >> 2] | 0;
  $7_1 = 0;
  $248(2138 | 0, $7_1 | 0) | 0;
  $11($4_1 + 262472 | 0 | 0) | 0;
  HEAP32[($4_1 + 262460 | 0) >> 2] = $7_1;
  HEAP32[($4_1 + 262456 | 0) >> 2] = $7_1;
  $12($4_1 + 262464 | 0 | 0, $4_1 + 262460 | 0 | 0, $4_1 + 262456 | 0 | 0) | 0;
  $16_1 = HEAP32[($4_1 + 262488 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    switch ($16_1 | 0) {
    case 0:
     $20_1 = $4_1 + 262160 | 0;
     HEAP32[($4_1 + 262156 | 0) >> 2] = 69;
     HEAP32[($4_1 + 262152 | 0) >> 2] = 6;
     $12($20_1 | 0, $4_1 + 262156 | 0 | 0, $4_1 + 262152 | 0 | 0) | 0;
     $30_1 = $20_1 + 8 | 0;
     HEAP32[($4_1 + 262148 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262144 | 0) >> 2] = 6;
     $12($30_1 | 0, $4_1 + 262148 | 0 | 0, $4_1 + 262144 | 0 | 0) | 0;
     $40_1 = $30_1 + 8 | 0;
     HEAP32[($4_1 + 262140 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262136 | 0) >> 2] = 7;
     $12($40_1 | 0, $4_1 + 262140 | 0 | 0, $4_1 + 262136 | 0 | 0) | 0;
     $50_1 = $40_1 + 8 | 0;
     HEAP32[($4_1 + 262132 | 0) >> 2] = 69;
     HEAP32[($4_1 + 262128 | 0) >> 2] = 7;
     $12($50_1 | 0, $4_1 + 262132 | 0 | 0, $4_1 + 262128 | 0 | 0) | 0;
     $60_1 = $50_1 + 8 | 0;
     HEAP32[($4_1 + 262124 | 0) >> 2] = 69;
     HEAP32[($4_1 + 262120 | 0) >> 2] = 16;
     $12($60_1 | 0, $4_1 + 262124 | 0 | 0, $4_1 + 262120 | 0 | 0) | 0;
     $70_1 = $60_1 + 8 | 0;
     HEAP32[($4_1 + 262116 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262112 | 0) >> 2] = 16;
     $12($70_1 | 0, $4_1 + 262116 | 0 | 0, $4_1 + 262112 | 0 | 0) | 0;
     $80_1 = $70_1 + 8 | 0;
     HEAP32[($4_1 + 262108 | 0) >> 2] = 67;
     HEAP32[($4_1 + 262104 | 0) >> 2] = 16;
     $12($80_1 | 0, $4_1 + 262108 | 0 | 0, $4_1 + 262104 | 0 | 0) | 0;
     $90_1 = $80_1 + 8 | 0;
     HEAP32[($4_1 + 262100 | 0) >> 2] = 70;
     HEAP32[($4_1 + 262096 | 0) >> 2] = 17;
     $12($90_1 | 0, $4_1 + 262100 | 0 | 0, $4_1 + 262096 | 0 | 0) | 0;
     $100_1 = $90_1 + 8 | 0;
     HEAP32[($4_1 + 262092 | 0) >> 2] = 71;
     HEAP32[($4_1 + 262088 | 0) >> 2] = 18;
     $12($100_1 | 0, $4_1 + 262092 | 0 | 0, $4_1 + 262088 | 0 | 0) | 0;
     $110_1 = $100_1 + 8 | 0;
     HEAP32[($4_1 + 262084 | 0) >> 2] = 71;
     HEAP32[($4_1 + 262080 | 0) >> 2] = 19;
     $12($110_1 | 0, $4_1 + 262084 | 0 | 0, $4_1 + 262080 | 0 | 0) | 0;
     $120_1 = $110_1 + 8 | 0;
     HEAP32[($4_1 + 262076 | 0) >> 2] = 66;
     HEAP32[($4_1 + 262072 | 0) >> 2] = 17;
     $12($120_1 | 0, $4_1 + 262076 | 0 | 0, $4_1 + 262072 | 0 | 0) | 0;
     $130_1 = $120_1 + 8 | 0;
     HEAP32[($4_1 + 262068 | 0) >> 2] = 65;
     HEAP32[($4_1 + 262064 | 0) >> 2] = 18;
     $12($130_1 | 0, $4_1 + 262068 | 0 | 0, $4_1 + 262064 | 0 | 0) | 0;
     $140_1 = $130_1 + 8 | 0;
     HEAP32[($4_1 + 262060 | 0) >> 2] = 65;
     HEAP32[($4_1 + 262056 | 0) >> 2] = 19;
     $12($140_1 | 0, $4_1 + 262060 | 0 | 0, $4_1 + 262056 | 0 | 0) | 0;
     $150_1 = $140_1 + 8 | 0;
     HEAP32[($4_1 + 262052 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262048 | 0) >> 2] = 20;
     $12($150_1 | 0, $4_1 + 262052 | 0 | 0, $4_1 + 262048 | 0 | 0) | 0;
     $160_1 = $150_1 + 8 | 0;
     HEAP32[($4_1 + 262044 | 0) >> 2] = 70;
     HEAP32[($4_1 + 262040 | 0) >> 2] = 21;
     $12($160_1 | 0, $4_1 + 262044 | 0 | 0, $4_1 + 262040 | 0 | 0) | 0;
     $170_1 = $160_1 + 8 | 0;
     HEAP32[($4_1 + 262036 | 0) >> 2] = 69;
     HEAP32[($4_1 + 262032 | 0) >> 2] = 22;
     $12($170_1 | 0, $4_1 + 262036 | 0 | 0, $4_1 + 262032 | 0 | 0) | 0;
     $180_1 = $170_1 + 8 | 0;
     HEAP32[($4_1 + 262028 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262024 | 0) >> 2] = 22;
     $12($180_1 | 0, $4_1 + 262028 | 0 | 0, $4_1 + 262024 | 0 | 0) | 0;
     $190_1 = $180_1 + 8 | 0;
     HEAP32[($4_1 + 262020 | 0) >> 2] = 67;
     HEAP32[($4_1 + 262016 | 0) >> 2] = 22;
     $12($190_1 | 0, $4_1 + 262020 | 0 | 0, $4_1 + 262016 | 0 | 0) | 0;
     $200_1 = $190_1 + 8 | 0;
     HEAP32[($4_1 + 262012 | 0) >> 2] = 66;
     HEAP32[($4_1 + 262008 | 0) >> 2] = 21;
     $12($200_1 | 0, $4_1 + 262012 | 0 | 0, $4_1 + 262008 | 0 | 0) | 0;
     $210_1 = $200_1 + 8 | 0;
     HEAP32[($4_1 + 262004 | 0) >> 2] = 68;
     HEAP32[($4_1 + 262e3 | 0) >> 2] = 23;
     $12($210_1 | 0, $4_1 + 262004 | 0 | 0, $4_1 + 262e3 | 0 | 0) | 0;
     $220_1 = $210_1 + 8 | 0;
     HEAP32[($4_1 + 261996 | 0) >> 2] = 69;
     HEAP32[($4_1 + 261992 | 0) >> 2] = 26;
     $12($220_1 | 0, $4_1 + 261996 | 0 | 0, $4_1 + 261992 | 0 | 0) | 0;
     $230_1 = $220_1 + 8 | 0;
     HEAP32[($4_1 + 261988 | 0) >> 2] = 69;
     HEAP32[($4_1 + 261984 | 0) >> 2] = 27;
     $12($230_1 | 0, $4_1 + 261988 | 0 | 0, $4_1 + 261984 | 0 | 0) | 0;
     $240_1 = $230_1 + 8 | 0;
     HEAP32[($4_1 + 261980 | 0) >> 2] = 70;
     HEAP32[($4_1 + 261976 | 0) >> 2] = 27;
     $12($240_1 | 0, $4_1 + 261980 | 0 | 0, $4_1 + 261976 | 0 | 0) | 0;
     $250_1 = $240_1 + 8 | 0;
     HEAP32[($4_1 + 261972 | 0) >> 2] = 70;
     HEAP32[($4_1 + 261968 | 0) >> 2] = 26;
     $12($250_1 | 0, $4_1 + 261972 | 0 | 0, $4_1 + 261968 | 0 | 0) | 0;
     $260_1 = $250_1 + 8 | 0;
     HEAP32[($4_1 + 261964 | 0) >> 2] = 71;
     HEAP32[($4_1 + 261960 | 0) >> 2] = 26;
     $12($260_1 | 0, $4_1 + 261964 | 0 | 0, $4_1 + 261960 | 0 | 0) | 0;
     $270_1 = $260_1 + 8 | 0;
     HEAP32[($4_1 + 261956 | 0) >> 2] = 71;
     HEAP32[($4_1 + 261952 | 0) >> 2] = 27;
     $12($270_1 | 0, $4_1 + 261956 | 0 | 0, $4_1 + 261952 | 0 | 0) | 0;
     $280_1 = $270_1 + 8 | 0;
     HEAP32[($4_1 + 261948 | 0) >> 2] = 72;
     HEAP32[($4_1 + 261944 | 0) >> 2] = 28;
     $12($280_1 | 0, $4_1 + 261948 | 0 | 0, $4_1 + 261944 | 0 | 0) | 0;
     $290_1 = $280_1 + 8 | 0;
     HEAP32[($4_1 + 261940 | 0) >> 2] = 68;
     HEAP32[($4_1 + 261936 | 0) >> 2] = 28;
     $12($290_1 | 0, $4_1 + 261940 | 0 | 0, $4_1 + 261936 | 0 | 0) | 0;
     $300_1 = $290_1 + 8 | 0;
     HEAP32[($4_1 + 261932 | 0) >> 2] = 72;
     HEAP32[($4_1 + 261928 | 0) >> 2] = 30;
     $12($300_1 | 0, $4_1 + 261932 | 0 | 0, $4_1 + 261928 | 0 | 0) | 0;
     $310_1 = $300_1 + 8 | 0;
     HEAP32[($4_1 + 261924 | 0) >> 2] = 73;
     HEAP32[($4_1 + 261920 | 0) >> 2] = 30;
     $12($310_1 | 0, $4_1 + 261924 | 0 | 0, $4_1 + 261920 | 0 | 0) | 0;
     $320_1 = $310_1 + 8 | 0;
     HEAP32[($4_1 + 261916 | 0) >> 2] = 68;
     HEAP32[($4_1 + 261912 | 0) >> 2] = 30;
     $12($320_1 | 0, $4_1 + 261916 | 0 | 0, $4_1 + 261912 | 0 | 0) | 0;
     $330_1 = $320_1 + 8 | 0;
     HEAP32[($4_1 + 261908 | 0) >> 2] = 67;
     HEAP32[($4_1 + 261904 | 0) >> 2] = 30;
     $12($330_1 | 0, $4_1 + 261908 | 0 | 0, $4_1 + 261904 | 0 | 0) | 0;
     $340_1 = $330_1 + 8 | 0;
     HEAP32[($4_1 + 261900 | 0) >> 2] = 71;
     HEAP32[($4_1 + 261896 | 0) >> 2] = 40;
     $12($340_1 | 0, $4_1 + 261900 | 0 | 0, $4_1 + 261896 | 0 | 0) | 0;
     $350_1 = $340_1 + 8 | 0;
     HEAP32[($4_1 + 261892 | 0) >> 2] = 71;
     HEAP32[($4_1 + 261888 | 0) >> 2] = 41;
     $12($350_1 | 0, $4_1 + 261892 | 0 | 0, $4_1 + 261888 | 0 | 0) | 0;
     $360_1 = $350_1 + 8 | 0;
     HEAP32[($4_1 + 261884 | 0) >> 2] = 70;
     HEAP32[($4_1 + 261880 | 0) >> 2] = 41;
     $12($360_1 | 0, $4_1 + 261884 | 0 | 0, $4_1 + 261880 | 0 | 0) | 0;
     HEAP32[($4_1 + 261876 | 0) >> 2] = 70;
     HEAP32[($4_1 + 261872 | 0) >> 2] = 40;
     $12($360_1 + 8 | 0 | 0, $4_1 + 261876 | 0 | 0, $4_1 + 261872 | 0 | 0) | 0;
     HEAP32[($4_1 + 262448 | 0) >> 2] = $4_1 + 262160 | 0;
     HEAP32[($4_1 + 262452 | 0) >> 2] = 36;
     i64toi32_i32$0 = HEAP32[($4_1 + 262448 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262452 | 0) >> 2] | 0;
     $4851 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 8 | 0) >> 2] = $4851;
     HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$1;
     $13($4_1 + 262472 | 0 | 0, $4_1 + 8 | 0 | 0) | 0;
     HEAP32[($4_1 + 262464 | 0) >> 2] = 10;
     HEAP32[($4_1 + 262468 | 0) >> 2] = -10;
     $14($4_1 + 236256 | 0 | 0, $4_1 + 262472 | 0 | 0) | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262464 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 262468 | 0) >> 2] | 0;
     $4879 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 236248 | 0) >> 2] = $4879;
     HEAP32[($4_1 + 236252 | 0) >> 2] = i64toi32_i32$0;
     i64toi32_i32$0 = HEAP32[($4_1 + 236248 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 236252 | 0) >> 2] | 0;
     $4891 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 16 | 0) >> 2] = $4891;
     HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$1;
     $15($4_1 + 236272 | 0 | 0, $5_1 | 0, $4_1 + 236256 | 0 | 0, $4_1 + 16 | 0 | 0);
     $246($4_1 + 24 | 0 | 0, $4_1 + 236272 | 0 | 0, 25600 | 0) | 0;
     $5($5_1 | 0, $4_1 + 24 | 0 | 0);
     $16($4_1 + 236256 | 0 | 0) | 0;
     break label$1;
    case 1:
     $419_1 = $4_1 + 235888 | 0;
     HEAP32[($4_1 + 235884 | 0) >> 2] = 59;
     HEAP32[($4_1 + 235880 | 0) >> 2] = 7;
     $12($419_1 | 0, $4_1 + 235884 | 0 | 0, $4_1 + 235880 | 0 | 0) | 0;
     $429 = $419_1 + 8 | 0;
     HEAP32[($4_1 + 235876 | 0) >> 2] = 58;
     HEAP32[($4_1 + 235872 | 0) >> 2] = 7;
     $12($429 | 0, $4_1 + 235876 | 0 | 0, $4_1 + 235872 | 0 | 0) | 0;
     $439 = $429 + 8 | 0;
     HEAP32[($4_1 + 235868 | 0) >> 2] = 59;
     HEAP32[($4_1 + 235864 | 0) >> 2] = 8;
     $12($439 | 0, $4_1 + 235868 | 0 | 0, $4_1 + 235864 | 0 | 0) | 0;
     $449 = $439 + 8 | 0;
     HEAP32[($4_1 + 235860 | 0) >> 2] = 58;
     HEAP32[($4_1 + 235856 | 0) >> 2] = 8;
     $12($449 | 0, $4_1 + 235860 | 0 | 0, $4_1 + 235856 | 0 | 0) | 0;
     $459 = $449 + 8 | 0;
     HEAP32[($4_1 + 235852 | 0) >> 2] = 59;
     HEAP32[($4_1 + 235848 | 0) >> 2] = 16;
     $12($459 | 0, $4_1 + 235852 | 0 | 0, $4_1 + 235848 | 0 | 0) | 0;
     $469 = $459 + 8 | 0;
     HEAP32[($4_1 + 235844 | 0) >> 2] = 59;
     HEAP32[($4_1 + 235840 | 0) >> 2] = 17;
     $12($469 | 0, $4_1 + 235844 | 0 | 0, $4_1 + 235840 | 0 | 0) | 0;
     $479 = $469 + 8 | 0;
     HEAP32[($4_1 + 235836 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235832 | 0) >> 2] = 17;
     $12($479 | 0, $4_1 + 235836 | 0 | 0, $4_1 + 235832 | 0 | 0) | 0;
     $489 = $479 + 8 | 0;
     HEAP32[($4_1 + 235828 | 0) >> 2] = 58;
     HEAP32[($4_1 + 235824 | 0) >> 2] = 17;
     $12($489 | 0, $4_1 + 235828 | 0 | 0, $4_1 + 235824 | 0 | 0) | 0;
     $499 = $489 + 8 | 0;
     HEAP32[($4_1 + 235820 | 0) >> 2] = 58;
     HEAP32[($4_1 + 235816 | 0) >> 2] = 18;
     $12($499 | 0, $4_1 + 235820 | 0 | 0, $4_1 + 235816 | 0 | 0) | 0;
     $509 = $499 + 8 | 0;
     HEAP32[($4_1 + 235812 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235808 | 0) >> 2] = 18;
     $12($509 | 0, $4_1 + 235812 | 0 | 0, $4_1 + 235808 | 0 | 0) | 0;
     $519 = $509 + 8 | 0;
     HEAP32[($4_1 + 235804 | 0) >> 2] = 57;
     HEAP32[($4_1 + 235800 | 0) >> 2] = 18;
     $12($519 | 0, $4_1 + 235804 | 0 | 0, $4_1 + 235800 | 0 | 0) | 0;
     $529 = $519 + 8 | 0;
     HEAP32[($4_1 + 235796 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235792 | 0) >> 2] = 21;
     $12($529 | 0, $4_1 + 235796 | 0 | 0, $4_1 + 235792 | 0 | 0) | 0;
     $539 = $529 + 8 | 0;
     HEAP32[($4_1 + 235788 | 0) >> 2] = 64;
     HEAP32[($4_1 + 235784 | 0) >> 2] = 21;
     $12($539 | 0, $4_1 + 235788 | 0 | 0, $4_1 + 235784 | 0 | 0) | 0;
     $549 = $539 + 8 | 0;
     HEAP32[($4_1 + 235780 | 0) >> 2] = 64;
     HEAP32[($4_1 + 235776 | 0) >> 2] = 17;
     $12($549 | 0, $4_1 + 235780 | 0 | 0, $4_1 + 235776 | 0 | 0) | 0;
     $559 = $549 + 8 | 0;
     HEAP32[($4_1 + 235772 | 0) >> 2] = 66;
     HEAP32[($4_1 + 235768 | 0) >> 2] = 17;
     $12($559 | 0, $4_1 + 235772 | 0 | 0, $4_1 + 235768 | 0 | 0) | 0;
     $569 = $559 + 8 | 0;
     HEAP32[($4_1 + 235764 | 0) >> 2] = 64;
     HEAP32[($4_1 + 235760 | 0) >> 2] = 18;
     $12($569 | 0, $4_1 + 235764 | 0 | 0, $4_1 + 235760 | 0 | 0) | 0;
     $579 = $569 + 8 | 0;
     HEAP32[($4_1 + 235756 | 0) >> 2] = 65;
     HEAP32[($4_1 + 235752 | 0) >> 2] = 17;
     $12($579 | 0, $4_1 + 235756 | 0 | 0, $4_1 + 235752 | 0 | 0) | 0;
     $589 = $579 + 8 | 0;
     HEAP32[($4_1 + 235748 | 0) >> 2] = 65;
     HEAP32[($4_1 + 235744 | 0) >> 2] = 16;
     $12($589 | 0, $4_1 + 235748 | 0 | 0, $4_1 + 235744 | 0 | 0) | 0;
     $599 = $589 + 8 | 0;
     HEAP32[($4_1 + 235740 | 0) >> 2] = 66;
     HEAP32[($4_1 + 235736 | 0) >> 2] = 18;
     $12($599 | 0, $4_1 + 235740 | 0 | 0, $4_1 + 235736 | 0 | 0) | 0;
     $609 = $599 + 8 | 0;
     HEAP32[($4_1 + 235732 | 0) >> 2] = 67;
     HEAP32[($4_1 + 235728 | 0) >> 2] = 18;
     $12($609 | 0, $4_1 + 235732 | 0 | 0, $4_1 + 235728 | 0 | 0) | 0;
     $619 = $609 + 8 | 0;
     HEAP32[($4_1 + 235724 | 0) >> 2] = 64;
     HEAP32[($4_1 + 235720 | 0) >> 2] = 22;
     $12($619 | 0, $4_1 + 235724 | 0 | 0, $4_1 + 235720 | 0 | 0) | 0;
     $629 = $619 + 8 | 0;
     HEAP32[($4_1 + 235716 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235712 | 0) >> 2] = 22;
     $12($629 | 0, $4_1 + 235716 | 0 | 0, $4_1 + 235712 | 0 | 0) | 0;
     $639 = $629 + 8 | 0;
     HEAP32[($4_1 + 235708 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235704 | 0) >> 2] = 41;
     $12($639 | 0, $4_1 + 235708 | 0 | 0, $4_1 + 235704 | 0 | 0) | 0;
     $649 = $639 + 8 | 0;
     HEAP32[($4_1 + 235700 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235696 | 0) >> 2] = 42;
     $12($649 | 0, $4_1 + 235700 | 0 | 0, $4_1 + 235696 | 0 | 0) | 0;
     $659 = $649 + 8 | 0;
     HEAP32[($4_1 + 235692 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235688 | 0) >> 2] = 45;
     $12($659 | 0, $4_1 + 235692 | 0 | 0, $4_1 + 235688 | 0 | 0) | 0;
     $669 = $659 + 8 | 0;
     HEAP32[($4_1 + 235684 | 0) >> 2] = 60;
     HEAP32[($4_1 + 235680 | 0) >> 2] = 46;
     $12($669 | 0, $4_1 + 235684 | 0 | 0, $4_1 + 235680 | 0 | 0) | 0;
     $679 = $669 + 8 | 0;
     HEAP32[($4_1 + 235676 | 0) >> 2] = 61;
     HEAP32[($4_1 + 235672 | 0) >> 2] = 46;
     $12($679 | 0, $4_1 + 235676 | 0 | 0, $4_1 + 235672 | 0 | 0) | 0;
     $689 = $679 + 8 | 0;
     HEAP32[($4_1 + 235668 | 0) >> 2] = 62;
     HEAP32[($4_1 + 235664 | 0) >> 2] = 46;
     $12($689 | 0, $4_1 + 235668 | 0 | 0, $4_1 + 235664 | 0 | 0) | 0;
     $699 = $689 + 8 | 0;
     HEAP32[($4_1 + 235660 | 0) >> 2] = 61;
     HEAP32[($4_1 + 235656 | 0) >> 2] = 47;
     $12($699 | 0, $4_1 + 235660 | 0 | 0, $4_1 + 235656 | 0 | 0) | 0;
     $709 = $699 + 8 | 0;
     HEAP32[($4_1 + 235652 | 0) >> 2] = 63;
     HEAP32[($4_1 + 235648 | 0) >> 2] = 45;
     $12($709 | 0, $4_1 + 235652 | 0 | 0, $4_1 + 235648 | 0 | 0) | 0;
     $719 = $709 + 8 | 0;
     HEAP32[($4_1 + 235644 | 0) >> 2] = 62;
     HEAP32[($4_1 + 235640 | 0) >> 2] = 45;
     $12($719 | 0, $4_1 + 235644 | 0 | 0, $4_1 + 235640 | 0 | 0) | 0;
     $729 = $719 + 8 | 0;
     HEAP32[($4_1 + 235636 | 0) >> 2] = 56;
     HEAP32[($4_1 + 235632 | 0) >> 2] = 41;
     $12($729 | 0, $4_1 + 235636 | 0 | 0, $4_1 + 235632 | 0 | 0) | 0;
     $739 = $729 + 8 | 0;
     HEAP32[($4_1 + 235628 | 0) >> 2] = 56;
     HEAP32[($4_1 + 235624 | 0) >> 2] = 42;
     $12($739 | 0, $4_1 + 235628 | 0 | 0, $4_1 + 235624 | 0 | 0) | 0;
     $749 = $739 + 8 | 0;
     HEAP32[($4_1 + 235620 | 0) >> 2] = 56;
     HEAP32[($4_1 + 235616 | 0) >> 2] = 45;
     $12($749 | 0, $4_1 + 235620 | 0 | 0, $4_1 + 235616 | 0 | 0) | 0;
     $759 = $749 + 8 | 0;
     HEAP32[($4_1 + 235612 | 0) >> 2] = 56;
     HEAP32[($4_1 + 235608 | 0) >> 2] = 46;
     $12($759 | 0, $4_1 + 235612 | 0 | 0, $4_1 + 235608 | 0 | 0) | 0;
     $769 = $759 + 8 | 0;
     HEAP32[($4_1 + 235604 | 0) >> 2] = 55;
     HEAP32[($4_1 + 235600 | 0) >> 2] = 46;
     $12($769 | 0, $4_1 + 235604 | 0 | 0, $4_1 + 235600 | 0 | 0) | 0;
     $779 = $769 + 8 | 0;
     HEAP32[($4_1 + 235596 | 0) >> 2] = 54;
     HEAP32[($4_1 + 235592 | 0) >> 2] = 46;
     $12($779 | 0, $4_1 + 235596 | 0 | 0, $4_1 + 235592 | 0 | 0) | 0;
     $789 = $779 + 8 | 0;
     HEAP32[($4_1 + 235588 | 0) >> 2] = 54;
     HEAP32[($4_1 + 235584 | 0) >> 2] = 45;
     $12($789 | 0, $4_1 + 235588 | 0 | 0, $4_1 + 235584 | 0 | 0) | 0;
     $799 = $789 + 8 | 0;
     HEAP32[($4_1 + 235580 | 0) >> 2] = 55;
     HEAP32[($4_1 + 235576 | 0) >> 2] = 47;
     $12($799 | 0, $4_1 + 235580 | 0 | 0, $4_1 + 235576 | 0 | 0) | 0;
     $809 = $799 + 8 | 0;
     HEAP32[($4_1 + 235572 | 0) >> 2] = 53;
     HEAP32[($4_1 + 235568 | 0) >> 2] = 45;
     $12($809 | 0, $4_1 + 235572 | 0 | 0, $4_1 + 235568 | 0 | 0) | 0;
     $819 = $809 + 8 | 0;
     HEAP32[($4_1 + 235564 | 0) >> 2] = 61;
     HEAP32[($4_1 + 235560 | 0) >> 2] = 55;
     $12($819 | 0, $4_1 + 235564 | 0 | 0, $4_1 + 235560 | 0 | 0) | 0;
     $829 = $819 + 8 | 0;
     HEAP32[($4_1 + 235556 | 0) >> 2] = 62;
     HEAP32[($4_1 + 235552 | 0) >> 2] = 55;
     $12($829 | 0, $4_1 + 235556 | 0 | 0, $4_1 + 235552 | 0 | 0) | 0;
     $839 = $829 + 8 | 0;
     HEAP32[($4_1 + 235548 | 0) >> 2] = 62;
     HEAP32[($4_1 + 235544 | 0) >> 2] = 56;
     $12($839 | 0, $4_1 + 235548 | 0 | 0, $4_1 + 235544 | 0 | 0) | 0;
     HEAP32[($4_1 + 235540 | 0) >> 2] = 61;
     HEAP32[($4_1 + 235536 | 0) >> 2] = 56;
     $12($839 + 8 | 0 | 0, $4_1 + 235540 | 0 | 0, $4_1 + 235536 | 0 | 0) | 0;
     HEAP32[($4_1 + 236240 | 0) >> 2] = $4_1 + 235888 | 0;
     HEAP32[($4_1 + 236244 | 0) >> 2] = 44;
     i64toi32_i32$1 = HEAP32[($4_1 + 236240 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 236244 | 0) >> 2] | 0;
     $5778 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 25624 | 0) >> 2] = $5778;
     HEAP32[($4_1 + 25628 | 0) >> 2] = i64toi32_i32$0;
     $13($4_1 + 262472 | 0 | 0, $4_1 + 25624 | 0 | 0) | 0;
     $14($4_1 + 209920 | 0 | 0, $4_1 + 262472 | 0 | 0) | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 262464 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262468 | 0) >> 2] | 0;
     $5802 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 209912 | 0) >> 2] = $5802;
     HEAP32[($4_1 + 209916 | 0) >> 2] = i64toi32_i32$1;
     i64toi32_i32$1 = HEAP32[($4_1 + 209912 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 209916 | 0) >> 2] | 0;
     $5814 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 25632 | 0) >> 2] = $5814;
     HEAP32[($4_1 + 25636 | 0) >> 2] = i64toi32_i32$0;
     $15($4_1 + 209936 | 0 | 0, $5_1 | 0, $4_1 + 209920 | 0 | 0, $4_1 + 25632 | 0 | 0);
     $246($4_1 + 25640 | 0 | 0, $4_1 + 209936 | 0 | 0, 25600 | 0) | 0;
     $5($5_1 | 0, $4_1 + 25640 | 0 | 0);
     $16($4_1 + 209920 | 0 | 0) | 0;
     break label$1;
    case 2:
     $896 = $4_1 + 209552 | 0;
     HEAP32[($4_1 + 209548 | 0) >> 2] = 59;
     HEAP32[($4_1 + 209544 | 0) >> 2] = 7;
     $12($896 | 0, $4_1 + 209548 | 0 | 0, $4_1 + 209544 | 0 | 0) | 0;
     $906 = $896 + 8 | 0;
     HEAP32[($4_1 + 209540 | 0) >> 2] = 58;
     HEAP32[($4_1 + 209536 | 0) >> 2] = 7;
     $12($906 | 0, $4_1 + 209540 | 0 | 0, $4_1 + 209536 | 0 | 0) | 0;
     $916 = $906 + 8 | 0;
     HEAP32[($4_1 + 209532 | 0) >> 2] = 59;
     HEAP32[($4_1 + 209528 | 0) >> 2] = 8;
     $12($916 | 0, $4_1 + 209532 | 0 | 0, $4_1 + 209528 | 0 | 0) | 0;
     $926 = $916 + 8 | 0;
     HEAP32[($4_1 + 209524 | 0) >> 2] = 58;
     HEAP32[($4_1 + 209520 | 0) >> 2] = 8;
     $12($926 | 0, $4_1 + 209524 | 0 | 0, $4_1 + 209520 | 0 | 0) | 0;
     $936 = $926 + 8 | 0;
     HEAP32[($4_1 + 209516 | 0) >> 2] = 59;
     HEAP32[($4_1 + 209512 | 0) >> 2] = 16;
     $12($936 | 0, $4_1 + 209516 | 0 | 0, $4_1 + 209512 | 0 | 0) | 0;
     $946 = $936 + 8 | 0;
     HEAP32[($4_1 + 209508 | 0) >> 2] = 59;
     HEAP32[($4_1 + 209504 | 0) >> 2] = 17;
     $12($946 | 0, $4_1 + 209508 | 0 | 0, $4_1 + 209504 | 0 | 0) | 0;
     $956 = $946 + 8 | 0;
     HEAP32[($4_1 + 209500 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209496 | 0) >> 2] = 17;
     $12($956 | 0, $4_1 + 209500 | 0 | 0, $4_1 + 209496 | 0 | 0) | 0;
     $966 = $956 + 8 | 0;
     HEAP32[($4_1 + 209492 | 0) >> 2] = 58;
     HEAP32[($4_1 + 209488 | 0) >> 2] = 17;
     $12($966 | 0, $4_1 + 209492 | 0 | 0, $4_1 + 209488 | 0 | 0) | 0;
     $976 = $966 + 8 | 0;
     HEAP32[($4_1 + 209484 | 0) >> 2] = 58;
     HEAP32[($4_1 + 209480 | 0) >> 2] = 18;
     $12($976 | 0, $4_1 + 209484 | 0 | 0, $4_1 + 209480 | 0 | 0) | 0;
     $986 = $976 + 8 | 0;
     HEAP32[($4_1 + 209476 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209472 | 0) >> 2] = 18;
     $12($986 | 0, $4_1 + 209476 | 0 | 0, $4_1 + 209472 | 0 | 0) | 0;
     $996 = $986 + 8 | 0;
     HEAP32[($4_1 + 209468 | 0) >> 2] = 57;
     HEAP32[($4_1 + 209464 | 0) >> 2] = 18;
     $12($996 | 0, $4_1 + 209468 | 0 | 0, $4_1 + 209464 | 0 | 0) | 0;
     $1006 = $996 + 8 | 0;
     HEAP32[($4_1 + 209460 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209456 | 0) >> 2] = 21;
     $12($1006 | 0, $4_1 + 209460 | 0 | 0, $4_1 + 209456 | 0 | 0) | 0;
     $1016 = $1006 + 8 | 0;
     HEAP32[($4_1 + 209452 | 0) >> 2] = 64;
     HEAP32[($4_1 + 209448 | 0) >> 2] = 21;
     $12($1016 | 0, $4_1 + 209452 | 0 | 0, $4_1 + 209448 | 0 | 0) | 0;
     $1026 = $1016 + 8 | 0;
     HEAP32[($4_1 + 209444 | 0) >> 2] = 64;
     HEAP32[($4_1 + 209440 | 0) >> 2] = 17;
     $12($1026 | 0, $4_1 + 209444 | 0 | 0, $4_1 + 209440 | 0 | 0) | 0;
     $1036 = $1026 + 8 | 0;
     HEAP32[($4_1 + 209436 | 0) >> 2] = 66;
     HEAP32[($4_1 + 209432 | 0) >> 2] = 17;
     $12($1036 | 0, $4_1 + 209436 | 0 | 0, $4_1 + 209432 | 0 | 0) | 0;
     $1046 = $1036 + 8 | 0;
     HEAP32[($4_1 + 209428 | 0) >> 2] = 64;
     HEAP32[($4_1 + 209424 | 0) >> 2] = 18;
     $12($1046 | 0, $4_1 + 209428 | 0 | 0, $4_1 + 209424 | 0 | 0) | 0;
     $1056 = $1046 + 8 | 0;
     HEAP32[($4_1 + 209420 | 0) >> 2] = 65;
     HEAP32[($4_1 + 209416 | 0) >> 2] = 17;
     $12($1056 | 0, $4_1 + 209420 | 0 | 0, $4_1 + 209416 | 0 | 0) | 0;
     $1066 = $1056 + 8 | 0;
     HEAP32[($4_1 + 209412 | 0) >> 2] = 65;
     HEAP32[($4_1 + 209408 | 0) >> 2] = 16;
     $12($1066 | 0, $4_1 + 209412 | 0 | 0, $4_1 + 209408 | 0 | 0) | 0;
     $1076 = $1066 + 8 | 0;
     HEAP32[($4_1 + 209404 | 0) >> 2] = 66;
     HEAP32[($4_1 + 209400 | 0) >> 2] = 18;
     $12($1076 | 0, $4_1 + 209404 | 0 | 0, $4_1 + 209400 | 0 | 0) | 0;
     $1086 = $1076 + 8 | 0;
     HEAP32[($4_1 + 209396 | 0) >> 2] = 67;
     HEAP32[($4_1 + 209392 | 0) >> 2] = 18;
     $12($1086 | 0, $4_1 + 209396 | 0 | 0, $4_1 + 209392 | 0 | 0) | 0;
     $1096 = $1086 + 8 | 0;
     HEAP32[($4_1 + 209388 | 0) >> 2] = 64;
     HEAP32[($4_1 + 209384 | 0) >> 2] = 22;
     $12($1096 | 0, $4_1 + 209388 | 0 | 0, $4_1 + 209384 | 0 | 0) | 0;
     $1106 = $1096 + 8 | 0;
     HEAP32[($4_1 + 209380 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209376 | 0) >> 2] = 22;
     $12($1106 | 0, $4_1 + 209380 | 0 | 0, $4_1 + 209376 | 0 | 0) | 0;
     $1116 = $1106 + 8 | 0;
     HEAP32[($4_1 + 209372 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209368 | 0) >> 2] = 41;
     $12($1116 | 0, $4_1 + 209372 | 0 | 0, $4_1 + 209368 | 0 | 0) | 0;
     $1126 = $1116 + 8 | 0;
     HEAP32[($4_1 + 209364 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209360 | 0) >> 2] = 42;
     $12($1126 | 0, $4_1 + 209364 | 0 | 0, $4_1 + 209360 | 0 | 0) | 0;
     $1136 = $1126 + 8 | 0;
     HEAP32[($4_1 + 209356 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209352 | 0) >> 2] = 45;
     $12($1136 | 0, $4_1 + 209356 | 0 | 0, $4_1 + 209352 | 0 | 0) | 0;
     $1146 = $1136 + 8 | 0;
     HEAP32[($4_1 + 209348 | 0) >> 2] = 60;
     HEAP32[($4_1 + 209344 | 0) >> 2] = 46;
     $12($1146 | 0, $4_1 + 209348 | 0 | 0, $4_1 + 209344 | 0 | 0) | 0;
     $1156 = $1146 + 8 | 0;
     HEAP32[($4_1 + 209340 | 0) >> 2] = 61;
     HEAP32[($4_1 + 209336 | 0) >> 2] = 46;
     $12($1156 | 0, $4_1 + 209340 | 0 | 0, $4_1 + 209336 | 0 | 0) | 0;
     $1166 = $1156 + 8 | 0;
     HEAP32[($4_1 + 209332 | 0) >> 2] = 62;
     HEAP32[($4_1 + 209328 | 0) >> 2] = 46;
     $12($1166 | 0, $4_1 + 209332 | 0 | 0, $4_1 + 209328 | 0 | 0) | 0;
     $1176 = $1166 + 8 | 0;
     HEAP32[($4_1 + 209324 | 0) >> 2] = 61;
     HEAP32[($4_1 + 209320 | 0) >> 2] = 47;
     $12($1176 | 0, $4_1 + 209324 | 0 | 0, $4_1 + 209320 | 0 | 0) | 0;
     $1186 = $1176 + 8 | 0;
     HEAP32[($4_1 + 209316 | 0) >> 2] = 63;
     HEAP32[($4_1 + 209312 | 0) >> 2] = 45;
     $12($1186 | 0, $4_1 + 209316 | 0 | 0, $4_1 + 209312 | 0 | 0) | 0;
     $1196 = $1186 + 8 | 0;
     HEAP32[($4_1 + 209308 | 0) >> 2] = 62;
     HEAP32[($4_1 + 209304 | 0) >> 2] = 45;
     $12($1196 | 0, $4_1 + 209308 | 0 | 0, $4_1 + 209304 | 0 | 0) | 0;
     $1206 = $1196 + 8 | 0;
     HEAP32[($4_1 + 209300 | 0) >> 2] = 56;
     HEAP32[($4_1 + 209296 | 0) >> 2] = 41;
     $12($1206 | 0, $4_1 + 209300 | 0 | 0, $4_1 + 209296 | 0 | 0) | 0;
     $1216 = $1206 + 8 | 0;
     HEAP32[($4_1 + 209292 | 0) >> 2] = 56;
     HEAP32[($4_1 + 209288 | 0) >> 2] = 42;
     $12($1216 | 0, $4_1 + 209292 | 0 | 0, $4_1 + 209288 | 0 | 0) | 0;
     $1226 = $1216 + 8 | 0;
     HEAP32[($4_1 + 209284 | 0) >> 2] = 56;
     HEAP32[($4_1 + 209280 | 0) >> 2] = 45;
     $12($1226 | 0, $4_1 + 209284 | 0 | 0, $4_1 + 209280 | 0 | 0) | 0;
     $1236 = $1226 + 8 | 0;
     HEAP32[($4_1 + 209276 | 0) >> 2] = 56;
     HEAP32[($4_1 + 209272 | 0) >> 2] = 46;
     $12($1236 | 0, $4_1 + 209276 | 0 | 0, $4_1 + 209272 | 0 | 0) | 0;
     $1246 = $1236 + 8 | 0;
     HEAP32[($4_1 + 209268 | 0) >> 2] = 55;
     HEAP32[($4_1 + 209264 | 0) >> 2] = 46;
     $12($1246 | 0, $4_1 + 209268 | 0 | 0, $4_1 + 209264 | 0 | 0) | 0;
     $1256 = $1246 + 8 | 0;
     HEAP32[($4_1 + 209260 | 0) >> 2] = 54;
     HEAP32[($4_1 + 209256 | 0) >> 2] = 46;
     $12($1256 | 0, $4_1 + 209260 | 0 | 0, $4_1 + 209256 | 0 | 0) | 0;
     $1266 = $1256 + 8 | 0;
     HEAP32[($4_1 + 209252 | 0) >> 2] = 54;
     HEAP32[($4_1 + 209248 | 0) >> 2] = 45;
     $12($1266 | 0, $4_1 + 209252 | 0 | 0, $4_1 + 209248 | 0 | 0) | 0;
     $1276 = $1266 + 8 | 0;
     HEAP32[($4_1 + 209244 | 0) >> 2] = 55;
     HEAP32[($4_1 + 209240 | 0) >> 2] = 47;
     $12($1276 | 0, $4_1 + 209244 | 0 | 0, $4_1 + 209240 | 0 | 0) | 0;
     $1286 = $1276 + 8 | 0;
     HEAP32[($4_1 + 209236 | 0) >> 2] = 53;
     HEAP32[($4_1 + 209232 | 0) >> 2] = 45;
     $12($1286 | 0, $4_1 + 209236 | 0 | 0, $4_1 + 209232 | 0 | 0) | 0;
     $1296 = $1286 + 8 | 0;
     HEAP32[($4_1 + 209228 | 0) >> 2] = 61;
     HEAP32[($4_1 + 209224 | 0) >> 2] = 55;
     $12($1296 | 0, $4_1 + 209228 | 0 | 0, $4_1 + 209224 | 0 | 0) | 0;
     $1306 = $1296 + 8 | 0;
     HEAP32[($4_1 + 209220 | 0) >> 2] = 62;
     HEAP32[($4_1 + 209216 | 0) >> 2] = 55;
     $12($1306 | 0, $4_1 + 209220 | 0 | 0, $4_1 + 209216 | 0 | 0) | 0;
     $1316 = $1306 + 8 | 0;
     HEAP32[($4_1 + 209212 | 0) >> 2] = 62;
     HEAP32[($4_1 + 209208 | 0) >> 2] = 56;
     $12($1316 | 0, $4_1 + 209212 | 0 | 0, $4_1 + 209208 | 0 | 0) | 0;
     HEAP32[($4_1 + 209204 | 0) >> 2] = 61;
     HEAP32[($4_1 + 209200 | 0) >> 2] = 56;
     $12($1316 + 8 | 0 | 0, $4_1 + 209204 | 0 | 0, $4_1 + 209200 | 0 | 0) | 0;
     HEAP32[($4_1 + 209904 | 0) >> 2] = $4_1 + 209552 | 0;
     HEAP32[($4_1 + 209908 | 0) >> 2] = 44;
     i64toi32_i32$0 = HEAP32[($4_1 + 209904 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 209908 | 0) >> 2] | 0;
     $6701 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 51240 | 0) >> 2] = $6701;
     HEAP32[($4_1 + 51244 | 0) >> 2] = i64toi32_i32$1;
     $13($4_1 + 262472 | 0 | 0, $4_1 + 51240 | 0 | 0) | 0;
     $14($4_1 + 183584 | 0 | 0, $4_1 + 262472 | 0 | 0) | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262464 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 262468 | 0) >> 2] | 0;
     $6725 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 183576 | 0) >> 2] = $6725;
     HEAP32[($4_1 + 183580 | 0) >> 2] = i64toi32_i32$0;
     i64toi32_i32$0 = HEAP32[($4_1 + 183576 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 183580 | 0) >> 2] | 0;
     $6737 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 51248 | 0) >> 2] = $6737;
     HEAP32[($4_1 + 51252 | 0) >> 2] = i64toi32_i32$1;
     $15($4_1 + 183600 | 0 | 0, $5_1 | 0, $4_1 + 183584 | 0 | 0, $4_1 + 51248 | 0 | 0);
     $246($4_1 + 51256 | 0 | 0, $4_1 + 183600 | 0 | 0, 25600 | 0) | 0;
     $5($5_1 | 0, $4_1 + 51256 | 0 | 0);
     $16($4_1 + 183584 | 0 | 0) | 0;
     break label$1;
    case 3:
     $1373 = $4_1 + 183280 | 0;
     HEAP32[($4_1 + 183276 | 0) >> 2] = 71;
     HEAP32[($4_1 + 183272 | 0) >> 2] = 6;
     $12($1373 | 0, $4_1 + 183276 | 0 | 0, $4_1 + 183272 | 0 | 0) | 0;
     $1383 = $1373 + 8 | 0;
     HEAP32[($4_1 + 183268 | 0) >> 2] = 70;
     HEAP32[($4_1 + 183264 | 0) >> 2] = 6;
     $12($1383 | 0, $4_1 + 183268 | 0 | 0, $4_1 + 183264 | 0 | 0) | 0;
     $1393 = $1383 + 8 | 0;
     HEAP32[($4_1 + 183260 | 0) >> 2] = 70;
     HEAP32[($4_1 + 183256 | 0) >> 2] = 7;
     $12($1393 | 0, $4_1 + 183260 | 0 | 0, $4_1 + 183256 | 0 | 0) | 0;
     $1403 = $1393 + 8 | 0;
     HEAP32[($4_1 + 183252 | 0) >> 2] = 71;
     HEAP32[($4_1 + 183248 | 0) >> 2] = 7;
     $12($1403 | 0, $4_1 + 183252 | 0 | 0, $4_1 + 183248 | 0 | 0) | 0;
     $1413 = $1403 + 8 | 0;
     HEAP32[($4_1 + 183244 | 0) >> 2] = 68;
     HEAP32[($4_1 + 183240 | 0) >> 2] = 10;
     $12($1413 | 0, $4_1 + 183244 | 0 | 0, $4_1 + 183240 | 0 | 0) | 0;
     $1423 = $1413 + 8 | 0;
     HEAP32[($4_1 + 183236 | 0) >> 2] = 68;
     HEAP32[($4_1 + 183232 | 0) >> 2] = 11;
     $12($1423 | 0, $4_1 + 183236 | 0 | 0, $4_1 + 183232 | 0 | 0) | 0;
     $1433 = $1423 + 8 | 0;
     HEAP32[($4_1 + 183228 | 0) >> 2] = 67;
     HEAP32[($4_1 + 183224 | 0) >> 2] = 11;
     $12($1433 | 0, $4_1 + 183228 | 0 | 0, $4_1 + 183224 | 0 | 0) | 0;
     $1443 = $1433 + 8 | 0;
     HEAP32[($4_1 + 183220 | 0) >> 2] = 67;
     HEAP32[($4_1 + 183216 | 0) >> 2] = 10;
     $12($1443 | 0, $4_1 + 183220 | 0 | 0, $4_1 + 183216 | 0 | 0) | 0;
     $1453 = $1443 + 8 | 0;
     HEAP32[($4_1 + 183212 | 0) >> 2] = 70;
     HEAP32[($4_1 + 183208 | 0) >> 2] = 13;
     $12($1453 | 0, $4_1 + 183212 | 0 | 0, $4_1 + 183208 | 0 | 0) | 0;
     $1463 = $1453 + 8 | 0;
     HEAP32[($4_1 + 183204 | 0) >> 2] = 71;
     HEAP32[($4_1 + 183200 | 0) >> 2] = 13;
     $12($1463 | 0, $4_1 + 183204 | 0 | 0, $4_1 + 183200 | 0 | 0) | 0;
     $1473 = $1463 + 8 | 0;
     HEAP32[($4_1 + 183196 | 0) >> 2] = 71;
     HEAP32[($4_1 + 183192 | 0) >> 2] = 14;
     $12($1473 | 0, $4_1 + 183196 | 0 | 0, $4_1 + 183192 | 0 | 0) | 0;
     $1483 = $1473 + 8 | 0;
     HEAP32[($4_1 + 183188 | 0) >> 2] = 70;
     HEAP32[($4_1 + 183184 | 0) >> 2] = 14;
     $12($1483 | 0, $4_1 + 183188 | 0 | 0, $4_1 + 183184 | 0 | 0) | 0;
     $1493 = $1483 + 8 | 0;
     HEAP32[($4_1 + 183180 | 0) >> 2] = 62;
     HEAP32[($4_1 + 183176 | 0) >> 2] = 28;
     $12($1493 | 0, $4_1 + 183180 | 0 | 0, $4_1 + 183176 | 0 | 0) | 0;
     $1503 = $1493 + 8 | 0;
     HEAP32[($4_1 + 183172 | 0) >> 2] = 61;
     HEAP32[($4_1 + 183168 | 0) >> 2] = 27;
     $12($1503 | 0, $4_1 + 183172 | 0 | 0, $4_1 + 183168 | 0 | 0) | 0;
     $1513 = $1503 + 8 | 0;
     HEAP32[($4_1 + 183164 | 0) >> 2] = 60;
     HEAP32[($4_1 + 183160 | 0) >> 2] = 27;
     $12($1513 | 0, $4_1 + 183164 | 0 | 0, $4_1 + 183160 | 0 | 0) | 0;
     $1523 = $1513 + 8 | 0;
     HEAP32[($4_1 + 183156 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183152 | 0) >> 2] = 27;
     $12($1523 | 0, $4_1 + 183156 | 0 | 0, $4_1 + 183152 | 0 | 0) | 0;
     $1533 = $1523 + 8 | 0;
     HEAP32[($4_1 + 183148 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183144 | 0) >> 2] = 28;
     $12($1533 | 0, $4_1 + 183148 | 0 | 0, $4_1 + 183144 | 0 | 0) | 0;
     $1543 = $1533 + 8 | 0;
     HEAP32[($4_1 + 183140 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183136 | 0) >> 2] = 29;
     $12($1543 | 0, $4_1 + 183140 | 0 | 0, $4_1 + 183136 | 0 | 0) | 0;
     $1553 = $1543 + 8 | 0;
     HEAP32[($4_1 + 183132 | 0) >> 2] = 62;
     HEAP32[($4_1 + 183128 | 0) >> 2] = 29;
     $12($1553 | 0, $4_1 + 183132 | 0 | 0, $4_1 + 183128 | 0 | 0) | 0;
     $1563 = $1553 + 8 | 0;
     HEAP32[($4_1 + 183124 | 0) >> 2] = 62;
     HEAP32[($4_1 + 183120 | 0) >> 2] = 31;
     $12($1563 | 0, $4_1 + 183124 | 0 | 0, $4_1 + 183120 | 0 | 0) | 0;
     $1573 = $1563 + 8 | 0;
     HEAP32[($4_1 + 183116 | 0) >> 2] = 62;
     HEAP32[($4_1 + 183112 | 0) >> 2] = 32;
     $12($1573 | 0, $4_1 + 183116 | 0 | 0, $4_1 + 183112 | 0 | 0) | 0;
     $1583 = $1573 + 8 | 0;
     HEAP32[($4_1 + 183108 | 0) >> 2] = 61;
     HEAP32[($4_1 + 183104 | 0) >> 2] = 33;
     $12($1583 | 0, $4_1 + 183108 | 0 | 0, $4_1 + 183104 | 0 | 0) | 0;
     $1593 = $1583 + 8 | 0;
     HEAP32[($4_1 + 183100 | 0) >> 2] = 60;
     HEAP32[($4_1 + 183096 | 0) >> 2] = 34;
     $12($1593 | 0, $4_1 + 183100 | 0 | 0, $4_1 + 183096 | 0 | 0) | 0;
     $1603 = $1593 + 8 | 0;
     HEAP32[($4_1 + 183092 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183088 | 0) >> 2] = 33;
     $12($1603 | 0, $4_1 + 183092 | 0 | 0, $4_1 + 183088 | 0 | 0) | 0;
     $1613 = $1603 + 8 | 0;
     HEAP32[($4_1 + 183084 | 0) >> 2] = 58;
     HEAP32[($4_1 + 183080 | 0) >> 2] = 32;
     $12($1613 | 0, $4_1 + 183084 | 0 | 0, $4_1 + 183080 | 0 | 0) | 0;
     $1623 = $1613 + 8 | 0;
     HEAP32[($4_1 + 183076 | 0) >> 2] = 60;
     HEAP32[($4_1 + 183072 | 0) >> 2] = 37;
     $12($1623 | 0, $4_1 + 183076 | 0 | 0, $4_1 + 183072 | 0 | 0) | 0;
     $1633 = $1623 + 8 | 0;
     HEAP32[($4_1 + 183068 | 0) >> 2] = 60;
     HEAP32[($4_1 + 183064 | 0) >> 2] = 38;
     $12($1633 | 0, $4_1 + 183068 | 0 | 0, $4_1 + 183064 | 0 | 0) | 0;
     $1643 = $1633 + 8 | 0;
     HEAP32[($4_1 + 183060 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183056 | 0) >> 2] = 38;
     $12($1643 | 0, $4_1 + 183060 | 0 | 0, $4_1 + 183056 | 0 | 0) | 0;
     $1653 = $1643 + 8 | 0;
     HEAP32[($4_1 + 183052 | 0) >> 2] = 59;
     HEAP32[($4_1 + 183048 | 0) >> 2] = 37;
     $12($1653 | 0, $4_1 + 183052 | 0 | 0, $4_1 + 183048 | 0 | 0) | 0;
     $1663 = $1653 + 8 | 0;
     HEAP32[($4_1 + 183044 | 0) >> 2] = 54;
     HEAP32[($4_1 + 183040 | 0) >> 2] = 27;
     $12($1663 | 0, $4_1 + 183044 | 0 | 0, $4_1 + 183040 | 0 | 0) | 0;
     $1673 = $1663 + 8 | 0;
     HEAP32[($4_1 + 183036 | 0) >> 2] = 54;
     HEAP32[($4_1 + 183032 | 0) >> 2] = 26;
     $12($1673 | 0, $4_1 + 183036 | 0 | 0, $4_1 + 183032 | 0 | 0) | 0;
     $1683 = $1673 + 8 | 0;
     HEAP32[($4_1 + 183028 | 0) >> 2] = 53;
     HEAP32[($4_1 + 183024 | 0) >> 2] = 26;
     $12($1683 | 0, $4_1 + 183028 | 0 | 0, $4_1 + 183024 | 0 | 0) | 0;
     $1693 = $1683 + 8 | 0;
     HEAP32[($4_1 + 183020 | 0) >> 2] = 52;
     HEAP32[($4_1 + 183016 | 0) >> 2] = 27;
     $12($1693 | 0, $4_1 + 183020 | 0 | 0, $4_1 + 183016 | 0 | 0) | 0;
     $1703 = $1693 + 8 | 0;
     HEAP32[($4_1 + 183012 | 0) >> 2] = 52;
     HEAP32[($4_1 + 183008 | 0) >> 2] = 28;
     $12($1703 | 0, $4_1 + 183012 | 0 | 0, $4_1 + 183008 | 0 | 0) | 0;
     $1713 = $1703 + 8 | 0;
     HEAP32[($4_1 + 183004 | 0) >> 2] = 52;
     HEAP32[($4_1 + 183e3 | 0) >> 2] = 29;
     $12($1713 | 0, $4_1 + 183004 | 0 | 0, $4_1 + 183e3 | 0 | 0) | 0;
     HEAP32[($4_1 + 182996 | 0) >> 2] = 51;
     HEAP32[($4_1 + 182992 | 0) >> 2] = 29;
     $12($1713 + 8 | 0 | 0, $4_1 + 182996 | 0 | 0, $4_1 + 182992 | 0 | 0) | 0;
     HEAP32[($4_1 + 183568 | 0) >> 2] = $4_1 + 183280 | 0;
     HEAP32[($4_1 + 183572 | 0) >> 2] = 36;
     i64toi32_i32$1 = HEAP32[($4_1 + 183568 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 183572 | 0) >> 2] | 0;
     $7472 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 76856 | 0) >> 2] = $7472;
     HEAP32[($4_1 + 76860 | 0) >> 2] = i64toi32_i32$0;
     $13($4_1 + 262472 | 0 | 0, $4_1 + 76856 | 0 | 0) | 0;
     $14($4_1 + 157376 | 0 | 0, $4_1 + 262472 | 0 | 0) | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 262464 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262468 | 0) >> 2] | 0;
     $7496 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 157368 | 0) >> 2] = $7496;
     HEAP32[($4_1 + 157372 | 0) >> 2] = i64toi32_i32$1;
     i64toi32_i32$1 = HEAP32[($4_1 + 157368 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 157372 | 0) >> 2] | 0;
     $7508 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 76864 | 0) >> 2] = $7508;
     HEAP32[($4_1 + 76868 | 0) >> 2] = i64toi32_i32$0;
     $15($4_1 + 157392 | 0 | 0, $5_1 | 0, $4_1 + 157376 | 0 | 0, $4_1 + 76864 | 0 | 0);
     $246($4_1 + 76872 | 0 | 0, $4_1 + 157392 | 0 | 0, 25600 | 0) | 0;
     $5($5_1 | 0, $4_1 + 76872 | 0 | 0);
     $16($4_1 + 157376 | 0 | 0) | 0;
     break label$1;
    case 4:
     $1770 = $4_1 + 155536 | 0;
     HEAP32[($4_1 + 155532 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155528 | 0) >> 2] = 15;
     $12($1770 | 0, $4_1 + 155532 | 0 | 0, $4_1 + 155528 | 0 | 0) | 0;
     $1780 = $1770 + 8 | 0;
     HEAP32[($4_1 + 155524 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155520 | 0) >> 2] = 16;
     $12($1780 | 0, $4_1 + 155524 | 0 | 0, $4_1 + 155520 | 0 | 0) | 0;
     $1790 = $1780 + 8 | 0;
     HEAP32[($4_1 + 155516 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155512 | 0) >> 2] = 21;
     $12($1790 | 0, $4_1 + 155516 | 0 | 0, $4_1 + 155512 | 0 | 0) | 0;
     $1800 = $1790 + 8 | 0;
     HEAP32[($4_1 + 155508 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155504 | 0) >> 2] = 22;
     $12($1800 | 0, $4_1 + 155508 | 0 | 0, $4_1 + 155504 | 0 | 0) | 0;
     $1810 = $1800 + 8 | 0;
     HEAP32[($4_1 + 155500 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155496 | 0) >> 2] = 25;
     $12($1810 | 0, $4_1 + 155500 | 0 | 0, $4_1 + 155496 | 0 | 0) | 0;
     $1820 = $1810 + 8 | 0;
     HEAP32[($4_1 + 155492 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155488 | 0) >> 2] = 26;
     $12($1820 | 0, $4_1 + 155492 | 0 | 0, $4_1 + 155488 | 0 | 0) | 0;
     $1830 = $1820 + 8 | 0;
     HEAP32[($4_1 + 155484 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155480 | 0) >> 2] = 31;
     $12($1830 | 0, $4_1 + 155484 | 0 | 0, $4_1 + 155480 | 0 | 0) | 0;
     $1840 = $1830 + 8 | 0;
     HEAP32[($4_1 + 155476 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155472 | 0) >> 2] = 32;
     $12($1840 | 0, $4_1 + 155476 | 0 | 0, $4_1 + 155472 | 0 | 0) | 0;
     $1850 = $1840 + 8 | 0;
     HEAP32[($4_1 + 155468 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155464 | 0) >> 2] = 35;
     $12($1850 | 0, $4_1 + 155468 | 0 | 0, $4_1 + 155464 | 0 | 0) | 0;
     $1860 = $1850 + 8 | 0;
     HEAP32[($4_1 + 155460 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155456 | 0) >> 2] = 36;
     $12($1860 | 0, $4_1 + 155460 | 0 | 0, $4_1 + 155456 | 0 | 0) | 0;
     $1870 = $1860 + 8 | 0;
     HEAP32[($4_1 + 155452 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155448 | 0) >> 2] = 41;
     $12($1870 | 0, $4_1 + 155452 | 0 | 0, $4_1 + 155448 | 0 | 0) | 0;
     $1880 = $1870 + 8 | 0;
     HEAP32[($4_1 + 155444 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155440 | 0) >> 2] = 42;
     $12($1880 | 0, $4_1 + 155444 | 0 | 0, $4_1 + 155440 | 0 | 0) | 0;
     $1890 = $1880 + 8 | 0;
     HEAP32[($4_1 + 155436 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155432 | 0) >> 2] = 45;
     $12($1890 | 0, $4_1 + 155436 | 0 | 0, $4_1 + 155432 | 0 | 0) | 0;
     $1900 = $1890 + 8 | 0;
     HEAP32[($4_1 + 155428 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155424 | 0) >> 2] = 46;
     $12($1900 | 0, $4_1 + 155428 | 0 | 0, $4_1 + 155424 | 0 | 0) | 0;
     $1910 = $1900 + 8 | 0;
     HEAP32[($4_1 + 155420 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155416 | 0) >> 2] = 51;
     $12($1910 | 0, $4_1 + 155420 | 0 | 0, $4_1 + 155416 | 0 | 0) | 0;
     $1920 = $1910 + 8 | 0;
     HEAP32[($4_1 + 155412 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155408 | 0) >> 2] = 52;
     $12($1920 | 0, $4_1 + 155412 | 0 | 0, $4_1 + 155408 | 0 | 0) | 0;
     $1930 = $1920 + 8 | 0;
     HEAP32[($4_1 + 155404 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155400 | 0) >> 2] = 55;
     $12($1930 | 0, $4_1 + 155404 | 0 | 0, $4_1 + 155400 | 0 | 0) | 0;
     $1940 = $1930 + 8 | 0;
     HEAP32[($4_1 + 155396 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155392 | 0) >> 2] = 56;
     $12($1940 | 0, $4_1 + 155396 | 0 | 0, $4_1 + 155392 | 0 | 0) | 0;
     $1950 = $1940 + 8 | 0;
     HEAP32[($4_1 + 155388 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155384 | 0) >> 2] = 61;
     $12($1950 | 0, $4_1 + 155388 | 0 | 0, $4_1 + 155384 | 0 | 0) | 0;
     $1960 = $1950 + 8 | 0;
     HEAP32[($4_1 + 155380 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155376 | 0) >> 2] = 62;
     $12($1960 | 0, $4_1 + 155380 | 0 | 0, $4_1 + 155376 | 0 | 0) | 0;
     $1970 = $1960 + 8 | 0;
     HEAP32[($4_1 + 155372 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155368 | 0) >> 2] = 65;
     $12($1970 | 0, $4_1 + 155372 | 0 | 0, $4_1 + 155368 | 0 | 0) | 0;
     $1980 = $1970 + 8 | 0;
     HEAP32[($4_1 + 155364 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155360 | 0) >> 2] = 66;
     $12($1980 | 0, $4_1 + 155364 | 0 | 0, $4_1 + 155360 | 0 | 0) | 0;
     $1990 = $1980 + 8 | 0;
     HEAP32[($4_1 + 155356 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155352 | 0) >> 2] = 71;
     $12($1990 | 0, $4_1 + 155356 | 0 | 0, $4_1 + 155352 | 0 | 0) | 0;
     $2000 = $1990 + 8 | 0;
     HEAP32[($4_1 + 155348 | 0) >> 2] = 73;
     HEAP32[($4_1 + 155344 | 0) >> 2] = 72;
     $12($2000 | 0, $4_1 + 155348 | 0 | 0, $4_1 + 155344 | 0 | 0) | 0;
     $2010 = $2000 + 8 | 0;
     HEAP32[($4_1 + 155340 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155336 | 0) >> 2] = 15;
     $12($2010 | 0, $4_1 + 155340 | 0 | 0, $4_1 + 155336 | 0 | 0) | 0;
     $2020 = $2010 + 8 | 0;
     HEAP32[($4_1 + 155332 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155328 | 0) >> 2] = 17;
     $12($2020 | 0, $4_1 + 155332 | 0 | 0, $4_1 + 155328 | 0 | 0) | 0;
     $2030 = $2020 + 8 | 0;
     HEAP32[($4_1 + 155324 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155320 | 0) >> 2] = 20;
     $12($2030 | 0, $4_1 + 155324 | 0 | 0, $4_1 + 155320 | 0 | 0) | 0;
     $2040 = $2030 + 8 | 0;
     HEAP32[($4_1 + 155316 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155312 | 0) >> 2] = 22;
     $12($2040 | 0, $4_1 + 155316 | 0 | 0, $4_1 + 155312 | 0 | 0) | 0;
     $2050 = $2040 + 8 | 0;
     HEAP32[($4_1 + 155308 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155304 | 0) >> 2] = 25;
     $12($2050 | 0, $4_1 + 155308 | 0 | 0, $4_1 + 155304 | 0 | 0) | 0;
     $2060 = $2050 + 8 | 0;
     HEAP32[($4_1 + 155300 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155296 | 0) >> 2] = 27;
     $12($2060 | 0, $4_1 + 155300 | 0 | 0, $4_1 + 155296 | 0 | 0) | 0;
     $2070 = $2060 + 8 | 0;
     HEAP32[($4_1 + 155292 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155288 | 0) >> 2] = 30;
     $12($2070 | 0, $4_1 + 155292 | 0 | 0, $4_1 + 155288 | 0 | 0) | 0;
     $2080 = $2070 + 8 | 0;
     HEAP32[($4_1 + 155284 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155280 | 0) >> 2] = 32;
     $12($2080 | 0, $4_1 + 155284 | 0 | 0, $4_1 + 155280 | 0 | 0) | 0;
     $2090 = $2080 + 8 | 0;
     HEAP32[($4_1 + 155276 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155272 | 0) >> 2] = 35;
     $12($2090 | 0, $4_1 + 155276 | 0 | 0, $4_1 + 155272 | 0 | 0) | 0;
     $2100 = $2090 + 8 | 0;
     HEAP32[($4_1 + 155268 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155264 | 0) >> 2] = 37;
     $12($2100 | 0, $4_1 + 155268 | 0 | 0, $4_1 + 155264 | 0 | 0) | 0;
     $2110 = $2100 + 8 | 0;
     HEAP32[($4_1 + 155260 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155256 | 0) >> 2] = 40;
     $12($2110 | 0, $4_1 + 155260 | 0 | 0, $4_1 + 155256 | 0 | 0) | 0;
     $2120 = $2110 + 8 | 0;
     HEAP32[($4_1 + 155252 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155248 | 0) >> 2] = 42;
     $12($2120 | 0, $4_1 + 155252 | 0 | 0, $4_1 + 155248 | 0 | 0) | 0;
     $2130 = $2120 + 8 | 0;
     HEAP32[($4_1 + 155244 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155240 | 0) >> 2] = 45;
     $12($2130 | 0, $4_1 + 155244 | 0 | 0, $4_1 + 155240 | 0 | 0) | 0;
     $2140 = $2130 + 8 | 0;
     HEAP32[($4_1 + 155236 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155232 | 0) >> 2] = 47;
     $12($2140 | 0, $4_1 + 155236 | 0 | 0, $4_1 + 155232 | 0 | 0) | 0;
     $2150 = $2140 + 8 | 0;
     HEAP32[($4_1 + 155228 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155224 | 0) >> 2] = 50;
     $12($2150 | 0, $4_1 + 155228 | 0 | 0, $4_1 + 155224 | 0 | 0) | 0;
     $2160 = $2150 + 8 | 0;
     HEAP32[($4_1 + 155220 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155216 | 0) >> 2] = 52;
     $12($2160 | 0, $4_1 + 155220 | 0 | 0, $4_1 + 155216 | 0 | 0) | 0;
     $2170 = $2160 + 8 | 0;
     HEAP32[($4_1 + 155212 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155208 | 0) >> 2] = 55;
     $12($2170 | 0, $4_1 + 155212 | 0 | 0, $4_1 + 155208 | 0 | 0) | 0;
     $2180 = $2170 + 8 | 0;
     HEAP32[($4_1 + 155204 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155200 | 0) >> 2] = 57;
     $12($2180 | 0, $4_1 + 155204 | 0 | 0, $4_1 + 155200 | 0 | 0) | 0;
     $2190 = $2180 + 8 | 0;
     HEAP32[($4_1 + 155196 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155192 | 0) >> 2] = 60;
     $12($2190 | 0, $4_1 + 155196 | 0 | 0, $4_1 + 155192 | 0 | 0) | 0;
     $2200 = $2190 + 8 | 0;
     HEAP32[($4_1 + 155188 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155184 | 0) >> 2] = 62;
     $12($2200 | 0, $4_1 + 155188 | 0 | 0, $4_1 + 155184 | 0 | 0) | 0;
     $2210 = $2200 + 8 | 0;
     HEAP32[($4_1 + 155180 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155176 | 0) >> 2] = 65;
     $12($2210 | 0, $4_1 + 155180 | 0 | 0, $4_1 + 155176 | 0 | 0) | 0;
     $2220 = $2210 + 8 | 0;
     HEAP32[($4_1 + 155172 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155168 | 0) >> 2] = 67;
     $12($2220 | 0, $4_1 + 155172 | 0 | 0, $4_1 + 155168 | 0 | 0) | 0;
     $2230 = $2220 + 8 | 0;
     HEAP32[($4_1 + 155164 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155160 | 0) >> 2] = 70;
     $12($2230 | 0, $4_1 + 155164 | 0 | 0, $4_1 + 155160 | 0 | 0) | 0;
     $2240 = $2230 + 8 | 0;
     HEAP32[($4_1 + 155156 | 0) >> 2] = 72;
     HEAP32[($4_1 + 155152 | 0) >> 2] = 72;
     $12($2240 | 0, $4_1 + 155156 | 0 | 0, $4_1 + 155152 | 0 | 0) | 0;
     $2250 = $2240 + 8 | 0;
     HEAP32[($4_1 + 155148 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155144 | 0) >> 2] = 17;
     $12($2250 | 0, $4_1 + 155148 | 0 | 0, $4_1 + 155144 | 0 | 0) | 0;
     $2260 = $2250 + 8 | 0;
     HEAP32[($4_1 + 155140 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155136 | 0) >> 2] = 18;
     $12($2260 | 0, $4_1 + 155140 | 0 | 0, $4_1 + 155136 | 0 | 0) | 0;
     $2270 = $2260 + 8 | 0;
     HEAP32[($4_1 + 155132 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155128 | 0) >> 2] = 19;
     $12($2270 | 0, $4_1 + 155132 | 0 | 0, $4_1 + 155128 | 0 | 0) | 0;
     $2280 = $2270 + 8 | 0;
     HEAP32[($4_1 + 155124 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155120 | 0) >> 2] = 20;
     $12($2280 | 0, $4_1 + 155124 | 0 | 0, $4_1 + 155120 | 0 | 0) | 0;
     $2290 = $2280 + 8 | 0;
     HEAP32[($4_1 + 155116 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155112 | 0) >> 2] = 27;
     $12($2290 | 0, $4_1 + 155116 | 0 | 0, $4_1 + 155112 | 0 | 0) | 0;
     $2300 = $2290 + 8 | 0;
     HEAP32[($4_1 + 155108 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155104 | 0) >> 2] = 30;
     $12($2300 | 0, $4_1 + 155108 | 0 | 0, $4_1 + 155104 | 0 | 0) | 0;
     $2310 = $2300 + 8 | 0;
     HEAP32[($4_1 + 155100 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155096 | 0) >> 2] = 37;
     $12($2310 | 0, $4_1 + 155100 | 0 | 0, $4_1 + 155096 | 0 | 0) | 0;
     $2320 = $2310 + 8 | 0;
     HEAP32[($4_1 + 155092 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155088 | 0) >> 2] = 38;
     $12($2320 | 0, $4_1 + 155092 | 0 | 0, $4_1 + 155088 | 0 | 0) | 0;
     $2330 = $2320 + 8 | 0;
     HEAP32[($4_1 + 155084 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155080 | 0) >> 2] = 39;
     $12($2330 | 0, $4_1 + 155084 | 0 | 0, $4_1 + 155080 | 0 | 0) | 0;
     $2340 = $2330 + 8 | 0;
     HEAP32[($4_1 + 155076 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155072 | 0) >> 2] = 40;
     $12($2340 | 0, $4_1 + 155076 | 0 | 0, $4_1 + 155072 | 0 | 0) | 0;
     $2350 = $2340 + 8 | 0;
     HEAP32[($4_1 + 155068 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155064 | 0) >> 2] = 47;
     $12($2350 | 0, $4_1 + 155068 | 0 | 0, $4_1 + 155064 | 0 | 0) | 0;
     $2360 = $2350 + 8 | 0;
     HEAP32[($4_1 + 155060 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155056 | 0) >> 2] = 50;
     $12($2360 | 0, $4_1 + 155060 | 0 | 0, $4_1 + 155056 | 0 | 0) | 0;
     $2370 = $2360 + 8 | 0;
     HEAP32[($4_1 + 155052 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155048 | 0) >> 2] = 57;
     $12($2370 | 0, $4_1 + 155052 | 0 | 0, $4_1 + 155048 | 0 | 0) | 0;
     $2380 = $2370 + 8 | 0;
     HEAP32[($4_1 + 155044 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155040 | 0) >> 2] = 58;
     $12($2380 | 0, $4_1 + 155044 | 0 | 0, $4_1 + 155040 | 0 | 0) | 0;
     $2390 = $2380 + 8 | 0;
     HEAP32[($4_1 + 155036 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155032 | 0) >> 2] = 59;
     $12($2390 | 0, $4_1 + 155036 | 0 | 0, $4_1 + 155032 | 0 | 0) | 0;
     $2400 = $2390 + 8 | 0;
     HEAP32[($4_1 + 155028 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155024 | 0) >> 2] = 60;
     $12($2400 | 0, $4_1 + 155028 | 0 | 0, $4_1 + 155024 | 0 | 0) | 0;
     $2410 = $2400 + 8 | 0;
     HEAP32[($4_1 + 155020 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155016 | 0) >> 2] = 67;
     $12($2410 | 0, $4_1 + 155020 | 0 | 0, $4_1 + 155016 | 0 | 0) | 0;
     $2420 = $2410 + 8 | 0;
     HEAP32[($4_1 + 155012 | 0) >> 2] = 71;
     HEAP32[($4_1 + 155008 | 0) >> 2] = 70;
     $12($2420 | 0, $4_1 + 155012 | 0 | 0, $4_1 + 155008 | 0 | 0) | 0;
     $2430 = $2420 + 8 | 0;
     HEAP32[($4_1 + 155004 | 0) >> 2] = 70;
     HEAP32[($4_1 + 155e3 | 0) >> 2] = 15;
     $12($2430 | 0, $4_1 + 155004 | 0 | 0, $4_1 + 155e3 | 0 | 0) | 0;
     $2440 = $2430 + 8 | 0;
     HEAP32[($4_1 + 154996 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154992 | 0) >> 2] = 17;
     $12($2440 | 0, $4_1 + 154996 | 0 | 0, $4_1 + 154992 | 0 | 0) | 0;
     $2450 = $2440 + 8 | 0;
     HEAP32[($4_1 + 154988 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154984 | 0) >> 2] = 20;
     $12($2450 | 0, $4_1 + 154988 | 0 | 0, $4_1 + 154984 | 0 | 0) | 0;
     $2460 = $2450 + 8 | 0;
     HEAP32[($4_1 + 154980 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154976 | 0) >> 2] = 22;
     $12($2460 | 0, $4_1 + 154980 | 0 | 0, $4_1 + 154976 | 0 | 0) | 0;
     $2470 = $2460 + 8 | 0;
     HEAP32[($4_1 + 154972 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154968 | 0) >> 2] = 25;
     $12($2470 | 0, $4_1 + 154972 | 0 | 0, $4_1 + 154968 | 0 | 0) | 0;
     $2480 = $2470 + 8 | 0;
     HEAP32[($4_1 + 154964 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154960 | 0) >> 2] = 27;
     $12($2480 | 0, $4_1 + 154964 | 0 | 0, $4_1 + 154960 | 0 | 0) | 0;
     $2490 = $2480 + 8 | 0;
     HEAP32[($4_1 + 154956 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154952 | 0) >> 2] = 30;
     $12($2490 | 0, $4_1 + 154956 | 0 | 0, $4_1 + 154952 | 0 | 0) | 0;
     $2500 = $2490 + 8 | 0;
     HEAP32[($4_1 + 154948 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154944 | 0) >> 2] = 32;
     $12($2500 | 0, $4_1 + 154948 | 0 | 0, $4_1 + 154944 | 0 | 0) | 0;
     $2510 = $2500 + 8 | 0;
     HEAP32[($4_1 + 154940 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154936 | 0) >> 2] = 35;
     $12($2510 | 0, $4_1 + 154940 | 0 | 0, $4_1 + 154936 | 0 | 0) | 0;
     $2520 = $2510 + 8 | 0;
     HEAP32[($4_1 + 154932 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154928 | 0) >> 2] = 37;
     $12($2520 | 0, $4_1 + 154932 | 0 | 0, $4_1 + 154928 | 0 | 0) | 0;
     $2530 = $2520 + 8 | 0;
     HEAP32[($4_1 + 154924 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154920 | 0) >> 2] = 40;
     $12($2530 | 0, $4_1 + 154924 | 0 | 0, $4_1 + 154920 | 0 | 0) | 0;
     $2540 = $2530 + 8 | 0;
     HEAP32[($4_1 + 154916 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154912 | 0) >> 2] = 42;
     $12($2540 | 0, $4_1 + 154916 | 0 | 0, $4_1 + 154912 | 0 | 0) | 0;
     $2550 = $2540 + 8 | 0;
     HEAP32[($4_1 + 154908 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154904 | 0) >> 2] = 45;
     $12($2550 | 0, $4_1 + 154908 | 0 | 0, $4_1 + 154904 | 0 | 0) | 0;
     $2560 = $2550 + 8 | 0;
     HEAP32[($4_1 + 154900 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154896 | 0) >> 2] = 47;
     $12($2560 | 0, $4_1 + 154900 | 0 | 0, $4_1 + 154896 | 0 | 0) | 0;
     $2570 = $2560 + 8 | 0;
     HEAP32[($4_1 + 154892 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154888 | 0) >> 2] = 50;
     $12($2570 | 0, $4_1 + 154892 | 0 | 0, $4_1 + 154888 | 0 | 0) | 0;
     $2580 = $2570 + 8 | 0;
     HEAP32[($4_1 + 154884 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154880 | 0) >> 2] = 52;
     $12($2580 | 0, $4_1 + 154884 | 0 | 0, $4_1 + 154880 | 0 | 0) | 0;
     $2590 = $2580 + 8 | 0;
     HEAP32[($4_1 + 154876 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154872 | 0) >> 2] = 55;
     $12($2590 | 0, $4_1 + 154876 | 0 | 0, $4_1 + 154872 | 0 | 0) | 0;
     $2600 = $2590 + 8 | 0;
     HEAP32[($4_1 + 154868 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154864 | 0) >> 2] = 57;
     $12($2600 | 0, $4_1 + 154868 | 0 | 0, $4_1 + 154864 | 0 | 0) | 0;
     $2610 = $2600 + 8 | 0;
     HEAP32[($4_1 + 154860 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154856 | 0) >> 2] = 60;
     $12($2610 | 0, $4_1 + 154860 | 0 | 0, $4_1 + 154856 | 0 | 0) | 0;
     $2620 = $2610 + 8 | 0;
     HEAP32[($4_1 + 154852 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154848 | 0) >> 2] = 62;
     $12($2620 | 0, $4_1 + 154852 | 0 | 0, $4_1 + 154848 | 0 | 0) | 0;
     $2630 = $2620 + 8 | 0;
     HEAP32[($4_1 + 154844 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154840 | 0) >> 2] = 65;
     $12($2630 | 0, $4_1 + 154844 | 0 | 0, $4_1 + 154840 | 0 | 0) | 0;
     $2640 = $2630 + 8 | 0;
     HEAP32[($4_1 + 154836 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154832 | 0) >> 2] = 67;
     $12($2640 | 0, $4_1 + 154836 | 0 | 0, $4_1 + 154832 | 0 | 0) | 0;
     $2650 = $2640 + 8 | 0;
     HEAP32[($4_1 + 154828 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154824 | 0) >> 2] = 70;
     $12($2650 | 0, $4_1 + 154828 | 0 | 0, $4_1 + 154824 | 0 | 0) | 0;
     $2660 = $2650 + 8 | 0;
     HEAP32[($4_1 + 154820 | 0) >> 2] = 70;
     HEAP32[($4_1 + 154816 | 0) >> 2] = 72;
     $12($2660 | 0, $4_1 + 154820 | 0 | 0, $4_1 + 154816 | 0 | 0) | 0;
     $2670 = $2660 + 8 | 0;
     HEAP32[($4_1 + 154812 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154808 | 0) >> 2] = 15;
     $12($2670 | 0, $4_1 + 154812 | 0 | 0, $4_1 + 154808 | 0 | 0) | 0;
     $2680 = $2670 + 8 | 0;
     HEAP32[($4_1 + 154804 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154800 | 0) >> 2] = 16;
     $12($2680 | 0, $4_1 + 154804 | 0 | 0, $4_1 + 154800 | 0 | 0) | 0;
     $2690 = $2680 + 8 | 0;
     HEAP32[($4_1 + 154796 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154792 | 0) >> 2] = 21;
     $12($2690 | 0, $4_1 + 154796 | 0 | 0, $4_1 + 154792 | 0 | 0) | 0;
     $2700 = $2690 + 8 | 0;
     HEAP32[($4_1 + 154788 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154784 | 0) >> 2] = 22;
     $12($2700 | 0, $4_1 + 154788 | 0 | 0, $4_1 + 154784 | 0 | 0) | 0;
     $2710 = $2700 + 8 | 0;
     HEAP32[($4_1 + 154780 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154776 | 0) >> 2] = 25;
     $12($2710 | 0, $4_1 + 154780 | 0 | 0, $4_1 + 154776 | 0 | 0) | 0;
     $2720 = $2710 + 8 | 0;
     HEAP32[($4_1 + 154772 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154768 | 0) >> 2] = 26;
     $12($2720 | 0, $4_1 + 154772 | 0 | 0, $4_1 + 154768 | 0 | 0) | 0;
     $2730 = $2720 + 8 | 0;
     HEAP32[($4_1 + 154764 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154760 | 0) >> 2] = 31;
     $12($2730 | 0, $4_1 + 154764 | 0 | 0, $4_1 + 154760 | 0 | 0) | 0;
     $2740 = $2730 + 8 | 0;
     HEAP32[($4_1 + 154756 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154752 | 0) >> 2] = 32;
     $12($2740 | 0, $4_1 + 154756 | 0 | 0, $4_1 + 154752 | 0 | 0) | 0;
     $2750 = $2740 + 8 | 0;
     HEAP32[($4_1 + 154748 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154744 | 0) >> 2] = 35;
     $12($2750 | 0, $4_1 + 154748 | 0 | 0, $4_1 + 154744 | 0 | 0) | 0;
     $2760 = $2750 + 8 | 0;
     HEAP32[($4_1 + 154740 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154736 | 0) >> 2] = 36;
     $12($2760 | 0, $4_1 + 154740 | 0 | 0, $4_1 + 154736 | 0 | 0) | 0;
     $2770 = $2760 + 8 | 0;
     HEAP32[($4_1 + 154732 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154728 | 0) >> 2] = 41;
     $12($2770 | 0, $4_1 + 154732 | 0 | 0, $4_1 + 154728 | 0 | 0) | 0;
     $2780 = $2770 + 8 | 0;
     HEAP32[($4_1 + 154724 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154720 | 0) >> 2] = 42;
     $12($2780 | 0, $4_1 + 154724 | 0 | 0, $4_1 + 154720 | 0 | 0) | 0;
     $2790 = $2780 + 8 | 0;
     HEAP32[($4_1 + 154716 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154712 | 0) >> 2] = 45;
     $12($2790 | 0, $4_1 + 154716 | 0 | 0, $4_1 + 154712 | 0 | 0) | 0;
     $2800 = $2790 + 8 | 0;
     HEAP32[($4_1 + 154708 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154704 | 0) >> 2] = 46;
     $12($2800 | 0, $4_1 + 154708 | 0 | 0, $4_1 + 154704 | 0 | 0) | 0;
     $2810 = $2800 + 8 | 0;
     HEAP32[($4_1 + 154700 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154696 | 0) >> 2] = 51;
     $12($2810 | 0, $4_1 + 154700 | 0 | 0, $4_1 + 154696 | 0 | 0) | 0;
     $2820 = $2810 + 8 | 0;
     HEAP32[($4_1 + 154692 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154688 | 0) >> 2] = 52;
     $12($2820 | 0, $4_1 + 154692 | 0 | 0, $4_1 + 154688 | 0 | 0) | 0;
     $2830 = $2820 + 8 | 0;
     HEAP32[($4_1 + 154684 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154680 | 0) >> 2] = 55;
     $12($2830 | 0, $4_1 + 154684 | 0 | 0, $4_1 + 154680 | 0 | 0) | 0;
     $2840 = $2830 + 8 | 0;
     HEAP32[($4_1 + 154676 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154672 | 0) >> 2] = 56;
     $12($2840 | 0, $4_1 + 154676 | 0 | 0, $4_1 + 154672 | 0 | 0) | 0;
     $2850 = $2840 + 8 | 0;
     HEAP32[($4_1 + 154668 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154664 | 0) >> 2] = 61;
     $12($2850 | 0, $4_1 + 154668 | 0 | 0, $4_1 + 154664 | 0 | 0) | 0;
     $2860 = $2850 + 8 | 0;
     HEAP32[($4_1 + 154660 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154656 | 0) >> 2] = 62;
     $12($2860 | 0, $4_1 + 154660 | 0 | 0, $4_1 + 154656 | 0 | 0) | 0;
     $2870 = $2860 + 8 | 0;
     HEAP32[($4_1 + 154652 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154648 | 0) >> 2] = 65;
     $12($2870 | 0, $4_1 + 154652 | 0 | 0, $4_1 + 154648 | 0 | 0) | 0;
     $2880 = $2870 + 8 | 0;
     HEAP32[($4_1 + 154644 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154640 | 0) >> 2] = 66;
     $12($2880 | 0, $4_1 + 154644 | 0 | 0, $4_1 + 154640 | 0 | 0) | 0;
     $2890 = $2880 + 8 | 0;
     HEAP32[($4_1 + 154636 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154632 | 0) >> 2] = 71;
     $12($2890 | 0, $4_1 + 154636 | 0 | 0, $4_1 + 154632 | 0 | 0) | 0;
     $2900 = $2890 + 8 | 0;
     HEAP32[($4_1 + 154628 | 0) >> 2] = 69;
     HEAP32[($4_1 + 154624 | 0) >> 2] = 72;
     $12($2900 | 0, $4_1 + 154628 | 0 | 0, $4_1 + 154624 | 0 | 0) | 0;
     $2910 = $2900 + 8 | 0;
     HEAP32[($4_1 + 154620 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154616 | 0) >> 2] = 15;
     $12($2910 | 0, $4_1 + 154620 | 0 | 0, $4_1 + 154616 | 0 | 0) | 0;
     $2920 = $2910 + 8 | 0;
     HEAP32[($4_1 + 154612 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154608 | 0) >> 2] = 16;
     $12($2920 | 0, $4_1 + 154612 | 0 | 0, $4_1 + 154608 | 0 | 0) | 0;
     $2930 = $2920 + 8 | 0;
     HEAP32[($4_1 + 154604 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154600 | 0) >> 2] = 21;
     $12($2930 | 0, $4_1 + 154604 | 0 | 0, $4_1 + 154600 | 0 | 0) | 0;
     $2940 = $2930 + 8 | 0;
     HEAP32[($4_1 + 154596 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154592 | 0) >> 2] = 22;
     $12($2940 | 0, $4_1 + 154596 | 0 | 0, $4_1 + 154592 | 0 | 0) | 0;
     $2950 = $2940 + 8 | 0;
     HEAP32[($4_1 + 154588 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154584 | 0) >> 2] = 25;
     $12($2950 | 0, $4_1 + 154588 | 0 | 0, $4_1 + 154584 | 0 | 0) | 0;
     $2960 = $2950 + 8 | 0;
     HEAP32[($4_1 + 154580 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154576 | 0) >> 2] = 26;
     $12($2960 | 0, $4_1 + 154580 | 0 | 0, $4_1 + 154576 | 0 | 0) | 0;
     $2970 = $2960 + 8 | 0;
     HEAP32[($4_1 + 154572 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154568 | 0) >> 2] = 31;
     $12($2970 | 0, $4_1 + 154572 | 0 | 0, $4_1 + 154568 | 0 | 0) | 0;
     $2980 = $2970 + 8 | 0;
     HEAP32[($4_1 + 154564 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154560 | 0) >> 2] = 32;
     $12($2980 | 0, $4_1 + 154564 | 0 | 0, $4_1 + 154560 | 0 | 0) | 0;
     $2990 = $2980 + 8 | 0;
     HEAP32[($4_1 + 154556 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154552 | 0) >> 2] = 35;
     $12($2990 | 0, $4_1 + 154556 | 0 | 0, $4_1 + 154552 | 0 | 0) | 0;
     $3000 = $2990 + 8 | 0;
     HEAP32[($4_1 + 154548 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154544 | 0) >> 2] = 36;
     $12($3000 | 0, $4_1 + 154548 | 0 | 0, $4_1 + 154544 | 0 | 0) | 0;
     $3010 = $3000 + 8 | 0;
     HEAP32[($4_1 + 154540 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154536 | 0) >> 2] = 41;
     $12($3010 | 0, $4_1 + 154540 | 0 | 0, $4_1 + 154536 | 0 | 0) | 0;
     $3020 = $3010 + 8 | 0;
     HEAP32[($4_1 + 154532 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154528 | 0) >> 2] = 42;
     $12($3020 | 0, $4_1 + 154532 | 0 | 0, $4_1 + 154528 | 0 | 0) | 0;
     $3030 = $3020 + 8 | 0;
     HEAP32[($4_1 + 154524 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154520 | 0) >> 2] = 45;
     $12($3030 | 0, $4_1 + 154524 | 0 | 0, $4_1 + 154520 | 0 | 0) | 0;
     $3040 = $3030 + 8 | 0;
     HEAP32[($4_1 + 154516 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154512 | 0) >> 2] = 46;
     $12($3040 | 0, $4_1 + 154516 | 0 | 0, $4_1 + 154512 | 0 | 0) | 0;
     $3050 = $3040 + 8 | 0;
     HEAP32[($4_1 + 154508 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154504 | 0) >> 2] = 51;
     $12($3050 | 0, $4_1 + 154508 | 0 | 0, $4_1 + 154504 | 0 | 0) | 0;
     $3060 = $3050 + 8 | 0;
     HEAP32[($4_1 + 154500 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154496 | 0) >> 2] = 52;
     $12($3060 | 0, $4_1 + 154500 | 0 | 0, $4_1 + 154496 | 0 | 0) | 0;
     $3070 = $3060 + 8 | 0;
     HEAP32[($4_1 + 154492 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154488 | 0) >> 2] = 55;
     $12($3070 | 0, $4_1 + 154492 | 0 | 0, $4_1 + 154488 | 0 | 0) | 0;
     $3080 = $3070 + 8 | 0;
     HEAP32[($4_1 + 154484 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154480 | 0) >> 2] = 56;
     $12($3080 | 0, $4_1 + 154484 | 0 | 0, $4_1 + 154480 | 0 | 0) | 0;
     $3090 = $3080 + 8 | 0;
     HEAP32[($4_1 + 154476 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154472 | 0) >> 2] = 61;
     $12($3090 | 0, $4_1 + 154476 | 0 | 0, $4_1 + 154472 | 0 | 0) | 0;
     $3100 = $3090 + 8 | 0;
     HEAP32[($4_1 + 154468 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154464 | 0) >> 2] = 62;
     $12($3100 | 0, $4_1 + 154468 | 0 | 0, $4_1 + 154464 | 0 | 0) | 0;
     $3110 = $3100 + 8 | 0;
     HEAP32[($4_1 + 154460 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154456 | 0) >> 2] = 65;
     $12($3110 | 0, $4_1 + 154460 | 0 | 0, $4_1 + 154456 | 0 | 0) | 0;
     $3120 = $3110 + 8 | 0;
     HEAP32[($4_1 + 154452 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154448 | 0) >> 2] = 66;
     $12($3120 | 0, $4_1 + 154452 | 0 | 0, $4_1 + 154448 | 0 | 0) | 0;
     $3130 = $3120 + 8 | 0;
     HEAP32[($4_1 + 154444 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154440 | 0) >> 2] = 71;
     $12($3130 | 0, $4_1 + 154444 | 0 | 0, $4_1 + 154440 | 0 | 0) | 0;
     $3140 = $3130 + 8 | 0;
     HEAP32[($4_1 + 154436 | 0) >> 2] = 66;
     HEAP32[($4_1 + 154432 | 0) >> 2] = 72;
     $12($3140 | 0, $4_1 + 154436 | 0 | 0, $4_1 + 154432 | 0 | 0) | 0;
     $3150 = $3140 + 8 | 0;
     HEAP32[($4_1 + 154428 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154424 | 0) >> 2] = 15;
     $12($3150 | 0, $4_1 + 154428 | 0 | 0, $4_1 + 154424 | 0 | 0) | 0;
     $3160 = $3150 + 8 | 0;
     HEAP32[($4_1 + 154420 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154416 | 0) >> 2] = 17;
     $12($3160 | 0, $4_1 + 154420 | 0 | 0, $4_1 + 154416 | 0 | 0) | 0;
     $3170 = $3160 + 8 | 0;
     HEAP32[($4_1 + 154412 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154408 | 0) >> 2] = 20;
     $12($3170 | 0, $4_1 + 154412 | 0 | 0, $4_1 + 154408 | 0 | 0) | 0;
     $3180 = $3170 + 8 | 0;
     HEAP32[($4_1 + 154404 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154400 | 0) >> 2] = 22;
     $12($3180 | 0, $4_1 + 154404 | 0 | 0, $4_1 + 154400 | 0 | 0) | 0;
     $3190 = $3180 + 8 | 0;
     HEAP32[($4_1 + 154396 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154392 | 0) >> 2] = 25;
     $12($3190 | 0, $4_1 + 154396 | 0 | 0, $4_1 + 154392 | 0 | 0) | 0;
     $3200 = $3190 + 8 | 0;
     HEAP32[($4_1 + 154388 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154384 | 0) >> 2] = 27;
     $12($3200 | 0, $4_1 + 154388 | 0 | 0, $4_1 + 154384 | 0 | 0) | 0;
     $3210 = $3200 + 8 | 0;
     HEAP32[($4_1 + 154380 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154376 | 0) >> 2] = 30;
     $12($3210 | 0, $4_1 + 154380 | 0 | 0, $4_1 + 154376 | 0 | 0) | 0;
     $3220 = $3210 + 8 | 0;
     HEAP32[($4_1 + 154372 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154368 | 0) >> 2] = 32;
     $12($3220 | 0, $4_1 + 154372 | 0 | 0, $4_1 + 154368 | 0 | 0) | 0;
     $3230 = $3220 + 8 | 0;
     HEAP32[($4_1 + 154364 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154360 | 0) >> 2] = 35;
     $12($3230 | 0, $4_1 + 154364 | 0 | 0, $4_1 + 154360 | 0 | 0) | 0;
     $3240 = $3230 + 8 | 0;
     HEAP32[($4_1 + 154356 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154352 | 0) >> 2] = 37;
     $12($3240 | 0, $4_1 + 154356 | 0 | 0, $4_1 + 154352 | 0 | 0) | 0;
     $3250 = $3240 + 8 | 0;
     HEAP32[($4_1 + 154348 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154344 | 0) >> 2] = 40;
     $12($3250 | 0, $4_1 + 154348 | 0 | 0, $4_1 + 154344 | 0 | 0) | 0;
     $3260 = $3250 + 8 | 0;
     HEAP32[($4_1 + 154340 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154336 | 0) >> 2] = 42;
     $12($3260 | 0, $4_1 + 154340 | 0 | 0, $4_1 + 154336 | 0 | 0) | 0;
     $3270 = $3260 + 8 | 0;
     HEAP32[($4_1 + 154332 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154328 | 0) >> 2] = 45;
     $12($3270 | 0, $4_1 + 154332 | 0 | 0, $4_1 + 154328 | 0 | 0) | 0;
     $3280 = $3270 + 8 | 0;
     HEAP32[($4_1 + 154324 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154320 | 0) >> 2] = 47;
     $12($3280 | 0, $4_1 + 154324 | 0 | 0, $4_1 + 154320 | 0 | 0) | 0;
     $3290 = $3280 + 8 | 0;
     HEAP32[($4_1 + 154316 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154312 | 0) >> 2] = 50;
     $12($3290 | 0, $4_1 + 154316 | 0 | 0, $4_1 + 154312 | 0 | 0) | 0;
     $3300 = $3290 + 8 | 0;
     HEAP32[($4_1 + 154308 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154304 | 0) >> 2] = 52;
     $12($3300 | 0, $4_1 + 154308 | 0 | 0, $4_1 + 154304 | 0 | 0) | 0;
     $3310 = $3300 + 8 | 0;
     HEAP32[($4_1 + 154300 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154296 | 0) >> 2] = 55;
     $12($3310 | 0, $4_1 + 154300 | 0 | 0, $4_1 + 154296 | 0 | 0) | 0;
     $3320 = $3310 + 8 | 0;
     HEAP32[($4_1 + 154292 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154288 | 0) >> 2] = 57;
     $12($3320 | 0, $4_1 + 154292 | 0 | 0, $4_1 + 154288 | 0 | 0) | 0;
     $3330 = $3320 + 8 | 0;
     HEAP32[($4_1 + 154284 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154280 | 0) >> 2] = 60;
     $12($3330 | 0, $4_1 + 154284 | 0 | 0, $4_1 + 154280 | 0 | 0) | 0;
     $3340 = $3330 + 8 | 0;
     HEAP32[($4_1 + 154276 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154272 | 0) >> 2] = 62;
     $12($3340 | 0, $4_1 + 154276 | 0 | 0, $4_1 + 154272 | 0 | 0) | 0;
     $3350 = $3340 + 8 | 0;
     HEAP32[($4_1 + 154268 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154264 | 0) >> 2] = 65;
     $12($3350 | 0, $4_1 + 154268 | 0 | 0, $4_1 + 154264 | 0 | 0) | 0;
     $3360 = $3350 + 8 | 0;
     HEAP32[($4_1 + 154260 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154256 | 0) >> 2] = 67;
     $12($3360 | 0, $4_1 + 154260 | 0 | 0, $4_1 + 154256 | 0 | 0) | 0;
     $3370 = $3360 + 8 | 0;
     HEAP32[($4_1 + 154252 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154248 | 0) >> 2] = 70;
     $12($3370 | 0, $4_1 + 154252 | 0 | 0, $4_1 + 154248 | 0 | 0) | 0;
     $3380 = $3370 + 8 | 0;
     HEAP32[($4_1 + 154244 | 0) >> 2] = 65;
     HEAP32[($4_1 + 154240 | 0) >> 2] = 72;
     $12($3380 | 0, $4_1 + 154244 | 0 | 0, $4_1 + 154240 | 0 | 0) | 0;
     $3390 = $3380 + 8 | 0;
     HEAP32[($4_1 + 154236 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154232 | 0) >> 2] = 17;
     $12($3390 | 0, $4_1 + 154236 | 0 | 0, $4_1 + 154232 | 0 | 0) | 0;
     $3400 = $3390 + 8 | 0;
     HEAP32[($4_1 + 154228 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154224 | 0) >> 2] = 18;
     $12($3400 | 0, $4_1 + 154228 | 0 | 0, $4_1 + 154224 | 0 | 0) | 0;
     $3410 = $3400 + 8 | 0;
     HEAP32[($4_1 + 154220 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154216 | 0) >> 2] = 19;
     $12($3410 | 0, $4_1 + 154220 | 0 | 0, $4_1 + 154216 | 0 | 0) | 0;
     $3420 = $3410 + 8 | 0;
     HEAP32[($4_1 + 154212 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154208 | 0) >> 2] = 20;
     $12($3420 | 0, $4_1 + 154212 | 0 | 0, $4_1 + 154208 | 0 | 0) | 0;
     $3430 = $3420 + 8 | 0;
     HEAP32[($4_1 + 154204 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154200 | 0) >> 2] = 27;
     $12($3430 | 0, $4_1 + 154204 | 0 | 0, $4_1 + 154200 | 0 | 0) | 0;
     $3440 = $3430 + 8 | 0;
     HEAP32[($4_1 + 154196 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154192 | 0) >> 2] = 30;
     $12($3440 | 0, $4_1 + 154196 | 0 | 0, $4_1 + 154192 | 0 | 0) | 0;
     $3450 = $3440 + 8 | 0;
     HEAP32[($4_1 + 154188 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154184 | 0) >> 2] = 37;
     $12($3450 | 0, $4_1 + 154188 | 0 | 0, $4_1 + 154184 | 0 | 0) | 0;
     $3460 = $3450 + 8 | 0;
     HEAP32[($4_1 + 154180 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154176 | 0) >> 2] = 38;
     $12($3460 | 0, $4_1 + 154180 | 0 | 0, $4_1 + 154176 | 0 | 0) | 0;
     $3470 = $3460 + 8 | 0;
     HEAP32[($4_1 + 154172 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154168 | 0) >> 2] = 39;
     $12($3470 | 0, $4_1 + 154172 | 0 | 0, $4_1 + 154168 | 0 | 0) | 0;
     $3480 = $3470 + 8 | 0;
     HEAP32[($4_1 + 154164 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154160 | 0) >> 2] = 40;
     $12($3480 | 0, $4_1 + 154164 | 0 | 0, $4_1 + 154160 | 0 | 0) | 0;
     $3490 = $3480 + 8 | 0;
     HEAP32[($4_1 + 154156 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154152 | 0) >> 2] = 47;
     $12($3490 | 0, $4_1 + 154156 | 0 | 0, $4_1 + 154152 | 0 | 0) | 0;
     $3500 = $3490 + 8 | 0;
     HEAP32[($4_1 + 154148 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154144 | 0) >> 2] = 50;
     $12($3500 | 0, $4_1 + 154148 | 0 | 0, $4_1 + 154144 | 0 | 0) | 0;
     $3510 = $3500 + 8 | 0;
     HEAP32[($4_1 + 154140 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154136 | 0) >> 2] = 57;
     $12($3510 | 0, $4_1 + 154140 | 0 | 0, $4_1 + 154136 | 0 | 0) | 0;
     $3520 = $3510 + 8 | 0;
     HEAP32[($4_1 + 154132 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154128 | 0) >> 2] = 58;
     $12($3520 | 0, $4_1 + 154132 | 0 | 0, $4_1 + 154128 | 0 | 0) | 0;
     $3530 = $3520 + 8 | 0;
     HEAP32[($4_1 + 154124 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154120 | 0) >> 2] = 59;
     $12($3530 | 0, $4_1 + 154124 | 0 | 0, $4_1 + 154120 | 0 | 0) | 0;
     $3540 = $3530 + 8 | 0;
     HEAP32[($4_1 + 154116 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154112 | 0) >> 2] = 60;
     $12($3540 | 0, $4_1 + 154116 | 0 | 0, $4_1 + 154112 | 0 | 0) | 0;
     $3550 = $3540 + 8 | 0;
     HEAP32[($4_1 + 154108 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154104 | 0) >> 2] = 67;
     $12($3550 | 0, $4_1 + 154108 | 0 | 0, $4_1 + 154104 | 0 | 0) | 0;
     $3560 = $3550 + 8 | 0;
     HEAP32[($4_1 + 154100 | 0) >> 2] = 64;
     HEAP32[($4_1 + 154096 | 0) >> 2] = 70;
     $12($3560 | 0, $4_1 + 154100 | 0 | 0, $4_1 + 154096 | 0 | 0) | 0;
     $3570 = $3560 + 8 | 0;
     HEAP32[($4_1 + 154092 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154088 | 0) >> 2] = 15;
     $12($3570 | 0, $4_1 + 154092 | 0 | 0, $4_1 + 154088 | 0 | 0) | 0;
     $3580 = $3570 + 8 | 0;
     HEAP32[($4_1 + 154084 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154080 | 0) >> 2] = 17;
     $12($3580 | 0, $4_1 + 154084 | 0 | 0, $4_1 + 154080 | 0 | 0) | 0;
     $3590 = $3580 + 8 | 0;
     HEAP32[($4_1 + 154076 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154072 | 0) >> 2] = 20;
     $12($3590 | 0, $4_1 + 154076 | 0 | 0, $4_1 + 154072 | 0 | 0) | 0;
     $3600 = $3590 + 8 | 0;
     HEAP32[($4_1 + 154068 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154064 | 0) >> 2] = 22;
     $12($3600 | 0, $4_1 + 154068 | 0 | 0, $4_1 + 154064 | 0 | 0) | 0;
     $3610 = $3600 + 8 | 0;
     HEAP32[($4_1 + 154060 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154056 | 0) >> 2] = 25;
     $12($3610 | 0, $4_1 + 154060 | 0 | 0, $4_1 + 154056 | 0 | 0) | 0;
     $3620 = $3610 + 8 | 0;
     HEAP32[($4_1 + 154052 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154048 | 0) >> 2] = 27;
     $12($3620 | 0, $4_1 + 154052 | 0 | 0, $4_1 + 154048 | 0 | 0) | 0;
     $3630 = $3620 + 8 | 0;
     HEAP32[($4_1 + 154044 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154040 | 0) >> 2] = 30;
     $12($3630 | 0, $4_1 + 154044 | 0 | 0, $4_1 + 154040 | 0 | 0) | 0;
     $3640 = $3630 + 8 | 0;
     HEAP32[($4_1 + 154036 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154032 | 0) >> 2] = 32;
     $12($3640 | 0, $4_1 + 154036 | 0 | 0, $4_1 + 154032 | 0 | 0) | 0;
     $3650 = $3640 + 8 | 0;
     HEAP32[($4_1 + 154028 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154024 | 0) >> 2] = 35;
     $12($3650 | 0, $4_1 + 154028 | 0 | 0, $4_1 + 154024 | 0 | 0) | 0;
     $3660 = $3650 + 8 | 0;
     HEAP32[($4_1 + 154020 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154016 | 0) >> 2] = 37;
     $12($3660 | 0, $4_1 + 154020 | 0 | 0, $4_1 + 154016 | 0 | 0) | 0;
     $3670 = $3660 + 8 | 0;
     HEAP32[($4_1 + 154012 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154008 | 0) >> 2] = 40;
     $12($3670 | 0, $4_1 + 154012 | 0 | 0, $4_1 + 154008 | 0 | 0) | 0;
     $3680 = $3670 + 8 | 0;
     HEAP32[($4_1 + 154004 | 0) >> 2] = 63;
     HEAP32[($4_1 + 154e3 | 0) >> 2] = 42;
     $12($3680 | 0, $4_1 + 154004 | 0 | 0, $4_1 + 154e3 | 0 | 0) | 0;
     $3690 = $3680 + 8 | 0;
     HEAP32[($4_1 + 153996 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153992 | 0) >> 2] = 45;
     $12($3690 | 0, $4_1 + 153996 | 0 | 0, $4_1 + 153992 | 0 | 0) | 0;
     $3700 = $3690 + 8 | 0;
     HEAP32[($4_1 + 153988 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153984 | 0) >> 2] = 47;
     $12($3700 | 0, $4_1 + 153988 | 0 | 0, $4_1 + 153984 | 0 | 0) | 0;
     $3710 = $3700 + 8 | 0;
     HEAP32[($4_1 + 153980 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153976 | 0) >> 2] = 50;
     $12($3710 | 0, $4_1 + 153980 | 0 | 0, $4_1 + 153976 | 0 | 0) | 0;
     $3720 = $3710 + 8 | 0;
     HEAP32[($4_1 + 153972 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153968 | 0) >> 2] = 52;
     $12($3720 | 0, $4_1 + 153972 | 0 | 0, $4_1 + 153968 | 0 | 0) | 0;
     $3730 = $3720 + 8 | 0;
     HEAP32[($4_1 + 153964 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153960 | 0) >> 2] = 55;
     $12($3730 | 0, $4_1 + 153964 | 0 | 0, $4_1 + 153960 | 0 | 0) | 0;
     $3740 = $3730 + 8 | 0;
     HEAP32[($4_1 + 153956 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153952 | 0) >> 2] = 57;
     $12($3740 | 0, $4_1 + 153956 | 0 | 0, $4_1 + 153952 | 0 | 0) | 0;
     $3750 = $3740 + 8 | 0;
     HEAP32[($4_1 + 153948 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153944 | 0) >> 2] = 60;
     $12($3750 | 0, $4_1 + 153948 | 0 | 0, $4_1 + 153944 | 0 | 0) | 0;
     $3760 = $3750 + 8 | 0;
     HEAP32[($4_1 + 153940 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153936 | 0) >> 2] = 62;
     $12($3760 | 0, $4_1 + 153940 | 0 | 0, $4_1 + 153936 | 0 | 0) | 0;
     $3770 = $3760 + 8 | 0;
     HEAP32[($4_1 + 153932 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153928 | 0) >> 2] = 65;
     $12($3770 | 0, $4_1 + 153932 | 0 | 0, $4_1 + 153928 | 0 | 0) | 0;
     $3780 = $3770 + 8 | 0;
     HEAP32[($4_1 + 153924 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153920 | 0) >> 2] = 67;
     $12($3780 | 0, $4_1 + 153924 | 0 | 0, $4_1 + 153920 | 0 | 0) | 0;
     $3790 = $3780 + 8 | 0;
     HEAP32[($4_1 + 153916 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153912 | 0) >> 2] = 70;
     $12($3790 | 0, $4_1 + 153916 | 0 | 0, $4_1 + 153912 | 0 | 0) | 0;
     $3800 = $3790 + 8 | 0;
     HEAP32[($4_1 + 153908 | 0) >> 2] = 63;
     HEAP32[($4_1 + 153904 | 0) >> 2] = 72;
     $12($3800 | 0, $4_1 + 153908 | 0 | 0, $4_1 + 153904 | 0 | 0) | 0;
     $3810 = $3800 + 8 | 0;
     HEAP32[($4_1 + 153900 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153896 | 0) >> 2] = 15;
     $12($3810 | 0, $4_1 + 153900 | 0 | 0, $4_1 + 153896 | 0 | 0) | 0;
     $3820 = $3810 + 8 | 0;
     HEAP32[($4_1 + 153892 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153888 | 0) >> 2] = 16;
     $12($3820 | 0, $4_1 + 153892 | 0 | 0, $4_1 + 153888 | 0 | 0) | 0;
     $3830 = $3820 + 8 | 0;
     HEAP32[($4_1 + 153884 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153880 | 0) >> 2] = 21;
     $12($3830 | 0, $4_1 + 153884 | 0 | 0, $4_1 + 153880 | 0 | 0) | 0;
     $3840 = $3830 + 8 | 0;
     HEAP32[($4_1 + 153876 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153872 | 0) >> 2] = 22;
     $12($3840 | 0, $4_1 + 153876 | 0 | 0, $4_1 + 153872 | 0 | 0) | 0;
     $3850 = $3840 + 8 | 0;
     HEAP32[($4_1 + 153868 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153864 | 0) >> 2] = 25;
     $12($3850 | 0, $4_1 + 153868 | 0 | 0, $4_1 + 153864 | 0 | 0) | 0;
     $3860 = $3850 + 8 | 0;
     HEAP32[($4_1 + 153860 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153856 | 0) >> 2] = 26;
     $12($3860 | 0, $4_1 + 153860 | 0 | 0, $4_1 + 153856 | 0 | 0) | 0;
     $3870 = $3860 + 8 | 0;
     HEAP32[($4_1 + 153852 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153848 | 0) >> 2] = 31;
     $12($3870 | 0, $4_1 + 153852 | 0 | 0, $4_1 + 153848 | 0 | 0) | 0;
     $3880 = $3870 + 8 | 0;
     HEAP32[($4_1 + 153844 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153840 | 0) >> 2] = 32;
     $12($3880 | 0, $4_1 + 153844 | 0 | 0, $4_1 + 153840 | 0 | 0) | 0;
     $3890 = $3880 + 8 | 0;
     HEAP32[($4_1 + 153836 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153832 | 0) >> 2] = 35;
     $12($3890 | 0, $4_1 + 153836 | 0 | 0, $4_1 + 153832 | 0 | 0) | 0;
     $3900 = $3890 + 8 | 0;
     HEAP32[($4_1 + 153828 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153824 | 0) >> 2] = 36;
     $12($3900 | 0, $4_1 + 153828 | 0 | 0, $4_1 + 153824 | 0 | 0) | 0;
     $3910 = $3900 + 8 | 0;
     HEAP32[($4_1 + 153820 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153816 | 0) >> 2] = 41;
     $12($3910 | 0, $4_1 + 153820 | 0 | 0, $4_1 + 153816 | 0 | 0) | 0;
     $3920 = $3910 + 8 | 0;
     HEAP32[($4_1 + 153812 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153808 | 0) >> 2] = 42;
     $12($3920 | 0, $4_1 + 153812 | 0 | 0, $4_1 + 153808 | 0 | 0) | 0;
     $3930 = $3920 + 8 | 0;
     HEAP32[($4_1 + 153804 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153800 | 0) >> 2] = 45;
     $12($3930 | 0, $4_1 + 153804 | 0 | 0, $4_1 + 153800 | 0 | 0) | 0;
     $3940 = $3930 + 8 | 0;
     HEAP32[($4_1 + 153796 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153792 | 0) >> 2] = 46;
     $12($3940 | 0, $4_1 + 153796 | 0 | 0, $4_1 + 153792 | 0 | 0) | 0;
     $3950 = $3940 + 8 | 0;
     HEAP32[($4_1 + 153788 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153784 | 0) >> 2] = 51;
     $12($3950 | 0, $4_1 + 153788 | 0 | 0, $4_1 + 153784 | 0 | 0) | 0;
     $3960 = $3950 + 8 | 0;
     HEAP32[($4_1 + 153780 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153776 | 0) >> 2] = 52;
     $12($3960 | 0, $4_1 + 153780 | 0 | 0, $4_1 + 153776 | 0 | 0) | 0;
     $3970 = $3960 + 8 | 0;
     HEAP32[($4_1 + 153772 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153768 | 0) >> 2] = 55;
     $12($3970 | 0, $4_1 + 153772 | 0 | 0, $4_1 + 153768 | 0 | 0) | 0;
     $3980 = $3970 + 8 | 0;
     HEAP32[($4_1 + 153764 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153760 | 0) >> 2] = 56;
     $12($3980 | 0, $4_1 + 153764 | 0 | 0, $4_1 + 153760 | 0 | 0) | 0;
     $3990 = $3980 + 8 | 0;
     HEAP32[($4_1 + 153756 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153752 | 0) >> 2] = 61;
     $12($3990 | 0, $4_1 + 153756 | 0 | 0, $4_1 + 153752 | 0 | 0) | 0;
     $4000 = $3990 + 8 | 0;
     HEAP32[($4_1 + 153748 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153744 | 0) >> 2] = 62;
     $12($4000 | 0, $4_1 + 153748 | 0 | 0, $4_1 + 153744 | 0 | 0) | 0;
     $4010 = $4000 + 8 | 0;
     HEAP32[($4_1 + 153740 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153736 | 0) >> 2] = 65;
     $12($4010 | 0, $4_1 + 153740 | 0 | 0, $4_1 + 153736 | 0 | 0) | 0;
     $4020 = $4010 + 8 | 0;
     HEAP32[($4_1 + 153732 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153728 | 0) >> 2] = 66;
     $12($4020 | 0, $4_1 + 153732 | 0 | 0, $4_1 + 153728 | 0 | 0) | 0;
     $4030 = $4020 + 8 | 0;
     HEAP32[($4_1 + 153724 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153720 | 0) >> 2] = 71;
     $12($4030 | 0, $4_1 + 153724 | 0 | 0, $4_1 + 153720 | 0 | 0) | 0;
     HEAP32[($4_1 + 153716 | 0) >> 2] = 62;
     HEAP32[($4_1 + 153712 | 0) >> 2] = 72;
     $12($4030 + 8 | 0 | 0, $4_1 + 153716 | 0 | 0, $4_1 + 153712 | 0 | 0) | 0;
     HEAP32[($4_1 + 157360 | 0) >> 2] = $4_1 + 155536 | 0;
     HEAP32[($4_1 + 157364 | 0) >> 2] = 228;
     i64toi32_i32$0 = HEAP32[($4_1 + 157360 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 157364 | 0) >> 2] | 0;
     $11891 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 102472 | 0) >> 2] = $11891;
     HEAP32[($4_1 + 102476 | 0) >> 2] = i64toi32_i32$1;
     $13($4_1 + 262472 | 0 | 0, $4_1 + 102472 | 0 | 0) | 0;
     HEAP32[($4_1 + 262464 | 0) >> 2] = 10;
     HEAP32[($4_1 + 262468 | 0) >> 2] = 10;
     $14($4_1 + 128096 | 0 | 0, $4_1 + 262472 | 0 | 0) | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 262464 | 0) >> 2] | 0;
     i64toi32_i32$0 = HEAP32[($4_1 + 262468 | 0) >> 2] | 0;
     $11919 = i64toi32_i32$1;
     i64toi32_i32$1 = $4_1;
     HEAP32[($4_1 + 128088 | 0) >> 2] = $11919;
     HEAP32[($4_1 + 128092 | 0) >> 2] = i64toi32_i32$0;
     i64toi32_i32$0 = HEAP32[($4_1 + 128088 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[($4_1 + 128092 | 0) >> 2] | 0;
     $11931 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 102480 | 0) >> 2] = $11931;
     HEAP32[($4_1 + 102484 | 0) >> 2] = i64toi32_i32$1;
     $15($4_1 + 128112 | 0 | 0, $5_1 | 0, $4_1 + 128096 | 0 | 0, $4_1 + 102480 | 0 | 0);
     $246($4_1 + 102488 | 0 | 0, $4_1 + 128112 | 0 | 0, 25600 | 0) | 0;
     $5($5_1 | 0, $4_1 + 102488 | 0 | 0);
     $16($4_1 + 128096 | 0 | 0) | 0;
     break label$1;
    default:
     break label$2;
    };
   }
   $248(2194 | 0, 0 | 0) | 0;
  }
  $16($4_1 + 262472 | 0 | 0) | 0;
  global$0 = $4_1 + 262496 | 0;
  return;
 }
 
 function $11($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  $17($4_1 + 8 | 0 | 0, $3_1 + 8 | 0 | 0, $3_1 | 0) | 0;
  $18($4_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $12($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  HEAP32[$6_1 >> 2] = HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0;
  return $6_1 | 0;
 }
 
 function $13($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $21($5_1 | 0, $19($1_1 | 0) | 0 | 0, $20($1_1 | 0) | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $14($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $34_1 = 0;
  $4_1 = global$0 - 48 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 40 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 36 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 40 | 0) >> 2] | 0;
  HEAP32[($4_1 + 44 | 0) >> 2] = $5_1;
  HEAP32[$5_1 >> 2] = 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = 0;
  HEAP32[($4_1 + 32 | 0) >> 2] = 0;
  $28($27(HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) | 0 | 0);
  $29($5_1 + 8 | 0 | 0, $4_1 + 32 | 0 | 0, $4_1 + 24 | 0 | 0) | 0;
  $18($5_1 | 0);
  HEAP32[($4_1 + 12 | 0) >> 2] = $30(HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 > 0 >>> 0 & 1 | 0)) {
    break label$1
   }
   $31($5_1 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
   $32($5_1 | 0, HEAP32[(HEAP32[($4_1 + 36 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  }
  $34_1 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  global$0 = $4_1 + 48 | 0;
  return $34_1 | 0;
 }
 
 function $15($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, $37_1 = 0;
  $6_1 = global$0 - 48 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 44 | 0) >> 2] = $1_1;
  $247($0_1 | 0, 0 | 0, 25600 | 0) | 0;
  HEAP32[($6_1 + 40 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 32 | 0) >> 2] = $22(HEAP32[($6_1 + 40 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($6_1 + 24 | 0) >> 2] = $23(HEAP32[($6_1 + 40 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!(($24($6_1 + 32 | 0 | 0, $6_1 + 24 | 0 | 0) | 0) & 1 | 0)) {
     break label$1
    }
    i64toi32_i32$2 = $25($6_1 + 32 | 0 | 0) | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    HEAP32[($6_1 + 16 | 0) >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
    HEAP32[($6_1 + 20 | 0) >> 2] = i64toi32_i32$1;
    HEAP32[($3($2($0_1 | 0, ((HEAP32[($6_1 + 16 | 0) >> 2] | 0) - (HEAP32[$3_1 >> 2] | 0) | 0) - 40 | 0 | 0) | 0 | 0, (HEAP32[($6_1 + 20 | 0) >> 2] | 0) - (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0 | 0) | 0) >> 2] = 1;
    $37_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
    HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 20 | 0) >> 2] | 0;
    HEAP32[$6_1 >> 2] = $37_1;
    $248(2128 | 0, $6_1 | 0) | 0;
    $26($6_1 + 32 | 0 | 0) | 0;
    continue label$2;
   };
  }
  global$0 = $6_1 + 48 | 0;
  return;
 }
 
 function $16($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0, $15_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $4_1;
  $33($4_1 | 0);
  label$1 : {
   if (!((HEAP32[$4_1 >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $34($4_1 | 0);
   $37($35($4_1 | 0) | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0, $36($4_1 | 0) | 0 | 0);
  }
  $15_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $15_1 | 0;
 }
 
 function $17($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $146($6_1 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $147($6_1 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $18($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return;
 }
 
 function $19($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0;
 }
 
 function $20($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  return (HEAP32[$4_1 >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) << 3 | 0) | 0 | 0;
 }
 
 function $21($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  HEAP32[($5_1 + 16 | 0) >> 2] = $168(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 <= ($36($6_1 | 0) | 0) >>> 0 & 1 | 0)) {
     break label$2
    }
    HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
    HEAP8[($5_1 + 11 | 0) >> 0] = 0;
    label$3 : {
     if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 > ($30($6_1 | 0) | 0) >>> 0 & 1 | 0)) {
      break label$3
     }
     HEAP8[($5_1 + 11 | 0) >> 0] = 1;
     HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
     $169($5_1 + 12 | 0 | 0, $30($6_1 | 0) | 0 | 0);
    }
    HEAP32[($5_1 + 4 | 0) >> 2] = $170(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[$6_1 >> 2] | 0 | 0) | 0;
    label$4 : {
     label$5 : {
      if (!((HEAPU8[($5_1 + 11 | 0) >> 0] | 0) & 1 | 0)) {
       break label$5
      }
      $171($6_1 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0, (HEAP32[($5_1 + 16 | 0) >> 2] | 0) - ($30($6_1 | 0) | 0) | 0 | 0);
      break label$4;
     }
     $172($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
    }
    break label$1;
   }
   $173($6_1 | 0);
   $31($6_1 | 0, $174($6_1 | 0, HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) | 0 | 0);
   $171($6_1 | 0, HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0);
  }
  $175($6_1 | 0);
  global$0 = $5_1 + 32 | 0;
  return;
 }
 
 function $22($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $54($4_1 | 0, HEAP32[$4_1 >> 2] | 0 | 0) | 0;
  $7_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $23($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $54($4_1 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  $7_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $24($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $11_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11_1 = (($55(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0) ^ -1 | 0) & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $11_1 | 0;
 }
 
 function $25($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0;
 }
 
 function $26($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + 8 | 0;
  return $4_1 | 0;
 }
 
 function $27($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $7_1 = $209((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $28($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return;
 }
 
 function $29($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $146($6_1 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $219($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $30($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  return ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) - (HEAP32[$4_1 >> 2] | 0) | 0) >> 3 | 0 | 0;
 }
 
 function $31($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $15_1 = 0, $20_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0 > ($190($5_1 | 0) | 0) >>> 0 & 1 | 0)) {
    break label$1
   }
   $191($5_1 | 0);
   wasm2js_trap();
  }
  $15_1 = $192($35($5_1 | 0) | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = $15_1;
  HEAP32[$5_1 >> 2] = $15_1;
  $20_1 = (HEAP32[$5_1 >> 2] | 0) + ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 3 | 0) | 0;
  HEAP32[($189($5_1 | 0) | 0) >> 2] = $20_1;
  $193($5_1 | 0, 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $32($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $7_1 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
  $7_1 = HEAP32[($6_1 + 28 | 0) >> 2] | 0;
  $183($6_1 | 0, $7_1 | 0, HEAP32[($6_1 + 16 | 0) >> 2] | 0 | 0) | 0;
  $220($35($7_1 | 0) | 0 | 0, HEAP32[($6_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 20 | 0) >> 2] | 0 | 0, $6_1 + 4 | 0 | 0);
  $185($6_1 | 0) | 0;
  global$0 = $6_1 + 32 | 0;
  return;
 }
 
 function $33($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $151($4_1 | 0, $150($4_1 | 0) | 0 | 0, ($150($4_1 | 0) | 0) + (($36($4_1 | 0) | 0) << 3 | 0) | 0 | 0, ($150($4_1 | 0) | 0) + (($30($4_1 | 0) | 0) << 3 | 0) | 0 | 0, ($150($4_1 | 0) | 0) + (($36($4_1 | 0) | 0) << 3 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $34($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $152($4_1 | 0, HEAP32[$4_1 >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $35($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $7_1 = $154((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $36($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $10_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $10_1 = ((HEAP32[($155($4_1 | 0) | 0) >> 2] | 0) - (HEAP32[$4_1 >> 2] | 0) | 0) >> 3 | 0;
  global$0 = $3_1 + 16 | 0;
  return $10_1 | 0;
 }
 
 function $37($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $153(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $38($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 96 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 92 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 88 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 88 | 0) >> 2] | 0;
  HEAP8[($4_1 + 87 | 0) >> 0] = 0 & 1 | 0;
  $39($0_1 | 0) | 0;
  HEAP32[($4_1 + 80 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 80 | 0) >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($4_1 + 76 | 0) >> 2] = 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($4_1 + 76 | 0) >> 2] | 0 | 0) < (80 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       if (!(HEAP32[($3($2($5_1 | 0, HEAP32[($4_1 + 80 | 0) >> 2] | 0 | 0) | 0 | 0, HEAP32[($4_1 + 76 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0)) {
        break label$5
       }
       $344($4_1 + 16 | 0 | 0, HEAP32[($4_1 + 80 | 0) >> 2] | 0 | 0);
       $40($4_1 + 32 | 0 | 0, $4_1 + 16 | 0 | 0, 2113 | 0);
       $344($4_1 | 0, HEAP32[($4_1 + 76 | 0) >> 2] | 0 | 0);
       $41($4_1 + 48 | 0 | 0, $4_1 + 32 | 0 | 0, $4_1 | 0);
       $40($4_1 + 64 | 0 | 0, $4_1 + 48 | 0 | 0, 2115 | 0);
       $42($0_1 | 0, $4_1 + 64 | 0 | 0) | 0;
       $340($4_1 + 64 | 0 | 0) | 0;
       $340($4_1 + 48 | 0 | 0) | 0;
       $340($4_1 | 0) | 0;
       $340($4_1 + 32 | 0 | 0) | 0;
       $340($4_1 + 16 | 0 | 0) | 0;
      }
      HEAP32[($4_1 + 76 | 0) >> 2] = (HEAP32[($4_1 + 76 | 0) >> 2] | 0) + 1 | 0;
      continue label$4;
     };
    }
    HEAP32[($4_1 + 80 | 0) >> 2] = (HEAP32[($4_1 + 80 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  label$6 : {
   if (!($43($0_1 | 0) | 0)) {
    break label$6
   }
   $44($0_1 | 0);
  }
  HEAP8[($4_1 + 87 | 0) >> 0] = 1 & 1 | 0;
  label$7 : {
   if ((HEAPU8[($4_1 + 87 | 0) >> 0] | 0) & 1 | 0) {
    break label$7
   }
   $340($0_1 | 0) | 0;
  }
  global$0 = $4_1 + 96 | 0;
  return;
 }
 
 function $39($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $45($4_1 | 0, $3_1 + 8 | 0 | 0, $3_1 | 0) | 0;
  $46($4_1 | 0);
  $47($4_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $40($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $48($0_1 | 0, $343(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $41($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $48($0_1 | 0, $49(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $42($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $49(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $43($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($50($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $51($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $52($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $44($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $53($4_1 | 0, ($43($4_1 | 0) | 0) - 1 | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $45($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  $221($6_1 | 0) | 0;
  $222($6_1 | 0) | 0;
  global$0 = $5_1 + 32 | 0;
  return $6_1 | 0;
 }
 
 function $46($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return;
 }
 
 function $47($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $223(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0) >>> 0 < 3 >>> 0 & 1 | 0)) {
     break label$1
    }
    HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + ((HEAP32[($3_1 + 4 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] = 0;
    HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $48($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, i64toi32_i32$1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $6_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  $7_1 = 8;
  HEAP32[($5_1 + $7_1 | 0) >> 2] = HEAP32[($6_1 + $7_1 | 0) >> 2] | 0;
  $47(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  $46($5_1 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $49($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $10_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $10_1 = $342(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $125(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, $43(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $10_1 | 0;
 }
 
 function $50($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $16_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $16_1 = (((HEAPU8[(($130(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 11 | 0) >> 0] | 0) & 255 | 0) & 128 | 0 | 0) != (0 | 0) & 1 | 0;
  global$0 = $3_1 + 16 | 0;
  return $16_1 | 0;
 }
 
 function $51($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[(($130(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 4 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $52($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $8_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $8_1 = (HEAPU8[(($130(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 11 | 0) >> 0] | 0) & 255 | 0;
  global$0 = $3_1 + 16 | 0;
  return $8_1 | 0;
 }
 
 function $53($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $229($5_1 | 0, $228($227($5_1 | 0) | 0 | 0) | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $54($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $9_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $0_1;
  HEAP32[$4_1 >> 2] = $1_1;
  $238($4_1 + 8 | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0) | 0;
  $9_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $55($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $13_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $13_1 = ($62(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) == ($62(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0) & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $13_1 | 0;
 }
 
 function $56() {
  var $2_1 = 0;
  $2_1 = global$0 - 25616 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 25612 | 0) >> 2] = 0;
  $57($2_1 + 8 | 0 | 0) | 0;
  $9($2_1 + 8 | 0 | 0);
  $7($2_1 + 8 | 0 | 0);
  $9($2_1 + 8 | 0 | 0);
  global$0 = $2_1 + 25616 | 0;
  return 0 | 0;
 }
 
 function $57($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0, $12_1 = 0, $8_1 = 0, $18_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $4_1;
  $247($4_1 | 0, 0 | 0, 25600 | 0) | 0;
  $8_1 = $4_1 + 25600 | 0;
  $9_1 = $4_1;
  label$1 : while (1) {
   $12_1 = $9_1 + 320 | 0;
   $9_1 = $12_1;
   if (!(($12_1 | 0) == ($8_1 | 0) & 1 | 0)) {
    continue label$1
   }
   break label$1;
  };
  $18_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $18_1 | 0;
 }
 
 function $58() {
  $59(5440 | 0) | 0;
  return;
 }
 
 function $59($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $61($4_1 | 0, 1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $60() {
  var $2_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $33_1 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, $15_1 = 0, $16_1 = 0, $18_1 = 0, $19_1 = 0, $21_1 = 0, $22_1 = 0, $23_1 = 0, $31_1 = 0, $242_1 = 0, $35_1 = 0, $36_1 = 0, $38_1 = 0, $39_1 = 0, $40_1 = 0, $270_1 = 0, $283_1 = 0, $45_1 = 0, $46_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $311_1 = 0, $324_1 = 0, $55_1 = 0, $56_1 = 0, $58_1 = 0, $59_1 = 0, $60_1 = 0, $352_1 = 0, $365_1 = 0, $65_1 = 0, $66_1 = 0, $68_1 = 0, $69_1 = 0, $70_1 = 0, $393_1 = 0, $406_1 = 0, $75_1 = 0, $76_1 = 0, $78_1 = 0, $79_1 = 0, $80_1 = 0, $434 = 0, $447 = 0, $85_1 = 0, $86_1 = 0, $88_1 = 0, $89_1 = 0, $90_1 = 0, $475 = 0, $488 = 0, $95_1 = 0, $96_1 = 0, $98_1 = 0, $99_1 = 0, $100_1 = 0, $516 = 0, $526 = 0, $103_1 = 0, $104_1 = 0, $106_1 = 0, $107_1 = 0, $552 = 0;
  $2_1 = global$0 - 448 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 160 | 0) >> 2] = $2_1 + 136 | 0;
  HEAP32[($2_1 + 156 | 0) >> 2] = 1424;
  $63();
  HEAP32[($2_1 + 152 | 0) >> 2] = 2;
  HEAP32[($2_1 + 148 | 0) >> 2] = $65() | 0;
  HEAP32[($2_1 + 144 | 0) >> 2] = $66() | 0;
  HEAP32[($2_1 + 140 | 0) >> 2] = 3;
  $10_1 = $68() | 0;
  $11_1 = $69() | 0;
  $12_1 = $70() | 0;
  $13_1 = $71() | 0;
  HEAP32[($2_1 + 424 | 0) >> 2] = HEAP32[($2_1 + 152 | 0) >> 2] | 0;
  $15_1 = $72() | 0;
  $16_1 = HEAP32[($2_1 + 152 | 0) >> 2] | 0;
  HEAP32[($2_1 + 432 | 0) >> 2] = HEAP32[($2_1 + 148 | 0) >> 2] | 0;
  $18_1 = $73() | 0;
  $19_1 = HEAP32[($2_1 + 148 | 0) >> 2] | 0;
  HEAP32[($2_1 + 428 | 0) >> 2] = HEAP32[($2_1 + 144 | 0) >> 2] | 0;
  $21_1 = $73() | 0;
  $22_1 = HEAP32[($2_1 + 144 | 0) >> 2] | 0;
  $23_1 = HEAP32[($2_1 + 156 | 0) >> 2] | 0;
  HEAP32[($2_1 + 436 | 0) >> 2] = HEAP32[($2_1 + 140 | 0) >> 2] | 0;
  fimport$0($10_1 | 0, $11_1 | 0, $12_1 | 0, $13_1 | 0, $15_1 | 0, $16_1 | 0, $18_1 | 0, $19_1 | 0, $21_1 | 0, $22_1 | 0, $23_1 | 0, $74() | 0 | 0, HEAP32[($2_1 + 140 | 0) >> 2] | 0 | 0);
  HEAP32[($2_1 + 164 | 0) >> 2] = $2_1 + 136 | 0;
  HEAP32[($2_1 + 444 | 0) >> 2] = HEAP32[($2_1 + 164 | 0) >> 2] | 0;
  HEAP32[($2_1 + 440 | 0) >> 2] = 4;
  $31_1 = HEAP32[($2_1 + 444 | 0) >> 2] | 0;
  $76(HEAP32[($2_1 + 440 | 0) >> 2] | 0 | 0);
  $33_1 = 0;
  HEAP32[($2_1 + 132 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 128 | 0) >> 2] = 5;
  i64toi32_i32$0 = HEAP32[($2_1 + 128 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 132 | 0) >> 2] | 0;
  $242_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 168 | 0) >> 2] = $242_1;
  HEAP32[($2_1 + 172 | 0) >> 2] = i64toi32_i32$1;
  $35_1 = HEAP32[($2_1 + 168 | 0) >> 2] | 0;
  $36_1 = HEAP32[($2_1 + 172 | 0) >> 2] | 0;
  HEAP32[($2_1 + 196 | 0) >> 2] = $31_1;
  HEAP32[($2_1 + 192 | 0) >> 2] = 1337;
  HEAP32[($2_1 + 188 | 0) >> 2] = $36_1;
  HEAP32[($2_1 + 184 | 0) >> 2] = $35_1;
  $38_1 = HEAP32[($2_1 + 196 | 0) >> 2] | 0;
  $39_1 = HEAP32[($2_1 + 192 | 0) >> 2] | 0;
  $40_1 = HEAP32[($2_1 + 184 | 0) >> 2] | 0;
  HEAP32[($2_1 + 180 | 0) >> 2] = HEAP32[($2_1 + 188 | 0) >> 2] | 0;
  HEAP32[($2_1 + 176 | 0) >> 2] = $40_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 176 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 180 | 0) >> 2] | 0;
  $270_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 48 | 0) >> 2] = $270_1;
  HEAP32[($2_1 + 52 | 0) >> 2] = i64toi32_i32$0;
  $77($39_1 | 0, $2_1 + 48 | 0 | 0);
  HEAP32[($2_1 + 124 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 120 | 0) >> 2] = 6;
  i64toi32_i32$0 = HEAP32[($2_1 + 120 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 124 | 0) >> 2] | 0;
  $283_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 200 | 0) >> 2] = $283_1;
  HEAP32[($2_1 + 204 | 0) >> 2] = i64toi32_i32$1;
  $45_1 = HEAP32[($2_1 + 200 | 0) >> 2] | 0;
  $46_1 = HEAP32[($2_1 + 204 | 0) >> 2] | 0;
  HEAP32[($2_1 + 228 | 0) >> 2] = $38_1;
  HEAP32[($2_1 + 224 | 0) >> 2] = 1372;
  HEAP32[($2_1 + 220 | 0) >> 2] = $46_1;
  HEAP32[($2_1 + 216 | 0) >> 2] = $45_1;
  $48_1 = HEAP32[($2_1 + 228 | 0) >> 2] | 0;
  $49_1 = HEAP32[($2_1 + 224 | 0) >> 2] | 0;
  $50_1 = HEAP32[($2_1 + 216 | 0) >> 2] | 0;
  HEAP32[($2_1 + 212 | 0) >> 2] = HEAP32[($2_1 + 220 | 0) >> 2] | 0;
  HEAP32[($2_1 + 208 | 0) >> 2] = $50_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 208 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 212 | 0) >> 2] | 0;
  $311_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 40 | 0) >> 2] = $311_1;
  HEAP32[($2_1 + 44 | 0) >> 2] = i64toi32_i32$0;
  $78($49_1 | 0, $2_1 + 40 | 0 | 0);
  HEAP32[($2_1 + 116 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 112 | 0) >> 2] = 7;
  i64toi32_i32$0 = HEAP32[($2_1 + 112 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 116 | 0) >> 2] | 0;
  $324_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 232 | 0) >> 2] = $324_1;
  HEAP32[($2_1 + 236 | 0) >> 2] = i64toi32_i32$1;
  $55_1 = HEAP32[($2_1 + 232 | 0) >> 2] | 0;
  $56_1 = HEAP32[($2_1 + 236 | 0) >> 2] | 0;
  HEAP32[($2_1 + 260 | 0) >> 2] = $48_1;
  HEAP32[($2_1 + 256 | 0) >> 2] = 1406;
  HEAP32[($2_1 + 252 | 0) >> 2] = $56_1;
  HEAP32[($2_1 + 248 | 0) >> 2] = $55_1;
  $58_1 = HEAP32[($2_1 + 260 | 0) >> 2] | 0;
  $59_1 = HEAP32[($2_1 + 256 | 0) >> 2] | 0;
  $60_1 = HEAP32[($2_1 + 248 | 0) >> 2] | 0;
  HEAP32[($2_1 + 244 | 0) >> 2] = HEAP32[($2_1 + 252 | 0) >> 2] | 0;
  HEAP32[($2_1 + 240 | 0) >> 2] = $60_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 240 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 244 | 0) >> 2] | 0;
  $352_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 32 | 0) >> 2] = $352_1;
  HEAP32[($2_1 + 36 | 0) >> 2] = i64toi32_i32$0;
  $79($59_1 | 0, $2_1 + 32 | 0 | 0);
  HEAP32[($2_1 + 108 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 104 | 0) >> 2] = 8;
  i64toi32_i32$0 = HEAP32[($2_1 + 104 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 108 | 0) >> 2] | 0;
  $365_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 264 | 0) >> 2] = $365_1;
  HEAP32[($2_1 + 268 | 0) >> 2] = i64toi32_i32$1;
  $65_1 = HEAP32[($2_1 + 264 | 0) >> 2] | 0;
  $66_1 = HEAP32[($2_1 + 268 | 0) >> 2] | 0;
  HEAP32[($2_1 + 292 | 0) >> 2] = $58_1;
  HEAP32[($2_1 + 288 | 0) >> 2] = 1395;
  HEAP32[($2_1 + 284 | 0) >> 2] = $66_1;
  HEAP32[($2_1 + 280 | 0) >> 2] = $65_1;
  $68_1 = HEAP32[($2_1 + 292 | 0) >> 2] | 0;
  $69_1 = HEAP32[($2_1 + 288 | 0) >> 2] | 0;
  $70_1 = HEAP32[($2_1 + 280 | 0) >> 2] | 0;
  HEAP32[($2_1 + 276 | 0) >> 2] = HEAP32[($2_1 + 284 | 0) >> 2] | 0;
  HEAP32[($2_1 + 272 | 0) >> 2] = $70_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 272 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 276 | 0) >> 2] | 0;
  $393_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 24 | 0) >> 2] = $393_1;
  HEAP32[($2_1 + 28 | 0) >> 2] = i64toi32_i32$0;
  $80($69_1 | 0, $2_1 + 24 | 0 | 0);
  HEAP32[($2_1 + 100 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 96 | 0) >> 2] = 9;
  i64toi32_i32$0 = HEAP32[($2_1 + 96 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 100 | 0) >> 2] | 0;
  $406_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 360 | 0) >> 2] = $406_1;
  HEAP32[($2_1 + 364 | 0) >> 2] = i64toi32_i32$1;
  $75_1 = HEAP32[($2_1 + 360 | 0) >> 2] | 0;
  $76_1 = HEAP32[($2_1 + 364 | 0) >> 2] | 0;
  HEAP32[($2_1 + 388 | 0) >> 2] = $68_1;
  HEAP32[($2_1 + 384 | 0) >> 2] = 1414;
  HEAP32[($2_1 + 380 | 0) >> 2] = $76_1;
  HEAP32[($2_1 + 376 | 0) >> 2] = $75_1;
  $78_1 = HEAP32[($2_1 + 388 | 0) >> 2] | 0;
  $79_1 = HEAP32[($2_1 + 384 | 0) >> 2] | 0;
  $80_1 = HEAP32[($2_1 + 376 | 0) >> 2] | 0;
  HEAP32[($2_1 + 372 | 0) >> 2] = HEAP32[($2_1 + 380 | 0) >> 2] | 0;
  HEAP32[($2_1 + 368 | 0) >> 2] = $80_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 368 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 372 | 0) >> 2] | 0;
  $434 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 16 | 0) >> 2] = $434;
  HEAP32[($2_1 + 20 | 0) >> 2] = i64toi32_i32$0;
  $81($79_1 | 0, $2_1 + 16 | 0 | 0);
  HEAP32[($2_1 + 92 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 88 | 0) >> 2] = 10;
  i64toi32_i32$0 = HEAP32[($2_1 + 88 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 92 | 0) >> 2] | 0;
  $447 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 328 | 0) >> 2] = $447;
  HEAP32[($2_1 + 332 | 0) >> 2] = i64toi32_i32$1;
  $85_1 = HEAP32[($2_1 + 328 | 0) >> 2] | 0;
  $86_1 = HEAP32[($2_1 + 332 | 0) >> 2] | 0;
  HEAP32[($2_1 + 356 | 0) >> 2] = $78_1;
  HEAP32[($2_1 + 352 | 0) >> 2] = 1183;
  HEAP32[($2_1 + 348 | 0) >> 2] = $86_1;
  HEAP32[($2_1 + 344 | 0) >> 2] = $85_1;
  $88_1 = HEAP32[($2_1 + 356 | 0) >> 2] | 0;
  $89_1 = HEAP32[($2_1 + 352 | 0) >> 2] | 0;
  $90_1 = HEAP32[($2_1 + 344 | 0) >> 2] | 0;
  HEAP32[($2_1 + 340 | 0) >> 2] = HEAP32[($2_1 + 348 | 0) >> 2] | 0;
  HEAP32[($2_1 + 336 | 0) >> 2] = $90_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 336 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 340 | 0) >> 2] | 0;
  $475 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 8 | 0) >> 2] = $475;
  HEAP32[($2_1 + 12 | 0) >> 2] = i64toi32_i32$0;
  $81($89_1 | 0, $2_1 + 8 | 0 | 0);
  HEAP32[($2_1 + 84 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 80 | 0) >> 2] = 11;
  i64toi32_i32$0 = HEAP32[($2_1 + 80 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 84 | 0) >> 2] | 0;
  $488 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 392 | 0) >> 2] = $488;
  HEAP32[($2_1 + 396 | 0) >> 2] = i64toi32_i32$1;
  $95_1 = HEAP32[($2_1 + 392 | 0) >> 2] | 0;
  $96_1 = HEAP32[($2_1 + 396 | 0) >> 2] | 0;
  HEAP32[($2_1 + 420 | 0) >> 2] = $88_1;
  HEAP32[($2_1 + 416 | 0) >> 2] = 1359;
  HEAP32[($2_1 + 412 | 0) >> 2] = $96_1;
  HEAP32[($2_1 + 408 | 0) >> 2] = $95_1;
  $98_1 = HEAP32[($2_1 + 420 | 0) >> 2] | 0;
  $99_1 = HEAP32[($2_1 + 416 | 0) >> 2] | 0;
  $100_1 = HEAP32[($2_1 + 408 | 0) >> 2] | 0;
  HEAP32[($2_1 + 404 | 0) >> 2] = HEAP32[($2_1 + 412 | 0) >> 2] | 0;
  HEAP32[($2_1 + 400 | 0) >> 2] = $100_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 400 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 404 | 0) >> 2] | 0;
  $516 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[$2_1 >> 2] = $516;
  HEAP32[($2_1 + 4 | 0) >> 2] = i64toi32_i32$0;
  $82($99_1 | 0, $2_1 | 0);
  HEAP32[($2_1 + 76 | 0) >> 2] = $33_1;
  HEAP32[($2_1 + 72 | 0) >> 2] = 12;
  i64toi32_i32$0 = HEAP32[($2_1 + 72 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($2_1 + 76 | 0) >> 2] | 0;
  $526 = i64toi32_i32$0;
  i64toi32_i32$0 = $2_1;
  HEAP32[($2_1 + 296 | 0) >> 2] = $526;
  HEAP32[($2_1 + 300 | 0) >> 2] = i64toi32_i32$1;
  $103_1 = HEAP32[($2_1 + 296 | 0) >> 2] | 0;
  $104_1 = HEAP32[($2_1 + 300 | 0) >> 2] | 0;
  HEAP32[($2_1 + 324 | 0) >> 2] = $98_1;
  HEAP32[($2_1 + 320 | 0) >> 2] = 1386;
  HEAP32[($2_1 + 316 | 0) >> 2] = $104_1;
  HEAP32[($2_1 + 312 | 0) >> 2] = $103_1;
  $106_1 = HEAP32[($2_1 + 320 | 0) >> 2] | 0;
  $107_1 = HEAP32[($2_1 + 312 | 0) >> 2] | 0;
  HEAP32[($2_1 + 308 | 0) >> 2] = HEAP32[($2_1 + 316 | 0) >> 2] | 0;
  HEAP32[($2_1 + 304 | 0) >> 2] = $107_1;
  i64toi32_i32$1 = HEAP32[($2_1 + 304 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($2_1 + 308 | 0) >> 2] | 0;
  $552 = i64toi32_i32$1;
  i64toi32_i32$1 = $2_1;
  HEAP32[($2_1 + 56 | 0) >> 2] = $552;
  HEAP32[($2_1 + 60 | 0) >> 2] = i64toi32_i32$0;
  $81($106_1 | 0, $2_1 + 56 | 0 | 0);
  $83($2_1 + 64 | 0 | 0, 1346 | 0) | 0;
  $84($84($84($84($84($2_1 + 64 | 0 | 0, 1472 | 0, 0 | 0) | 0 | 0, 1483 | 0, 1 | 0) | 0 | 0, 2106 | 0, 2 | 0) | 0 | 0, 1465 | 0, 3 | 0) | 0 | 0, 1453 | 0, 4 | 0) | 0;
  global$0 = $2_1 + 448 | 0;
  return;
 }
 
 function $61($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = 0;
  FUNCTION_TABLE[HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0]();
  $243($5_1 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $62($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0;
 }
 
 function $63() {
  
 }
 
 function $64($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $86(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $65() {
  return 0 | 0;
 }
 
 function $66() {
  return 0 | 0;
 }
 
 function $67($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   if (($4_1 | 0) == (0 | 0) & 1 | 0) {
    break label$1
   }
   $298($4_1 | 0);
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $68() {
  return $87() | 0 | 0;
 }
 
 function $69() {
  return $88() | 0 | 0;
 }
 
 function $70() {
  return $89() | 0 | 0;
 }
 
 function $71() {
  return 0 | 0;
 }
 
 function $72() {
  return 2272 | 0;
 }
 
 function $73() {
  return 2275 | 0;
 }
 
 function $74() {
  return 2277 | 0;
 }
 
 function $75() {
  var $1_1 = 0;
  $1_1 = $297(25600 | 0) | 0;
  $57($1_1 | 0) | 0;
  return $1_1 | 0;
 }
 
 function $76($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $9_1 = 0, $13_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = 13;
  $5_1 = $68() | 0;
  $9_1 = $91($3_1 + 16 | 0 | 0) | 0;
  $13_1 = $92($3_1 + 16 | 0 | 0) | 0;
  HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  fimport$3($5_1 | 0, $9_1 | 0, $13_1 | 0, $72() | 0 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $77($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 14;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $96($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $97($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $98() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $99($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $78($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 15;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $105($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $106($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $107() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $108($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $79($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 16;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $111($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $112($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $113() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $114($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $80($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 17;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $118($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $119($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $120() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $121($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $81($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 18;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $134($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $135($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $136() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $137($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $82($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $8_1 = 0, $9_1 = 0, $13_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$1_1 >> 2] | 0;
  $6_1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $6_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $5_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 19;
  $8_1 = $68() | 0;
  $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $13_1 = $140($4_1 + 8 | 0 | 0) | 0;
  $17_1 = $141($4_1 + 8 | 0 | 0) | 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$4($8_1 | 0, $9_1 | 0, $13_1 | 0, $17_1 | 0, $113() | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $142($4_1 + 16 | 0 | 0) | 0 | 0, 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $83($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  fimport$1($85() | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, 4 | 0, 0 & 1 | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $84($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  fimport$2($85() | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $85() {
  return $145() | 0 | 0;
 }
 
 function $86($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 2216 | 0;
 }
 
 function $87() {
  return 2216 | 0;
 }
 
 function $88() {
  return 2232 | 0;
 }
 
 function $89() {
  return 2256 | 0;
 }
 
 function $90($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $93(FUNCTION_TABLE[HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0]() | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $91($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 1 | 0;
 }
 
 function $92($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $94() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $93($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $94() {
  return 2280 | 0;
 }
 
 function $95($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $14_1 = 0, $20_1 = 0, $8_1 = 0, $31_1 = 0;
  $6_1 = global$0 - 16 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[$6_1 >> 2] = $3_1;
  $8_1 = $100(HEAP32[($6_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $9_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
  $10_1 = HEAP32[($9_1 + 4 | 0) >> 2] | 0;
  $11_1 = HEAP32[$9_1 >> 2] | 0;
  $14_1 = $8_1 + ($10_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($10_1 & 1 | 0)) {
     break label$2
    }
    $20_1 = HEAP32[((HEAP32[$14_1 >> 2] | 0) + $11_1 | 0) >> 2] | 0;
    break label$1;
   }
   $20_1 = $11_1;
  }
  $31_1 = ($102((FUNCTION_TABLE[$20_1 | 0]($14_1, $101(HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0) | 0, $101(HEAP32[$6_1 >> 2] | 0 | 0) | 0) | 0) & 1 | 0 | 0) | 0) & 1 | 0;
  global$0 = $6_1 + 16 | 0;
  return $31_1 | 0;
 }
 
 function $96($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 4 | 0;
 }
 
 function $97($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $103() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $98() {
  return 2304 | 0;
 }
 
 function $99($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $100($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $101($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $102($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP8[($3_1 + 15 | 0) >> 0] = $0_1;
  return (HEAPU8[($3_1 + 15 | 0) >> 0] | 0) & 1 | 0 | 0;
 }
 
 function $103() {
  return 2288 | 0;
 }
 
 function $104($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $14_1 = 0, $20_1 = 0, $8_1 = 0;
  $6_1 = global$0 - 16 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[$6_1 >> 2] = $3_1;
  $8_1 = $100(HEAP32[($6_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $9_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
  $10_1 = HEAP32[($9_1 + 4 | 0) >> 2] | 0;
  $11_1 = HEAP32[$9_1 >> 2] | 0;
  $14_1 = $8_1 + ($10_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($10_1 & 1 | 0)) {
     break label$2
    }
    $20_1 = HEAP32[((HEAP32[$14_1 >> 2] | 0) + $11_1 | 0) >> 2] | 0;
    break label$1;
   }
   $20_1 = $11_1;
  }
  FUNCTION_TABLE[$20_1 | 0]($14_1, $101(HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0) | 0, $101(HEAP32[$6_1 >> 2] | 0 | 0) | 0);
  global$0 = $6_1 + 16 | 0;
  return;
 }
 
 function $105($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 4 | 0;
 }
 
 function $106($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $109() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $107() {
  return 2336 | 0;
 }
 
 function $108($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $109() {
  return 2320 | 0;
 }
 
 function $110($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $8_1 = 0, $9_1 = 0, $10_1 = 0, $13_1 = 0, $19_1 = 0, $7_1 = 0;
  $5_1 = global$0 - 51216 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 51212 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 51208 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 51204 | 0) >> 2] = $2_1;
  $7_1 = $100(HEAP32[($5_1 + 51208 | 0) >> 2] | 0 | 0) | 0;
  $8_1 = HEAP32[($5_1 + 51212 | 0) >> 2] | 0;
  $9_1 = HEAP32[($8_1 + 4 | 0) >> 2] | 0;
  $10_1 = HEAP32[$8_1 >> 2] | 0;
  $13_1 = $7_1 + ($9_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($9_1 & 1 | 0)) {
     break label$2
    }
    $19_1 = HEAP32[((HEAP32[$13_1 >> 2] | 0) + $10_1 | 0) >> 2] | 0;
    break label$1;
   }
   $19_1 = $10_1;
  }
  $246($5_1 + 25600 | 0 | 0, $115(HEAP32[($5_1 + 51204 | 0) >> 2] | 0 | 0) | 0 | 0, 25600 | 0) | 0;
  $246($5_1 | 0, $5_1 + 25600 | 0 | 0, 25600 | 0) | 0;
  FUNCTION_TABLE[$19_1 | 0]($13_1, $5_1);
  global$0 = $5_1 + 51216 | 0;
  return;
 }
 
 function $111($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 3 | 0;
 }
 
 function $112($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $116() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $113() {
  return 2400 | 0;
 }
 
 function $114($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $115($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $116() {
  return 2344 | 0;
 }
 
 function $117($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0, $8_1 = 0, $9_1 = 0, $12_1 = 0, $18_1 = 0, $6_1 = 0, $26_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $1_1;
  $6_1 = $100(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0) | 0;
  $7_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  $8_1 = HEAP32[($7_1 + 4 | 0) >> 2] | 0;
  $9_1 = HEAP32[$7_1 >> 2] | 0;
  $12_1 = $6_1 + ($8_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($8_1 & 1 | 0)) {
     break label$2
    }
    $18_1 = HEAP32[((HEAP32[$12_1 >> 2] | 0) + $9_1 | 0) >> 2] | 0;
    break label$1;
   }
   $18_1 = $9_1;
  }
  FUNCTION_TABLE[$18_1 | 0]($4_1 + 8 | 0, $12_1);
  $26_1 = $122($4_1 + 8 | 0 | 0) | 0;
  $340($4_1 + 8 | 0 | 0) | 0;
  global$0 = $4_1 + 32 | 0;
  return $26_1 | 0;
 }
 
 function $118($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 2 | 0;
 }
 
 function $119($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $123() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $120() {
  return 2488 | 0;
 }
 
 function $121($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $122($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $12_1 = 0, $23_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $287((($124(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) << 0 | 0) + 4 | 0 | 0) | 0;
  $12_1 = $124(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] = $12_1;
  $246((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0 | 0, $125(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0, ($124(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) << 0 | 0 | 0) | 0;
  $23_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $23_1 | 0;
 }
 
 function $123() {
  return 2408 | 0;
 }
 
 function $124($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $43(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $125($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $127($126(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $126($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($50($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $128($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $129($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $127($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $128($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[($130(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $129($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $131($130(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $130($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $132(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $131($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $132($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $133($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0, $8_1 = 0, $9_1 = 0, $12_1 = 0, $18_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $6_1 = $100(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $7_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $8_1 = HEAP32[($7_1 + 4 | 0) >> 2] | 0;
  $9_1 = HEAP32[$7_1 >> 2] | 0;
  $12_1 = $6_1 + ($8_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($8_1 & 1 | 0)) {
     break label$2
    }
    $18_1 = HEAP32[((HEAP32[$12_1 >> 2] | 0) + $9_1 | 0) >> 2] | 0;
    break label$1;
   }
   $18_1 = $9_1;
  }
  FUNCTION_TABLE[$18_1 | 0]($12_1);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $134($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 2 | 0;
 }
 
 function $135($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $138() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $136() {
  return 2500 | 0;
 }
 
 function $137($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $138() {
  return 2492 | 0;
 }
 
 function $139($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $8_1 = 0, $9_1 = 0, $10_1 = 0, $13_1 = 0, $19_1 = 0, $7_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $7_1 = $100(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $8_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $9_1 = HEAP32[($8_1 + 4 | 0) >> 2] | 0;
  $10_1 = HEAP32[$8_1 >> 2] | 0;
  $13_1 = $7_1 + ($9_1 >> 1 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!($9_1 & 1 | 0)) {
     break label$2
    }
    $19_1 = HEAP32[((HEAP32[$13_1 >> 2] | 0) + $10_1 | 0) >> 2] | 0;
    break label$1;
   }
   $19_1 = $10_1;
  }
  FUNCTION_TABLE[$19_1 | 0]($13_1, $143(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $140($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 3 | 0;
 }
 
 function $141($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = $144() | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $142($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(8 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $7_1 = HEAP32[$6_1 >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = $7_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $143($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $144() {
  return 2504 | 0;
 }
 
 function $145() {
  return 2532 | 0;
 }
 
 function $146($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = 0;
  return $5_1 | 0;
 }
 
 function $147($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  $148($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $148($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $149($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $149($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $150($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $156(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $151($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $7_1 = 0;
  $7_1 = global$0 - 32 | 0;
  HEAP32[($7_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($7_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($7_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($7_1 + 16 | 0) >> 2] = $3_1;
  HEAP32[($7_1 + 12 | 0) >> 2] = $4_1;
  return;
 }
 
 function $152($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $17_1 = 0, $14_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$1
    }
    $14_1 = $35($5_1 | 0) | 0;
    $17_1 = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + -8 | 0;
    HEAP32[($4_1 + 4 | 0) >> 2] = $17_1;
    $157($14_1 | 0, $156($17_1 | 0) | 0 | 0);
    continue label$2;
   };
  }
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $153($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $159(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, (HEAP32[($5_1 + 4 | 0) >> 2] | 0) << 3 | 0 | 0, 4 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $154($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $165(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $155($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $7_1 = $166((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $156($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $157($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $158(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $158($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return;
 }
 
 function $159($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  label$1 : {
   label$2 : {
    if (!(($160(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[$5_1 >> 2] = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    $161(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[$5_1 >> 2] | 0 | 0);
    break label$1;
   }
   $162(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0);
  }
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $160($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return (HEAP32[($3_1 + 12 | 0) >> 2] | 0) >>> 0 > 8 >>> 0 & 1 | 0 | 0;
 }
 
 function $161($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $163(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $162($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $164(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $163($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $301(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $164($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $298(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $165($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $166($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $167(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $167($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $168($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $176(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $169($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $177(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $178(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $170($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $14_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $14_1 = $182(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0, $181($179(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0, $179(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, $180(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $14_1 | 0;
 }
 
 function $171($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $7_1 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
  $7_1 = HEAP32[($6_1 + 28 | 0) >> 2] | 0;
  $183($6_1 | 0, $7_1 | 0, HEAP32[($6_1 + 16 | 0) >> 2] | 0 | 0) | 0;
  $184($35($7_1 | 0) | 0 | 0, HEAP32[($6_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 20 | 0) >> 2] | 0 | 0, $6_1 + 4 | 0 | 0);
  $185($6_1 | 0) | 0;
  global$0 = $6_1 + 32 | 0;
  return;
 }
 
 function $172($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $186($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  HEAP32[($4_1 + 4 | 0) >> 2] = $30($5_1 | 0) | 0;
  $152($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  $187($5_1 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $173($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   if (!((HEAP32[$4_1 >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $188($4_1 | 0);
   $37($35($4_1 | 0) | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0, $36($4_1 | 0) | 0 | 0);
   HEAP32[($189($4_1 | 0) | 0) >> 2] = 0;
   HEAP32[($4_1 + 4 | 0) >> 2] = 0;
   HEAP32[$4_1 >> 2] = 0;
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $174($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $36_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  HEAP32[($4_1 + 16 | 0) >> 2] = $190($5_1 | 0) | 0;
  label$1 : {
   if (!((HEAP32[($4_1 + 20 | 0) >> 2] | 0) >>> 0 > (HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
    break label$1
   }
   $191($5_1 | 0);
   wasm2js_trap();
  }
  HEAP32[($4_1 + 12 | 0) >> 2] = $36($5_1 | 0) | 0;
  label$2 : {
   label$3 : {
    if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 >= ((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 1 | 0) >>> 0 & 1 | 0)) {
     break label$3
    }
    HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
    break label$2;
   }
   HEAP32[($4_1 + 8 | 0) >> 2] = (HEAP32[($4_1 + 12 | 0) >> 2] | 0) << 1 | 0;
   HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($194($4_1 + 8 | 0 | 0, $4_1 + 20 | 0 | 0) | 0) >> 2] | 0;
  }
  $36_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $36_1 | 0;
 }
 
 function $175($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return;
 }
 
 function $176($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = $0_1;
  HEAP32[$4_1 >> 2] = $1_1;
  return ((HEAP32[$4_1 >> 2] | 0) - (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) >> 3 | 0 | 0;
 }
 
 function $177($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $178($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = $0_1;
  HEAP32[$4_1 >> 2] = $1_1;
  $6_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  HEAP32[$6_1 >> 2] = (HEAP32[$6_1 >> 2] | 0) + ((HEAP32[$4_1 >> 2] | 0) << 3 | 0) | 0;
  return;
 }
 
 function $179($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $196(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $180($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $197(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $181($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $9_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $9_1 = $195(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $182($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $183($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  HEAP32[$6_1 >> 2] = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
  HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
  HEAP32[($6_1 + 8 | 0) >> 2] = (HEAP32[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) << 3 | 0) | 0;
  return $6_1 | 0;
 }
 
 function $184($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $26_1 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = ((HEAP32[($6_1 + 20 | 0) >> 2] | 0) - (HEAP32[($6_1 + 24 | 0) >> 2] | 0) | 0) >> 3 | 0;
  label$1 : {
   if (!((HEAP32[($6_1 + 12 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
    break label$1
   }
   $246(HEAP32[(HEAP32[($6_1 + 16 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 24 | 0) >> 2] | 0 | 0, (HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0 | 0) | 0;
   $26_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
   HEAP32[$26_1 >> 2] = (HEAP32[$26_1 >> 2] | 0) + ((HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0) | 0;
  }
  global$0 = $6_1 + 32 | 0;
  return;
 }
 
 function $185($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[((HEAP32[$4_1 >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  return $4_1 | 0;
 }
 
 function $186($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return;
 }
 
 function $187($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $5_1 = 0, $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $151($5_1 | 0, $150($5_1 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + (($36($5_1 | 0) | 0) << 3 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 3 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + (($30($5_1 | 0) | 0) << 3 | 0) | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $188($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $30($4_1 | 0) | 0;
  $34($4_1 | 0);
  $187($4_1 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $175($4_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $189($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $7_1 = $200((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $190($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $202($27(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $203() | 0;
  $15_1 = HEAP32[($204($3_1 + 8 | 0 | 0, $3_1 + 4 | 0 | 0) | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $15_1 | 0;
 }
 
 function $191($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $205(1160 | 0);
  wasm2js_trap();
 }
 
 function $192($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $206(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $193($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $5_1 = 0, $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $151($5_1 | 0, $150($5_1 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + (($36($5_1 | 0) | 0) << 3 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + (($36($5_1 | 0) | 0) << 3 | 0) | 0 | 0, ($150($5_1 | 0) | 0) + ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 3 | 0) | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $194($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $218(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $195($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $21_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$1
    }
    $198(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = (HEAP32[($5_1 + 4 | 0) >> 2] | 0) + 8 | 0;
    continue label$2;
   };
  }
  $21_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
  global$0 = $5_1 + 16 | 0;
  return $21_1 | 0;
 }
 
 function $196($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $199(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $197($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $156(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $198($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
  return $5_1 | 0;
 }
 
 function $199($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $200($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $201(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $201($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $202($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $208(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $203() {
  return $210() | 0 | 0;
 }
 
 function $204($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $207(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $205($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = fimport$5(8 | 0) | 0;
  $213($5_1 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  fimport$6($5_1 | 0, 5092 | 0, 20 | 0);
  wasm2js_trap();
 }
 
 function $206($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $17_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0 > ($202(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0) >>> 0 & 1 | 0)) {
    break label$1
   }
   $214();
   wasm2js_trap();
  }
  $17_1 = $215((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 3 | 0 | 0, 4 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $17_1 | 0;
 }
 
 function $207($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $14_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $0_1;
  HEAP32[$4_1 >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(($211($4_1 + 8 | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $14_1 = HEAP32[$4_1 >> 2] | 0;
    break label$1;
   }
   $14_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 16 | 0;
  return $14_1 | 0;
 }
 
 function $208($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return 536870911 | 0;
 }
 
 function $209($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $212(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $210() {
  return 2147483647 | 0;
 }
 
 function $211($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  return (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) >>> 0 < (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) >>> 0 & 1 | 0 | 0;
 }
 
 function $212($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $213($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $306($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[$5_1 >> 2] = 5052 + 8 | 0;
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $214() {
  var $1_1 = 0;
  $1_1 = fimport$5(4 | 0) | 0;
  $400($1_1 | 0) | 0;
  fimport$6($1_1 | 0, 4992 | 0, 21 | 0);
  wasm2js_trap();
 }
 
 function $215($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $15_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(($160(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[$4_1 >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
    HEAP32[($4_1 + 12 | 0) >> 2] = $216(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0) | 0;
    break label$1;
   }
   HEAP32[($4_1 + 12 | 0) >> 2] = $217(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  }
  $15_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $15_1 | 0;
 }
 
 function $216($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $299(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $217($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $297(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $218($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $14_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $0_1;
  HEAP32[$4_1 >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(($211($4_1 + 8 | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $14_1 = HEAP32[$4_1 >> 2] | 0;
    break label$1;
   }
   $14_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 16 | 0;
  return $14_1 | 0;
 }
 
 function $219($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $220($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $26_1 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = ((HEAP32[($6_1 + 20 | 0) >> 2] | 0) - (HEAP32[($6_1 + 24 | 0) >> 2] | 0) | 0) >> 3 | 0;
  label$1 : {
   if (!((HEAP32[($6_1 + 12 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
    break label$1
   }
   $246(HEAP32[(HEAP32[($6_1 + 16 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[($6_1 + 24 | 0) >> 2] | 0 | 0, (HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0 | 0) | 0;
   $26_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
   HEAP32[$26_1 >> 2] = (HEAP32[$26_1 >> 2] | 0) + ((HEAP32[($6_1 + 12 | 0) >> 2] | 0) << 3 | 0) | 0;
  }
  global$0 = $6_1 + 32 | 0;
  return;
 }
 
 function $221($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0;
 }
 
 function $222($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  $224($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $223($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $226(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $224($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $225($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $225($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $226($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $227($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($50($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $233($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $234($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $228($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $229($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0, $11_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $230($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  $231($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  $11_1 = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
  HEAP8[($5_1 + 3 | 0) >> 0] = 0;
  $232($11_1 | 0, $5_1 + 3 | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $230($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($50($5_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $235($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
    break label$1;
   }
   $236($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $231($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return;
 }
 
 function $232($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP8[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 0] = HEAPU8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] | 0;
  return;
 }
 
 function $233($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[($223(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $234($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $237($223(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $235($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $6_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  HEAP32[(($223(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 4 | 0) >> 2] = $6_1;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $236($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $6_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  HEAP8[(($223(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 11 | 0) >> 0] = $6_1;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $237($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $238($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  return $5_1 | 0;
 }
 
 function $239() {
  $58();
  return;
 }
 
 function $240($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $56() | 0 | 0;
 }
 
 function $241($0_1) {
  $0_1 = $0_1 | 0;
  return $252(HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0;
 }
 
 function $242() {
  var $0_1 = 0;
  label$1 : {
   $0_1 = HEAP32[(0 + 5448 | 0) >> 2] | 0;
   if (!$0_1) {
    break label$1
   }
   label$2 : while (1) {
    FUNCTION_TABLE[HEAP32[$0_1 >> 2] | 0 | 0]();
    $0_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
    if ($0_1) {
     continue label$2
    }
    break label$2;
   };
  }
 }
 
 function $243($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[(0 + 5448 | 0) >> 2] | 0;
  HEAP32[(0 + 5448 | 0) >> 2] = $0_1;
 }
 
 function $244() {
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  fimport$7(4428 | 0, 1433 | 0);
  fimport$8(4452 | 0, 1209 | 0, 1 | 0, 1 | 0, 0 | 0);
  fimport$9(4464 | 0, 1176 | 0, 1 | 0, -128 | 0, 127 | 0);
  fimport$9(4488 | 0, 1169 | 0, 1 | 0, -128 | 0, 127 | 0);
  fimport$9(4476 | 0, 1167 | 0, 1 | 0, 0 | 0, 255 | 0);
  fimport$9(4500 | 0, 1126 | 0, 2 | 0, -32768 | 0, 32767 | 0);
  fimport$9(4512 | 0, 1117 | 0, 2 | 0, 0 | 0, 65535 | 0);
  fimport$9(4524 | 0, 1141 | 0, 4 | 0, -2147483648 | 0, 2147483647 | 0);
  fimport$9(4536 | 0, 1132 | 0, 4 | 0, 0 | 0, -1 | 0);
  fimport$9(4548 | 0, 1260 | 0, 4 | 0, -2147483648 | 0, 2147483647 | 0);
  fimport$9(4560 | 0, 1251 | 0, 4 | 0, 0 | 0, -1 | 0);
  i64toi32_i32$0 = -2147483648;
  i64toi32_i32$1 = 2147483647;
  $424(4572 | 0, 1152 | 0, 8 | 0, 0 | 0, i64toi32_i32$0 | 0, -1 | 0, i64toi32_i32$1 | 0);
  i64toi32_i32$1 = 0;
  i64toi32_i32$0 = -1;
  $424(4584 | 0, 1151 | 0, 8 | 0, 0 | 0, i64toi32_i32$1 | 0, -1 | 0, i64toi32_i32$0 | 0);
  fimport$10(4596 | 0, 1145 | 0, 4 | 0);
  fimport$10(4608 | 0, 1379 | 0, 8 | 0);
  fimport$11(2480 | 0, 1291 | 0);
  fimport$11(2604 | 0, 1935 | 0);
  fimport$12(2676 | 0, 4 | 0, 1265 | 0);
  fimport$12(2752 | 0, 2 | 0, 1303 | 0);
  fimport$12(2828 | 0, 4 | 0, 1318 | 0);
  fimport$13(2856 | 0, 1214 | 0);
  fimport$14(2896 | 0, 0 | 0, 1866 | 0);
  fimport$14(2936 | 0, 0 | 0, 1968 | 0);
  fimport$14(2976 | 0, 1 | 0, 1896 | 0);
  fimport$14(3016 | 0, 2 | 0, 1498 | 0);
  fimport$14(3056 | 0, 3 | 0, 1529 | 0);
  fimport$14(3096 | 0, 4 | 0, 1569 | 0);
  fimport$14(3136 | 0, 5 | 0, 1598 | 0);
  fimport$14(3176 | 0, 4 | 0, 2005 | 0);
  fimport$14(3216 | 0, 5 | 0, 2035 | 0);
  fimport$14(2936 | 0, 0 | 0, 1700 | 0);
  fimport$14(2976 | 0, 1 | 0, 1667 | 0);
  fimport$14(3016 | 0, 2 | 0, 1766 | 0);
  fimport$14(3056 | 0, 3 | 0, 1732 | 0);
  fimport$14(3096 | 0, 4 | 0, 1833 | 0);
  fimport$14(3136 | 0, 5 | 0, 1799 | 0);
  fimport$14(3256 | 0, 6 | 0, 1636 | 0);
  fimport$14(3296 | 0, 7 | 0, 2074 | 0);
 }
 
 function $245() {
  HEAP32[(0 + 5452 | 0) >> 2] = 22;
  HEAP32[(0 + 5456 | 0) >> 2] = 0;
  $244();
  HEAP32[(0 + 5456 | 0) >> 2] = HEAP32[(0 + 5448 | 0) >> 2] | 0;
  HEAP32[(0 + 5448 | 0) >> 2] = 5452;
 }
 
 function $246($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0;
  label$1 : {
   if ($2_1 >>> 0 < 512 >>> 0) {
    break label$1
   }
   fimport$15($0_1 | 0, $1_1 | 0, $2_1 | 0);
   return $0_1 | 0;
  }
  $3_1 = $0_1 + $2_1 | 0;
  label$2 : {
   label$3 : {
    if (($1_1 ^ $0_1 | 0) & 3 | 0) {
     break label$3
    }
    label$4 : {
     label$5 : {
      if ($0_1 & 3 | 0) {
       break label$5
      }
      $2_1 = $0_1;
      break label$4;
     }
     label$6 : {
      if ($2_1) {
       break label$6
      }
      $2_1 = $0_1;
      break label$4;
     }
     $2_1 = $0_1;
     label$7 : while (1) {
      HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
      $1_1 = $1_1 + 1 | 0;
      $2_1 = $2_1 + 1 | 0;
      if (!($2_1 & 3 | 0)) {
       break label$4
      }
      if ($2_1 >>> 0 < $3_1 >>> 0) {
       continue label$7
      }
      break label$7;
     };
    }
    label$8 : {
     $4_1 = $3_1 & -4 | 0;
     if ($4_1 >>> 0 < 64 >>> 0) {
      break label$8
     }
     $5_1 = $4_1 + -64 | 0;
     if ($2_1 >>> 0 > $5_1 >>> 0) {
      break label$8
     }
     label$9 : while (1) {
      HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
      HEAP32[($2_1 + 4 | 0) >> 2] = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
      HEAP32[($2_1 + 8 | 0) >> 2] = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
      HEAP32[($2_1 + 12 | 0) >> 2] = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
      HEAP32[($2_1 + 16 | 0) >> 2] = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      HEAP32[($2_1 + 20 | 0) >> 2] = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
      HEAP32[($2_1 + 24 | 0) >> 2] = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
      HEAP32[($2_1 + 28 | 0) >> 2] = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
      HEAP32[($2_1 + 32 | 0) >> 2] = HEAP32[($1_1 + 32 | 0) >> 2] | 0;
      HEAP32[($2_1 + 36 | 0) >> 2] = HEAP32[($1_1 + 36 | 0) >> 2] | 0;
      HEAP32[($2_1 + 40 | 0) >> 2] = HEAP32[($1_1 + 40 | 0) >> 2] | 0;
      HEAP32[($2_1 + 44 | 0) >> 2] = HEAP32[($1_1 + 44 | 0) >> 2] | 0;
      HEAP32[($2_1 + 48 | 0) >> 2] = HEAP32[($1_1 + 48 | 0) >> 2] | 0;
      HEAP32[($2_1 + 52 | 0) >> 2] = HEAP32[($1_1 + 52 | 0) >> 2] | 0;
      HEAP32[($2_1 + 56 | 0) >> 2] = HEAP32[($1_1 + 56 | 0) >> 2] | 0;
      HEAP32[($2_1 + 60 | 0) >> 2] = HEAP32[($1_1 + 60 | 0) >> 2] | 0;
      $1_1 = $1_1 + 64 | 0;
      $2_1 = $2_1 + 64 | 0;
      if ($2_1 >>> 0 <= $5_1 >>> 0) {
       continue label$9
      }
      break label$9;
     };
    }
    if ($2_1 >>> 0 >= $4_1 >>> 0) {
     break label$2
    }
    label$10 : while (1) {
     HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 + 4 | 0;
     $2_1 = $2_1 + 4 | 0;
     if ($2_1 >>> 0 < $4_1 >>> 0) {
      continue label$10
     }
     break label$2;
    };
   }
   label$11 : {
    if ($3_1 >>> 0 >= 4 >>> 0) {
     break label$11
    }
    $2_1 = $0_1;
    break label$2;
   }
   label$12 : {
    $4_1 = $3_1 + -4 | 0;
    if ($4_1 >>> 0 >= $0_1 >>> 0) {
     break label$12
    }
    $2_1 = $0_1;
    break label$2;
   }
   $2_1 = $0_1;
   label$13 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    HEAP8[($2_1 + 1 | 0) >> 0] = HEAPU8[($1_1 + 1 | 0) >> 0] | 0;
    HEAP8[($2_1 + 2 | 0) >> 0] = HEAPU8[($1_1 + 2 | 0) >> 0] | 0;
    HEAP8[($2_1 + 3 | 0) >> 0] = HEAPU8[($1_1 + 3 | 0) >> 0] | 0;
    $1_1 = $1_1 + 4 | 0;
    $2_1 = $2_1 + 4 | 0;
    if ($2_1 >>> 0 <= $4_1 >>> 0) {
     continue label$13
    }
    break label$13;
   };
  }
  label$14 : {
   if ($2_1 >>> 0 >= $3_1 >>> 0) {
    break label$14
   }
   label$15 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($2_1 | 0) != ($3_1 | 0)) {
     continue label$15
    }
    break label$15;
   };
  }
  return $0_1 | 0;
 }
 
 function $247($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, i64toi32_i32$0 = 0, $4_1 = 0, i64toi32_i32$1 = 0, $6_1 = 0, $5_1 = 0, $6$hi = 0;
  label$1 : {
   if (!$2_1) {
    break label$1
   }
   HEAP8[$0_1 >> 0] = $1_1;
   $3_1 = $2_1 + $0_1 | 0;
   HEAP8[($3_1 + -1 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 3 >>> 0) {
    break label$1
   }
   HEAP8[($0_1 + 2 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 1 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -2 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 7 >>> 0) {
    break label$1
   }
   HEAP8[($0_1 + 3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -4 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   $4_1 = (0 - $0_1 | 0) & 3 | 0;
   $3_1 = $0_1 + $4_1 | 0;
   $1_1 = Math_imul($1_1 & 255 | 0, 16843009);
   HEAP32[$3_1 >> 2] = $1_1;
   $4_1 = ($2_1 - $4_1 | 0) & -4 | 0;
   $2_1 = $3_1 + $4_1 | 0;
   HEAP32[($2_1 + -4 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 4 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -8 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -12 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 25 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 16 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 12 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -16 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -20 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -24 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -28 | 0) >> 2] = $1_1;
   $5_1 = $3_1 & 4 | 0 | 24 | 0;
   $2_1 = $4_1 - $5_1 | 0;
   if ($2_1 >>> 0 < 32 >>> 0) {
    break label$1
   }
   i64toi32_i32$0 = 0;
   i64toi32_i32$1 = 1;
   i64toi32_i32$1 = __wasm_i64_mul($1_1 | 0, i64toi32_i32$0 | 0, 1 | 0, i64toi32_i32$1 | 0) | 0;
   i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
   $6_1 = i64toi32_i32$1;
   $6$hi = i64toi32_i32$0;
   $1_1 = $3_1 + $5_1 | 0;
   label$2 : while (1) {
    i64toi32_i32$0 = $6$hi;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 28 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 16 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 20 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[$1_1 >> 2] = $6_1;
    HEAP32[($1_1 + 4 | 0) >> 2] = i64toi32_i32$0;
    $1_1 = $1_1 + 32 | 0;
    $2_1 = $2_1 + -32 | 0;
    if ($2_1 >>> 0 > 31 >>> 0) {
     continue label$2
    }
    break label$2;
   };
  }
  return $0_1 | 0;
 }
 
 function $248($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 12 | 0) >> 2] = $1_1;
  $1_1 = $276(5128 | 0, $0_1 | 0, $1_1 | 0) | 0;
  global$0 = $2_1 + 16 | 0;
  return $1_1 | 0;
 }
 
 function $249($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0, $8_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[($0_1 + 28 | 0) >> 2] | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = $4_1;
  $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
  HEAP32[($3_1 + 28 | 0) >> 2] = $2_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
  $1_1 = $5_1 - $4_1 | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
  $6_1 = $1_1 + $2_1 | 0;
  $4_1 = $3_1 + 16 | 0;
  $7_1 = 2;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       if (!($280(fimport$16(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $3_1 + 16 | 0 | 0, 2 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        break label$5
       }
       $5_1 = $4_1;
       break label$4;
      }
      label$6 : while (1) {
       $1_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
       if (($6_1 | 0) == ($1_1 | 0)) {
        break label$3
       }
       label$7 : {
        if (($1_1 | 0) > (-1 | 0)) {
         break label$7
        }
        $5_1 = $4_1;
        break label$2;
       }
       $8_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
       $9_1 = $1_1 >>> 0 > $8_1 >>> 0;
       $5_1 = $4_1 + ($9_1 << 3 | 0) | 0;
       $8_1 = $1_1 - ($9_1 ? $8_1 : 0) | 0;
       HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + $8_1 | 0;
       $4_1 = $4_1 + ($9_1 ? 12 : 4) | 0;
       HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) - $8_1 | 0;
       $6_1 = $6_1 - $1_1 | 0;
       $4_1 = $5_1;
       $7_1 = $7_1 - $9_1 | 0;
       if (!($280(fimport$16(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $4_1 | 0, $7_1 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        continue label$6
       }
       break label$6;
      };
     }
     if (($6_1 | 0) != (-1 | 0)) {
      break label$2
     }
    }
    $1_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 20 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 16 | 0) >> 2] = $1_1 + (HEAP32[($0_1 + 48 | 0) >> 2] | 0) | 0;
    $1_1 = $2_1;
    break label$1;
   }
   $1_1 = 0;
   HEAP32[($0_1 + 28 | 0) >> 2] = 0;
   HEAP32[($0_1 + 16 | 0) >> 2] = 0;
   HEAP32[($0_1 + 20 | 0) >> 2] = 0;
   HEAP32[$0_1 >> 2] = HEAP32[$0_1 >> 2] | 0 | 32 | 0;
   if (($7_1 | 0) == (2 | 0)) {
    break label$1
   }
   $1_1 = $2_1 - (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
  }
  global$0 = $3_1 + 32 | 0;
  return $1_1 | 0;
 }
 
 function $250($0_1) {
  $0_1 = $0_1 | 0;
  return 0 | 0;
 }
 
 function $251($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  i64toi32_i32$HIGH_BITS = 0;
  return 0 | 0;
 }
 
 function $252($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  label$1 : {
   $1_1 = ($253($0_1 | 0) | 0) + 1 | 0;
   $2_1 = $287($1_1 | 0) | 0;
   if ($2_1) {
    break label$1
   }
   return 0 | 0;
  }
  return $246($2_1 | 0, $0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $253($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $1_1 = $0_1;
  label$1 : {
   label$2 : {
    if (!($1_1 & 3 | 0)) {
     break label$2
    }
    $1_1 = $0_1;
    label$3 : while (1) {
     if (!(HEAPU8[$1_1 >> 0] | 0)) {
      break label$1
     }
     $1_1 = $1_1 + 1 | 0;
     if ($1_1 & 3 | 0) {
      continue label$3
     }
     break label$3;
    };
   }
   label$4 : while (1) {
    $2_1 = $1_1;
    $1_1 = $1_1 + 4 | 0;
    $3_1 = HEAP32[$2_1 >> 2] | 0;
    if (!((($3_1 ^ -1 | 0) & ($3_1 + -16843009 | 0) | 0) & -2139062144 | 0)) {
     continue label$4
    }
    break label$4;
   };
   label$5 : while (1) {
    $1_1 = $2_1;
    $2_1 = $1_1 + 1 | 0;
    if (HEAPU8[$1_1 >> 0] | 0) {
     continue label$5
    }
    break label$5;
   };
  }
  return $1_1 - $0_1 | 0 | 0;
 }
 
 function $254($0_1) {
  $0_1 = $0_1 | 0;
  return 1 | 0;
 }
 
 function $255($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $256($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $257($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $258() {
  $256(6504 | 0);
  return 6508 | 0;
 }
 
 function $259() {
  $257(6504 | 0);
 }
 
 function $260($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = HEAP32[($0_1 + 72 | 0) >> 2] | 0;
  HEAP32[($0_1 + 72 | 0) >> 2] = $1_1 + -1 | 0 | $1_1 | 0;
  label$1 : {
   $1_1 = HEAP32[$0_1 >> 2] | 0;
   if (!($1_1 & 8 | 0)) {
    break label$1
   }
   HEAP32[$0_1 >> 2] = $1_1 | 32 | 0;
   return -1 | 0;
  }
  HEAP32[($0_1 + 4 | 0) >> 2] = 0;
  HEAP32[($0_1 + 8 | 0) >> 2] = 0;
  $1_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
  HEAP32[($0_1 + 28 | 0) >> 2] = $1_1;
  HEAP32[($0_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($0_1 + 16 | 0) >> 2] = $1_1 + (HEAP32[($0_1 + 48 | 0) >> 2] | 0) | 0;
  return 0 | 0;
 }
 
 function $261($0_1) {
  $0_1 = $0_1 | 0;
  return ($0_1 + -48 | 0) >>> 0 < 10 >>> 0 | 0;
 }
 
 function $262($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = ($2_1 | 0) != (0 | 0);
  label$1 : {
   label$2 : {
    label$3 : {
     if (!($0_1 & 3 | 0)) {
      break label$3
     }
     if (!$2_1) {
      break label$3
     }
     $4_1 = $1_1 & 255 | 0;
     label$4 : while (1) {
      if ((HEAPU8[$0_1 >> 0] | 0 | 0) == ($4_1 | 0)) {
       break label$2
      }
      $2_1 = $2_1 + -1 | 0;
      $3_1 = ($2_1 | 0) != (0 | 0);
      $0_1 = $0_1 + 1 | 0;
      if (!($0_1 & 3 | 0)) {
       break label$3
      }
      if ($2_1) {
       continue label$4
      }
      break label$4;
     };
    }
    if (!$3_1) {
     break label$1
    }
    label$5 : {
     if ((HEAPU8[$0_1 >> 0] | 0 | 0) == ($1_1 & 255 | 0 | 0)) {
      break label$5
     }
     if ($2_1 >>> 0 < 4 >>> 0) {
      break label$5
     }
     $4_1 = Math_imul($1_1 & 255 | 0, 16843009);
     label$6 : while (1) {
      $3_1 = (HEAP32[$0_1 >> 2] | 0) ^ $4_1 | 0;
      if ((($3_1 ^ -1 | 0) & ($3_1 + -16843009 | 0) | 0) & -2139062144 | 0) {
       break label$2
      }
      $0_1 = $0_1 + 4 | 0;
      $2_1 = $2_1 + -4 | 0;
      if ($2_1 >>> 0 > 3 >>> 0) {
       continue label$6
      }
      break label$6;
     };
    }
    if (!$2_1) {
     break label$1
    }
   }
   $3_1 = $1_1 & 255 | 0;
   label$7 : while (1) {
    label$8 : {
     if ((HEAPU8[$0_1 >> 0] | 0 | 0) != ($3_1 | 0)) {
      break label$8
     }
     return $0_1 | 0;
    }
    $0_1 = $0_1 + 1 | 0;
    $2_1 = $2_1 + -1 | 0;
    if ($2_1) {
     continue label$7
    }
    break label$7;
   };
  }
  return 0 | 0;
 }
 
 function $263($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = $262($0_1 | 0, 0 | 0, $1_1 | 0) | 0;
  return ($2_1 ? $2_1 - $0_1 | 0 : $1_1) | 0;
 }
 
 function $264() {
  return 6512 | 0;
 }
 
 function $265($0_1, $1_1) {
  $0_1 = +$0_1;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, $2_1 = 0, $10_1 = 0, $2$hi = 0;
  label$1 : {
   wasm2js_scratch_store_f64(+$0_1);
   i64toi32_i32$0 = wasm2js_scratch_load_i32(1 | 0) | 0;
   $2_1 = wasm2js_scratch_load_i32(0 | 0) | 0;
   $2$hi = i64toi32_i32$0;
   i64toi32_i32$2 = $2_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$3 = 52;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$1 = 0;
    $10_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
    $10_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
   }
   $3_1 = $10_1 & 2047 | 0;
   if (($3_1 | 0) == (2047 | 0)) {
    break label$1
   }
   label$2 : {
    if ($3_1) {
     break label$2
    }
    label$3 : {
     label$4 : {
      if ($0_1 != 0.0) {
       break label$4
      }
      $3_1 = 0;
      break label$3;
     }
     $0_1 = +$265(+($0_1 * 18446744073709551615.0), $1_1 | 0);
     $3_1 = (HEAP32[$1_1 >> 2] | 0) + -64 | 0;
    }
    HEAP32[$1_1 >> 2] = $3_1;
    return +$0_1;
   }
   HEAP32[$1_1 >> 2] = $3_1 + -1022 | 0;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = -2146435073;
   i64toi32_i32$3 = -1;
   i64toi32_i32$2 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
   i64toi32_i32$1 = i64toi32_i32$0 & i64toi32_i32$3 | 0;
   i64toi32_i32$0 = 1071644672;
   i64toi32_i32$3 = 0;
   i64toi32_i32$0 = i64toi32_i32$2 | i64toi32_i32$0 | 0;
   wasm2js_scratch_store_i32(0 | 0, i64toi32_i32$1 | i64toi32_i32$3 | 0 | 0);
   wasm2js_scratch_store_i32(1 | 0, i64toi32_i32$0 | 0);
   $0_1 = +wasm2js_scratch_load_f64();
  }
  return +$0_1;
 }
 
 function $266($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
    if ($3_1) {
     break label$2
    }
    $4_1 = 0;
    if ($260($2_1 | 0) | 0) {
     break label$1
    }
    $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
   }
   label$3 : {
    $5_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
    if (($3_1 - $5_1 | 0) >>> 0 >= $1_1 >>> 0) {
     break label$3
    }
    return FUNCTION_TABLE[HEAP32[($2_1 + 36 | 0) >> 2] | 0 | 0]($2_1, $0_1, $1_1) | 0 | 0;
   }
   label$4 : {
    label$5 : {
     if ((HEAP32[($2_1 + 80 | 0) >> 2] | 0 | 0) >= (0 | 0)) {
      break label$5
     }
     $3_1 = 0;
     break label$4;
    }
    $4_1 = $1_1;
    label$6 : while (1) {
     label$7 : {
      $3_1 = $4_1;
      if ($3_1) {
       break label$7
      }
      $3_1 = 0;
      break label$4;
     }
     $4_1 = $3_1 + -1 | 0;
     if ((HEAPU8[($0_1 + $4_1 | 0) >> 0] | 0 | 0) != (10 | 0)) {
      continue label$6
     }
     break label$6;
    };
    $4_1 = FUNCTION_TABLE[HEAP32[($2_1 + 36 | 0) >> 2] | 0 | 0]($2_1, $0_1, $3_1) | 0;
    if ($4_1 >>> 0 < $3_1 >>> 0) {
     break label$1
    }
    $0_1 = $0_1 + $3_1 | 0;
    $1_1 = $1_1 - $3_1 | 0;
    $5_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
   }
   $246($5_1 | 0, $0_1 | 0, $1_1 | 0) | 0;
   HEAP32[($2_1 + 20 | 0) >> 2] = (HEAP32[($2_1 + 20 | 0) >> 2] | 0) + $1_1 | 0;
   $4_1 = $3_1 + $1_1 | 0;
  }
  return $4_1 | 0;
 }
 
 function $267($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $5_1 = 0, i64toi32_i32$0 = 0, $8_1 = 0, $6_1 = 0, $7_1 = 0;
  $5_1 = global$0 - 208 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 204 | 0) >> 2] = $2_1;
  $6_1 = 0;
  $247($5_1 + 160 | 0 | 0, 0 | 0, 40 | 0) | 0;
  HEAP32[($5_1 + 200 | 0) >> 2] = HEAP32[($5_1 + 204 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (($268(0 | 0, $1_1 | 0, $5_1 + 200 | 0 | 0, $5_1 + 80 | 0 | 0, $5_1 + 160 | 0 | 0, $3_1 | 0, $4_1 | 0) | 0 | 0) >= (0 | 0)) {
     break label$2
    }
    $4_1 = -1;
    break label$1;
   }
   label$3 : {
    if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
     break label$3
    }
    $6_1 = $254($0_1 | 0) | 0;
   }
   $7_1 = HEAP32[$0_1 >> 2] | 0;
   label$4 : {
    if ((HEAP32[($0_1 + 72 | 0) >> 2] | 0 | 0) > (0 | 0)) {
     break label$4
    }
    HEAP32[$0_1 >> 2] = $7_1 & -33 | 0;
   }
   label$5 : {
    label$6 : {
     label$7 : {
      label$8 : {
       if (HEAP32[($0_1 + 48 | 0) >> 2] | 0) {
        break label$8
       }
       HEAP32[($0_1 + 48 | 0) >> 2] = 80;
       HEAP32[($0_1 + 28 | 0) >> 2] = 0;
       i64toi32_i32$0 = 0;
       HEAP32[($0_1 + 16 | 0) >> 2] = 0;
       HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$0;
       $8_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
       HEAP32[($0_1 + 44 | 0) >> 2] = $5_1;
       break label$7;
      }
      $8_1 = 0;
      if (HEAP32[($0_1 + 16 | 0) >> 2] | 0) {
       break label$6
      }
     }
     $2_1 = -1;
     if ($260($0_1 | 0) | 0) {
      break label$5
     }
    }
    $2_1 = $268($0_1 | 0, $1_1 | 0, $5_1 + 200 | 0 | 0, $5_1 + 80 | 0 | 0, $5_1 + 160 | 0 | 0, $3_1 | 0, $4_1 | 0) | 0;
   }
   $4_1 = $7_1 & 32 | 0;
   label$9 : {
    if (!$8_1) {
     break label$9
    }
    FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
    HEAP32[($0_1 + 48 | 0) >> 2] = 0;
    HEAP32[($0_1 + 44 | 0) >> 2] = $8_1;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    $3_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
    i64toi32_i32$0 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$0;
    $2_1 = $3_1 ? $2_1 : -1;
   }
   $3_1 = HEAP32[$0_1 >> 2] | 0;
   HEAP32[$0_1 >> 2] = $3_1 | $4_1 | 0;
   $4_1 = $3_1 & 32 | 0 ? -1 : $2_1;
   if (!$6_1) {
    break label$1
   }
   $255($0_1 | 0);
  }
  global$0 = $5_1 + 208 | 0;
  return $4_1 | 0;
 }
 
 function $268($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  $6_1 = $6_1 | 0;
  var $12_1 = 0, $7_1 = 0, $15_1 = 0, $20_1 = 0, i64toi32_i32$1 = 0, $17_1 = 0, $18_1 = 0, $14_1 = 0, $13_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, $11_1 = 0, $16_1 = 0, $19_1 = 0, $22_1 = 0, i64toi32_i32$3 = 0, i64toi32_i32$5 = 0, $9_1 = 0, $24_1 = 0, $10_1 = 0, $25_1 = 0, $25$hi = 0, $21_1 = 0, $23_1 = 0, $33_1 = 0, $34_1 = 0, $35_1 = 0, $8_1 = 0, $272_1 = 0;
  $7_1 = global$0 - 80 | 0;
  global$0 = $7_1;
  HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
  $8_1 = $7_1 + 55 | 0;
  $9_1 = $7_1 + 56 | 0;
  $10_1 = 0;
  $11_1 = 0;
  $12_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : while (1) {
       $13_1 = $1_1;
       if (($12_1 | 0) > ($11_1 ^ 2147483647 | 0 | 0)) {
        break label$4
       }
       $11_1 = $12_1 + $11_1 | 0;
       $12_1 = $13_1;
       label$6 : {
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            $14_1 = HEAPU8[$12_1 >> 0] | 0;
            if (!$14_1) {
             break label$10
            }
            label$11 : while (1) {
             label$12 : {
              label$13 : {
               label$14 : {
                $14_1 = $14_1 & 255 | 0;
                if ($14_1) {
                 break label$14
                }
                $1_1 = $12_1;
                break label$13;
               }
               if (($14_1 | 0) != (37 | 0)) {
                break label$12
               }
               $14_1 = $12_1;
               label$15 : while (1) {
                label$16 : {
                 if ((HEAPU8[($14_1 + 1 | 0) >> 0] | 0 | 0) == (37 | 0)) {
                  break label$16
                 }
                 $1_1 = $14_1;
                 break label$13;
                }
                $12_1 = $12_1 + 1 | 0;
                $15_1 = HEAPU8[($14_1 + 2 | 0) >> 0] | 0;
                $1_1 = $14_1 + 2 | 0;
                $14_1 = $1_1;
                if (($15_1 | 0) == (37 | 0)) {
                 continue label$15
                }
                break label$15;
               };
              }
              $12_1 = $12_1 - $13_1 | 0;
              $14_1 = $11_1 ^ 2147483647 | 0;
              if (($12_1 | 0) > ($14_1 | 0)) {
               break label$4
              }
              label$17 : {
               if (!$0_1) {
                break label$17
               }
               $269($0_1 | 0, $13_1 | 0, $12_1 | 0);
              }
              if ($12_1) {
               continue label$5
              }
              HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
              $12_1 = $1_1 + 1 | 0;
              $16_1 = -1;
              label$18 : {
               if (!($261(HEAP8[($1_1 + 1 | 0) >> 0] | 0 | 0) | 0)) {
                break label$18
               }
               if ((HEAPU8[($1_1 + 2 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                break label$18
               }
               $12_1 = $1_1 + 3 | 0;
               $16_1 = (HEAP8[($1_1 + 1 | 0) >> 0] | 0) + -48 | 0;
               $10_1 = 1;
              }
              HEAP32[($7_1 + 76 | 0) >> 2] = $12_1;
              $17_1 = 0;
              label$19 : {
               label$20 : {
                $18_1 = HEAP8[$12_1 >> 0] | 0;
                $1_1 = $18_1 + -32 | 0;
                if ($1_1 >>> 0 <= 31 >>> 0) {
                 break label$20
                }
                $15_1 = $12_1;
                break label$19;
               }
               $17_1 = 0;
               $15_1 = $12_1;
               $1_1 = 1 << $1_1 | 0;
               if (!($1_1 & 75913 | 0)) {
                break label$19
               }
               label$21 : while (1) {
                $15_1 = $12_1 + 1 | 0;
                HEAP32[($7_1 + 76 | 0) >> 2] = $15_1;
                $17_1 = $1_1 | $17_1 | 0;
                $18_1 = HEAP8[($12_1 + 1 | 0) >> 0] | 0;
                $1_1 = $18_1 + -32 | 0;
                if ($1_1 >>> 0 >= 32 >>> 0) {
                 break label$19
                }
                $12_1 = $15_1;
                $1_1 = 1 << $1_1 | 0;
                if ($1_1 & 75913 | 0) {
                 continue label$21
                }
                break label$21;
               };
              }
              label$22 : {
               label$23 : {
                if (($18_1 | 0) != (42 | 0)) {
                 break label$23
                }
                label$24 : {
                 label$25 : {
                  if (!($261(HEAP8[($15_1 + 1 | 0) >> 0] | 0 | 0) | 0)) {
                   break label$25
                  }
                  if ((HEAPU8[($15_1 + 2 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                   break label$25
                  }
                  HEAP32[((((HEAP8[($15_1 + 1 | 0) >> 0] | 0) << 2 | 0) + $4_1 | 0) + -192 | 0) >> 2] = 10;
                  $18_1 = $15_1 + 3 | 0;
                  $19_1 = HEAP32[((((HEAP8[($15_1 + 1 | 0) >> 0] | 0) << 3 | 0) + $3_1 | 0) + -384 | 0) >> 2] | 0;
                  $10_1 = 1;
                  break label$24;
                 }
                 if ($10_1) {
                  break label$9
                 }
                 $18_1 = $15_1 + 1 | 0;
                 label$26 : {
                  if ($0_1) {
                   break label$26
                  }
                  HEAP32[($7_1 + 76 | 0) >> 2] = $18_1;
                  $10_1 = 0;
                  $19_1 = 0;
                  break label$22;
                 }
                 $12_1 = HEAP32[$2_1 >> 2] | 0;
                 HEAP32[$2_1 >> 2] = $12_1 + 4 | 0;
                 $19_1 = HEAP32[$12_1 >> 2] | 0;
                 $10_1 = 0;
                }
                HEAP32[($7_1 + 76 | 0) >> 2] = $18_1;
                if (($19_1 | 0) > (-1 | 0)) {
                 break label$22
                }
                $19_1 = 0 - $19_1 | 0;
                $17_1 = $17_1 | 8192 | 0;
                break label$22;
               }
               $19_1 = $270($7_1 + 76 | 0 | 0) | 0;
               if (($19_1 | 0) < (0 | 0)) {
                break label$4
               }
               $18_1 = HEAP32[($7_1 + 76 | 0) >> 2] | 0;
              }
              $12_1 = 0;
              $20_1 = -1;
              label$27 : {
               label$28 : {
                if ((HEAPU8[$18_1 >> 0] | 0 | 0) == (46 | 0)) {
                 break label$28
                }
                $1_1 = $18_1;
                $21_1 = 0;
                break label$27;
               }
               label$29 : {
                if ((HEAPU8[($18_1 + 1 | 0) >> 0] | 0 | 0) != (42 | 0)) {
                 break label$29
                }
                label$30 : {
                 label$31 : {
                  if (!($261(HEAP8[($18_1 + 2 | 0) >> 0] | 0 | 0) | 0)) {
                   break label$31
                  }
                  if ((HEAPU8[($18_1 + 3 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                   break label$31
                  }
                  HEAP32[((((HEAP8[($18_1 + 2 | 0) >> 0] | 0) << 2 | 0) + $4_1 | 0) + -192 | 0) >> 2] = 10;
                  $1_1 = $18_1 + 4 | 0;
                  $20_1 = HEAP32[((((HEAP8[($18_1 + 2 | 0) >> 0] | 0) << 3 | 0) + $3_1 | 0) + -384 | 0) >> 2] | 0;
                  break label$30;
                 }
                 if ($10_1) {
                  break label$9
                 }
                 $1_1 = $18_1 + 2 | 0;
                 label$32 : {
                  if ($0_1) {
                   break label$32
                  }
                  $20_1 = 0;
                  break label$30;
                 }
                 $15_1 = HEAP32[$2_1 >> 2] | 0;
                 HEAP32[$2_1 >> 2] = $15_1 + 4 | 0;
                 $20_1 = HEAP32[$15_1 >> 2] | 0;
                }
                HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
                $21_1 = ($20_1 ^ -1 | 0) >>> 31 | 0;
                break label$27;
               }
               HEAP32[($7_1 + 76 | 0) >> 2] = $18_1 + 1 | 0;
               $21_1 = 1;
               $20_1 = $270($7_1 + 76 | 0 | 0) | 0;
               $1_1 = HEAP32[($7_1 + 76 | 0) >> 2] | 0;
              }
              label$33 : while (1) {
               $15_1 = $12_1;
               $22_1 = 28;
               $18_1 = $1_1;
               $12_1 = HEAP8[$18_1 >> 0] | 0;
               if (($12_1 + -123 | 0) >>> 0 < -58 >>> 0) {
                break label$3
               }
               $1_1 = $18_1 + 1 | 0;
               $12_1 = HEAPU8[(($12_1 + Math_imul($15_1, 58) | 0) + 3247 | 0) >> 0] | 0;
               if (($12_1 + -1 | 0) >>> 0 < 8 >>> 0) {
                continue label$33
               }
               break label$33;
              };
              HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
              label$34 : {
               label$35 : {
                label$36 : {
                 if (($12_1 | 0) == (27 | 0)) {
                  break label$36
                 }
                 if (!$12_1) {
                  break label$3
                 }
                 label$37 : {
                  if (($16_1 | 0) < (0 | 0)) {
                   break label$37
                  }
                  HEAP32[($4_1 + ($16_1 << 2 | 0) | 0) >> 2] = $12_1;
                  i64toi32_i32$2 = $3_1 + ($16_1 << 3 | 0) | 0;
                  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
                  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
                  $272_1 = i64toi32_i32$0;
                  i64toi32_i32$0 = $7_1;
                  HEAP32[($7_1 + 64 | 0) >> 2] = $272_1;
                  HEAP32[($7_1 + 68 | 0) >> 2] = i64toi32_i32$1;
                  break label$35;
                 }
                 if (!$0_1) {
                  break label$6
                 }
                 $271($7_1 + 64 | 0 | 0, $12_1 | 0, $2_1 | 0, $6_1 | 0);
                 break label$34;
                }
                if (($16_1 | 0) > (-1 | 0)) {
                 break label$3
                }
               }
               $12_1 = 0;
               if (!$0_1) {
                continue label$5
               }
              }
              $23_1 = $17_1 & -65537 | 0;
              $17_1 = $17_1 & 8192 | 0 ? $23_1 : $17_1;
              $16_1 = 0;
              $24_1 = 1088;
              $22_1 = $9_1;
              label$38 : {
               label$39 : {
                label$40 : {
                 label$41 : {
                  label$42 : {
                   label$43 : {
                    label$44 : {
                     label$45 : {
                      label$46 : {
                       label$47 : {
                        label$48 : {
                         label$49 : {
                          label$50 : {
                           label$51 : {
                            label$52 : {
                             label$53 : {
                              $12_1 = HEAP8[$18_1 >> 0] | 0;
                              $12_1 = $15_1 ? (($12_1 & 15 | 0 | 0) == (3 | 0) ? $12_1 & -33 | 0 : $12_1) : $12_1;
                              switch ($12_1 + -88 | 0 | 0) {
                              case 11:
                               break label$38;
                              case 9:
                              case 13:
                              case 14:
                              case 15:
                               break label$39;
                              case 27:
                               break label$44;
                              case 12:
                              case 17:
                               break label$47;
                              case 23:
                               break label$48;
                              case 0:
                              case 32:
                               break label$49;
                              case 24:
                               break label$50;
                              case 22:
                               break label$51;
                              case 29:
                               break label$52;
                              case 1:
                              case 2:
                              case 3:
                              case 4:
                              case 5:
                              case 6:
                              case 7:
                              case 8:
                              case 10:
                              case 16:
                              case 18:
                              case 19:
                              case 20:
                              case 21:
                              case 25:
                              case 26:
                              case 28:
                              case 30:
                              case 31:
                               break label$7;
                              default:
                               break label$53;
                              };
                             }
                             $22_1 = $9_1;
                             label$54 : {
                              switch ($12_1 + -65 | 0 | 0) {
                              case 0:
                              case 4:
                              case 5:
                              case 6:
                               break label$39;
                              case 2:
                               break label$42;
                              case 1:
                              case 3:
                               break label$7;
                              default:
                               break label$54;
                              };
                             }
                             if (($12_1 | 0) == (83 | 0)) {
                              break label$43
                             }
                             break label$8;
                            }
                            $16_1 = 0;
                            $24_1 = 1088;
                            i64toi32_i32$2 = $7_1;
                            i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                            i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                            $25_1 = i64toi32_i32$1;
                            $25$hi = i64toi32_i32$0;
                            break label$46;
                           }
                           $12_1 = 0;
                           label$55 : {
                            switch ($15_1 & 255 | 0 | 0) {
                            case 0:
                             HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                             continue label$5;
                            case 1:
                             HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                             continue label$5;
                            case 2:
                             i64toi32_i32$1 = $11_1;
                             i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
                             i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                             HEAP32[i64toi32_i32$1 >> 2] = $11_1;
                             HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
                             continue label$5;
                            case 3:
                             HEAP16[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 1] = $11_1;
                             continue label$5;
                            case 4:
                             HEAP8[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 0] = $11_1;
                             continue label$5;
                            case 6:
                             HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                             continue label$5;
                            case 7:
                             break label$55;
                            default:
                             continue label$5;
                            };
                           }
                           i64toi32_i32$1 = $11_1;
                           i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
                           i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                           HEAP32[i64toi32_i32$1 >> 2] = $11_1;
                           HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
                           continue label$5;
                          }
                          $20_1 = $20_1 >>> 0 > 8 >>> 0 ? $20_1 : 8;
                          $17_1 = $17_1 | 8 | 0;
                          $12_1 = 120;
                         }
                         i64toi32_i32$2 = $7_1;
                         i64toi32_i32$0 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                         i64toi32_i32$1 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                         $13_1 = $272(i64toi32_i32$0 | 0, i64toi32_i32$1 | 0, $9_1 | 0, $12_1 & 32 | 0 | 0) | 0;
                         $16_1 = 0;
                         $24_1 = 1088;
                         i64toi32_i32$2 = $7_1;
                         i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                         i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                         if (!(i64toi32_i32$1 | i64toi32_i32$0 | 0)) {
                          break label$45
                         }
                         if (!($17_1 & 8 | 0)) {
                          break label$45
                         }
                         $24_1 = ($12_1 >>> 4 | 0) + 1088 | 0;
                         $16_1 = 2;
                         break label$45;
                        }
                        $16_1 = 0;
                        $24_1 = 1088;
                        i64toi32_i32$2 = $7_1;
                        i64toi32_i32$0 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                        i64toi32_i32$1 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                        $13_1 = $273(i64toi32_i32$0 | 0, i64toi32_i32$1 | 0, $9_1 | 0) | 0;
                        if (!($17_1 & 8 | 0)) {
                         break label$45
                        }
                        $12_1 = $9_1 - $13_1 | 0;
                        $20_1 = ($20_1 | 0) > ($12_1 | 0) ? $20_1 : $12_1 + 1 | 0;
                        break label$45;
                       }
                       label$62 : {
                        i64toi32_i32$2 = $7_1;
                        i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                        i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                        $25_1 = i64toi32_i32$1;
                        $25$hi = i64toi32_i32$0;
                        i64toi32_i32$2 = i64toi32_i32$1;
                        i64toi32_i32$1 = -1;
                        i64toi32_i32$3 = -1;
                        if ((i64toi32_i32$0 | 0) > (i64toi32_i32$1 | 0)) {
                         $33_1 = 1
                        } else {
                         if ((i64toi32_i32$0 | 0) >= (i64toi32_i32$1 | 0)) {
                          if (i64toi32_i32$2 >>> 0 <= i64toi32_i32$3 >>> 0) {
                           $34_1 = 0
                          } else {
                           $34_1 = 1
                          }
                          $35_1 = $34_1;
                         } else {
                          $35_1 = 0
                         }
                         $33_1 = $35_1;
                        }
                        if ($33_1) {
                         break label$62
                        }
                        i64toi32_i32$2 = $25$hi;
                        i64toi32_i32$2 = 0;
                        i64toi32_i32$3 = 0;
                        i64toi32_i32$0 = $25$hi;
                        i64toi32_i32$1 = $25_1;
                        i64toi32_i32$5 = (i64toi32_i32$3 >>> 0 < i64toi32_i32$1 >>> 0) + i64toi32_i32$0 | 0;
                        i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
                        $25_1 = i64toi32_i32$3 - i64toi32_i32$1 | 0;
                        $25$hi = i64toi32_i32$5;
                        i64toi32_i32$3 = $7_1;
                        HEAP32[($7_1 + 64 | 0) >> 2] = $25_1;
                        HEAP32[($7_1 + 68 | 0) >> 2] = i64toi32_i32$5;
                        $16_1 = 1;
                        $24_1 = 1088;
                        break label$46;
                       }
                       label$63 : {
                        if (!($17_1 & 2048 | 0)) {
                         break label$63
                        }
                        $16_1 = 1;
                        $24_1 = 1089;
                        break label$46;
                       }
                       $16_1 = $17_1 & 1 | 0;
                       $24_1 = $16_1 ? 1090 : 1088;
                      }
                      i64toi32_i32$5 = $25$hi;
                      $13_1 = $274($25_1 | 0, i64toi32_i32$5 | 0, $9_1 | 0) | 0;
                     }
                     label$64 : {
                      if (!$21_1) {
                       break label$64
                      }
                      if (($20_1 | 0) < (0 | 0)) {
                       break label$4
                      }
                     }
                     $17_1 = $21_1 ? $17_1 & -65537 | 0 : $17_1;
                     label$65 : {
                      i64toi32_i32$2 = $7_1;
                      i64toi32_i32$5 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                      i64toi32_i32$3 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                      $25_1 = i64toi32_i32$5;
                      $25$hi = i64toi32_i32$3;
                      i64toi32_i32$2 = i64toi32_i32$5;
                      i64toi32_i32$5 = 0;
                      i64toi32_i32$1 = 0;
                      if ((i64toi32_i32$2 | 0) != (i64toi32_i32$1 | 0) | (i64toi32_i32$3 | 0) != (i64toi32_i32$5 | 0) | 0) {
                       break label$65
                      }
                      if ($20_1) {
                       break label$65
                      }
                      $13_1 = $9_1;
                      $22_1 = $13_1;
                      $20_1 = 0;
                      break label$7;
                     }
                     i64toi32_i32$2 = $25$hi;
                     $12_1 = ($9_1 - $13_1 | 0) + !($25_1 | i64toi32_i32$2 | 0) | 0;
                     $20_1 = ($20_1 | 0) > ($12_1 | 0) ? $20_1 : $12_1;
                     break label$8;
                    }
                    $12_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                    $13_1 = $12_1 ? $12_1 : 2117;
                    $12_1 = $263($13_1 | 0, ($20_1 >>> 0 < 2147483647 >>> 0 ? $20_1 : 2147483647) | 0) | 0;
                    $22_1 = $13_1 + $12_1 | 0;
                    label$66 : {
                     if (($20_1 | 0) <= (-1 | 0)) {
                      break label$66
                     }
                     $17_1 = $23_1;
                     $20_1 = $12_1;
                     break label$7;
                    }
                    $17_1 = $23_1;
                    $20_1 = $12_1;
                    if (HEAPU8[$22_1 >> 0] | 0) {
                     break label$4
                    }
                    break label$7;
                   }
                   label$67 : {
                    if (!$20_1) {
                     break label$67
                    }
                    $14_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                    break label$41;
                   }
                   $12_1 = 0;
                   $275($0_1 | 0, 32 | 0, $19_1 | 0, 0 | 0, $17_1 | 0);
                   break label$40;
                  }
                  HEAP32[($7_1 + 12 | 0) >> 2] = 0;
                  i64toi32_i32$1 = $7_1;
                  i64toi32_i32$2 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                  i64toi32_i32$3 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                  HEAP32[($7_1 + 8 | 0) >> 2] = i64toi32_i32$2;
                  HEAP32[($7_1 + 64 | 0) >> 2] = $7_1 + 8 | 0;
                  $14_1 = $7_1 + 8 | 0;
                  $20_1 = -1;
                 }
                 $12_1 = 0;
                 label$68 : {
                  label$69 : while (1) {
                   $15_1 = HEAP32[$14_1 >> 2] | 0;
                   if (!$15_1) {
                    break label$68
                   }
                   label$70 : {
                    $15_1 = $286($7_1 + 4 | 0 | 0, $15_1 | 0) | 0;
                    $13_1 = ($15_1 | 0) < (0 | 0);
                    if ($13_1) {
                     break label$70
                    }
                    if ($15_1 >>> 0 > ($20_1 - $12_1 | 0) >>> 0) {
                     break label$70
                    }
                    $14_1 = $14_1 + 4 | 0;
                    $12_1 = $15_1 + $12_1 | 0;
                    if ($20_1 >>> 0 > $12_1 >>> 0) {
                     continue label$69
                    }
                    break label$68;
                   }
                   break label$69;
                  };
                  if ($13_1) {
                   break label$2
                  }
                 }
                 $22_1 = 61;
                 if (($12_1 | 0) < (0 | 0)) {
                  break label$3
                 }
                 $275($0_1 | 0, 32 | 0, $19_1 | 0, $12_1 | 0, $17_1 | 0);
                 label$71 : {
                  if ($12_1) {
                   break label$71
                  }
                  $12_1 = 0;
                  break label$40;
                 }
                 $15_1 = 0;
                 $14_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                 label$72 : while (1) {
                  $13_1 = HEAP32[$14_1 >> 2] | 0;
                  if (!$13_1) {
                   break label$40
                  }
                  $13_1 = $286($7_1 + 4 | 0 | 0, $13_1 | 0) | 0;
                  $15_1 = $13_1 + $15_1 | 0;
                  if ($15_1 >>> 0 > $12_1 >>> 0) {
                   break label$40
                  }
                  $269($0_1 | 0, $7_1 + 4 | 0 | 0, $13_1 | 0);
                  $14_1 = $14_1 + 4 | 0;
                  if ($15_1 >>> 0 < $12_1 >>> 0) {
                   continue label$72
                  }
                  break label$72;
                 };
                }
                $275($0_1 | 0, 32 | 0, $19_1 | 0, $12_1 | 0, $17_1 ^ 8192 | 0 | 0);
                $12_1 = ($19_1 | 0) > ($12_1 | 0) ? $19_1 : $12_1;
                continue label$5;
               }
               label$73 : {
                if (!$21_1) {
                 break label$73
                }
                if (($20_1 | 0) < (0 | 0)) {
                 break label$4
                }
               }
               $22_1 = 61;
               $12_1 = FUNCTION_TABLE[$5_1 | 0]($0_1, +HEAPF64[($7_1 + 64 | 0) >> 3], $19_1, $20_1, $17_1, $12_1) | 0;
               if (($12_1 | 0) >= (0 | 0)) {
                continue label$5
               }
               break label$3;
              }
              i64toi32_i32$1 = $7_1;
              i64toi32_i32$3 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
              i64toi32_i32$2 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
              HEAP8[($7_1 + 55 | 0) >> 0] = i64toi32_i32$3;
              $20_1 = 1;
              $13_1 = $8_1;
              $22_1 = $9_1;
              $17_1 = $23_1;
              break label$7;
             }
             $14_1 = HEAPU8[($12_1 + 1 | 0) >> 0] | 0;
             $12_1 = $12_1 + 1 | 0;
             continue label$11;
            };
           }
           if ($0_1) {
            break label$1
           }
           if (!$10_1) {
            break label$6
           }
           $12_1 = 1;
           label$74 : {
            label$75 : while (1) {
             $14_1 = HEAP32[($4_1 + ($12_1 << 2 | 0) | 0) >> 2] | 0;
             if (!$14_1) {
              break label$74
             }
             $271($3_1 + ($12_1 << 3 | 0) | 0 | 0, $14_1 | 0, $2_1 | 0, $6_1 | 0);
             $11_1 = 1;
             $12_1 = $12_1 + 1 | 0;
             if (($12_1 | 0) != (10 | 0)) {
              continue label$75
             }
             break label$1;
            };
           }
           $11_1 = 1;
           if ($12_1 >>> 0 >= 10 >>> 0) {
            break label$1
           }
           label$76 : while (1) {
            if (HEAP32[($4_1 + ($12_1 << 2 | 0) | 0) >> 2] | 0) {
             break label$9
            }
            $11_1 = 1;
            $12_1 = $12_1 + 1 | 0;
            if (($12_1 | 0) == (10 | 0)) {
             break label$1
            }
            continue label$76;
           };
          }
          $22_1 = 28;
          break label$3;
         }
         $22_1 = $9_1;
        }
        $18_1 = $22_1 - $13_1 | 0;
        $20_1 = ($20_1 | 0) > ($18_1 | 0) ? $20_1 : $18_1;
        if (($20_1 | 0) > ($16_1 ^ 2147483647 | 0 | 0)) {
         break label$4
        }
        $22_1 = 61;
        $15_1 = $16_1 + $20_1 | 0;
        $12_1 = ($19_1 | 0) > ($15_1 | 0) ? $19_1 : $15_1;
        if (($12_1 | 0) > ($14_1 | 0)) {
         break label$3
        }
        $275($0_1 | 0, 32 | 0, $12_1 | 0, $15_1 | 0, $17_1 | 0);
        $269($0_1 | 0, $24_1 | 0, $16_1 | 0);
        $275($0_1 | 0, 48 | 0, $12_1 | 0, $15_1 | 0, $17_1 ^ 65536 | 0 | 0);
        $275($0_1 | 0, 48 | 0, $20_1 | 0, $18_1 | 0, 0 | 0);
        $269($0_1 | 0, $13_1 | 0, $18_1 | 0);
        $275($0_1 | 0, 32 | 0, $12_1 | 0, $15_1 | 0, $17_1 ^ 8192 | 0 | 0);
        continue label$5;
       }
       break label$5;
      };
      $11_1 = 0;
      break label$1;
     }
     $22_1 = 61;
    }
    HEAP32[($264() | 0) >> 2] = $22_1;
   }
   $11_1 = -1;
  }
  global$0 = $7_1 + 80 | 0;
  return $11_1 | 0;
 }
 
 function $269($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if ((HEAPU8[$0_1 >> 0] | 0) & 32 | 0) {
    break label$1
   }
   $266($1_1 | 0, $2_1 | 0, $0_1 | 0) | 0;
  }
 }
 
 function $270($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $3_1 = 0, $2_1 = 0;
  $1_1 = 0;
  label$1 : {
   if ($261(HEAP8[(HEAP32[$0_1 >> 2] | 0) >> 0] | 0 | 0) | 0) {
    break label$1
   }
   return 0 | 0;
  }
  label$2 : while (1) {
   $2_1 = HEAP32[$0_1 >> 2] | 0;
   $3_1 = -1;
   label$3 : {
    if ($1_1 >>> 0 > 214748364 >>> 0) {
     break label$3
    }
    $3_1 = (HEAP8[$2_1 >> 0] | 0) + -48 | 0;
    $1_1 = Math_imul($1_1, 10);
    $3_1 = ($3_1 | 0) > ($1_1 ^ 2147483647 | 0 | 0) ? -1 : $3_1 + $1_1 | 0;
   }
   HEAP32[$0_1 >> 2] = $2_1 + 1 | 0;
   $1_1 = $3_1;
   if ($261(HEAP8[($2_1 + 1 | 0) >> 0] | 0 | 0) | 0) {
    continue label$2
   }
   break label$2;
  };
  return $3_1 | 0;
 }
 
 function $271($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $21_1 = 0, $29_1 = 0, $37_1 = 0, $45_1 = 0, $55_1 = 0, $63_1 = 0, $71_1 = 0, $79_1 = 0, $87_1 = 0, $97_1 = 0, $105_1 = 0, $115_1 = 0, $125_1 = 0, $133_1 = 0, $141_1 = 0;
  label$1 : {
   switch ($1_1 + -9 | 0 | 0) {
   case 0:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
    return;
   case 1:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
    $21_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $21_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 2:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = 0;
    $29_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $29_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 4:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
    $37_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $37_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 5:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = 0;
    $45_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $45_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 3:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $55_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $55_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 6:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP16[$1_1 >> 1] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $63_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $63_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 7:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAPU16[$1_1 >> 1] | 0;
    i64toi32_i32$1 = 0;
    $71_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $71_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 8:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP8[$1_1 >> 0] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $79_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $79_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 9:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAPU8[$1_1 >> 0] | 0;
    i64toi32_i32$1 = 0;
    $87_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $87_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 10:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $97_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $97_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 11:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = 0;
    $105_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $105_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 12:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $115_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $115_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 13:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $125_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $125_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 14:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $133_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $133_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 15:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = 0;
    $141_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $141_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 16:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    HEAPF64[$0_1 >> 3] = +HEAPF64[$1_1 >> 3];
    return;
   case 17:
    FUNCTION_TABLE[$3_1 | 0]($0_1, $2_1);
    break;
   default:
    break label$1;
   };
  }
 }
 
 function $272($0_1, $0$hi, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $10_1 = 0, $3_1 = 0;
  label$1 : {
   i64toi32_i32$0 = $0$hi;
   if (!($0_1 | i64toi32_i32$0 | 0)) {
    break label$1
   }
   label$2 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$0 = $0$hi;
    HEAP8[$1_1 >> 0] = HEAPU8[(($0_1 & 15 | 0) + 3776 | 0) >> 0] | 0 | $2_1 | 0;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 0;
    i64toi32_i32$3 = 15;
    $3_1 = i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$1 = 4;
    i64toi32_i32$4 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $10_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
     $10_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
    }
    $0_1 = $10_1;
    $0$hi = i64toi32_i32$0;
    if ($3_1) {
     continue label$2
    }
    break label$2;
   };
  }
  return $1_1 | 0;
 }
 
 function $273($0_1, $0$hi, $1_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $9_1 = 0, $2_1 = 0;
  label$1 : {
   i64toi32_i32$0 = $0$hi;
   if (!($0_1 | i64toi32_i32$0 | 0)) {
    break label$1
   }
   label$2 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$0 = $0$hi;
    HEAP8[$1_1 >> 0] = $0_1 & 7 | 0 | 48 | 0;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 0;
    i64toi32_i32$3 = 7;
    $2_1 = i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$1 = 3;
    i64toi32_i32$4 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $9_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
     $9_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
    }
    $0_1 = $9_1;
    $0$hi = i64toi32_i32$0;
    if ($2_1) {
     continue label$2
    }
    break label$2;
   };
  }
  return $1_1 | 0;
 }
 
 function $274($0_1, $0$hi, $1_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $3_1 = 0, i64toi32_i32$3 = 0, $2_1 = 0, i64toi32_i32$5 = 0, $2$hi = 0, $4_1 = 0, $16_1 = 0, $16$hi = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 1;
    i64toi32_i32$3 = 0;
    if (i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 >= i64toi32_i32$3 >>> 0 | 0) | 0) {
     break label$2
    }
    i64toi32_i32$2 = $0$hi;
    $2_1 = $0_1;
    $2$hi = i64toi32_i32$2;
    break label$1;
   }
   label$3 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$2 = $0$hi;
    i64toi32_i32$0 = 0;
    i64toi32_i32$0 = __wasm_i64_udiv($0_1 | 0, i64toi32_i32$2 | 0, 10 | 0, i64toi32_i32$0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
    $2_1 = i64toi32_i32$0;
    $2$hi = i64toi32_i32$2;
    i64toi32_i32$0 = 0;
    i64toi32_i32$0 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$2 | 0, 10 | 0, i64toi32_i32$0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
    $16_1 = i64toi32_i32$0;
    $16$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $0$hi;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = $16$hi;
    i64toi32_i32$1 = $16_1;
    i64toi32_i32$5 = ($0_1 >>> 0 < i64toi32_i32$1 >>> 0) + i64toi32_i32$0 | 0;
    i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
    HEAP8[$1_1 >> 0] = $0_1 - i64toi32_i32$1 | 0 | 48 | 0;
    i64toi32_i32$5 = i64toi32_i32$2;
    i64toi32_i32$5 = i64toi32_i32$2;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$3 = 9;
    i64toi32_i32$1 = -1;
    $3_1 = $0$hi >>> 0 > i64toi32_i32$3 >>> 0 | (($0$hi | 0) == (i64toi32_i32$3 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$1 >>> 0 | 0) | 0;
    i64toi32_i32$2 = $2$hi;
    $0_1 = $2_1;
    $0$hi = i64toi32_i32$2;
    if ($3_1) {
     continue label$3
    }
    break label$3;
   };
  }
  label$4 : {
   i64toi32_i32$2 = $2$hi;
   $3_1 = $2_1;
   if (!$3_1) {
    break label$4
   }
   label$5 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    $4_1 = ($3_1 >>> 0) / (10 >>> 0) | 0;
    HEAP8[$1_1 >> 0] = $3_1 - Math_imul($4_1, 10) | 0 | 48 | 0;
    $5_1 = $3_1 >>> 0 > 9 >>> 0;
    $3_1 = $4_1;
    if ($5_1) {
     continue label$5
    }
    break label$5;
   };
  }
  return $1_1 | 0;
 }
 
 function $275($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 256 | 0;
  global$0 = $5_1;
  label$1 : {
   if (($2_1 | 0) <= ($3_1 | 0)) {
    break label$1
   }
   if ($4_1 & 73728 | 0) {
    break label$1
   }
   $3_1 = $2_1 - $3_1 | 0;
   $2_1 = $3_1 >>> 0 < 256 >>> 0;
   $247($5_1 | 0, $1_1 & 255 | 0 | 0, ($2_1 ? $3_1 : 256) | 0) | 0;
   label$2 : {
    if ($2_1) {
     break label$2
    }
    label$3 : while (1) {
     $269($0_1 | 0, $5_1 | 0, 256 | 0);
     $3_1 = $3_1 + -256 | 0;
     if ($3_1 >>> 0 > 255 >>> 0) {
      continue label$3
     }
     break label$3;
    };
   }
   $269($0_1 | 0, $5_1 | 0, $3_1 | 0);
  }
  global$0 = $5_1 + 256 | 0;
 }
 
 function $276($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $267($0_1 | 0, $1_1 | 0, $2_1 | 0, 26 | 0, 27 | 0) | 0 | 0;
 }
 
 function $277($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  var $10_1 = 0, $11_1 = 0, $12_1 = 0, $18_1 = 0, $21_1 = 0, $6_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, $15_1 = 0, i64toi32_i32$4 = 0, $22_1 = 0, $23_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, i64toi32_i32$5 = 0, $17_1 = 0, $19_1 = 0, $8_1 = 0, $26_1 = 0.0, $24_1 = 0, $13_1 = 0, $24$hi = 0, $14_1 = 0, $16_1 = 0, $9_1 = 0, $20_1 = 0, $7_1 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $25$hi = 0, $48_1 = 0, $25_1 = 0, $167_1 = 0, $169$hi = 0, $171$hi = 0, $173_1 = 0, $173$hi = 0, $175$hi = 0, $179_1 = 0, $179$hi = 0, $388_1 = 0.0, $852 = 0;
  $6_1 = global$0 - 560 | 0;
  global$0 = $6_1;
  $7_1 = 0;
  HEAP32[($6_1 + 44 | 0) >> 2] = 0;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $279(+$1_1) | 0;
    i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    $24_1 = i64toi32_i32$0;
    $24$hi = i64toi32_i32$1;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$0 = -1;
    i64toi32_i32$3 = -1;
    if ((i64toi32_i32$1 | 0) > (i64toi32_i32$0 | 0)) {
     $45_1 = 1
    } else {
     if ((i64toi32_i32$1 | 0) >= (i64toi32_i32$0 | 0)) {
      if (i64toi32_i32$2 >>> 0 <= i64toi32_i32$3 >>> 0) {
       $46_1 = 0
      } else {
       $46_1 = 1
      }
      $47_1 = $46_1;
     } else {
      $47_1 = 0
     }
     $45_1 = $47_1;
    }
    if ($45_1) {
     break label$2
    }
    $8_1 = 1;
    $9_1 = 1098;
    $1_1 = -$1_1;
    i64toi32_i32$2 = $279(+$1_1) | 0;
    i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    $24_1 = i64toi32_i32$2;
    $24$hi = i64toi32_i32$1;
    break label$1;
   }
   label$3 : {
    if (!($4_1 & 2048 | 0)) {
     break label$3
    }
    $8_1 = 1;
    $9_1 = 1101;
    break label$1;
   }
   $8_1 = $4_1 & 1 | 0;
   $9_1 = $8_1 ? 1104 : 1099;
   $7_1 = !$8_1;
  }
  label$4 : {
   label$5 : {
    i64toi32_i32$1 = $24$hi;
    i64toi32_i32$3 = $24_1;
    i64toi32_i32$2 = 2146435072;
    i64toi32_i32$0 = 0;
    i64toi32_i32$2 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
    i64toi32_i32$1 = i64toi32_i32$3 & i64toi32_i32$0 | 0;
    i64toi32_i32$3 = 2146435072;
    i64toi32_i32$0 = 0;
    if ((i64toi32_i32$1 | 0) != (i64toi32_i32$0 | 0) | (i64toi32_i32$2 | 0) != (i64toi32_i32$3 | 0) | 0) {
     break label$5
    }
    $10_1 = $8_1 + 3 | 0;
    $275($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 & -65537 | 0 | 0);
    $269($0_1 | 0, $9_1 | 0, $8_1 | 0);
    $11_1 = $5_1 & 32 | 0;
    $269($0_1 | 0, ($1_1 != $1_1 ? ($11_1 ? 1205 : 1490) : $11_1 ? 1333 : 1494) | 0, 3 | 0);
    $275($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 ^ 8192 | 0 | 0);
    $12_1 = ($10_1 | 0) > ($2_1 | 0) ? $10_1 : $2_1;
    break label$4;
   }
   $13_1 = $6_1 + 16 | 0;
   label$6 : {
    label$7 : {
     label$8 : {
      label$9 : {
       $1_1 = +$265(+$1_1, $6_1 + 44 | 0 | 0);
       $1_1 = $1_1 + $1_1;
       if ($1_1 == 0.0) {
        break label$9
       }
       $10_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
       HEAP32[($6_1 + 44 | 0) >> 2] = $10_1 + -1 | 0;
       $14_1 = $5_1 | 32 | 0;
       if (($14_1 | 0) != (97 | 0)) {
        break label$8
       }
       break label$6;
      }
      $14_1 = $5_1 | 32 | 0;
      if (($14_1 | 0) == (97 | 0)) {
       break label$6
      }
      $15_1 = ($3_1 | 0) < (0 | 0) ? 6 : $3_1;
      $16_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
      break label$7;
     }
     $16_1 = $10_1 + -29 | 0;
     HEAP32[($6_1 + 44 | 0) >> 2] = $16_1;
     $15_1 = ($3_1 | 0) < (0 | 0) ? 6 : $3_1;
     $1_1 = $1_1 * 268435456.0;
    }
    $17_1 = ($6_1 + 48 | 0) + (($16_1 | 0) < (0 | 0) ? 0 : 288) | 0;
    $11_1 = $17_1;
    label$10 : while (1) {
     label$11 : {
      label$12 : {
       if (!($1_1 < 4294967296.0 & $1_1 >= 0.0 | 0)) {
        break label$12
       }
       $10_1 = ~~$1_1 >>> 0;
       break label$11;
      }
      $10_1 = 0;
     }
     HEAP32[$11_1 >> 2] = $10_1;
     $11_1 = $11_1 + 4 | 0;
     $1_1 = ($1_1 - +($10_1 >>> 0)) * 1.0e9;
     if ($1_1 != 0.0) {
      continue label$10
     }
     break label$10;
    };
    label$13 : {
     label$14 : {
      if (($16_1 | 0) >= (1 | 0)) {
       break label$14
      }
      $3_1 = $16_1;
      $10_1 = $11_1;
      $18_1 = $17_1;
      break label$13;
     }
     $18_1 = $17_1;
     $3_1 = $16_1;
     label$15 : while (1) {
      $3_1 = ($3_1 | 0) < (29 | 0) ? $3_1 : 29;
      label$16 : {
       $10_1 = $11_1 + -4 | 0;
       if ($10_1 >>> 0 < $18_1 >>> 0) {
        break label$16
       }
       i64toi32_i32$1 = 0;
       $25_1 = $3_1;
       $25$hi = i64toi32_i32$1;
       i64toi32_i32$1 = 0;
       $24_1 = 0;
       $24$hi = i64toi32_i32$1;
       label$17 : while (1) {
        $167_1 = $10_1;
        i64toi32_i32$0 = $10_1;
        i64toi32_i32$1 = HEAP32[$10_1 >> 2] | 0;
        i64toi32_i32$2 = 0;
        $169$hi = i64toi32_i32$2;
        i64toi32_i32$2 = $25$hi;
        i64toi32_i32$2 = $169$hi;
        i64toi32_i32$0 = i64toi32_i32$1;
        i64toi32_i32$1 = $25$hi;
        i64toi32_i32$3 = $25_1;
        i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
        if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
         i64toi32_i32$1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
         $48_1 = 0;
        } else {
         i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
         $48_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
        }
        $171$hi = i64toi32_i32$1;
        i64toi32_i32$1 = $24$hi;
        i64toi32_i32$2 = $24_1;
        i64toi32_i32$0 = 0;
        i64toi32_i32$3 = -1;
        i64toi32_i32$0 = i64toi32_i32$1 & i64toi32_i32$0 | 0;
        $173_1 = i64toi32_i32$2 & i64toi32_i32$3 | 0;
        $173$hi = i64toi32_i32$0;
        i64toi32_i32$0 = $171$hi;
        i64toi32_i32$1 = $48_1;
        i64toi32_i32$2 = $173$hi;
        i64toi32_i32$3 = $173_1;
        i64toi32_i32$4 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
        i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$2 | 0;
        if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
         i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
        }
        $24_1 = i64toi32_i32$4;
        $24$hi = i64toi32_i32$5;
        $175$hi = i64toi32_i32$5;
        i64toi32_i32$1 = 0;
        i64toi32_i32$1 = __wasm_i64_udiv(i64toi32_i32$4 | 0, i64toi32_i32$5 | 0, 1e9 | 0, i64toi32_i32$1 | 0) | 0;
        i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
        $24_1 = i64toi32_i32$1;
        $24$hi = i64toi32_i32$5;
        i64toi32_i32$1 = 0;
        i64toi32_i32$1 = __wasm_i64_mul($24_1 | 0, i64toi32_i32$5 | 0, 1e9 | 0, i64toi32_i32$1 | 0) | 0;
        i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
        $179_1 = i64toi32_i32$1;
        $179$hi = i64toi32_i32$5;
        i64toi32_i32$5 = $175$hi;
        i64toi32_i32$0 = i64toi32_i32$4;
        i64toi32_i32$1 = $179$hi;
        i64toi32_i32$3 = $179_1;
        i64toi32_i32$2 = i64toi32_i32$0 - i64toi32_i32$3 | 0;
        i64toi32_i32$4 = (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) + i64toi32_i32$1 | 0;
        i64toi32_i32$4 = i64toi32_i32$5 - i64toi32_i32$4 | 0;
        HEAP32[$167_1 >> 2] = i64toi32_i32$2;
        $10_1 = $10_1 + -4 | 0;
        if ($10_1 >>> 0 >= $18_1 >>> 0) {
         continue label$17
        }
        break label$17;
       };
       i64toi32_i32$4 = $24$hi;
       $10_1 = $24_1;
       if (!$10_1) {
        break label$16
       }
       $18_1 = $18_1 + -4 | 0;
       HEAP32[$18_1 >> 2] = $10_1;
      }
      label$18 : {
       label$19 : while (1) {
        $10_1 = $11_1;
        if ($10_1 >>> 0 <= $18_1 >>> 0) {
         break label$18
        }
        $11_1 = $10_1 + -4 | 0;
        if (!(HEAP32[$11_1 >> 2] | 0)) {
         continue label$19
        }
        break label$19;
       };
      }
      $3_1 = (HEAP32[($6_1 + 44 | 0) >> 2] | 0) - $3_1 | 0;
      HEAP32[($6_1 + 44 | 0) >> 2] = $3_1;
      $11_1 = $10_1;
      if (($3_1 | 0) > (0 | 0)) {
       continue label$15
      }
      break label$15;
     };
    }
    label$20 : {
     if (($3_1 | 0) > (-1 | 0)) {
      break label$20
     }
     $19_1 = ((($15_1 + 25 | 0) >>> 0) / (9 >>> 0) | 0) + 1 | 0;
     $20_1 = ($14_1 | 0) == (102 | 0);
     label$21 : while (1) {
      $11_1 = 0 - $3_1 | 0;
      $21_1 = ($11_1 | 0) < (9 | 0) ? $11_1 : 9;
      label$22 : {
       label$23 : {
        if ($18_1 >>> 0 < $10_1 >>> 0) {
         break label$23
        }
        $11_1 = HEAP32[$18_1 >> 2] | 0;
        break label$22;
       }
       $22_1 = 1e9 >>> $21_1 | 0;
       $23_1 = (-1 << $21_1 | 0) ^ -1 | 0;
       $3_1 = 0;
       $11_1 = $18_1;
       label$24 : while (1) {
        $12_1 = HEAP32[$11_1 >> 2] | 0;
        HEAP32[$11_1 >> 2] = ($12_1 >>> $21_1 | 0) + $3_1 | 0;
        $3_1 = Math_imul($12_1 & $23_1 | 0, $22_1);
        $11_1 = $11_1 + 4 | 0;
        if ($11_1 >>> 0 < $10_1 >>> 0) {
         continue label$24
        }
        break label$24;
       };
       $11_1 = HEAP32[$18_1 >> 2] | 0;
       if (!$3_1) {
        break label$22
       }
       HEAP32[$10_1 >> 2] = $3_1;
       $10_1 = $10_1 + 4 | 0;
      }
      $3_1 = (HEAP32[($6_1 + 44 | 0) >> 2] | 0) + $21_1 | 0;
      HEAP32[($6_1 + 44 | 0) >> 2] = $3_1;
      $18_1 = $18_1 + (!$11_1 << 2 | 0) | 0;
      $11_1 = $20_1 ? $17_1 : $18_1;
      $10_1 = (($10_1 - $11_1 | 0) >> 2 | 0 | 0) > ($19_1 | 0) ? $11_1 + ($19_1 << 2 | 0) | 0 : $10_1;
      if (($3_1 | 0) < (0 | 0)) {
       continue label$21
      }
      break label$21;
     };
    }
    $3_1 = 0;
    label$25 : {
     if ($18_1 >>> 0 >= $10_1 >>> 0) {
      break label$25
     }
     $3_1 = Math_imul(($17_1 - $18_1 | 0) >> 2 | 0, 9);
     $11_1 = 10;
     $12_1 = HEAP32[$18_1 >> 2] | 0;
     if ($12_1 >>> 0 < 10 >>> 0) {
      break label$25
     }
     label$26 : while (1) {
      $3_1 = $3_1 + 1 | 0;
      $11_1 = Math_imul($11_1, 10);
      if ($12_1 >>> 0 >= $11_1 >>> 0) {
       continue label$26
      }
      break label$26;
     };
    }
    label$27 : {
     $11_1 = ($15_1 - (($14_1 | 0) == (102 | 0) ? 0 : $3_1) | 0) - (($15_1 | 0) != (0 | 0) & ($14_1 | 0) == (103 | 0) | 0) | 0;
     if (($11_1 | 0) >= (Math_imul(($10_1 - $17_1 | 0) >> 2 | 0, 9) + -9 | 0 | 0)) {
      break label$27
     }
     $12_1 = $11_1 + 9216 | 0;
     $22_1 = ($12_1 | 0) / (9 | 0) | 0;
     $21_1 = (($22_1 << 2 | 0) + (($6_1 + 48 | 0) + (($16_1 | 0) < (0 | 0) ? 4 : 292) | 0) | 0) + -4096 | 0;
     $11_1 = 10;
     label$28 : {
      $12_1 = $12_1 - Math_imul($22_1, 9) | 0;
      if (($12_1 | 0) > (7 | 0)) {
       break label$28
      }
      label$29 : while (1) {
       $11_1 = Math_imul($11_1, 10);
       $12_1 = $12_1 + 1 | 0;
       if (($12_1 | 0) != (8 | 0)) {
        continue label$29
       }
       break label$29;
      };
     }
     $23_1 = $21_1 + 4 | 0;
     label$30 : {
      label$31 : {
       $12_1 = HEAP32[$21_1 >> 2] | 0;
       $19_1 = ($12_1 >>> 0) / ($11_1 >>> 0) | 0;
       $22_1 = $12_1 - Math_imul($19_1, $11_1) | 0;
       if ($22_1) {
        break label$31
       }
       if (($23_1 | 0) == ($10_1 | 0)) {
        break label$30
       }
      }
      label$32 : {
       label$33 : {
        if ($19_1 & 1 | 0) {
         break label$33
        }
        $1_1 = 9007199254740992.0;
        if (($11_1 | 0) != (1e9 | 0)) {
         break label$32
        }
        if ($21_1 >>> 0 <= $18_1 >>> 0) {
         break label$32
        }
        if (!((HEAPU8[($21_1 + -4 | 0) >> 0] | 0) & 1 | 0)) {
         break label$32
        }
       }
       $1_1 = 9007199254740994.0;
      }
      $388_1 = ($23_1 | 0) == ($10_1 | 0) ? 1.0 : 1.5;
      $23_1 = $11_1 >>> 1 | 0;
      $26_1 = $22_1 >>> 0 < $23_1 >>> 0 ? .5 : ($22_1 | 0) == ($23_1 | 0) ? $388_1 : 1.5;
      label$34 : {
       if ($7_1) {
        break label$34
       }
       if ((HEAPU8[$9_1 >> 0] | 0 | 0) != (45 | 0)) {
        break label$34
       }
       $26_1 = -$26_1;
       $1_1 = -$1_1;
      }
      $12_1 = $12_1 - $22_1 | 0;
      HEAP32[$21_1 >> 2] = $12_1;
      if ($1_1 + $26_1 == $1_1) {
       break label$30
      }
      $11_1 = $12_1 + $11_1 | 0;
      HEAP32[$21_1 >> 2] = $11_1;
      label$35 : {
       if ($11_1 >>> 0 < 1e9 >>> 0) {
        break label$35
       }
       label$36 : while (1) {
        HEAP32[$21_1 >> 2] = 0;
        label$37 : {
         $21_1 = $21_1 + -4 | 0;
         if ($21_1 >>> 0 >= $18_1 >>> 0) {
          break label$37
         }
         $18_1 = $18_1 + -4 | 0;
         HEAP32[$18_1 >> 2] = 0;
        }
        $11_1 = (HEAP32[$21_1 >> 2] | 0) + 1 | 0;
        HEAP32[$21_1 >> 2] = $11_1;
        if ($11_1 >>> 0 > 999999999 >>> 0) {
         continue label$36
        }
        break label$36;
       };
      }
      $3_1 = Math_imul(($17_1 - $18_1 | 0) >> 2 | 0, 9);
      $11_1 = 10;
      $12_1 = HEAP32[$18_1 >> 2] | 0;
      if ($12_1 >>> 0 < 10 >>> 0) {
       break label$30
      }
      label$38 : while (1) {
       $3_1 = $3_1 + 1 | 0;
       $11_1 = Math_imul($11_1, 10);
       if ($12_1 >>> 0 >= $11_1 >>> 0) {
        continue label$38
       }
       break label$38;
      };
     }
     $11_1 = $21_1 + 4 | 0;
     $10_1 = $10_1 >>> 0 > $11_1 >>> 0 ? $11_1 : $10_1;
    }
    label$39 : {
     label$40 : while (1) {
      $11_1 = $10_1;
      $12_1 = $10_1 >>> 0 <= $18_1 >>> 0;
      if ($12_1) {
       break label$39
      }
      $10_1 = $11_1 + -4 | 0;
      if (!(HEAP32[$10_1 >> 2] | 0)) {
       continue label$40
      }
      break label$40;
     };
    }
    label$41 : {
     label$42 : {
      if (($14_1 | 0) == (103 | 0)) {
       break label$42
      }
      $21_1 = $4_1 & 8 | 0;
      break label$41;
     }
     $10_1 = $15_1 ? $15_1 : 1;
     $21_1 = ($10_1 | 0) > ($3_1 | 0) & ($3_1 | 0) > (-5 | 0) | 0;
     $15_1 = ($21_1 ? $3_1 ^ -1 | 0 : -1) + $10_1 | 0;
     $5_1 = ($21_1 ? -1 : -2) + $5_1 | 0;
     $21_1 = $4_1 & 8 | 0;
     if ($21_1) {
      break label$41
     }
     $10_1 = -9;
     label$43 : {
      if ($12_1) {
       break label$43
      }
      $21_1 = HEAP32[($11_1 + -4 | 0) >> 2] | 0;
      if (!$21_1) {
       break label$43
      }
      $12_1 = 10;
      $10_1 = 0;
      if (($21_1 >>> 0) % (10 >>> 0) | 0) {
       break label$43
      }
      label$44 : while (1) {
       $22_1 = $10_1;
       $10_1 = $10_1 + 1 | 0;
       $12_1 = Math_imul($12_1, 10);
       if (!(($21_1 >>> 0) % ($12_1 >>> 0) | 0)) {
        continue label$44
       }
       break label$44;
      };
      $10_1 = $22_1 ^ -1 | 0;
     }
     $12_1 = Math_imul(($11_1 - $17_1 | 0) >> 2 | 0, 9);
     label$45 : {
      if (($5_1 & -33 | 0 | 0) != (70 | 0)) {
       break label$45
      }
      $21_1 = 0;
      $10_1 = ($12_1 + $10_1 | 0) + -9 | 0;
      $10_1 = ($10_1 | 0) > (0 | 0) ? $10_1 : 0;
      $15_1 = ($15_1 | 0) < ($10_1 | 0) ? $15_1 : $10_1;
      break label$41;
     }
     $21_1 = 0;
     $10_1 = (($3_1 + $12_1 | 0) + $10_1 | 0) + -9 | 0;
     $10_1 = ($10_1 | 0) > (0 | 0) ? $10_1 : 0;
     $15_1 = ($15_1 | 0) < ($10_1 | 0) ? $15_1 : $10_1;
    }
    $12_1 = -1;
    $22_1 = $15_1 | $21_1 | 0;
    if (($15_1 | 0) > (($22_1 ? 2147483645 : 2147483646) | 0)) {
     break label$4
    }
    $23_1 = ($15_1 + (($22_1 | 0) != (0 | 0)) | 0) + 1 | 0;
    label$46 : {
     label$47 : {
      $20_1 = $5_1 & -33 | 0;
      if (($20_1 | 0) != (70 | 0)) {
       break label$47
      }
      if (($3_1 | 0) > ($23_1 ^ 2147483647 | 0 | 0)) {
       break label$4
      }
      $10_1 = ($3_1 | 0) > (0 | 0) ? $3_1 : 0;
      break label$46;
     }
     label$48 : {
      $10_1 = $3_1 >> 31 | 0;
      i64toi32_i32$4 = 0;
      $10_1 = $274(($3_1 ^ $10_1 | 0) - $10_1 | 0 | 0, i64toi32_i32$4 | 0, $13_1 | 0) | 0;
      if (($13_1 - $10_1 | 0 | 0) > (1 | 0)) {
       break label$48
      }
      label$49 : while (1) {
       $10_1 = $10_1 + -1 | 0;
       HEAP8[$10_1 >> 0] = 48;
       if (($13_1 - $10_1 | 0 | 0) < (2 | 0)) {
        continue label$49
       }
       break label$49;
      };
     }
     $19_1 = $10_1 + -2 | 0;
     HEAP8[$19_1 >> 0] = $5_1;
     $12_1 = -1;
     HEAP8[($10_1 + -1 | 0) >> 0] = ($3_1 | 0) < (0 | 0) ? 45 : 43;
     $10_1 = $13_1 - $19_1 | 0;
     if (($10_1 | 0) > ($23_1 ^ 2147483647 | 0 | 0)) {
      break label$4
     }
    }
    $12_1 = -1;
    $10_1 = $10_1 + $23_1 | 0;
    if (($10_1 | 0) > ($8_1 ^ 2147483647 | 0 | 0)) {
     break label$4
    }
    $23_1 = $10_1 + $8_1 | 0;
    $275($0_1 | 0, 32 | 0, $2_1 | 0, $23_1 | 0, $4_1 | 0);
    $269($0_1 | 0, $9_1 | 0, $8_1 | 0);
    $275($0_1 | 0, 48 | 0, $2_1 | 0, $23_1 | 0, $4_1 ^ 65536 | 0 | 0);
    label$50 : {
     label$51 : {
      label$52 : {
       label$53 : {
        if (($20_1 | 0) != (70 | 0)) {
         break label$53
        }
        $21_1 = $6_1 + 16 | 0 | 8 | 0;
        $3_1 = $6_1 + 16 | 0 | 9 | 0;
        $12_1 = $18_1 >>> 0 > $17_1 >>> 0 ? $17_1 : $18_1;
        $18_1 = $12_1;
        label$54 : while (1) {
         i64toi32_i32$5 = $18_1;
         i64toi32_i32$4 = HEAP32[$18_1 >> 2] | 0;
         i64toi32_i32$0 = 0;
         $10_1 = $274(i64toi32_i32$4 | 0, i64toi32_i32$0 | 0, $3_1 | 0) | 0;
         label$55 : {
          label$56 : {
           if (($18_1 | 0) == ($12_1 | 0)) {
            break label$56
           }
           if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
            break label$55
           }
           label$57 : while (1) {
            $10_1 = $10_1 + -1 | 0;
            HEAP8[$10_1 >> 0] = 48;
            if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
             continue label$57
            }
            break label$55;
           };
          }
          if (($10_1 | 0) != ($3_1 | 0)) {
           break label$55
          }
          HEAP8[($6_1 + 24 | 0) >> 0] = 48;
          $10_1 = $21_1;
         }
         $269($0_1 | 0, $10_1 | 0, $3_1 - $10_1 | 0 | 0);
         $18_1 = $18_1 + 4 | 0;
         if ($18_1 >>> 0 <= $17_1 >>> 0) {
          continue label$54
         }
         break label$54;
        };
        label$58 : {
         if (!$22_1) {
          break label$58
         }
         $269($0_1 | 0, 2111 | 0, 1 | 0);
        }
        if ($18_1 >>> 0 >= $11_1 >>> 0) {
         break label$52
        }
        if (($15_1 | 0) < (1 | 0)) {
         break label$52
        }
        label$59 : while (1) {
         label$60 : {
          i64toi32_i32$5 = $18_1;
          i64toi32_i32$0 = HEAP32[$18_1 >> 2] | 0;
          i64toi32_i32$4 = 0;
          $10_1 = $274(i64toi32_i32$0 | 0, i64toi32_i32$4 | 0, $3_1 | 0) | 0;
          if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
           break label$60
          }
          label$61 : while (1) {
           $10_1 = $10_1 + -1 | 0;
           HEAP8[$10_1 >> 0] = 48;
           if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
            continue label$61
           }
           break label$61;
          };
         }
         $269($0_1 | 0, $10_1 | 0, (($15_1 | 0) < (9 | 0) ? $15_1 : 9) | 0);
         $10_1 = $15_1 + -9 | 0;
         $18_1 = $18_1 + 4 | 0;
         if ($18_1 >>> 0 >= $11_1 >>> 0) {
          break label$51
         }
         $12_1 = ($15_1 | 0) > (9 | 0);
         $15_1 = $10_1;
         if ($12_1) {
          continue label$59
         }
         break label$51;
        };
       }
       label$62 : {
        if (($15_1 | 0) < (0 | 0)) {
         break label$62
        }
        $22_1 = $11_1 >>> 0 > $18_1 >>> 0 ? $11_1 : $18_1 + 4 | 0;
        $17_1 = $6_1 + 16 | 0 | 8 | 0;
        $3_1 = $6_1 + 16 | 0 | 9 | 0;
        $11_1 = $18_1;
        label$63 : while (1) {
         label$64 : {
          i64toi32_i32$5 = $11_1;
          i64toi32_i32$4 = HEAP32[$11_1 >> 2] | 0;
          i64toi32_i32$0 = 0;
          $10_1 = $274(i64toi32_i32$4 | 0, i64toi32_i32$0 | 0, $3_1 | 0) | 0;
          if (($10_1 | 0) != ($3_1 | 0)) {
           break label$64
          }
          HEAP8[($6_1 + 24 | 0) >> 0] = 48;
          $10_1 = $17_1;
         }
         label$65 : {
          label$66 : {
           if (($11_1 | 0) == ($18_1 | 0)) {
            break label$66
           }
           if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
            break label$65
           }
           label$67 : while (1) {
            $10_1 = $10_1 + -1 | 0;
            HEAP8[$10_1 >> 0] = 48;
            if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
             continue label$67
            }
            break label$65;
           };
          }
          $269($0_1 | 0, $10_1 | 0, 1 | 0);
          $10_1 = $10_1 + 1 | 0;
          if (!($15_1 | $21_1 | 0)) {
           break label$65
          }
          $269($0_1 | 0, 2111 | 0, 1 | 0);
         }
         $12_1 = $3_1 - $10_1 | 0;
         $269($0_1 | 0, $10_1 | 0, (($15_1 | 0) < ($12_1 | 0) ? $15_1 : $12_1) | 0);
         $15_1 = $15_1 - $12_1 | 0;
         $11_1 = $11_1 + 4 | 0;
         if ($11_1 >>> 0 >= $22_1 >>> 0) {
          break label$62
         }
         if (($15_1 | 0) > (-1 | 0)) {
          continue label$63
         }
         break label$63;
        };
       }
       $275($0_1 | 0, 48 | 0, $15_1 + 18 | 0 | 0, 18 | 0, 0 | 0);
       $269($0_1 | 0, $19_1 | 0, $13_1 - $19_1 | 0 | 0);
       break label$50;
      }
      $10_1 = $15_1;
     }
     $275($0_1 | 0, 48 | 0, $10_1 + 9 | 0 | 0, 9 | 0, 0 | 0);
    }
    $275($0_1 | 0, 32 | 0, $2_1 | 0, $23_1 | 0, $4_1 ^ 8192 | 0 | 0);
    $12_1 = ($23_1 | 0) > ($2_1 | 0) ? $23_1 : $2_1;
    break label$4;
   }
   $23_1 = $9_1 + ((($5_1 << 26 | 0) >> 31 | 0) & 9 | 0) | 0;
   label$68 : {
    if ($3_1 >>> 0 > 11 >>> 0) {
     break label$68
    }
    $10_1 = 12 - $3_1 | 0;
    $26_1 = 16.0;
    label$69 : while (1) {
     $26_1 = $26_1 * 16.0;
     $10_1 = $10_1 + -1 | 0;
     if ($10_1) {
      continue label$69
     }
     break label$69;
    };
    label$70 : {
     if ((HEAPU8[$23_1 >> 0] | 0 | 0) != (45 | 0)) {
      break label$70
     }
     $1_1 = -($26_1 + (-$1_1 - $26_1));
     break label$68;
    }
    $1_1 = $1_1 + $26_1 - $26_1;
   }
   label$71 : {
    $10_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
    $852 = $10_1;
    $10_1 = $10_1 >> 31 | 0;
    i64toi32_i32$0 = 0;
    $10_1 = $274(($852 ^ $10_1 | 0) - $10_1 | 0 | 0, i64toi32_i32$0 | 0, $13_1 | 0) | 0;
    if (($10_1 | 0) != ($13_1 | 0)) {
     break label$71
    }
    HEAP8[($6_1 + 15 | 0) >> 0] = 48;
    $10_1 = $6_1 + 15 | 0;
   }
   $21_1 = $8_1 | 2 | 0;
   $18_1 = $5_1 & 32 | 0;
   $11_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
   $22_1 = $10_1 + -2 | 0;
   HEAP8[$22_1 >> 0] = $5_1 + 15 | 0;
   HEAP8[($10_1 + -1 | 0) >> 0] = ($11_1 | 0) < (0 | 0) ? 45 : 43;
   $12_1 = $4_1 & 8 | 0;
   $11_1 = $6_1 + 16 | 0;
   label$72 : while (1) {
    $10_1 = $11_1;
    label$73 : {
     label$74 : {
      if (!(Math_abs($1_1) < 2147483648.0)) {
       break label$74
      }
      $11_1 = ~~$1_1;
      break label$73;
     }
     $11_1 = -2147483648;
    }
    HEAP8[$10_1 >> 0] = HEAPU8[($11_1 + 3776 | 0) >> 0] | 0 | $18_1 | 0;
    $1_1 = ($1_1 - +($11_1 | 0)) * 16.0;
    label$75 : {
     $11_1 = $10_1 + 1 | 0;
     if (($11_1 - ($6_1 + 16 | 0) | 0 | 0) != (1 | 0)) {
      break label$75
     }
     label$76 : {
      if ($12_1) {
       break label$76
      }
      if (($3_1 | 0) > (0 | 0)) {
       break label$76
      }
      if ($1_1 == 0.0) {
       break label$75
      }
     }
     HEAP8[($10_1 + 1 | 0) >> 0] = 46;
     $11_1 = $10_1 + 2 | 0;
    }
    if ($1_1 != 0.0) {
     continue label$72
    }
    break label$72;
   };
   $12_1 = -1;
   $19_1 = $13_1 - $22_1 | 0;
   $10_1 = $21_1 + $19_1 | 0;
   if ((2147483645 - $10_1 | 0 | 0) < ($3_1 | 0)) {
    break label$4
   }
   label$77 : {
    label$78 : {
     if (!$3_1) {
      break label$78
     }
     $18_1 = $11_1 - ($6_1 + 16 | 0) | 0;
     if (($18_1 + -2 | 0 | 0) >= ($3_1 | 0)) {
      break label$78
     }
     $11_1 = $3_1 + 2 | 0;
     break label$77;
    }
    $18_1 = $11_1 - ($6_1 + 16 | 0) | 0;
    $11_1 = $18_1;
   }
   $10_1 = $10_1 + $11_1 | 0;
   $275($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 | 0);
   $269($0_1 | 0, $23_1 | 0, $21_1 | 0);
   $275($0_1 | 0, 48 | 0, $2_1 | 0, $10_1 | 0, $4_1 ^ 65536 | 0 | 0);
   $269($0_1 | 0, $6_1 + 16 | 0 | 0, $18_1 | 0);
   $275($0_1 | 0, 48 | 0, $11_1 - $18_1 | 0 | 0, 0 | 0, 0 | 0);
   $269($0_1 | 0, $22_1 | 0, $19_1 | 0);
   $275($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 ^ 8192 | 0 | 0);
   $12_1 = ($10_1 | 0) > ($2_1 | 0) ? $10_1 : $2_1;
  }
  global$0 = $6_1 + 560 | 0;
  return $12_1 | 0;
 }
 
 function $278($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $2_1 = 0, $12_1 = 0, $12$hi = 0, $15_1 = 0, $15$hi = 0;
  $2_1 = ((HEAP32[$1_1 >> 2] | 0) + 7 | 0) & -8 | 0;
  HEAP32[$1_1 >> 2] = $2_1 + 16 | 0;
  i64toi32_i32$2 = $2_1;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $12_1 = i64toi32_i32$0;
  $12$hi = i64toi32_i32$1;
  i64toi32_i32$2 = i64toi32_i32$2 + 8 | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $15_1 = i64toi32_i32$1;
  $15$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $12$hi;
  i64toi32_i32$1 = $15$hi;
  HEAPF64[$0_1 >> 3] = +$296($12_1 | 0, i64toi32_i32$0 | 0, $15_1 | 0, i64toi32_i32$1 | 0);
 }
 
 function $279($0_1) {
  $0_1 = +$0_1;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  wasm2js_scratch_store_f64(+$0_1);
  i64toi32_i32$0 = wasm2js_scratch_load_i32(1 | 0) | 0;
  i64toi32_i32$1 = wasm2js_scratch_load_i32(0 | 0) | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function $280($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  HEAP32[($264() | 0) >> 2] = $0_1;
  return -1 | 0;
 }
 
 function $281() {
  return 42 | 0;
 }
 
 function $282() {
  return $281() | 0 | 0;
 }
 
 function $283() {
  return 6572 | 0;
 }
 
 function $284() {
  HEAP32[(0 + 6660 | 0) >> 2] = 6548;
  HEAP32[(0 + 6588 | 0) >> 2] = $282() | 0;
 }
 
 function $285($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = 1;
  label$1 : {
   label$2 : {
    if (!$0_1) {
     break label$2
    }
    if ($1_1 >>> 0 <= 127 >>> 0) {
     break label$1
    }
    label$3 : {
     label$4 : {
      if (HEAP32[(HEAP32[(($283() | 0) + 88 | 0) >> 2] | 0) >> 2] | 0) {
       break label$4
      }
      if (($1_1 & -128 | 0 | 0) == (57216 | 0)) {
       break label$1
      }
      HEAP32[($264() | 0) >> 2] = 25;
      break label$3;
     }
     label$5 : {
      if ($1_1 >>> 0 > 2047 >>> 0) {
       break label$5
      }
      HEAP8[($0_1 + 1 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 6 | 0 | 192 | 0;
      return 2 | 0;
     }
     label$6 : {
      label$7 : {
       if ($1_1 >>> 0 < 55296 >>> 0) {
        break label$7
       }
       if (($1_1 & -8192 | 0 | 0) != (57344 | 0)) {
        break label$6
       }
      }
      HEAP8[($0_1 + 2 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 12 | 0 | 224 | 0;
      HEAP8[($0_1 + 1 | 0) >> 0] = ($1_1 >>> 6 | 0) & 63 | 0 | 128 | 0;
      return 3 | 0;
     }
     label$8 : {
      if (($1_1 + -65536 | 0) >>> 0 > 1048575 >>> 0) {
       break label$8
      }
      HEAP8[($0_1 + 3 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 18 | 0 | 240 | 0;
      HEAP8[($0_1 + 2 | 0) >> 0] = ($1_1 >>> 6 | 0) & 63 | 0 | 128 | 0;
      HEAP8[($0_1 + 1 | 0) >> 0] = ($1_1 >>> 12 | 0) & 63 | 0 | 128 | 0;
      return 4 | 0;
     }
     HEAP32[($264() | 0) >> 2] = 25;
    }
    $3_1 = -1;
   }
   return $3_1 | 0;
  }
  HEAP8[$0_1 >> 0] = $1_1;
  return 1 | 0;
 }
 
 function $286($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  return $285($0_1 | 0, $1_1 | 0, 0 | 0) | 0 | 0;
 }
 
 function $287($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $5_1 = 0, $7_1 = 0, $8_1 = 0, $3_1 = 0, $2_1 = 0, $11_1 = 0, $6_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $9_1 = 0, i64toi32_i32$2 = 0, $10_1 = 0, $1_1 = 0, $79_1 = 0, $92_1 = 0, $103_1 = 0, $111_1 = 0, $119_1 = 0, $209_1 = 0, $220_1 = 0, $228_1 = 0, $236_1 = 0, $271_1 = 0, $338_1 = 0, $345_1 = 0, $352_1 = 0, $443 = 0, $454 = 0, $462 = 0, $470 = 0, $1156 = 0, $1163 = 0, $1170 = 0, $1292 = 0, $1294 = 0, $1354 = 0, $1361 = 0, $1368 = 0, $1599 = 0, $1606 = 0, $1613 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            label$11 : {
             label$12 : {
              if ($0_1 >>> 0 > 244 >>> 0) {
               break label$12
              }
              label$13 : {
               $2_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
               $3_1 = $0_1 >>> 0 < 11 >>> 0 ? 16 : ($0_1 + 11 | 0) & -8 | 0;
               $4_1 = $3_1 >>> 3 | 0;
               $0_1 = $2_1 >>> $4_1 | 0;
               if (!($0_1 & 3 | 0)) {
                break label$13
               }
               label$14 : {
                label$15 : {
                 $5_1 = (($0_1 ^ -1 | 0) & 1 | 0) + $4_1 | 0;
                 $4_1 = $5_1 << 3 | 0;
                 $0_1 = $4_1 + 6724 | 0;
                 $4_1 = HEAP32[($4_1 + 6732 | 0) >> 2] | 0;
                 $3_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
                 if (($0_1 | 0) != ($3_1 | 0)) {
                  break label$15
                 }
                 HEAP32[(0 + 6684 | 0) >> 2] = $2_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
                 break label$14;
                }
                HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
                HEAP32[($0_1 + 8 | 0) >> 2] = $3_1;
               }
               $0_1 = $4_1 + 8 | 0;
               $5_1 = $5_1 << 3 | 0;
               HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 3 | 0;
               $4_1 = $4_1 + $5_1 | 0;
               HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 1 | 0;
               break label$1;
              }
              $6_1 = HEAP32[(0 + 6692 | 0) >> 2] | 0;
              if ($3_1 >>> 0 <= $6_1 >>> 0) {
               break label$11
              }
              label$16 : {
               if (!$0_1) {
                break label$16
               }
               label$17 : {
                label$18 : {
                 $79_1 = $0_1 << $4_1 | 0;
                 $0_1 = 2 << $4_1 | 0;
                 $0_1 = $79_1 & ($0_1 | (0 - $0_1 | 0) | 0) | 0;
                 $0_1 = ($0_1 + -1 | 0) & ($0_1 ^ -1 | 0) | 0;
                 $92_1 = $0_1;
                 $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                 $4_1 = $92_1 >>> $0_1 | 0;
                 $5_1 = ($4_1 >>> 5 | 0) & 8 | 0;
                 $103_1 = $5_1 | $0_1 | 0;
                 $0_1 = $4_1 >>> $5_1 | 0;
                 $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                 $111_1 = $103_1 | $4_1 | 0;
                 $0_1 = $0_1 >>> $4_1 | 0;
                 $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                 $119_1 = $111_1 | $4_1 | 0;
                 $0_1 = $0_1 >>> $4_1 | 0;
                 $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                 $4_1 = ($119_1 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0;
                 $0_1 = $4_1 << 3 | 0;
                 $5_1 = $0_1 + 6724 | 0;
                 $0_1 = HEAP32[($0_1 + 6732 | 0) >> 2] | 0;
                 $7_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                 if (($5_1 | 0) != ($7_1 | 0)) {
                  break label$18
                 }
                 $2_1 = $2_1 & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
                 HEAP32[(0 + 6684 | 0) >> 2] = $2_1;
                 break label$17;
                }
                HEAP32[($7_1 + 12 | 0) >> 2] = $5_1;
                HEAP32[($5_1 + 8 | 0) >> 2] = $7_1;
               }
               HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
               $7_1 = $0_1 + $3_1 | 0;
               $4_1 = $4_1 << 3 | 0;
               $5_1 = $4_1 - $3_1 | 0;
               HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
               HEAP32[($0_1 + $4_1 | 0) >> 2] = $5_1;
               label$19 : {
                if (!$6_1) {
                 break label$19
                }
                $3_1 = ($6_1 & -8 | 0) + 6724 | 0;
                $4_1 = HEAP32[(0 + 6704 | 0) >> 2] | 0;
                label$20 : {
                 label$21 : {
                  $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
                  if ($2_1 & $8_1 | 0) {
                   break label$21
                  }
                  HEAP32[(0 + 6684 | 0) >> 2] = $2_1 | $8_1 | 0;
                  $8_1 = $3_1;
                  break label$20;
                 }
                 $8_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
                }
                HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
                HEAP32[($8_1 + 12 | 0) >> 2] = $4_1;
                HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
                HEAP32[($4_1 + 8 | 0) >> 2] = $8_1;
               }
               $0_1 = $0_1 + 8 | 0;
               HEAP32[(0 + 6704 | 0) >> 2] = $7_1;
               HEAP32[(0 + 6692 | 0) >> 2] = $5_1;
               break label$1;
              }
              $9_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
              if (!$9_1) {
               break label$11
              }
              $0_1 = ($9_1 + -1 | 0) & ($9_1 ^ -1 | 0) | 0;
              $209_1 = $0_1;
              $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
              $4_1 = $209_1 >>> $0_1 | 0;
              $5_1 = ($4_1 >>> 5 | 0) & 8 | 0;
              $220_1 = $5_1 | $0_1 | 0;
              $0_1 = $4_1 >>> $5_1 | 0;
              $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
              $228_1 = $220_1 | $4_1 | 0;
              $0_1 = $0_1 >>> $4_1 | 0;
              $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
              $236_1 = $228_1 | $4_1 | 0;
              $0_1 = $0_1 >>> $4_1 | 0;
              $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
              $7_1 = HEAP32[(((($236_1 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0) << 2 | 0) + 6988 | 0) >> 2] | 0;
              $4_1 = ((HEAP32[($7_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
              $5_1 = $7_1;
              label$22 : {
               label$23 : while (1) {
                label$24 : {
                 $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
                 if ($0_1) {
                  break label$24
                 }
                 $0_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                 if (!$0_1) {
                  break label$22
                 }
                }
                $5_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                $271_1 = $5_1;
                $5_1 = $5_1 >>> 0 < $4_1 >>> 0;
                $4_1 = $5_1 ? $271_1 : $4_1;
                $7_1 = $5_1 ? $0_1 : $7_1;
                $5_1 = $0_1;
                continue label$23;
               };
              }
              $10_1 = HEAP32[($7_1 + 24 | 0) >> 2] | 0;
              label$25 : {
               $8_1 = HEAP32[($7_1 + 12 | 0) >> 2] | 0;
               if (($8_1 | 0) == ($7_1 | 0)) {
                break label$25
               }
               $0_1 = HEAP32[($7_1 + 8 | 0) >> 2] | 0;
               HEAP32[(0 + 6700 | 0) >> 2] | 0;
               HEAP32[($0_1 + 12 | 0) >> 2] = $8_1;
               HEAP32[($8_1 + 8 | 0) >> 2] = $0_1;
               break label$2;
              }
              label$26 : {
               $5_1 = $7_1 + 20 | 0;
               $0_1 = HEAP32[$5_1 >> 2] | 0;
               if ($0_1) {
                break label$26
               }
               $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
               if (!$0_1) {
                break label$10
               }
               $5_1 = $7_1 + 16 | 0;
              }
              label$27 : while (1) {
               $11_1 = $5_1;
               $8_1 = $0_1;
               $5_1 = $0_1 + 20 | 0;
               $0_1 = HEAP32[$5_1 >> 2] | 0;
               if ($0_1) {
                continue label$27
               }
               $5_1 = $8_1 + 16 | 0;
               $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$27
               }
               break label$27;
              };
              HEAP32[$11_1 >> 2] = 0;
              break label$2;
             }
             $3_1 = -1;
             if ($0_1 >>> 0 > -65 >>> 0) {
              break label$11
             }
             $0_1 = $0_1 + 11 | 0;
             $3_1 = $0_1 & -8 | 0;
             $6_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
             if (!$6_1) {
              break label$11
             }
             $11_1 = 0;
             label$28 : {
              if ($3_1 >>> 0 < 256 >>> 0) {
               break label$28
              }
              $11_1 = 31;
              if ($3_1 >>> 0 > 16777215 >>> 0) {
               break label$28
              }
              $0_1 = $0_1 >>> 8 | 0;
              $338_1 = $0_1;
              $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
              $4_1 = $338_1 << $0_1 | 0;
              $345_1 = $4_1;
              $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
              $5_1 = $345_1 << $4_1 | 0;
              $352_1 = $5_1;
              $5_1 = (($5_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
              $0_1 = (($352_1 << $5_1 | 0) >>> 15 | 0) - ($0_1 | $4_1 | 0 | $5_1 | 0) | 0;
              $11_1 = ($0_1 << 1 | 0 | (($3_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
             }
             $4_1 = 0 - $3_1 | 0;
             label$29 : {
              label$30 : {
               label$31 : {
                label$32 : {
                 $5_1 = HEAP32[(($11_1 << 2 | 0) + 6988 | 0) >> 2] | 0;
                 if ($5_1) {
                  break label$32
                 }
                 $0_1 = 0;
                 $8_1 = 0;
                 break label$31;
                }
                $0_1 = 0;
                $7_1 = $3_1 << (($11_1 | 0) == (31 | 0) ? 0 : 25 - ($11_1 >>> 1 | 0) | 0) | 0;
                $8_1 = 0;
                label$33 : while (1) {
                 label$34 : {
                  $2_1 = ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                  if ($2_1 >>> 0 >= $4_1 >>> 0) {
                   break label$34
                  }
                  $4_1 = $2_1;
                  $8_1 = $5_1;
                  if ($4_1) {
                   break label$34
                  }
                  $4_1 = 0;
                  $8_1 = $5_1;
                  $0_1 = $5_1;
                  break label$30;
                 }
                 $2_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                 $5_1 = HEAP32[(($5_1 + (($7_1 >>> 29 | 0) & 4 | 0) | 0) + 16 | 0) >> 2] | 0;
                 $0_1 = $2_1 ? (($2_1 | 0) == ($5_1 | 0) ? $0_1 : $2_1) : $0_1;
                 $7_1 = $7_1 << 1 | 0;
                 if ($5_1) {
                  continue label$33
                 }
                 break label$33;
                };
               }
               label$35 : {
                if ($0_1 | $8_1 | 0) {
                 break label$35
                }
                $8_1 = 0;
                $0_1 = 2 << $11_1 | 0;
                $0_1 = ($0_1 | (0 - $0_1 | 0) | 0) & $6_1 | 0;
                if (!$0_1) {
                 break label$11
                }
                $0_1 = ($0_1 + -1 | 0) & ($0_1 ^ -1 | 0) | 0;
                $443 = $0_1;
                $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                $5_1 = $443 >>> $0_1 | 0;
                $7_1 = ($5_1 >>> 5 | 0) & 8 | 0;
                $454 = $7_1 | $0_1 | 0;
                $0_1 = $5_1 >>> $7_1 | 0;
                $5_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                $462 = $454 | $5_1 | 0;
                $0_1 = $0_1 >>> $5_1 | 0;
                $5_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                $470 = $462 | $5_1 | 0;
                $0_1 = $0_1 >>> $5_1 | 0;
                $5_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                $0_1 = HEAP32[(((($470 | $5_1 | 0) + ($0_1 >>> $5_1 | 0) | 0) << 2 | 0) + 6988 | 0) >> 2] | 0;
               }
               if (!$0_1) {
                break label$29
               }
              }
              label$36 : while (1) {
               $2_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
               $7_1 = $2_1 >>> 0 < $4_1 >>> 0;
               label$37 : {
                $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
                if ($5_1) {
                 break label$37
                }
                $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
               }
               $4_1 = $7_1 ? $2_1 : $4_1;
               $8_1 = $7_1 ? $0_1 : $8_1;
               $0_1 = $5_1;
               if ($0_1) {
                continue label$36
               }
               break label$36;
              };
             }
             if (!$8_1) {
              break label$11
             }
             if ($4_1 >>> 0 >= ((HEAP32[(0 + 6692 | 0) >> 2] | 0) - $3_1 | 0) >>> 0) {
              break label$11
             }
             $11_1 = HEAP32[($8_1 + 24 | 0) >> 2] | 0;
             label$38 : {
              $7_1 = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
              if (($7_1 | 0) == ($8_1 | 0)) {
               break label$38
              }
              $0_1 = HEAP32[($8_1 + 8 | 0) >> 2] | 0;
              HEAP32[(0 + 6700 | 0) >> 2] | 0;
              HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
              HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
              break label$3;
             }
             label$39 : {
              $5_1 = $8_1 + 20 | 0;
              $0_1 = HEAP32[$5_1 >> 2] | 0;
              if ($0_1) {
               break label$39
              }
              $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
              if (!$0_1) {
               break label$9
              }
              $5_1 = $8_1 + 16 | 0;
             }
             label$40 : while (1) {
              $2_1 = $5_1;
              $7_1 = $0_1;
              $5_1 = $0_1 + 20 | 0;
              $0_1 = HEAP32[$5_1 >> 2] | 0;
              if ($0_1) {
               continue label$40
              }
              $5_1 = $7_1 + 16 | 0;
              $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
              if ($0_1) {
               continue label$40
              }
              break label$40;
             };
             HEAP32[$2_1 >> 2] = 0;
             break label$3;
            }
            label$41 : {
             $0_1 = HEAP32[(0 + 6692 | 0) >> 2] | 0;
             if ($0_1 >>> 0 < $3_1 >>> 0) {
              break label$41
             }
             $4_1 = HEAP32[(0 + 6704 | 0) >> 2] | 0;
             label$42 : {
              label$43 : {
               $5_1 = $0_1 - $3_1 | 0;
               if ($5_1 >>> 0 < 16 >>> 0) {
                break label$43
               }
               HEAP32[(0 + 6692 | 0) >> 2] = $5_1;
               $7_1 = $4_1 + $3_1 | 0;
               HEAP32[(0 + 6704 | 0) >> 2] = $7_1;
               HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
               HEAP32[($4_1 + $0_1 | 0) >> 2] = $5_1;
               HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
               break label$42;
              }
              HEAP32[(0 + 6704 | 0) >> 2] = 0;
              HEAP32[(0 + 6692 | 0) >> 2] = 0;
              HEAP32[($4_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
              $0_1 = $4_1 + $0_1 | 0;
              HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
             }
             $0_1 = $4_1 + 8 | 0;
             break label$1;
            }
            label$44 : {
             $7_1 = HEAP32[(0 + 6696 | 0) >> 2] | 0;
             if ($7_1 >>> 0 <= $3_1 >>> 0) {
              break label$44
             }
             $4_1 = $7_1 - $3_1 | 0;
             HEAP32[(0 + 6696 | 0) >> 2] = $4_1;
             $0_1 = HEAP32[(0 + 6708 | 0) >> 2] | 0;
             $5_1 = $0_1 + $3_1 | 0;
             HEAP32[(0 + 6708 | 0) >> 2] = $5_1;
             HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
             HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
             $0_1 = $0_1 + 8 | 0;
             break label$1;
            }
            label$45 : {
             label$46 : {
              if (!(HEAP32[(0 + 7156 | 0) >> 2] | 0)) {
               break label$46
              }
              $4_1 = HEAP32[(0 + 7164 | 0) >> 2] | 0;
              break label$45;
             }
             i64toi32_i32$1 = 0;
             i64toi32_i32$0 = -1;
             HEAP32[(i64toi32_i32$1 + 7168 | 0) >> 2] = -1;
             HEAP32[(i64toi32_i32$1 + 7172 | 0) >> 2] = i64toi32_i32$0;
             i64toi32_i32$1 = 0;
             i64toi32_i32$0 = 4096;
             HEAP32[(i64toi32_i32$1 + 7160 | 0) >> 2] = 4096;
             HEAP32[(i64toi32_i32$1 + 7164 | 0) >> 2] = i64toi32_i32$0;
             HEAP32[(0 + 7156 | 0) >> 2] = (($1_1 + 12 | 0) & -16 | 0) ^ 1431655768 | 0;
             HEAP32[(0 + 7176 | 0) >> 2] = 0;
             HEAP32[(0 + 7128 | 0) >> 2] = 0;
             $4_1 = 4096;
            }
            $0_1 = 0;
            $6_1 = $3_1 + 47 | 0;
            $2_1 = $4_1 + $6_1 | 0;
            $11_1 = 0 - $4_1 | 0;
            $8_1 = $2_1 & $11_1 | 0;
            if ($8_1 >>> 0 <= $3_1 >>> 0) {
             break label$1
            }
            $0_1 = 0;
            label$47 : {
             $4_1 = HEAP32[(0 + 7124 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$47
             }
             $5_1 = HEAP32[(0 + 7116 | 0) >> 2] | 0;
             $9_1 = $5_1 + $8_1 | 0;
             if ($9_1 >>> 0 <= $5_1 >>> 0) {
              break label$1
             }
             if ($9_1 >>> 0 > $4_1 >>> 0) {
              break label$1
             }
            }
            if ((HEAPU8[(0 + 7128 | 0) >> 0] | 0) & 4 | 0) {
             break label$6
            }
            label$48 : {
             label$49 : {
              label$50 : {
               $4_1 = HEAP32[(0 + 6708 | 0) >> 2] | 0;
               if (!$4_1) {
                break label$50
               }
               $0_1 = 7132;
               label$51 : while (1) {
                label$52 : {
                 $5_1 = HEAP32[$0_1 >> 2] | 0;
                 if ($5_1 >>> 0 > $4_1 >>> 0) {
                  break label$52
                 }
                 if (($5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0) >>> 0 > $4_1 >>> 0) {
                  break label$49
                 }
                }
                $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                if ($0_1) {
                 continue label$51
                }
                break label$51;
               };
              }
              $7_1 = $293(0 | 0) | 0;
              if (($7_1 | 0) == (-1 | 0)) {
               break label$7
              }
              $2_1 = $8_1;
              label$53 : {
               $0_1 = HEAP32[(0 + 7160 | 0) >> 2] | 0;
               $4_1 = $0_1 + -1 | 0;
               if (!($4_1 & $7_1 | 0)) {
                break label$53
               }
               $2_1 = ($8_1 - $7_1 | 0) + (($4_1 + $7_1 | 0) & (0 - $0_1 | 0) | 0) | 0;
              }
              if ($2_1 >>> 0 <= $3_1 >>> 0) {
               break label$7
              }
              if ($2_1 >>> 0 > 2147483646 >>> 0) {
               break label$7
              }
              label$54 : {
               $0_1 = HEAP32[(0 + 7124 | 0) >> 2] | 0;
               if (!$0_1) {
                break label$54
               }
               $4_1 = HEAP32[(0 + 7116 | 0) >> 2] | 0;
               $5_1 = $4_1 + $2_1 | 0;
               if ($5_1 >>> 0 <= $4_1 >>> 0) {
                break label$7
               }
               if ($5_1 >>> 0 > $0_1 >>> 0) {
                break label$7
               }
              }
              $0_1 = $293($2_1 | 0) | 0;
              if (($0_1 | 0) != ($7_1 | 0)) {
               break label$48
              }
              break label$5;
             }
             $2_1 = ($2_1 - $7_1 | 0) & $11_1 | 0;
             if ($2_1 >>> 0 > 2147483646 >>> 0) {
              break label$7
             }
             $7_1 = $293($2_1 | 0) | 0;
             if (($7_1 | 0) == ((HEAP32[$0_1 >> 2] | 0) + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0 | 0)) {
              break label$8
             }
             $0_1 = $7_1;
            }
            label$55 : {
             if (($0_1 | 0) == (-1 | 0)) {
              break label$55
             }
             if (($3_1 + 48 | 0) >>> 0 <= $2_1 >>> 0) {
              break label$55
             }
             label$56 : {
              $4_1 = HEAP32[(0 + 7164 | 0) >> 2] | 0;
              $4_1 = (($6_1 - $2_1 | 0) + $4_1 | 0) & (0 - $4_1 | 0) | 0;
              if ($4_1 >>> 0 <= 2147483646 >>> 0) {
               break label$56
              }
              $7_1 = $0_1;
              break label$5;
             }
             label$57 : {
              if (($293($4_1 | 0) | 0 | 0) == (-1 | 0)) {
               break label$57
              }
              $2_1 = $4_1 + $2_1 | 0;
              $7_1 = $0_1;
              break label$5;
             }
             $293(0 - $2_1 | 0 | 0) | 0;
             break label$7;
            }
            $7_1 = $0_1;
            if (($0_1 | 0) != (-1 | 0)) {
             break label$5
            }
            break label$7;
           }
           $8_1 = 0;
           break label$2;
          }
          $7_1 = 0;
          break label$3;
         }
         if (($7_1 | 0) != (-1 | 0)) {
          break label$5
         }
        }
        HEAP32[(0 + 7128 | 0) >> 2] = HEAP32[(0 + 7128 | 0) >> 2] | 0 | 4 | 0;
       }
       if ($8_1 >>> 0 > 2147483646 >>> 0) {
        break label$4
       }
       $7_1 = $293($8_1 | 0) | 0;
       $0_1 = $293(0 | 0) | 0;
       if (($7_1 | 0) == (-1 | 0)) {
        break label$4
       }
       if (($0_1 | 0) == (-1 | 0)) {
        break label$4
       }
       if ($7_1 >>> 0 >= $0_1 >>> 0) {
        break label$4
       }
       $2_1 = $0_1 - $7_1 | 0;
       if ($2_1 >>> 0 <= ($3_1 + 40 | 0) >>> 0) {
        break label$4
       }
      }
      $0_1 = (HEAP32[(0 + 7116 | 0) >> 2] | 0) + $2_1 | 0;
      HEAP32[(0 + 7116 | 0) >> 2] = $0_1;
      label$58 : {
       if ($0_1 >>> 0 <= (HEAP32[(0 + 7120 | 0) >> 2] | 0) >>> 0) {
        break label$58
       }
       HEAP32[(0 + 7120 | 0) >> 2] = $0_1;
      }
      label$59 : {
       label$60 : {
        label$61 : {
         label$62 : {
          $4_1 = HEAP32[(0 + 6708 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$62
          }
          $0_1 = 7132;
          label$63 : while (1) {
           $5_1 = HEAP32[$0_1 >> 2] | 0;
           $8_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
           if (($7_1 | 0) == ($5_1 + $8_1 | 0 | 0)) {
            break label$61
           }
           $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           if ($0_1) {
            continue label$63
           }
           break label$60;
          };
         }
         label$64 : {
          label$65 : {
           $0_1 = HEAP32[(0 + 6700 | 0) >> 2] | 0;
           if (!$0_1) {
            break label$65
           }
           if ($7_1 >>> 0 >= $0_1 >>> 0) {
            break label$64
           }
          }
          HEAP32[(0 + 6700 | 0) >> 2] = $7_1;
         }
         $0_1 = 0;
         HEAP32[(0 + 7136 | 0) >> 2] = $2_1;
         HEAP32[(0 + 7132 | 0) >> 2] = $7_1;
         HEAP32[(0 + 6716 | 0) >> 2] = -1;
         HEAP32[(0 + 6720 | 0) >> 2] = HEAP32[(0 + 7156 | 0) >> 2] | 0;
         HEAP32[(0 + 7144 | 0) >> 2] = 0;
         label$66 : while (1) {
          $4_1 = $0_1 << 3 | 0;
          $5_1 = $4_1 + 6724 | 0;
          HEAP32[($4_1 + 6732 | 0) >> 2] = $5_1;
          HEAP32[($4_1 + 6736 | 0) >> 2] = $5_1;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != (32 | 0)) {
           continue label$66
          }
          break label$66;
         };
         $0_1 = $2_1 + -40 | 0;
         $4_1 = ($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0;
         $5_1 = $0_1 - $4_1 | 0;
         HEAP32[(0 + 6696 | 0) >> 2] = $5_1;
         $4_1 = $7_1 + $4_1 | 0;
         HEAP32[(0 + 6708 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
         HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
         HEAP32[(0 + 6712 | 0) >> 2] = HEAP32[(0 + 7172 | 0) >> 2] | 0;
         break label$59;
        }
        if ((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0) {
         break label$60
        }
        if ($4_1 >>> 0 < $5_1 >>> 0) {
         break label$60
        }
        if ($4_1 >>> 0 >= $7_1 >>> 0) {
         break label$60
        }
        HEAP32[($0_1 + 4 | 0) >> 2] = $8_1 + $2_1 | 0;
        $0_1 = ($4_1 + 8 | 0) & 7 | 0 ? (-8 - $4_1 | 0) & 7 | 0 : 0;
        $5_1 = $4_1 + $0_1 | 0;
        HEAP32[(0 + 6708 | 0) >> 2] = $5_1;
        $7_1 = (HEAP32[(0 + 6696 | 0) >> 2] | 0) + $2_1 | 0;
        $0_1 = $7_1 - $0_1 | 0;
        HEAP32[(0 + 6696 | 0) >> 2] = $0_1;
        HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
        HEAP32[(($4_1 + $7_1 | 0) + 4 | 0) >> 2] = 40;
        HEAP32[(0 + 6712 | 0) >> 2] = HEAP32[(0 + 7172 | 0) >> 2] | 0;
        break label$59;
       }
       label$67 : {
        $8_1 = HEAP32[(0 + 6700 | 0) >> 2] | 0;
        if ($7_1 >>> 0 >= $8_1 >>> 0) {
         break label$67
        }
        HEAP32[(0 + 6700 | 0) >> 2] = $7_1;
        $8_1 = $7_1;
       }
       $5_1 = $7_1 + $2_1 | 0;
       $0_1 = 7132;
       label$68 : {
        label$69 : {
         label$70 : {
          label$71 : {
           label$72 : {
            label$73 : {
             label$74 : {
              label$75 : while (1) {
               if ((HEAP32[$0_1 >> 2] | 0 | 0) == ($5_1 | 0)) {
                break label$74
               }
               $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$75
               }
               break label$73;
              };
             }
             if (!((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0)) {
              break label$72
             }
            }
            $0_1 = 7132;
            label$76 : while (1) {
             label$77 : {
              $5_1 = HEAP32[$0_1 >> 2] | 0;
              if ($5_1 >>> 0 > $4_1 >>> 0) {
               break label$77
              }
              $5_1 = $5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0;
              if ($5_1 >>> 0 > $4_1 >>> 0) {
               break label$71
              }
             }
             $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
             continue label$76;
            };
           }
           HEAP32[$0_1 >> 2] = $7_1;
           HEAP32[($0_1 + 4 | 0) >> 2] = (HEAP32[($0_1 + 4 | 0) >> 2] | 0) + $2_1 | 0;
           $11_1 = $7_1 + (($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0) | 0;
           HEAP32[($11_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
           $2_1 = $5_1 + (($5_1 + 8 | 0) & 7 | 0 ? (-8 - $5_1 | 0) & 7 | 0 : 0) | 0;
           $3_1 = $11_1 + $3_1 | 0;
           $0_1 = $2_1 - $3_1 | 0;
           label$78 : {
            if (($2_1 | 0) != ($4_1 | 0)) {
             break label$78
            }
            HEAP32[(0 + 6708 | 0) >> 2] = $3_1;
            $0_1 = (HEAP32[(0 + 6696 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 6696 | 0) >> 2] = $0_1;
            HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            break label$69;
           }
           label$79 : {
            if (($2_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
             break label$79
            }
            HEAP32[(0 + 6704 | 0) >> 2] = $3_1;
            $0_1 = (HEAP32[(0 + 6692 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 6692 | 0) >> 2] = $0_1;
            HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            HEAP32[($3_1 + $0_1 | 0) >> 2] = $0_1;
            break label$69;
           }
           label$80 : {
            $4_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
            if (($4_1 & 3 | 0 | 0) != (1 | 0)) {
             break label$80
            }
            $6_1 = $4_1 & -8 | 0;
            label$81 : {
             label$82 : {
              if ($4_1 >>> 0 > 255 >>> 0) {
               break label$82
              }
              $5_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
              $8_1 = $4_1 >>> 3 | 0;
              $7_1 = ($8_1 << 3 | 0) + 6724 | 0;
              label$83 : {
               $4_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
               if (($4_1 | 0) != ($5_1 | 0)) {
                break label$83
               }
               HEAP32[(0 + 6684 | 0) >> 2] = (HEAP32[(0 + 6684 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
               break label$81;
              }
              HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
              HEAP32[($4_1 + 8 | 0) >> 2] = $5_1;
              break label$81;
             }
             $9_1 = HEAP32[($2_1 + 24 | 0) >> 2] | 0;
             label$84 : {
              label$85 : {
               $7_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
               if (($7_1 | 0) == ($2_1 | 0)) {
                break label$85
               }
               $4_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
               HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
               HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
               break label$84;
              }
              label$86 : {
               $4_1 = $2_1 + 20 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                break label$86
               }
               $4_1 = $2_1 + 16 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                break label$86
               }
               $7_1 = 0;
               break label$84;
              }
              label$87 : while (1) {
               $8_1 = $4_1;
               $7_1 = $5_1;
               $4_1 = $5_1 + 20 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                continue label$87
               }
               $4_1 = $7_1 + 16 | 0;
               $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
               if ($5_1) {
                continue label$87
               }
               break label$87;
              };
              HEAP32[$8_1 >> 2] = 0;
             }
             if (!$9_1) {
              break label$81
             }
             label$88 : {
              label$89 : {
               $5_1 = HEAP32[($2_1 + 28 | 0) >> 2] | 0;
               $4_1 = ($5_1 << 2 | 0) + 6988 | 0;
               if (($2_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
                break label$89
               }
               HEAP32[$4_1 >> 2] = $7_1;
               if ($7_1) {
                break label$88
               }
               HEAP32[(0 + 6688 | 0) >> 2] = (HEAP32[(0 + 6688 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
               break label$81;
              }
              HEAP32[($9_1 + ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0) ? 16 : 20) | 0) >> 2] = $7_1;
              if (!$7_1) {
               break label$81
              }
             }
             HEAP32[($7_1 + 24 | 0) >> 2] = $9_1;
             label$90 : {
              $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
              if (!$4_1) {
               break label$90
              }
              HEAP32[($7_1 + 16 | 0) >> 2] = $4_1;
              HEAP32[($4_1 + 24 | 0) >> 2] = $7_1;
             }
             $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$81
             }
             HEAP32[($7_1 + 20 | 0) >> 2] = $4_1;
             HEAP32[($4_1 + 24 | 0) >> 2] = $7_1;
            }
            $0_1 = $6_1 + $0_1 | 0;
            $2_1 = $2_1 + $6_1 | 0;
            $4_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
           }
           HEAP32[($2_1 + 4 | 0) >> 2] = $4_1 & -2 | 0;
           HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
           HEAP32[($3_1 + $0_1 | 0) >> 2] = $0_1;
           label$91 : {
            if ($0_1 >>> 0 > 255 >>> 0) {
             break label$91
            }
            $4_1 = ($0_1 & -8 | 0) + 6724 | 0;
            label$92 : {
             label$93 : {
              $5_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
              $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
              if ($5_1 & $0_1 | 0) {
               break label$93
              }
              HEAP32[(0 + 6684 | 0) >> 2] = $5_1 | $0_1 | 0;
              $0_1 = $4_1;
              break label$92;
             }
             $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
            }
            HEAP32[($4_1 + 8 | 0) >> 2] = $3_1;
            HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
            HEAP32[($3_1 + 12 | 0) >> 2] = $4_1;
            HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
            break label$69;
           }
           $4_1 = 31;
           label$94 : {
            if ($0_1 >>> 0 > 16777215 >>> 0) {
             break label$94
            }
            $4_1 = $0_1 >>> 8 | 0;
            $1156 = $4_1;
            $4_1 = (($4_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
            $5_1 = $1156 << $4_1 | 0;
            $1163 = $5_1;
            $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
            $7_1 = $1163 << $5_1 | 0;
            $1170 = $7_1;
            $7_1 = (($7_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
            $4_1 = (($1170 << $7_1 | 0) >>> 15 | 0) - ($4_1 | $5_1 | 0 | $7_1 | 0) | 0;
            $4_1 = ($4_1 << 1 | 0 | (($0_1 >>> ($4_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
           }
           HEAP32[($3_1 + 28 | 0) >> 2] = $4_1;
           i64toi32_i32$1 = $3_1;
           i64toi32_i32$0 = 0;
           HEAP32[($3_1 + 16 | 0) >> 2] = 0;
           HEAP32[($3_1 + 20 | 0) >> 2] = i64toi32_i32$0;
           $5_1 = ($4_1 << 2 | 0) + 6988 | 0;
           label$95 : {
            label$96 : {
             $7_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
             $8_1 = 1 << $4_1 | 0;
             if ($7_1 & $8_1 | 0) {
              break label$96
             }
             HEAP32[(0 + 6688 | 0) >> 2] = $7_1 | $8_1 | 0;
             HEAP32[$5_1 >> 2] = $3_1;
             HEAP32[($3_1 + 24 | 0) >> 2] = $5_1;
             break label$95;
            }
            $4_1 = $0_1 << (($4_1 | 0) == (31 | 0) ? 0 : 25 - ($4_1 >>> 1 | 0) | 0) | 0;
            $7_1 = HEAP32[$5_1 >> 2] | 0;
            label$97 : while (1) {
             $5_1 = $7_1;
             if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
              break label$70
             }
             $7_1 = $4_1 >>> 29 | 0;
             $4_1 = $4_1 << 1 | 0;
             $8_1 = ($5_1 + ($7_1 & 4 | 0) | 0) + 16 | 0;
             $7_1 = HEAP32[$8_1 >> 2] | 0;
             if ($7_1) {
              continue label$97
             }
             break label$97;
            };
            HEAP32[$8_1 >> 2] = $3_1;
            HEAP32[($3_1 + 24 | 0) >> 2] = $5_1;
           }
           HEAP32[($3_1 + 12 | 0) >> 2] = $3_1;
           HEAP32[($3_1 + 8 | 0) >> 2] = $3_1;
           break label$69;
          }
          $0_1 = $2_1 + -40 | 0;
          $8_1 = ($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0;
          $11_1 = $0_1 - $8_1 | 0;
          HEAP32[(0 + 6696 | 0) >> 2] = $11_1;
          $8_1 = $7_1 + $8_1 | 0;
          HEAP32[(0 + 6708 | 0) >> 2] = $8_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = $11_1 | 1 | 0;
          HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
          HEAP32[(0 + 6712 | 0) >> 2] = HEAP32[(0 + 7172 | 0) >> 2] | 0;
          $0_1 = ($5_1 + (($5_1 + -39 | 0) & 7 | 0 ? (39 - $5_1 | 0) & 7 | 0 : 0) | 0) + -47 | 0;
          $8_1 = $0_1 >>> 0 < ($4_1 + 16 | 0) >>> 0 ? $4_1 : $0_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = 27;
          i64toi32_i32$2 = 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 7140 | 0) >> 2] | 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 7144 | 0) >> 2] | 0;
          $1292 = i64toi32_i32$0;
          i64toi32_i32$0 = $8_1 + 16 | 0;
          HEAP32[i64toi32_i32$0 >> 2] = $1292;
          HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
          i64toi32_i32$2 = 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 7132 | 0) >> 2] | 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 7136 | 0) >> 2] | 0;
          $1294 = i64toi32_i32$1;
          i64toi32_i32$1 = $8_1;
          HEAP32[($8_1 + 8 | 0) >> 2] = $1294;
          HEAP32[($8_1 + 12 | 0) >> 2] = i64toi32_i32$0;
          HEAP32[(0 + 7140 | 0) >> 2] = $8_1 + 8 | 0;
          HEAP32[(0 + 7136 | 0) >> 2] = $2_1;
          HEAP32[(0 + 7132 | 0) >> 2] = $7_1;
          HEAP32[(0 + 7144 | 0) >> 2] = 0;
          $0_1 = $8_1 + 24 | 0;
          label$98 : while (1) {
           HEAP32[($0_1 + 4 | 0) >> 2] = 7;
           $7_1 = $0_1 + 8 | 0;
           $0_1 = $0_1 + 4 | 0;
           if ($7_1 >>> 0 < $5_1 >>> 0) {
            continue label$98
           }
           break label$98;
          };
          if (($8_1 | 0) == ($4_1 | 0)) {
           break label$59
          }
          HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) & -2 | 0;
          $7_1 = $8_1 - $4_1 | 0;
          HEAP32[($4_1 + 4 | 0) >> 2] = $7_1 | 1 | 0;
          HEAP32[$8_1 >> 2] = $7_1;
          label$99 : {
           if ($7_1 >>> 0 > 255 >>> 0) {
            break label$99
           }
           $0_1 = ($7_1 & -8 | 0) + 6724 | 0;
           label$100 : {
            label$101 : {
             $5_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
             $7_1 = 1 << ($7_1 >>> 3 | 0) | 0;
             if ($5_1 & $7_1 | 0) {
              break label$101
             }
             HEAP32[(0 + 6684 | 0) >> 2] = $5_1 | $7_1 | 0;
             $5_1 = $0_1;
             break label$100;
            }
            $5_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           }
           HEAP32[($0_1 + 8 | 0) >> 2] = $4_1;
           HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
           HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
           HEAP32[($4_1 + 8 | 0) >> 2] = $5_1;
           break label$59;
          }
          $0_1 = 31;
          label$102 : {
           if ($7_1 >>> 0 > 16777215 >>> 0) {
            break label$102
           }
           $0_1 = $7_1 >>> 8 | 0;
           $1354 = $0_1;
           $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
           $5_1 = $1354 << $0_1 | 0;
           $1361 = $5_1;
           $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
           $8_1 = $1361 << $5_1 | 0;
           $1368 = $8_1;
           $8_1 = (($8_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
           $0_1 = (($1368 << $8_1 | 0) >>> 15 | 0) - ($0_1 | $5_1 | 0 | $8_1 | 0) | 0;
           $0_1 = ($0_1 << 1 | 0 | (($7_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
          }
          HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
          i64toi32_i32$1 = $4_1;
          i64toi32_i32$0 = 0;
          HEAP32[($4_1 + 16 | 0) >> 2] = 0;
          HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
          $5_1 = ($0_1 << 2 | 0) + 6988 | 0;
          label$103 : {
           label$104 : {
            $8_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
            $2_1 = 1 << $0_1 | 0;
            if ($8_1 & $2_1 | 0) {
             break label$104
            }
            HEAP32[(0 + 6688 | 0) >> 2] = $8_1 | $2_1 | 0;
            HEAP32[$5_1 >> 2] = $4_1;
            HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
            break label$103;
           }
           $0_1 = $7_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
           $8_1 = HEAP32[$5_1 >> 2] | 0;
           label$105 : while (1) {
            $5_1 = $8_1;
            if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($7_1 | 0)) {
             break label$68
            }
            $8_1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1 | 0;
            $2_1 = ($5_1 + ($8_1 & 4 | 0) | 0) + 16 | 0;
            $8_1 = HEAP32[$2_1 >> 2] | 0;
            if ($8_1) {
             continue label$105
            }
            break label$105;
           };
           HEAP32[$2_1 >> 2] = $4_1;
           HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
          }
          HEAP32[($4_1 + 12 | 0) >> 2] = $4_1;
          HEAP32[($4_1 + 8 | 0) >> 2] = $4_1;
          break label$59;
         }
         $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
         HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($5_1 + 8 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 24 | 0) >> 2] = 0;
         HEAP32[($3_1 + 12 | 0) >> 2] = $5_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
        }
        $0_1 = $11_1 + 8 | 0;
        break label$1;
       }
       $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
       HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
       HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
       HEAP32[($4_1 + 24 | 0) >> 2] = 0;
       HEAP32[($4_1 + 12 | 0) >> 2] = $5_1;
       HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
      }
      $0_1 = HEAP32[(0 + 6696 | 0) >> 2] | 0;
      if ($0_1 >>> 0 <= $3_1 >>> 0) {
       break label$4
      }
      $4_1 = $0_1 - $3_1 | 0;
      HEAP32[(0 + 6696 | 0) >> 2] = $4_1;
      $0_1 = HEAP32[(0 + 6708 | 0) >> 2] | 0;
      $5_1 = $0_1 + $3_1 | 0;
      HEAP32[(0 + 6708 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
      $0_1 = $0_1 + 8 | 0;
      break label$1;
     }
     HEAP32[($264() | 0) >> 2] = 48;
     $0_1 = 0;
     break label$1;
    }
    label$106 : {
     if (!$11_1) {
      break label$106
     }
     label$107 : {
      label$108 : {
       $5_1 = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
       $0_1 = ($5_1 << 2 | 0) + 6988 | 0;
       if (($8_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
        break label$108
       }
       HEAP32[$0_1 >> 2] = $7_1;
       if ($7_1) {
        break label$107
       }
       $6_1 = $6_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       HEAP32[(0 + 6688 | 0) >> 2] = $6_1;
       break label$106;
      }
      HEAP32[($11_1 + ((HEAP32[($11_1 + 16 | 0) >> 2] | 0 | 0) == ($8_1 | 0) ? 16 : 20) | 0) >> 2] = $7_1;
      if (!$7_1) {
       break label$106
      }
     }
     HEAP32[($7_1 + 24 | 0) >> 2] = $11_1;
     label$109 : {
      $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      if (!$0_1) {
       break label$109
      }
      HEAP32[($7_1 + 16 | 0) >> 2] = $0_1;
      HEAP32[($0_1 + 24 | 0) >> 2] = $7_1;
     }
     $0_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$106
     }
     HEAP32[($7_1 + 20 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $7_1;
    }
    label$110 : {
     label$111 : {
      if ($4_1 >>> 0 > 15 >>> 0) {
       break label$111
      }
      $0_1 = $4_1 + $3_1 | 0;
      HEAP32[($8_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
      $0_1 = $8_1 + $0_1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
      break label$110;
     }
     HEAP32[($8_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
     $7_1 = $8_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
     HEAP32[($7_1 + $4_1 | 0) >> 2] = $4_1;
     label$112 : {
      if ($4_1 >>> 0 > 255 >>> 0) {
       break label$112
      }
      $0_1 = ($4_1 & -8 | 0) + 6724 | 0;
      label$113 : {
       label$114 : {
        $5_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
        $4_1 = 1 << ($4_1 >>> 3 | 0) | 0;
        if ($5_1 & $4_1 | 0) {
         break label$114
        }
        HEAP32[(0 + 6684 | 0) >> 2] = $5_1 | $4_1 | 0;
        $4_1 = $0_1;
        break label$113;
       }
       $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
      }
      HEAP32[($0_1 + 8 | 0) >> 2] = $7_1;
      HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 12 | 0) >> 2] = $0_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
      break label$110;
     }
     $0_1 = 31;
     label$115 : {
      if ($4_1 >>> 0 > 16777215 >>> 0) {
       break label$115
      }
      $0_1 = $4_1 >>> 8 | 0;
      $1599 = $0_1;
      $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
      $5_1 = $1599 << $0_1 | 0;
      $1606 = $5_1;
      $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
      $3_1 = $1606 << $5_1 | 0;
      $1613 = $3_1;
      $3_1 = (($3_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
      $0_1 = (($1613 << $3_1 | 0) >>> 15 | 0) - ($0_1 | $5_1 | 0 | $3_1 | 0) | 0;
      $0_1 = ($0_1 << 1 | 0 | (($4_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
     }
     HEAP32[($7_1 + 28 | 0) >> 2] = $0_1;
     i64toi32_i32$1 = $7_1;
     i64toi32_i32$0 = 0;
     HEAP32[($7_1 + 16 | 0) >> 2] = 0;
     HEAP32[($7_1 + 20 | 0) >> 2] = i64toi32_i32$0;
     $5_1 = ($0_1 << 2 | 0) + 6988 | 0;
     label$116 : {
      label$117 : {
       label$118 : {
        $3_1 = 1 << $0_1 | 0;
        if ($6_1 & $3_1 | 0) {
         break label$118
        }
        HEAP32[(0 + 6688 | 0) >> 2] = $6_1 | $3_1 | 0;
        HEAP32[$5_1 >> 2] = $7_1;
        HEAP32[($7_1 + 24 | 0) >> 2] = $5_1;
        break label$117;
       }
       $0_1 = $4_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
       $3_1 = HEAP32[$5_1 >> 2] | 0;
       label$119 : while (1) {
        $5_1 = $3_1;
        if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($4_1 | 0)) {
         break label$116
        }
        $3_1 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1 | 0;
        $2_1 = ($5_1 + ($3_1 & 4 | 0) | 0) + 16 | 0;
        $3_1 = HEAP32[$2_1 >> 2] | 0;
        if ($3_1) {
         continue label$119
        }
        break label$119;
       };
       HEAP32[$2_1 >> 2] = $7_1;
       HEAP32[($7_1 + 24 | 0) >> 2] = $5_1;
      }
      HEAP32[($7_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $7_1;
      break label$110;
     }
     $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
     HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
     HEAP32[($5_1 + 8 | 0) >> 2] = $7_1;
     HEAP32[($7_1 + 24 | 0) >> 2] = 0;
     HEAP32[($7_1 + 12 | 0) >> 2] = $5_1;
     HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
    }
    $0_1 = $8_1 + 8 | 0;
    break label$1;
   }
   label$120 : {
    if (!$10_1) {
     break label$120
    }
    label$121 : {
     label$122 : {
      $5_1 = HEAP32[($7_1 + 28 | 0) >> 2] | 0;
      $0_1 = ($5_1 << 2 | 0) + 6988 | 0;
      if (($7_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
       break label$122
      }
      HEAP32[$0_1 >> 2] = $8_1;
      if ($8_1) {
       break label$121
      }
      HEAP32[(0 + 6688 | 0) >> 2] = $9_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
      break label$120;
     }
     HEAP32[($10_1 + ((HEAP32[($10_1 + 16 | 0) >> 2] | 0 | 0) == ($7_1 | 0) ? 16 : 20) | 0) >> 2] = $8_1;
     if (!$8_1) {
      break label$120
     }
    }
    HEAP32[($8_1 + 24 | 0) >> 2] = $10_1;
    label$123 : {
     $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$123
     }
     HEAP32[($8_1 + 16 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
    }
    $0_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
    if (!$0_1) {
     break label$120
    }
    HEAP32[($8_1 + 20 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
   }
   label$124 : {
    label$125 : {
     if ($4_1 >>> 0 > 15 >>> 0) {
      break label$125
     }
     $0_1 = $4_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
     $0_1 = $7_1 + $0_1 | 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
     break label$124;
    }
    HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
    $5_1 = $7_1 + $3_1 | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
    HEAP32[($5_1 + $4_1 | 0) >> 2] = $4_1;
    label$126 : {
     if (!$6_1) {
      break label$126
     }
     $3_1 = ($6_1 & -8 | 0) + 6724 | 0;
     $0_1 = HEAP32[(0 + 6704 | 0) >> 2] | 0;
     label$127 : {
      label$128 : {
       $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
       if ($8_1 & $2_1 | 0) {
        break label$128
       }
       HEAP32[(0 + 6684 | 0) >> 2] = $8_1 | $2_1 | 0;
       $8_1 = $3_1;
       break label$127;
      }
      $8_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
     }
     HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
     HEAP32[($8_1 + 12 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
     HEAP32[($0_1 + 8 | 0) >> 2] = $8_1;
    }
    HEAP32[(0 + 6704 | 0) >> 2] = $5_1;
    HEAP32[(0 + 6692 | 0) >> 2] = $4_1;
   }
   $0_1 = $7_1 + 8 | 0;
  }
  global$0 = $1_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $288($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $6_1 = 0, $1_1 = 0, $4_1 = 0, $3_1 = 0, $5_1 = 0, $7_1 = 0, $378_1 = 0, $385_1 = 0, $392_1 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $1_1 = $0_1 + -8 | 0;
   $2_1 = HEAP32[($0_1 + -4 | 0) >> 2] | 0;
   $0_1 = $2_1 & -8 | 0;
   $3_1 = $1_1 + $0_1 | 0;
   label$2 : {
    if ($2_1 & 1 | 0) {
     break label$2
    }
    if (!($2_1 & 3 | 0)) {
     break label$1
    }
    $2_1 = HEAP32[$1_1 >> 2] | 0;
    $1_1 = $1_1 - $2_1 | 0;
    $4_1 = HEAP32[(0 + 6700 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $4_1 >>> 0) {
     break label$1
    }
    $0_1 = $2_1 + $0_1 | 0;
    label$3 : {
     if (($1_1 | 0) == (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
      break label$3
     }
     label$4 : {
      if ($2_1 >>> 0 > 255 >>> 0) {
       break label$4
      }
      $4_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
      $5_1 = $2_1 >>> 3 | 0;
      $6_1 = ($5_1 << 3 | 0) + 6724 | 0;
      label$5 : {
       $2_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       if (($2_1 | 0) != ($4_1 | 0)) {
        break label$5
       }
       HEAP32[(0 + 6684 | 0) >> 2] = (HEAP32[(0 + 6684 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       break label$2;
      }
      HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
      break label$2;
     }
     $7_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
     label$6 : {
      label$7 : {
       $6_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       if (($6_1 | 0) == ($1_1 | 0)) {
        break label$7
       }
       $2_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
       HEAP32[($2_1 + 12 | 0) >> 2] = $6_1;
       HEAP32[($6_1 + 8 | 0) >> 2] = $2_1;
       break label$6;
      }
      label$8 : {
       $2_1 = $1_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$8
       }
       $2_1 = $1_1 + 16 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$8
       }
       $6_1 = 0;
       break label$6;
      }
      label$9 : while (1) {
       $5_1 = $2_1;
       $6_1 = $4_1;
       $2_1 = $6_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        continue label$9
       }
       $2_1 = $6_1 + 16 | 0;
       $4_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
       if ($4_1) {
        continue label$9
       }
       break label$9;
      };
      HEAP32[$5_1 >> 2] = 0;
     }
     if (!$7_1) {
      break label$2
     }
     label$10 : {
      label$11 : {
       $4_1 = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
       $2_1 = ($4_1 << 2 | 0) + 6988 | 0;
       if (($1_1 | 0) != (HEAP32[$2_1 >> 2] | 0 | 0)) {
        break label$11
       }
       HEAP32[$2_1 >> 2] = $6_1;
       if ($6_1) {
        break label$10
       }
       HEAP32[(0 + 6688 | 0) >> 2] = (HEAP32[(0 + 6688 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
       break label$2;
      }
      HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($1_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
      if (!$6_1) {
       break label$2
      }
     }
     HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
     label$12 : {
      $2_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$12
      }
      HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     }
     $2_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
     if (!$2_1) {
      break label$2
     }
     HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
     HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     break label$2;
    }
    $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
    if (($2_1 & 3 | 0 | 0) != (3 | 0)) {
     break label$2
    }
    HEAP32[(0 + 6692 | 0) >> 2] = $0_1;
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
    return;
   }
   if ($1_1 >>> 0 >= $3_1 >>> 0) {
    break label$1
   }
   $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
   if (!($2_1 & 1 | 0)) {
    break label$1
   }
   label$13 : {
    label$14 : {
     if ($2_1 & 2 | 0) {
      break label$14
     }
     label$15 : {
      if (($3_1 | 0) != (HEAP32[(0 + 6708 | 0) >> 2] | 0 | 0)) {
       break label$15
      }
      HEAP32[(0 + 6708 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 6696 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 6696 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      if (($1_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
       break label$1
      }
      HEAP32[(0 + 6692 | 0) >> 2] = 0;
      HEAP32[(0 + 6704 | 0) >> 2] = 0;
      return;
     }
     label$16 : {
      if (($3_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
       break label$16
      }
      HEAP32[(0 + 6704 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 6692 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 6692 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
      return;
     }
     $0_1 = ($2_1 & -8 | 0) + $0_1 | 0;
     label$17 : {
      label$18 : {
       if ($2_1 >>> 0 > 255 >>> 0) {
        break label$18
       }
       $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
       $5_1 = $2_1 >>> 3 | 0;
       $6_1 = ($5_1 << 3 | 0) + 6724 | 0;
       label$19 : {
        $2_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        if (($2_1 | 0) != ($4_1 | 0)) {
         break label$19
        }
        HEAP32[(0 + 6684 | 0) >> 2] = (HEAP32[(0 + 6684 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
       break label$17;
      }
      $7_1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
      label$20 : {
       label$21 : {
        $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        if (($6_1 | 0) == ($3_1 | 0)) {
         break label$21
        }
        $2_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
        HEAP32[(0 + 6700 | 0) >> 2] | 0;
        HEAP32[($2_1 + 12 | 0) >> 2] = $6_1;
        HEAP32[($6_1 + 8 | 0) >> 2] = $2_1;
        break label$20;
       }
       label$22 : {
        $2_1 = $3_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$22
        }
        $2_1 = $3_1 + 16 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$22
        }
        $6_1 = 0;
        break label$20;
       }
       label$23 : while (1) {
        $5_1 = $2_1;
        $6_1 = $4_1;
        $2_1 = $6_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         continue label$23
        }
        $2_1 = $6_1 + 16 | 0;
        $4_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$23
        }
        break label$23;
       };
       HEAP32[$5_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$17
      }
      label$24 : {
       label$25 : {
        $4_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
        $2_1 = ($4_1 << 2 | 0) + 6988 | 0;
        if (($3_1 | 0) != (HEAP32[$2_1 >> 2] | 0 | 0)) {
         break label$25
        }
        HEAP32[$2_1 >> 2] = $6_1;
        if ($6_1) {
         break label$24
        }
        HEAP32[(0 + 6688 | 0) >> 2] = (HEAP32[(0 + 6688 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($3_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
       if (!$6_1) {
        break label$17
       }
      }
      HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
      label$26 : {
       $2_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
       if (!$2_1) {
        break label$26
       }
       HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
      }
      $2_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$17
      }
      HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     }
     HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
     HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
     if (($1_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
      break label$13
     }
     HEAP32[(0 + 6692 | 0) >> 2] = $0_1;
     return;
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
   }
   label$27 : {
    if ($0_1 >>> 0 > 255 >>> 0) {
     break label$27
    }
    $2_1 = ($0_1 & -8 | 0) + 6724 | 0;
    label$28 : {
     label$29 : {
      $4_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
      $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
      if ($4_1 & $0_1 | 0) {
       break label$29
      }
      HEAP32[(0 + 6684 | 0) >> 2] = $4_1 | $0_1 | 0;
      $0_1 = $2_1;
      break label$28;
     }
     $0_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
    return;
   }
   $2_1 = 31;
   label$30 : {
    if ($0_1 >>> 0 > 16777215 >>> 0) {
     break label$30
    }
    $2_1 = $0_1 >>> 8 | 0;
    $378_1 = $2_1;
    $2_1 = (($2_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
    $4_1 = $378_1 << $2_1 | 0;
    $385_1 = $4_1;
    $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
    $6_1 = $385_1 << $4_1 | 0;
    $392_1 = $6_1;
    $6_1 = (($6_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
    $2_1 = (($392_1 << $6_1 | 0) >>> 15 | 0) - ($2_1 | $4_1 | 0 | $6_1 | 0) | 0;
    $2_1 = ($2_1 << 1 | 0 | (($0_1 >>> ($2_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
   }
   HEAP32[($1_1 + 28 | 0) >> 2] = $2_1;
   HEAP32[($1_1 + 16 | 0) >> 2] = 0;
   HEAP32[($1_1 + 20 | 0) >> 2] = 0;
   $4_1 = ($2_1 << 2 | 0) + 6988 | 0;
   label$31 : {
    label$32 : {
     label$33 : {
      label$34 : {
       $6_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
       $3_1 = 1 << $2_1 | 0;
       if ($6_1 & $3_1 | 0) {
        break label$34
       }
       HEAP32[(0 + 6688 | 0) >> 2] = $6_1 | $3_1 | 0;
       HEAP32[$4_1 >> 2] = $1_1;
       HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
       break label$33;
      }
      $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
      $6_1 = HEAP32[$4_1 >> 2] | 0;
      label$35 : while (1) {
       $4_1 = $6_1;
       if (((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
        break label$32
       }
       $6_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1 | 0;
       $3_1 = ($4_1 + ($6_1 & 4 | 0) | 0) + 16 | 0;
       $6_1 = HEAP32[$3_1 >> 2] | 0;
       if ($6_1) {
        continue label$35
       }
       break label$35;
      };
      HEAP32[$3_1 >> 2] = $1_1;
      HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
     }
     HEAP32[($1_1 + 12 | 0) >> 2] = $1_1;
     HEAP32[($1_1 + 8 | 0) >> 2] = $1_1;
     break label$31;
    }
    $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = 0;
    HEAP32[($1_1 + 12 | 0) >> 2] = $4_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
   }
   $1_1 = (HEAP32[(0 + 6716 | 0) >> 2] | 0) + -1 | 0;
   HEAP32[(0 + 6716 | 0) >> 2] = $1_1 ? $1_1 : -1;
  }
 }
 
 function $289($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $6_1 = 0, $4_1 = 0, $5_1 = 0;
  $2_1 = 16;
  label$1 : {
   label$2 : {
    $3_1 = $0_1 >>> 0 > 16 >>> 0 ? $0_1 : 16;
    if ($3_1 & ($3_1 + -1 | 0) | 0) {
     break label$2
    }
    $0_1 = $3_1;
    break label$1;
   }
   label$3 : while (1) {
    $0_1 = $2_1;
    $2_1 = $0_1 << 1 | 0;
    if ($0_1 >>> 0 < $3_1 >>> 0) {
     continue label$3
    }
    break label$3;
   };
  }
  label$4 : {
   if ((-64 - $0_1 | 0) >>> 0 > $1_1 >>> 0) {
    break label$4
   }
   HEAP32[($264() | 0) >> 2] = 48;
   return 0 | 0;
  }
  label$5 : {
   $1_1 = $1_1 >>> 0 < 11 >>> 0 ? 16 : ($1_1 + 11 | 0) & -8 | 0;
   $2_1 = $287(($1_1 + $0_1 | 0) + 12 | 0 | 0) | 0;
   if ($2_1) {
    break label$5
   }
   return 0 | 0;
  }
  $3_1 = $2_1 + -8 | 0;
  label$6 : {
   label$7 : {
    if (($0_1 + -1 | 0) & $2_1 | 0) {
     break label$7
    }
    $0_1 = $3_1;
    break label$6;
   }
   $4_1 = $2_1 + -4 | 0;
   $5_1 = HEAP32[$4_1 >> 2] | 0;
   $2_1 = ((($2_1 + $0_1 | 0) + -1 | 0) & (0 - $0_1 | 0) | 0) + -8 | 0;
   $0_1 = $2_1 + (($2_1 - $3_1 | 0) >>> 0 > 15 >>> 0 ? 0 : $0_1) | 0;
   $2_1 = $0_1 - $3_1 | 0;
   $6_1 = ($5_1 & -8 | 0) - $2_1 | 0;
   label$8 : {
    if ($5_1 & 3 | 0) {
     break label$8
    }
    $3_1 = HEAP32[$3_1 >> 2] | 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = $6_1;
    HEAP32[$0_1 >> 2] = $3_1 + $2_1 | 0;
    break label$6;
   }
   HEAP32[($0_1 + 4 | 0) >> 2] = $6_1 | ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & 1 | 0) | 0 | 2 | 0;
   $6_1 = $0_1 + $6_1 | 0;
   HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   HEAP32[$4_1 >> 2] = $2_1 | ((HEAP32[$4_1 >> 2] | 0) & 1 | 0) | 0 | 2 | 0;
   $6_1 = $3_1 + $2_1 | 0;
   HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   $291($3_1 | 0, $2_1 | 0);
  }
  label$9 : {
   $2_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
   if (!($2_1 & 3 | 0)) {
    break label$9
   }
   $3_1 = $2_1 & -8 | 0;
   if ($3_1 >>> 0 <= ($1_1 + 16 | 0) >>> 0) {
    break label$9
   }
   HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | ($2_1 & 1 | 0) | 0 | 2 | 0;
   $2_1 = $0_1 + $1_1 | 0;
   $1_1 = $3_1 - $1_1 | 0;
   HEAP32[($2_1 + 4 | 0) >> 2] = $1_1 | 3 | 0;
   $3_1 = $0_1 + $3_1 | 0;
   HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   $291($2_1 | 0, $1_1 | 0);
  }
  return $0_1 + 8 | 0 | 0;
 }
 
 function $290($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     if (($1_1 | 0) != (8 | 0)) {
      break label$3
     }
     $1_1 = $287($2_1 | 0) | 0;
     break label$2;
    }
    $3_1 = 28;
    if ($1_1 >>> 0 < 4 >>> 0) {
     break label$1
    }
    if ($1_1 & 3 | 0) {
     break label$1
    }
    $4_1 = $1_1 >>> 2 | 0;
    if ($4_1 & ($4_1 + -1 | 0) | 0) {
     break label$1
    }
    $3_1 = 48;
    if ((-64 - $1_1 | 0) >>> 0 < $2_1 >>> 0) {
     break label$1
    }
    $1_1 = $289(($1_1 >>> 0 > 16 >>> 0 ? $1_1 : 16) | 0, $2_1 | 0) | 0;
   }
   label$4 : {
    if ($1_1) {
     break label$4
    }
    return 48 | 0;
   }
   HEAP32[$0_1 >> 2] = $1_1;
   $3_1 = 0;
  }
  return $3_1 | 0;
 }
 
 function $291($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $3_1 = 0, $6_1 = 0, $4_1 = 0, $2_1 = 0, $5_1 = 0, $7_1 = 0, $359_1 = 0, $366_1 = 0, $373_1 = 0;
  $2_1 = $0_1 + $1_1 | 0;
  label$1 : {
   label$2 : {
    $3_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
    if ($3_1 & 1 | 0) {
     break label$2
    }
    if (!($3_1 & 3 | 0)) {
     break label$1
    }
    $3_1 = HEAP32[$0_1 >> 2] | 0;
    $1_1 = $3_1 + $1_1 | 0;
    label$3 : {
     label$4 : {
      $0_1 = $0_1 - $3_1 | 0;
      if (($0_1 | 0) == (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
       break label$4
      }
      label$5 : {
       if ($3_1 >>> 0 > 255 >>> 0) {
        break label$5
       }
       $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
       $5_1 = $3_1 >>> 3 | 0;
       $6_1 = ($5_1 << 3 | 0) + 6724 | 0;
       $3_1 = HEAP32[($0_1 + 12 | 0) >> 2] | 0;
       if (($3_1 | 0) != ($4_1 | 0)) {
        break label$3
       }
       HEAP32[(0 + 6684 | 0) >> 2] = (HEAP32[(0 + 6684 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       break label$2;
      }
      $7_1 = HEAP32[($0_1 + 24 | 0) >> 2] | 0;
      label$6 : {
       label$7 : {
        $6_1 = HEAP32[($0_1 + 12 | 0) >> 2] | 0;
        if (($6_1 | 0) == ($0_1 | 0)) {
         break label$7
        }
        $3_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
        HEAP32[(0 + 6700 | 0) >> 2] | 0;
        HEAP32[($3_1 + 12 | 0) >> 2] = $6_1;
        HEAP32[($6_1 + 8 | 0) >> 2] = $3_1;
        break label$6;
       }
       label$8 : {
        $3_1 = $0_1 + 20 | 0;
        $4_1 = HEAP32[$3_1 >> 2] | 0;
        if ($4_1) {
         break label$8
        }
        $3_1 = $0_1 + 16 | 0;
        $4_1 = HEAP32[$3_1 >> 2] | 0;
        if ($4_1) {
         break label$8
        }
        $6_1 = 0;
        break label$6;
       }
       label$9 : while (1) {
        $5_1 = $3_1;
        $6_1 = $4_1;
        $3_1 = $6_1 + 20 | 0;
        $4_1 = HEAP32[$3_1 >> 2] | 0;
        if ($4_1) {
         continue label$9
        }
        $3_1 = $6_1 + 16 | 0;
        $4_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$9
        }
        break label$9;
       };
       HEAP32[$5_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$2
      }
      label$10 : {
       label$11 : {
        $4_1 = HEAP32[($0_1 + 28 | 0) >> 2] | 0;
        $3_1 = ($4_1 << 2 | 0) + 6988 | 0;
        if (($0_1 | 0) != (HEAP32[$3_1 >> 2] | 0 | 0)) {
         break label$11
        }
        HEAP32[$3_1 >> 2] = $6_1;
        if ($6_1) {
         break label$10
        }
        HEAP32[(0 + 6688 | 0) >> 2] = (HEAP32[(0 + 6688 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
        break label$2;
       }
       HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($0_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
       if (!$6_1) {
        break label$2
       }
      }
      HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
      label$12 : {
       $3_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
       if (!$3_1) {
        break label$12
       }
       HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
       HEAP32[($3_1 + 24 | 0) >> 2] = $6_1;
      }
      $3_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
      if (!$3_1) {
       break label$2
      }
      HEAP32[($6_1 + 20 | 0) >> 2] = $3_1;
      HEAP32[($3_1 + 24 | 0) >> 2] = $6_1;
      break label$2;
     }
     $3_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
     if (($3_1 & 3 | 0 | 0) != (3 | 0)) {
      break label$2
     }
     HEAP32[(0 + 6692 | 0) >> 2] = $1_1;
     HEAP32[($2_1 + 4 | 0) >> 2] = $3_1 & -2 | 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
     HEAP32[$2_1 >> 2] = $1_1;
     return;
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
    HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
   }
   label$13 : {
    label$14 : {
     $3_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
     if ($3_1 & 2 | 0) {
      break label$14
     }
     label$15 : {
      if (($2_1 | 0) != (HEAP32[(0 + 6708 | 0) >> 2] | 0 | 0)) {
       break label$15
      }
      HEAP32[(0 + 6708 | 0) >> 2] = $0_1;
      $1_1 = (HEAP32[(0 + 6696 | 0) >> 2] | 0) + $1_1 | 0;
      HEAP32[(0 + 6696 | 0) >> 2] = $1_1;
      HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
      if (($0_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
       break label$1
      }
      HEAP32[(0 + 6692 | 0) >> 2] = 0;
      HEAP32[(0 + 6704 | 0) >> 2] = 0;
      return;
     }
     label$16 : {
      if (($2_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
       break label$16
      }
      HEAP32[(0 + 6704 | 0) >> 2] = $0_1;
      $1_1 = (HEAP32[(0 + 6692 | 0) >> 2] | 0) + $1_1 | 0;
      HEAP32[(0 + 6692 | 0) >> 2] = $1_1;
      HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
      HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
      return;
     }
     $1_1 = ($3_1 & -8 | 0) + $1_1 | 0;
     label$17 : {
      label$18 : {
       if ($3_1 >>> 0 > 255 >>> 0) {
        break label$18
       }
       $4_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
       $5_1 = $3_1 >>> 3 | 0;
       $6_1 = ($5_1 << 3 | 0) + 6724 | 0;
       label$19 : {
        $3_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
        if (($3_1 | 0) != ($4_1 | 0)) {
         break label$19
        }
        HEAP32[(0 + 6684 | 0) >> 2] = (HEAP32[(0 + 6684 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
       HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
       break label$17;
      }
      $7_1 = HEAP32[($2_1 + 24 | 0) >> 2] | 0;
      label$20 : {
       label$21 : {
        $6_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
        if (($6_1 | 0) == ($2_1 | 0)) {
         break label$21
        }
        $3_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
        HEAP32[(0 + 6700 | 0) >> 2] | 0;
        HEAP32[($3_1 + 12 | 0) >> 2] = $6_1;
        HEAP32[($6_1 + 8 | 0) >> 2] = $3_1;
        break label$20;
       }
       label$22 : {
        $4_1 = $2_1 + 20 | 0;
        $3_1 = HEAP32[$4_1 >> 2] | 0;
        if ($3_1) {
         break label$22
        }
        $4_1 = $2_1 + 16 | 0;
        $3_1 = HEAP32[$4_1 >> 2] | 0;
        if ($3_1) {
         break label$22
        }
        $6_1 = 0;
        break label$20;
       }
       label$23 : while (1) {
        $5_1 = $4_1;
        $6_1 = $3_1;
        $4_1 = $3_1 + 20 | 0;
        $3_1 = HEAP32[$4_1 >> 2] | 0;
        if ($3_1) {
         continue label$23
        }
        $4_1 = $6_1 + 16 | 0;
        $3_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
        if ($3_1) {
         continue label$23
        }
        break label$23;
       };
       HEAP32[$5_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$17
      }
      label$24 : {
       label$25 : {
        $4_1 = HEAP32[($2_1 + 28 | 0) >> 2] | 0;
        $3_1 = ($4_1 << 2 | 0) + 6988 | 0;
        if (($2_1 | 0) != (HEAP32[$3_1 >> 2] | 0 | 0)) {
         break label$25
        }
        HEAP32[$3_1 >> 2] = $6_1;
        if ($6_1) {
         break label$24
        }
        HEAP32[(0 + 6688 | 0) >> 2] = (HEAP32[(0 + 6688 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
       if (!$6_1) {
        break label$17
       }
      }
      HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
      label$26 : {
       $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
       if (!$3_1) {
        break label$26
       }
       HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
       HEAP32[($3_1 + 24 | 0) >> 2] = $6_1;
      }
      $3_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
      if (!$3_1) {
       break label$17
      }
      HEAP32[($6_1 + 20 | 0) >> 2] = $3_1;
      HEAP32[($3_1 + 24 | 0) >> 2] = $6_1;
     }
     HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
     HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
     if (($0_1 | 0) != (HEAP32[(0 + 6704 | 0) >> 2] | 0 | 0)) {
      break label$13
     }
     HEAP32[(0 + 6692 | 0) >> 2] = $1_1;
     return;
    }
    HEAP32[($2_1 + 4 | 0) >> 2] = $3_1 & -2 | 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
    HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
   }
   label$27 : {
    if ($1_1 >>> 0 > 255 >>> 0) {
     break label$27
    }
    $3_1 = ($1_1 & -8 | 0) + 6724 | 0;
    label$28 : {
     label$29 : {
      $4_1 = HEAP32[(0 + 6684 | 0) >> 2] | 0;
      $1_1 = 1 << ($1_1 >>> 3 | 0) | 0;
      if ($4_1 & $1_1 | 0) {
       break label$29
      }
      HEAP32[(0 + 6684 | 0) >> 2] = $4_1 | $1_1 | 0;
      $1_1 = $3_1;
      break label$28;
     }
     $1_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
    HEAP32[($0_1 + 8 | 0) >> 2] = $1_1;
    return;
   }
   $3_1 = 31;
   label$30 : {
    if ($1_1 >>> 0 > 16777215 >>> 0) {
     break label$30
    }
    $3_1 = $1_1 >>> 8 | 0;
    $359_1 = $3_1;
    $3_1 = (($3_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
    $4_1 = $359_1 << $3_1 | 0;
    $366_1 = $4_1;
    $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
    $6_1 = $366_1 << $4_1 | 0;
    $373_1 = $6_1;
    $6_1 = (($6_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
    $3_1 = (($373_1 << $6_1 | 0) >>> 15 | 0) - ($3_1 | $4_1 | 0 | $6_1 | 0) | 0;
    $3_1 = ($3_1 << 1 | 0 | (($1_1 >>> ($3_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
   }
   HEAP32[($0_1 + 28 | 0) >> 2] = $3_1;
   HEAP32[($0_1 + 16 | 0) >> 2] = 0;
   HEAP32[($0_1 + 20 | 0) >> 2] = 0;
   $4_1 = ($3_1 << 2 | 0) + 6988 | 0;
   label$31 : {
    label$32 : {
     label$33 : {
      $6_1 = HEAP32[(0 + 6688 | 0) >> 2] | 0;
      $2_1 = 1 << $3_1 | 0;
      if ($6_1 & $2_1 | 0) {
       break label$33
      }
      HEAP32[(0 + 6688 | 0) >> 2] = $6_1 | $2_1 | 0;
      HEAP32[$4_1 >> 2] = $0_1;
      HEAP32[($0_1 + 24 | 0) >> 2] = $4_1;
      break label$32;
     }
     $3_1 = $1_1 << (($3_1 | 0) == (31 | 0) ? 0 : 25 - ($3_1 >>> 1 | 0) | 0) | 0;
     $6_1 = HEAP32[$4_1 >> 2] | 0;
     label$34 : while (1) {
      $4_1 = $6_1;
      if (((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($1_1 | 0)) {
       break label$31
      }
      $6_1 = $3_1 >>> 29 | 0;
      $3_1 = $3_1 << 1 | 0;
      $2_1 = ($4_1 + ($6_1 & 4 | 0) | 0) + 16 | 0;
      $6_1 = HEAP32[$2_1 >> 2] | 0;
      if ($6_1) {
       continue label$34
      }
      break label$34;
     };
     HEAP32[$2_1 >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $4_1;
    }
    HEAP32[($0_1 + 12 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 8 | 0) >> 2] = $0_1;
    return;
   }
   $1_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($1_1 + 12 | 0) >> 2] = $0_1;
   HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
   HEAP32[($0_1 + 24 | 0) >> 2] = 0;
   HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
   HEAP32[($0_1 + 8 | 0) >> 2] = $1_1;
  }
 }
 
 function $292() {
  return __wasm_memory_size() << 16 | 0 | 0;
 }
 
 function $293($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = HEAP32[(0 + 5276 | 0) >> 2] | 0;
  $2_1 = ($0_1 + 7 | 0) & -8 | 0;
  $0_1 = $1_1 + $2_1 | 0;
  label$1 : {
   label$2 : {
    if (!$2_1) {
     break label$2
    }
    if ($0_1 >>> 0 <= $1_1 >>> 0) {
     break label$1
    }
   }
   label$3 : {
    if ($0_1 >>> 0 <= ($292() | 0) >>> 0) {
     break label$3
    }
    if (!(fimport$17($0_1 | 0) | 0)) {
     break label$1
    }
   }
   HEAP32[(0 + 5276 | 0) >> 2] = $0_1;
   return $1_1 | 0;
  }
  HEAP32[($264() | 0) >> 2] = 48;
  return -1 | 0;
 }
 
 function $294($0_1, $1_1, $1$hi, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$3 = 0, $4$hi = 0, $18_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $11$hi = 0, $18$hi = 0, $19_1 = 0, $19$hi = 0, $4_1 = 0, $24$hi = 0;
  label$1 : {
   label$2 : {
    if (!($3_1 & 64 | 0)) {
     break label$2
    }
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$0 = 0;
    $11$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$2 = $1_1;
    i64toi32_i32$1 = $11$hi;
    i64toi32_i32$3 = $3_1 + -64 | 0;
    i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
     $18_1 = 0;
    } else {
     i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
     $18_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
    }
    $2_1 = $18_1;
    $2$hi = i64toi32_i32$1;
    i64toi32_i32$1 = 0;
    $1_1 = 0;
    $1$hi = i64toi32_i32$1;
    break label$1;
   }
   if (!$3_1) {
    break label$1
   }
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$1 = 0;
   $18$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$2 = $18$hi;
   i64toi32_i32$3 = 64 - $3_1 | 0;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $20_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
    $20_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
   }
   $19_1 = $20_1;
   $19$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $2$hi;
   i64toi32_i32$2 = 0;
   $4_1 = $3_1;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $2$hi;
   i64toi32_i32$1 = $2_1;
   i64toi32_i32$0 = $4$hi;
   i64toi32_i32$3 = $3_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
    $21_1 = 0;
   } else {
    i64toi32_i32$0 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$1 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
    $21_1 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
   }
   $24$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $19$hi;
   i64toi32_i32$2 = $19_1;
   i64toi32_i32$1 = $24$hi;
   i64toi32_i32$3 = $21_1;
   i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
   $2_1 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
   $2$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$3 = $4_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
    $22_1 = 0;
   } else {
    i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
    $22_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
   }
   $1_1 = $22_1;
   $1$hi = i64toi32_i32$2;
  }
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $1_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$2;
  i64toi32_i32$2 = $2$hi;
  HEAP32[(i64toi32_i32$0 + 8 | 0) >> 2] = $2_1;
  HEAP32[(i64toi32_i32$0 + 12 | 0) >> 2] = i64toi32_i32$2;
 }
 
 function $295($0_1, $1_1, $1$hi, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$4 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $4$hi = 0, $18_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $11$hi = 0, $18$hi = 0, $19_1 = 0, $19$hi = 0, $4_1 = 0, $24$hi = 0;
  label$1 : {
   label$2 : {
    if (!($3_1 & 64 | 0)) {
     break label$2
    }
    i64toi32_i32$0 = $2$hi;
    i64toi32_i32$0 = 0;
    $11$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $2$hi;
    i64toi32_i32$2 = $2_1;
    i64toi32_i32$1 = $11$hi;
    i64toi32_i32$3 = $3_1 + -64 | 0;
    i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = 0;
     $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
     $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
    }
    $1_1 = $18_1;
    $1$hi = i64toi32_i32$1;
    i64toi32_i32$1 = 0;
    $2_1 = 0;
    $2$hi = i64toi32_i32$1;
    break label$1;
   }
   if (!$3_1) {
    break label$1
   }
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$1 = 0;
   $18$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = $18$hi;
   i64toi32_i32$3 = 64 - $3_1 | 0;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
    $20_1 = 0;
   } else {
    i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
    $20_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
   }
   $19_1 = $20_1;
   $19$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$2 = 0;
   $4_1 = $3_1;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$1 = $1_1;
   i64toi32_i32$0 = $4$hi;
   i64toi32_i32$3 = $3_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = 0;
    $21_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$4 | 0) | 0;
   }
   $24$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $19$hi;
   i64toi32_i32$2 = $19_1;
   i64toi32_i32$1 = $24$hi;
   i64toi32_i32$3 = $21_1;
   i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
   $1_1 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
   $1$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$3 = $4_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $22_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
    $22_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
   }
   $2_1 = $22_1;
   $2$hi = i64toi32_i32$2;
  }
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $1_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$2;
  i64toi32_i32$2 = $2$hi;
  HEAP32[(i64toi32_i32$0 + 8 | 0) >> 2] = $2_1;
  HEAP32[(i64toi32_i32$0 + 12 | 0) >> 2] = i64toi32_i32$2;
 }
 
 function $296($0_1, $0$hi, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$5 = 0, i64toi32_i32$3 = 0, i64toi32_i32$1 = 0, $4_1 = 0, $4$hi = 0, $5$hi = 0, $5_1 = 0, $2_1 = 0, $3_1 = 0, $44_1 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $12_1 = 0, $12$hi = 0, $14$hi = 0, $17_1 = 0, $17$hi = 0, $19$hi = 0, $33_1 = 0, $33$hi = 0, $36_1 = 0, $38_1 = 0, $43_1 = 0, $43$hi = 0, $45$hi = 0, $73_1 = 0, $73$hi = 0, $77$hi = 0, $80_1 = 0, $80$hi = 0, $82_1 = 0, $82$hi = 0, $86_1 = 0, $86$hi = 0, $88_1 = 0, $89$hi = 0, $98$hi = 0, $105_1 = 0, $105$hi = 0;
  $2_1 = global$0 - 32 | 0;
  global$0 = $2_1;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$2 = $1_1;
    i64toi32_i32$1 = 2147483647;
    i64toi32_i32$3 = -1;
    i64toi32_i32$1 = i64toi32_i32$0 & i64toi32_i32$1 | 0;
    $4_1 = i64toi32_i32$2 & i64toi32_i32$3 | 0;
    $4$hi = i64toi32_i32$1;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$2 = -1006698496;
    i64toi32_i32$3 = 0;
    i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$3 | 0;
    i64toi32_i32$5 = i64toi32_i32$1 + i64toi32_i32$2 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
    }
    $12_1 = i64toi32_i32$4;
    $12$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $4$hi;
    i64toi32_i32$1 = $4_1;
    i64toi32_i32$0 = -1140785152;
    i64toi32_i32$3 = 0;
    i64toi32_i32$2 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
    i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$0 | 0;
    if (i64toi32_i32$2 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $14$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $12$hi;
    i64toi32_i32$5 = $12_1;
    i64toi32_i32$1 = $14$hi;
    i64toi32_i32$3 = i64toi32_i32$2;
    if (i64toi32_i32$4 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$5 >>> 0 >= i64toi32_i32$2 >>> 0 | 0) | 0) {
     break label$2
    }
    i64toi32_i32$5 = $0$hi;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$4 = 0;
    i64toi32_i32$1 = 60;
    i64toi32_i32$0 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$4 = 0;
     $44_1 = i64toi32_i32$5 >>> i64toi32_i32$0 | 0;
    } else {
     i64toi32_i32$4 = i64toi32_i32$5 >>> i64toi32_i32$0 | 0;
     $44_1 = (((1 << i64toi32_i32$0 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$0 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$0 | 0) | 0;
    }
    $17_1 = $44_1;
    $17$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $1$hi;
    i64toi32_i32$5 = $1_1;
    i64toi32_i32$3 = 0;
    i64toi32_i32$1 = 4;
    i64toi32_i32$0 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$3 = i64toi32_i32$5 << i64toi32_i32$0 | 0;
     $45_1 = 0;
    } else {
     i64toi32_i32$3 = ((1 << i64toi32_i32$0 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$0 | 0) | 0) | 0 | (i64toi32_i32$4 << i64toi32_i32$0 | 0) | 0;
     $45_1 = i64toi32_i32$5 << i64toi32_i32$0 | 0;
    }
    $19$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $17$hi;
    i64toi32_i32$4 = $17_1;
    i64toi32_i32$5 = $19$hi;
    i64toi32_i32$1 = $45_1;
    i64toi32_i32$5 = i64toi32_i32$3 | i64toi32_i32$5 | 0;
    $4_1 = i64toi32_i32$4 | i64toi32_i32$1 | 0;
    $4$hi = i64toi32_i32$5;
    label$3 : {
     i64toi32_i32$5 = $0$hi;
     i64toi32_i32$3 = $0_1;
     i64toi32_i32$4 = 268435455;
     i64toi32_i32$1 = -1;
     i64toi32_i32$4 = i64toi32_i32$5 & i64toi32_i32$4 | 0;
     $0_1 = i64toi32_i32$3 & i64toi32_i32$1 | 0;
     $0$hi = i64toi32_i32$4;
     i64toi32_i32$5 = $0_1;
     i64toi32_i32$3 = 134217728;
     i64toi32_i32$1 = 1;
     if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$3 | 0) & i64toi32_i32$5 >>> 0 < i64toi32_i32$1 >>> 0 | 0) | 0) {
      break label$3
     }
     i64toi32_i32$5 = $4$hi;
     i64toi32_i32$1 = $4_1;
     i64toi32_i32$4 = 1073741824;
     i64toi32_i32$3 = 1;
     i64toi32_i32$0 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
     i64toi32_i32$2 = i64toi32_i32$5 + i64toi32_i32$4 | 0;
     if (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) {
      i64toi32_i32$2 = i64toi32_i32$2 + 1 | 0
     }
     $5_1 = i64toi32_i32$0;
     $5$hi = i64toi32_i32$2;
     break label$1;
    }
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$5 = $4_1;
    i64toi32_i32$1 = 1073741824;
    i64toi32_i32$3 = 0;
    i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$3 | 0;
    i64toi32_i32$0 = i64toi32_i32$2 + i64toi32_i32$1 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$0 = i64toi32_i32$0 + 1 | 0
    }
    $5_1 = i64toi32_i32$4;
    $5$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$5 = 134217728;
    i64toi32_i32$3 = 0;
    if ((i64toi32_i32$2 | 0) != (i64toi32_i32$3 | 0) | (i64toi32_i32$0 | 0) != (i64toi32_i32$5 | 0) | 0) {
     break label$1
    }
    i64toi32_i32$2 = $5$hi;
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$3 = $4_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$5 = 1;
    i64toi32_i32$0 = i64toi32_i32$2 & i64toi32_i32$0 | 0;
    $33_1 = i64toi32_i32$3 & i64toi32_i32$5 | 0;
    $33$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $5$hi;
    i64toi32_i32$2 = $5_1;
    i64toi32_i32$3 = $33$hi;
    i64toi32_i32$5 = $33_1;
    i64toi32_i32$1 = i64toi32_i32$2 + i64toi32_i32$5 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$3 | 0;
    if (i64toi32_i32$1 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $5_1 = i64toi32_i32$1;
    $5$hi = i64toi32_i32$4;
    break label$1;
   }
   label$4 : {
    i64toi32_i32$4 = $0$hi;
    $36_1 = !($0_1 | i64toi32_i32$4 | 0);
    i64toi32_i32$4 = $4$hi;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$2 = 2147418112;
    i64toi32_i32$5 = 0;
    $38_1 = i64toi32_i32$4 >>> 0 < i64toi32_i32$2 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$2 | 0) & i64toi32_i32$0 >>> 0 < i64toi32_i32$5 >>> 0 | 0) | 0;
    i64toi32_i32$0 = i64toi32_i32$4;
    i64toi32_i32$5 = $4_1;
    i64toi32_i32$4 = 2147418112;
    i64toi32_i32$2 = 0;
    if ((i64toi32_i32$5 | 0) == (i64toi32_i32$2 | 0) & (i64toi32_i32$0 | 0) == (i64toi32_i32$4 | 0) | 0 ? $36_1 : $38_1) {
     break label$4
    }
    i64toi32_i32$5 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$4 = 60;
    i64toi32_i32$3 = i64toi32_i32$4 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$4 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $46_1 = i64toi32_i32$5 >>> i64toi32_i32$3 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$5 >>> i64toi32_i32$3 | 0;
     $46_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$3 | 0) | 0;
    }
    $43_1 = $46_1;
    $43$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$5 = $1_1;
    i64toi32_i32$2 = 0;
    i64toi32_i32$4 = 4;
    i64toi32_i32$3 = i64toi32_i32$4 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$4 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$3 | 0;
     $47_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$3 | 0) | 0;
     $47_1 = i64toi32_i32$5 << i64toi32_i32$3 | 0;
    }
    $45$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $43$hi;
    i64toi32_i32$0 = $43_1;
    i64toi32_i32$5 = $45$hi;
    i64toi32_i32$4 = $47_1;
    i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$4 | 0;
    i64toi32_i32$0 = 524287;
    i64toi32_i32$4 = -1;
    i64toi32_i32$0 = i64toi32_i32$5 & i64toi32_i32$0 | 0;
    i64toi32_i32$5 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
    i64toi32_i32$2 = 2146959360;
    i64toi32_i32$4 = 0;
    i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$2 | 0;
    $5_1 = i64toi32_i32$5 | i64toi32_i32$4 | 0;
    $5$hi = i64toi32_i32$2;
    break label$1;
   }
   i64toi32_i32$2 = 2146435072;
   $5_1 = 0;
   $5$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$0 = $4_1;
   i64toi32_i32$5 = 1140785151;
   i64toi32_i32$4 = -1;
   if (i64toi32_i32$2 >>> 0 > i64toi32_i32$5 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$5 | 0) & i64toi32_i32$0 >>> 0 > i64toi32_i32$4 >>> 0 | 0) | 0) {
    break label$1
   }
   i64toi32_i32$0 = 0;
   $5_1 = 0;
   $5$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $4$hi;
   i64toi32_i32$4 = $4_1;
   i64toi32_i32$2 = 0;
   i64toi32_i32$5 = 48;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $48_1 = i64toi32_i32$0 >>> i64toi32_i32$3 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$0 >>> i64toi32_i32$3 | 0;
    $48_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$3 | 0) | 0;
   }
   $3_1 = $48_1;
   if ($3_1 >>> 0 < 15249 >>> 0) {
    break label$1
   }
   i64toi32_i32$2 = $0$hi;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$4 = 65535;
   i64toi32_i32$5 = -1;
   i64toi32_i32$4 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
   i64toi32_i32$2 = i64toi32_i32$0 & i64toi32_i32$5 | 0;
   i64toi32_i32$0 = 65536;
   i64toi32_i32$5 = 0;
   i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
   $4_1 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
   $4$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $0$hi;
   i64toi32_i32$2 = $4$hi;
   $294($2_1 + 16 | 0 | 0, $0_1 | 0, i64toi32_i32$0 | 0, $4_1 | 0, i64toi32_i32$2 | 0, $3_1 + -15233 | 0 | 0);
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$0 = $4$hi;
   $295($2_1 | 0, $0_1 | 0, i64toi32_i32$2 | 0, $4_1 | 0, i64toi32_i32$0 | 0, 15361 - $3_1 | 0 | 0);
   i64toi32_i32$4 = $2_1;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$4 >> 2] | 0;
   i64toi32_i32$2 = HEAP32[(i64toi32_i32$4 + 4 | 0) >> 2] | 0;
   $4_1 = i64toi32_i32$0;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$4 = i64toi32_i32$0;
   i64toi32_i32$0 = 0;
   i64toi32_i32$5 = 60;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = 0;
    $49_1 = i64toi32_i32$2 >>> i64toi32_i32$3 | 0;
   } else {
    i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$3 | 0;
    $49_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$3 | 0) | 0;
   }
   $73_1 = $49_1;
   $73$hi = i64toi32_i32$0;
   i64toi32_i32$2 = $2_1 + 8 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$0 = 0;
   i64toi32_i32$5 = 4;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
    $50_1 = 0;
   } else {
    i64toi32_i32$0 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$4 << i64toi32_i32$3 | 0) | 0;
    $50_1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
   }
   $77$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $73$hi;
   i64toi32_i32$4 = $73_1;
   i64toi32_i32$2 = $77$hi;
   i64toi32_i32$5 = $50_1;
   i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$2 | 0;
   $5_1 = i64toi32_i32$4 | i64toi32_i32$5 | 0;
   $5$hi = i64toi32_i32$2;
   label$5 : {
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$4 = 268435455;
    i64toi32_i32$5 = -1;
    i64toi32_i32$4 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
    $80_1 = i64toi32_i32$0 & i64toi32_i32$5 | 0;
    $80$hi = i64toi32_i32$4;
    i64toi32_i32$2 = $2_1;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 16 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 20 | 0) >> 2] | 0;
    $82_1 = i64toi32_i32$4;
    $82$hi = i64toi32_i32$0;
    i64toi32_i32$2 = (i64toi32_i32$2 + 16 | 0) + 8 | 0;
    i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $86_1 = i64toi32_i32$0;
    $86$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $82$hi;
    i64toi32_i32$2 = $82_1;
    i64toi32_i32$0 = $86$hi;
    i64toi32_i32$5 = $86_1;
    i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
    i64toi32_i32$4 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$2 = 0;
    i64toi32_i32$5 = 0;
    $88_1 = (i64toi32_i32$4 | 0) != (i64toi32_i32$5 | 0) | (i64toi32_i32$0 | 0) != (i64toi32_i32$2 | 0) | 0;
    i64toi32_i32$4 = 0;
    $89$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $80$hi;
    i64toi32_i32$5 = $80_1;
    i64toi32_i32$0 = $89$hi;
    i64toi32_i32$2 = $88_1;
    i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
    $4_1 = i64toi32_i32$5 | i64toi32_i32$2 | 0;
    $4$hi = i64toi32_i32$0;
    i64toi32_i32$4 = $4_1;
    i64toi32_i32$5 = 134217728;
    i64toi32_i32$2 = 1;
    if (i64toi32_i32$0 >>> 0 < i64toi32_i32$5 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$5 | 0) & i64toi32_i32$4 >>> 0 < i64toi32_i32$2 >>> 0 | 0) | 0) {
     break label$5
    }
    i64toi32_i32$4 = $5$hi;
    i64toi32_i32$2 = $5_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$5 = 1;
    i64toi32_i32$3 = i64toi32_i32$2 + i64toi32_i32$5 | 0;
    i64toi32_i32$1 = i64toi32_i32$4 + i64toi32_i32$0 | 0;
    if (i64toi32_i32$3 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$1 = i64toi32_i32$1 + 1 | 0
    }
    $5_1 = i64toi32_i32$3;
    $5$hi = i64toi32_i32$1;
    break label$1;
   }
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$4 = $4_1;
   i64toi32_i32$2 = 134217728;
   i64toi32_i32$5 = 0;
   if ((i64toi32_i32$4 | 0) != (i64toi32_i32$5 | 0) | (i64toi32_i32$1 | 0) != (i64toi32_i32$2 | 0) | 0) {
    break label$1
   }
   i64toi32_i32$4 = $5$hi;
   i64toi32_i32$5 = $5_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$2 = 1;
   i64toi32_i32$1 = i64toi32_i32$4 & i64toi32_i32$1 | 0;
   $98$hi = i64toi32_i32$1;
   i64toi32_i32$1 = i64toi32_i32$4;
   i64toi32_i32$1 = $98$hi;
   i64toi32_i32$4 = i64toi32_i32$5 & i64toi32_i32$2 | 0;
   i64toi32_i32$5 = $5$hi;
   i64toi32_i32$2 = $5_1;
   i64toi32_i32$0 = i64toi32_i32$4 + i64toi32_i32$2 | 0;
   i64toi32_i32$3 = i64toi32_i32$1 + i64toi32_i32$5 | 0;
   if (i64toi32_i32$0 >>> 0 < i64toi32_i32$2 >>> 0) {
    i64toi32_i32$3 = i64toi32_i32$3 + 1 | 0
   }
   $5_1 = i64toi32_i32$0;
   $5$hi = i64toi32_i32$3;
  }
  global$0 = $2_1 + 32 | 0;
  i64toi32_i32$3 = $5$hi;
  i64toi32_i32$3 = $1$hi;
  i64toi32_i32$1 = $1_1;
  i64toi32_i32$4 = -2147483648;
  i64toi32_i32$2 = 0;
  i64toi32_i32$4 = i64toi32_i32$3 & i64toi32_i32$4 | 0;
  $105_1 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
  $105$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $5$hi;
  i64toi32_i32$3 = $5_1;
  i64toi32_i32$1 = $105$hi;
  i64toi32_i32$2 = $105_1;
  i64toi32_i32$1 = i64toi32_i32$4 | i64toi32_i32$1 | 0;
  wasm2js_scratch_store_i32(0 | 0, i64toi32_i32$3 | i64toi32_i32$2 | 0 | 0);
  wasm2js_scratch_store_i32(1 | 0, i64toi32_i32$1 | 0);
  return +(+wasm2js_scratch_load_f64());
 }
 
 function $297($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = $0_1 ? $0_1 : 1;
  label$1 : {
   label$2 : while (1) {
    $0_1 = $287($1_1 | 0) | 0;
    if ($0_1) {
     break label$1
    }
    label$3 : {
     $0_1 = $364() | 0;
     if (!$0_1) {
      break label$3
     }
     FUNCTION_TABLE[$0_1 | 0]();
     continue label$2;
    }
    break label$2;
   };
   fimport$18();
   wasm2js_trap();
  }
  return $0_1 | 0;
 }
 
 function $298($0_1) {
  $0_1 = $0_1 | 0;
  $288($0_1 | 0);
 }
 
 function $299($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $3_1 = 0, $2_1 = 0;
  $2_1 = $1_1 >>> 0 > 4 >>> 0 ? $1_1 : 4;
  $0_1 = $0_1 ? $0_1 : 1;
  label$1 : {
   label$2 : while (1) {
    $3_1 = $300($2_1 | 0, $0_1 | 0) | 0;
    if ($3_1) {
     break label$1
    }
    $1_1 = $364() | 0;
    if (!$1_1) {
     break label$1
    }
    FUNCTION_TABLE[$1_1 | 0]();
    continue label$2;
   };
  }
  return $3_1 | 0;
 }
 
 function $300($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 12 | 0) >> 2] = 0;
  $290($2_1 + 12 | 0 | 0, $0_1 | 0, $1_1 | 0) | 0;
  $1_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
  global$0 = $2_1 + 16 | 0;
  return $1_1 | 0;
 }
 
 function $301($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $302($0_1 | 0);
 }
 
 function $302($0_1) {
  $0_1 = $0_1 | 0;
  $288($0_1 | 0);
 }
 
 function $303($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[$0_1 >> 2] = 4892 + 8 | 0;
  return $0_1 | 0;
 }
 
 function $304($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = $253($1_1 | 0) | 0;
  $3_1 = $297($2_1 + 13 | 0 | 0) | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[$3_1 >> 2] = $2_1;
  HEAP32[$0_1 >> 2] = $246($305($3_1 | 0) | 0 | 0, $1_1 | 0, $2_1 + 1 | 0 | 0) | 0;
  return $0_1 | 0;
 }
 
 function $305($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 + 12 | 0 | 0;
 }
 
 function $306($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $0_1 = $303($0_1 | 0) | 0;
  HEAP32[$0_1 >> 2] = 5004 + 8 | 0;
  $304($0_1 + 4 | 0 | 0, $1_1 | 0) | 0;
  return $0_1 | 0;
 }
 
 function $307($0_1) {
  $0_1 = $0_1 | 0;
  return 1 | 0;
 }
 
 function $308($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $309($0_1) {
  $0_1 = $0_1 | 0;
  return fimport$19($308(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $310($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $3_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  i64toi32_i32$0 = $1$hi;
  $2_1 = $280($425($0_1 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 & 255 | 0 | 0, $3_1 + 8 | 0 | 0) | 0 | 0) | 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 12 | 0) >> 2] | 0;
  $1_1 = i64toi32_i32$0;
  $1$hi = i64toi32_i32$1;
  global$0 = i64toi32_i32$2 + 16 | 0;
  i64toi32_i32$1 = -1;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$3 = $2_1 ? -1 : $1_1;
  i64toi32_i32$2 = $2_1 ? i64toi32_i32$1 : i64toi32_i32$0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$2;
  return i64toi32_i32$3 | 0;
 }
 
 function $311($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = $310(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $312($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $12_1 = 0;
  label$1 : {
   if ($0_1 >>> 0 > 99999999 >>> 0) {
    break label$1
   }
   return $313($1_1 | 0, $0_1 | 0) | 0 | 0;
  }
  $2_1 = ($0_1 >>> 0) / (1e8 >>> 0) | 0;
  $12_1 = $314($1_1 | 0, $2_1 | 0) | 0;
  $0_1 = $0_1 - Math_imul($2_1, 1e8) | 0;
  $1_1 = ($0_1 >>> 0) / (1e4 >>> 0) | 0;
  return $315($315($12_1 | 0, $1_1 | 0) | 0 | 0, $0_1 - Math_imul($1_1, 1e4) | 0 | 0) | 0 | 0;
 }
 
 function $313($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  label$1 : {
   if ($1_1 >>> 0 > 9999 >>> 0) {
    break label$1
   }
   return $316($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  $2_1 = ($1_1 >>> 0) / (1e4 >>> 0) | 0;
  return $315($316($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e4) | 0 | 0) | 0 | 0;
 }
 
 function $314($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if ($1_1 >>> 0 > 9 >>> 0) {
    break label$1
   }
   return $317($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  return $318($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $315($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (100 >>> 0) | 0;
  return $318($318($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 100) | 0 | 0) | 0 | 0;
 }
 
 function $316($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if ($1_1 >>> 0 > 99 >>> 0) {
    break label$1
   }
   return $314($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  label$2 : {
   if ($1_1 >>> 0 > 999 >>> 0) {
    break label$2
   }
   return $319($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  return $315($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $317($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP8[$0_1 >> 0] = $1_1 + 48 | 0;
  return $0_1 + 1 | 0 | 0;
 }
 
 function $318($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAPU16[(3792 + ($1_1 << 1 | 0) | 0) >> 1] | 0;
  HEAP8[$0_1 >> 0] = $2_1;
  HEAP8[($0_1 + 1 | 0) >> 0] = $2_1 >>> 8 | 0;
  return $0_1 + 2 | 0 | 0;
 }
 
 function $319($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (100 >>> 0) | 0;
  return $318($317($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 100) | 0 | 0) | 0 | 0;
 }
 
 function $320($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = 10;
  label$1 : {
   if (!($50($0_1 | 0) | 0)) {
    break label$1
   }
   $1_1 = ($322($0_1 | 0) | 0) + -1 | 0;
  }
  return $1_1 | 0;
 }
 
 function $321($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  $6_1 = $6_1 | 0;
  $7_1 = $7_1 | 0;
  var $8_1 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0;
  $8_1 = global$0 - 16 | 0;
  global$0 = $8_1;
  label$1 : {
   $9_1 = $323($0_1 | 0) | 0;
   if (($9_1 + ($1_1 ^ -1 | 0) | 0) >>> 0 < $2_1 >>> 0) {
    break label$1
   }
   $10_1 = $227($0_1 | 0) | 0;
   label$2 : {
    label$3 : {
     if ((($9_1 >>> 1 | 0) + -16 | 0) >>> 0 <= $1_1 >>> 0) {
      break label$3
     }
     HEAP32[($8_1 + 8 | 0) >> 2] = $1_1 << 1 | 0;
     HEAP32[($8_1 + 12 | 0) >> 2] = $2_1 + $1_1 | 0;
     $2_1 = $324(HEAP32[($194($8_1 + 12 | 0 | 0, $8_1 + 8 | 0 | 0) | 0) >> 2] | 0 | 0) | 0;
     break label$2;
    }
    $2_1 = $9_1 + -1 | 0;
   }
   $11_1 = $2_1 + 1 | 0;
   $2_1 = $326($325($0_1 | 0) | 0 | 0, $11_1 | 0) | 0;
   $327($0_1 | 0);
   label$4 : {
    if (!$4_1) {
     break label$4
    }
    $328($228($2_1 | 0) | 0 | 0, $228($10_1 | 0) | 0 | 0, $4_1 | 0) | 0;
   }
   label$5 : {
    if (!$6_1) {
     break label$5
    }
    $328(($228($2_1 | 0) | 0) + $4_1 | 0 | 0, $7_1 | 0, $6_1 | 0) | 0;
   }
   $7_1 = $5_1 + $4_1 | 0;
   $9_1 = $3_1 - $7_1 | 0;
   label$6 : {
    if (($3_1 | 0) == ($7_1 | 0)) {
     break label$6
    }
    $328((($228($2_1 | 0) | 0) + $4_1 | 0) + $6_1 | 0 | 0, (($228($10_1 | 0) | 0) + $4_1 | 0) + $5_1 | 0 | 0, $9_1 | 0) | 0;
   }
   label$7 : {
    $1_1 = $1_1 + 1 | 0;
    if (($1_1 | 0) == (11 | 0)) {
     break label$7
    }
    $329($325($0_1 | 0) | 0 | 0, $10_1 | 0, $1_1 | 0);
   }
   $330($0_1 | 0, $2_1 | 0);
   $331($0_1 | 0, $11_1 | 0);
   $4_1 = ($6_1 + $4_1 | 0) + $9_1 | 0;
   $235($0_1 | 0, $4_1 | 0);
   HEAP8[($8_1 + 7 | 0) >> 0] = 0;
   $232($2_1 + $4_1 | 0 | 0, $8_1 + 7 | 0 | 0);
   global$0 = $8_1 + 16 | 0;
   return;
  }
  $332($0_1 | 0);
  wasm2js_trap();
 }
 
 function $322($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAP32[(($130($0_1 | 0) | 0) + 8 | 0) >> 2] | 0) & 2147483647 | 0 | 0;
 }
 
 function $323($0_1) {
  $0_1 = $0_1 | 0;
  return ($335($334($0_1 | 0) | 0 | 0) | 0) + -16 | 0 | 0;
 }
 
 function $324($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $7_1 = 0;
  $1_1 = 10;
  label$1 : {
   if ($0_1 >>> 0 < 11 >>> 0) {
    break label$1
   }
   $0_1 = $336($0_1 + 1 | 0 | 0) | 0;
   $7_1 = $0_1;
   $0_1 = $0_1 + -1 | 0;
   $1_1 = ($0_1 | 0) == (11 | 0) ? $7_1 : $0_1;
  }
  return $1_1 | 0;
 }
 
 function $325($0_1) {
  $0_1 = $0_1 | 0;
  return $338($0_1 | 0) | 0 | 0;
 }
 
 function $326($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $337($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $327($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $328($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if (!$2_1) {
    break label$1
   }
   $246($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
  }
  return $0_1 | 0;
 }
 
 function $329($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $341($0_1 | 0, $1_1 | 0, $2_1 | 0);
 }
 
 function $330($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP32[($223($0_1 | 0) | 0) >> 2] = $1_1;
 }
 
 function $331($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP32[(($223($0_1 | 0) | 0) + 8 | 0) >> 2] = $1_1 | -2147483648 | 0;
 }
 
 function $332($0_1) {
  $0_1 = $0_1 | 0;
  $205(1278 | 0);
  wasm2js_trap();
 }
 
 function $333($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 >>> 0 < 11 >>> 0 | 0;
 }
 
 function $334($0_1) {
  $0_1 = $0_1 | 0;
  return $350($0_1 | 0) | 0 | 0;
 }
 
 function $335($0_1) {
  $0_1 = $0_1 | 0;
  return $348() | 0 | 0;
 }
 
 function $336($0_1) {
  $0_1 = $0_1 | 0;
  return ($0_1 + 15 | 0) & -16 | 0 | 0;
 }
 
 function $337($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if (($335($0_1 | 0) | 0) >>> 0 >= $1_1 >>> 0) {
    break label$1
   }
   $214();
   wasm2js_trap();
  }
  return $215($1_1 | 0, 1 | 0) | 0 | 0;
 }
 
 function $338($0_1) {
  $0_1 = $0_1 | 0;
  return $352($0_1 | 0) | 0 | 0;
 }
 
 function $339($0_1) {
  $0_1 = $0_1 | 0;
  return $253($0_1 | 0) | 0 | 0;
 }
 
 function $340($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if (!($50($0_1 | 0) | 0)) {
    break label$1
   }
   $329($325($0_1 | 0) | 0 | 0, $233($0_1 | 0) | 0 | 0, $322($0_1 | 0) | 0 | 0);
  }
  return $0_1 | 0;
 }
 
 function $341($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $159($1_1 | 0, $2_1 | 0, 1 | 0);
 }
 
 function $342($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $5_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   label$2 : {
    $4_1 = $320($0_1 | 0) | 0;
    $5_1 = $43($0_1 | 0) | 0;
    if (($4_1 - $5_1 | 0) >>> 0 < $2_1 >>> 0) {
     break label$2
    }
    if (!$2_1) {
     break label$1
    }
    $4_1 = $228($227($0_1 | 0) | 0 | 0) | 0;
    $328($4_1 + $5_1 | 0 | 0, $1_1 | 0, $2_1 | 0) | 0;
    $2_1 = $5_1 + $2_1 | 0;
    $230($0_1 | 0, $2_1 | 0);
    HEAP8[($3_1 + 15 | 0) >> 0] = 0;
    $232($4_1 + $2_1 | 0 | 0, $3_1 + 15 | 0 | 0);
    break label$1;
   }
   $321($0_1 | 0, $4_1 | 0, ($5_1 + $2_1 | 0) - $4_1 | 0 | 0, $5_1 | 0, $5_1 | 0, 0 | 0, $2_1 | 0, $1_1 | 0);
  }
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $343($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $342($0_1 | 0, $1_1 | 0, $339($1_1 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $344($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $345($0_1 | 0, $1_1 | 0);
 }
 
 function $345($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 32 | 0;
  global$0 = $2_1;
  $346($2_1 + 8 | 0 | 0, $2_1 + 21 | 0 | 0, $2_1 + 32 | 0 | 0, $1_1 | 0);
  $347($0_1 | 0, $2_1 + 21 | 0 | 0, HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $2_1 + 32 | 0;
 }
 
 function $346($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $353($0_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
 }
 
 function $347($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $0_1 = $45($0_1 | 0, $3_1 + 8 | 0 | 0, $3_1 | 0) | 0;
  $354($0_1 | 0, $1_1 | 0, $2_1 | 0);
  $46($0_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $348() {
  return $349() | 0 | 0;
 }
 
 function $349() {
  return -1 | 0;
 }
 
 function $350($0_1) {
  $0_1 = $0_1 | 0;
  return $351($0_1 | 0) | 0 | 0;
 }
 
 function $351($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $352($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $353($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  $4_1 = $355($3_1 | 0) | 0;
  label$1 : {
   if (($1_1 | 0) == ($2_1 | 0)) {
    break label$1
   }
   if (($3_1 | 0) > (-1 | 0)) {
    break label$1
   }
   HEAP8[$1_1 >> 0] = 45;
   $1_1 = $1_1 + 1 | 0;
   $4_1 = $356($4_1 | 0) | 0;
  }
  $357($0_1 | 0, $1_1 | 0, $2_1 | 0, $4_1 | 0);
 }
 
 function $354($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $4_1 = 0, $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   $4_1 = $361($1_1 | 0, $2_1 | 0) | 0;
   if ($4_1 >>> 0 > ($323($0_1 | 0) | 0) >>> 0) {
    break label$1
   }
   label$2 : {
    label$3 : {
     if (!($333($4_1 | 0) | 0)) {
      break label$3
     }
     $236($0_1 | 0, $4_1 | 0);
     $5_1 = $234($0_1 | 0) | 0;
     break label$2;
    }
    $5_1 = $324($4_1 | 0) | 0;
    $6_1 = $5_1 + 1 | 0;
    $5_1 = $326($325($0_1 | 0) | 0 | 0, $6_1 | 0) | 0;
    $330($0_1 | 0, $5_1 | 0);
    $331($0_1 | 0, $6_1 | 0);
    $235($0_1 | 0, $4_1 | 0);
   }
   label$4 : {
    label$5 : while (1) {
     if (($1_1 | 0) == ($2_1 | 0)) {
      break label$4
     }
     $232($5_1 | 0, $1_1 | 0);
     $5_1 = $5_1 + 1 | 0;
     $1_1 = $1_1 + 1 | 0;
     continue label$5;
    };
   }
   HEAP8[($3_1 + 15 | 0) >> 0] = 0;
   $232($5_1 | 0, $3_1 + 15 | 0 | 0);
   global$0 = $3_1 + 16 | 0;
   return;
  }
  $332($0_1 | 0);
  wasm2js_trap();
 }
 
 function $355($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $356($0_1) {
  $0_1 = $0_1 | 0;
  return 0 - $0_1 | 0 | 0;
 }
 
 function $357($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    $4_1 = $2_1 - $1_1 | 0;
    if (($4_1 | 0) > (9 | 0)) {
     break label$2
    }
    $5_1 = 61;
    if (($358($3_1 | 0) | 0 | 0) > ($4_1 | 0)) {
     break label$1
    }
   }
   $5_1 = 0;
   $2_1 = $359($3_1 | 0, $1_1 | 0) | 0;
  }
  HEAP32[($0_1 + 4 | 0) >> 2] = $5_1;
  HEAP32[$0_1 >> 2] = $2_1;
 }
 
 function $358($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = Math_imul(32 - ($360($0_1 | 1 | 0 | 0) | 0) | 0, 1233) >> 12 | 0;
  return $1_1 + ((HEAP32[(($1_1 << 2 | 0) + 4e3 | 0) >> 2] | 0) >>> 0 <= $0_1 >>> 0) | 0 | 0;
 }
 
 function $359($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $312($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $360($0_1) {
  $0_1 = $0_1 | 0;
  return Math_clz32($0_1) | 0;
 }
 
 function $361($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $362($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $362($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $1_1 - $0_1 | 0 | 0;
 }
 
 function $363($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[$0_1 >> 2] | 0 | 0;
 }
 
 function $364() {
  return $363(7188 | 0) | 0 | 0;
 }
 
 function $365($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $3_1 = 0, $2_1 = 0;
  $2_1 = HEAPU8[$1_1 >> 0] | 0;
  label$1 : {
   $3_1 = HEAPU8[$0_1 >> 0] | 0;
   if (!$3_1) {
    break label$1
   }
   if (($3_1 | 0) != ($2_1 & 255 | 0 | 0)) {
    break label$1
   }
   label$2 : while (1) {
    $2_1 = HEAPU8[($1_1 + 1 | 0) >> 0] | 0;
    $3_1 = HEAPU8[($0_1 + 1 | 0) >> 0] | 0;
    if (!$3_1) {
     break label$1
    }
    $1_1 = $1_1 + 1 | 0;
    $0_1 = $0_1 + 1 | 0;
    if (($3_1 | 0) == ($2_1 & 255 | 0 | 0)) {
     continue label$2
    }
    break label$2;
   };
  }
  return $3_1 - ($2_1 & 255 | 0) | 0 | 0;
 }
 
 function $366($0_1) {
  $0_1 = $0_1 | 0;
  return $411($0_1 | 0) | 0 | 0;
 }
 
 function $367($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $368($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $369($0_1) {
  $0_1 = $0_1 | 0;
  $298($366($0_1 | 0) | 0 | 0);
 }
 
 function $370($0_1) {
  $0_1 = $0_1 | 0;
  $298($366($0_1 | 0) | 0 | 0);
 }
 
 function $371($0_1) {
  $0_1 = $0_1 | 0;
  $298($366($0_1 | 0) | 0 | 0);
 }
 
 function $372($0_1) {
  $0_1 = $0_1 | 0;
  $298($366($0_1 | 0) | 0 | 0);
 }
 
 function $373($0_1) {
  $0_1 = $0_1 | 0;
  $298($366($0_1 | 0) | 0 | 0);
 }
 
 function $374($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $375($0_1 | 0, $1_1 | 0, 0 | 0) | 0 | 0;
 }
 
 function $375($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if ($2_1) {
    break label$1
   }
   return (HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 0) == (HEAP32[($1_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  }
  label$2 : {
   if (($0_1 | 0) != ($1_1 | 0)) {
    break label$2
   }
   return 1 | 0;
  }
  return !($365($376($0_1 | 0) | 0 | 0, $376($1_1 | 0) | 0 | 0) | 0) | 0;
 }
 
 function $376($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 0;
 }
 
 function $377($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $375($0_1 | 0, $1_1 | 0, 0 | 0) | 0 | 0;
 }
 
 function $378($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 64 | 0;
  global$0 = $3_1;
  $4_1 = 1;
  label$1 : {
   if ($375($0_1 | 0, $1_1 | 0, 0 | 0) | 0) {
    break label$1
   }
   $4_1 = 0;
   if (!$1_1) {
    break label$1
   }
   $4_1 = 0;
   $1_1 = $379($1_1 | 0, 4076 | 0, 4124 | 0, 0 | 0) | 0;
   if (!$1_1) {
    break label$1
   }
   $247($3_1 + 8 | 0 | 4 | 0 | 0, 0 | 0, 52 | 0) | 0;
   HEAP32[($3_1 + 56 | 0) >> 2] = 1;
   HEAP32[($3_1 + 20 | 0) >> 2] = -1;
   HEAP32[($3_1 + 16 | 0) >> 2] = $0_1;
   HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
   FUNCTION_TABLE[HEAP32[((HEAP32[$1_1 >> 2] | 0) + 28 | 0) >> 2] | 0 | 0]($1_1, $3_1 + 8 | 0, HEAP32[$2_1 >> 2] | 0, 1);
   label$2 : {
    $4_1 = HEAP32[($3_1 + 32 | 0) >> 2] | 0;
    if (($4_1 | 0) != (1 | 0)) {
     break label$2
    }
    HEAP32[$2_1 >> 2] = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
   }
   $4_1 = ($4_1 | 0) == (1 | 0);
  }
  global$0 = $3_1 + 64 | 0;
  return $4_1 | 0;
 }
 
 function $379($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, $6_1 = 0, $5_1 = 0, $9_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0, wasm2js_i32$2 = 0, wasm2js_i32$3 = 0, wasm2js_i32$4 = 0, wasm2js_i32$5 = 0, wasm2js_i32$6 = 0, wasm2js_i32$7 = 0, wasm2js_i32$8 = 0;
  $4_1 = global$0 - 64 | 0;
  global$0 = $4_1;
  $5_1 = HEAP32[$0_1 >> 2] | 0;
  $6_1 = HEAP32[($5_1 + -4 | 0) >> 2] | 0;
  $5_1 = HEAP32[($5_1 + -8 | 0) >> 2] | 0;
  i64toi32_i32$1 = $4_1 + 32 | 0;
  i64toi32_i32$0 = 0;
  HEAP32[i64toi32_i32$1 >> 2] = 0;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$1 = $4_1 + 40 | 0;
  i64toi32_i32$0 = 0;
  HEAP32[i64toi32_i32$1 >> 2] = 0;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$1 = $4_1 + 48 | 0;
  i64toi32_i32$0 = 0;
  HEAP32[i64toi32_i32$1 >> 2] = 0;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$1 = $4_1 + 55 | 0;
  i64toi32_i32$0 = 0;
  $9_1 = 0;
  HEAP8[i64toi32_i32$1 >> 0] = $9_1;
  HEAP8[(i64toi32_i32$1 + 1 | 0) >> 0] = $9_1 >>> 8 | 0;
  HEAP8[(i64toi32_i32$1 + 2 | 0) >> 0] = $9_1 >>> 16 | 0;
  HEAP8[(i64toi32_i32$1 + 3 | 0) >> 0] = $9_1 >>> 24 | 0;
  HEAP8[(i64toi32_i32$1 + 4 | 0) >> 0] = i64toi32_i32$0;
  HEAP8[(i64toi32_i32$1 + 5 | 0) >> 0] = i64toi32_i32$0 >>> 8 | 0;
  HEAP8[(i64toi32_i32$1 + 6 | 0) >> 0] = i64toi32_i32$0 >>> 16 | 0;
  HEAP8[(i64toi32_i32$1 + 7 | 0) >> 0] = i64toi32_i32$0 >>> 24 | 0;
  i64toi32_i32$1 = $4_1;
  i64toi32_i32$0 = 0;
  HEAP32[($4_1 + 24 | 0) >> 2] = 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($4_1 + 20 | 0) >> 2] = $3_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $2_1;
  $0_1 = $0_1 + $5_1 | 0;
  $3_1 = 0;
  label$1 : {
   label$2 : {
    if (!($375($6_1 | 0, $2_1 | 0, 0 | 0) | 0)) {
     break label$2
    }
    HEAP32[($4_1 + 56 | 0) >> 2] = 1;
    FUNCTION_TABLE[HEAP32[((HEAP32[$6_1 >> 2] | 0) + 20 | 0) >> 2] | 0 | 0]($6_1, $4_1 + 8 | 0, $0_1, $0_1, 1, 0);
    $3_1 = (HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) == (1 | 0) ? $0_1 : 0;
    break label$1;
   }
   FUNCTION_TABLE[HEAP32[((HEAP32[$6_1 >> 2] | 0) + 24 | 0) >> 2] | 0 | 0]($6_1, $4_1 + 8 | 0, $0_1, 1, 0);
   label$3 : {
    switch (HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0) {
    case 0:
     $3_1 = (wasm2js_i32$0 = (wasm2js_i32$3 = (wasm2js_i32$6 = HEAP32[($4_1 + 28 | 0) >> 2] | 0, wasm2js_i32$7 = 0, wasm2js_i32$8 = (HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) == (1 | 0), wasm2js_i32$8 ? wasm2js_i32$6 : wasm2js_i32$7), wasm2js_i32$4 = 0, wasm2js_i32$5 = (HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) == (1 | 0), wasm2js_i32$5 ? wasm2js_i32$3 : wasm2js_i32$4), wasm2js_i32$1 = 0, wasm2js_i32$2 = (HEAP32[($4_1 + 48 | 0) >> 2] | 0 | 0) == (1 | 0), wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
     break label$1;
    case 1:
     break label$3;
    default:
     break label$1;
    };
   }
   label$5 : {
    if ((HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) == (1 | 0)) {
     break label$5
    }
    if (HEAP32[($4_1 + 48 | 0) >> 2] | 0) {
     break label$1
    }
    if ((HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) != (1 | 0)) {
     break label$1
    }
    if ((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) != (1 | 0)) {
     break label$1
    }
   }
   $3_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 64 | 0;
  return $3_1 | 0;
 }
 
 function $380($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  label$1 : {
   $4_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
   if ($4_1) {
    break label$1
   }
   HEAP32[($1_1 + 36 | 0) >> 2] = 1;
   HEAP32[($1_1 + 24 | 0) >> 2] = $3_1;
   HEAP32[($1_1 + 16 | 0) >> 2] = $2_1;
   return;
  }
  label$2 : {
   label$3 : {
    if (($4_1 | 0) != ($2_1 | 0)) {
     break label$3
    }
    if ((HEAP32[($1_1 + 24 | 0) >> 2] | 0 | 0) != (2 | 0)) {
     break label$2
    }
    HEAP32[($1_1 + 24 | 0) >> 2] = $3_1;
    return;
   }
   HEAP8[($1_1 + 54 | 0) >> 0] = 1;
   HEAP32[($1_1 + 24 | 0) >> 2] = 2;
   HEAP32[($1_1 + 36 | 0) >> 2] = (HEAP32[($1_1 + 36 | 0) >> 2] | 0) + 1 | 0;
  }
 }
 
 function $381($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, 0 | 0) | 0)) {
    break label$1
   }
   $380($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
  }
 }
 
 function $382($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, 0 | 0) | 0)) {
    break label$1
   }
   $380($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
   return;
  }
  $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
  FUNCTION_TABLE[HEAP32[((HEAP32[$0_1 >> 2] | 0) + 28 | 0) >> 2] | 0 | 0]($0_1, $1_1, $2_1, $3_1);
 }
 
 function $383($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = 1;
  label$1 : {
   label$2 : {
    if ((HEAPU8[($0_1 + 8 | 0) >> 0] | 0) & 24 | 0) {
     break label$2
    }
    $3_1 = 0;
    if (!$1_1) {
     break label$1
    }
    $4_1 = $379($1_1 | 0, 4076 | 0, 4172 | 0, 0 | 0) | 0;
    if (!$4_1) {
     break label$1
    }
    $3_1 = ((HEAPU8[($4_1 + 8 | 0) >> 0] | 0) & 24 | 0 | 0) != (0 | 0);
   }
   $3_1 = $375($0_1 | 0, $1_1 | 0, $3_1 | 0) | 0;
  }
  return $3_1 | 0;
 }
 
 function $384($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 64 | 0;
  global$0 = $3_1;
  label$1 : {
   label$2 : {
    if (!($375($1_1 | 0, 4440 | 0, 0 | 0) | 0)) {
     break label$2
    }
    HEAP32[$2_1 >> 2] = 0;
    $4_1 = 1;
    break label$1;
   }
   label$3 : {
    if (!($383($0_1 | 0, $1_1 | 0, $1_1 | 0) | 0)) {
     break label$3
    }
    $4_1 = 1;
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    if (!$1_1) {
     break label$1
    }
    HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
    break label$1;
   }
   label$4 : {
    if (!$1_1) {
     break label$4
    }
    $4_1 = 0;
    $1_1 = $379($1_1 | 0, 4076 | 0, 4220 | 0, 0 | 0) | 0;
    if (!$1_1) {
     break label$1
    }
    label$5 : {
     $5_1 = HEAP32[$2_1 >> 2] | 0;
     if (!$5_1) {
      break label$5
     }
     HEAP32[$2_1 >> 2] = HEAP32[$5_1 >> 2] | 0;
    }
    $5_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
    $6_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
    if (($5_1 & ($6_1 ^ -1 | 0) | 0) & 7 | 0) {
     break label$1
    }
    if ((($5_1 ^ -1 | 0) & $6_1 | 0) & 96 | 0) {
     break label$1
    }
    $4_1 = 1;
    if ($375(HEAP32[($0_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0, 0 | 0) | 0) {
     break label$1
    }
    label$6 : {
     if (!($375(HEAP32[($0_1 + 12 | 0) >> 2] | 0 | 0, 4428 | 0, 0 | 0) | 0)) {
      break label$6
     }
     $1_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
     if (!$1_1) {
      break label$1
     }
     $4_1 = !($379($1_1 | 0, 4076 | 0, 4272 | 0, 0 | 0) | 0);
     break label$1;
    }
    $5_1 = HEAP32[($0_1 + 12 | 0) >> 2] | 0;
    if (!$5_1) {
     break label$4
    }
    $4_1 = 0;
    label$7 : {
     $6_1 = $379($5_1 | 0, 4076 | 0, 4220 | 0, 0 | 0) | 0;
     if (!$6_1) {
      break label$7
     }
     if (!((HEAPU8[($0_1 + 8 | 0) >> 0] | 0) & 1 | 0)) {
      break label$1
     }
     $4_1 = $385($6_1 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0) | 0;
     break label$1;
    }
    $4_1 = 0;
    label$8 : {
     $6_1 = $379($5_1 | 0, 4076 | 0, 4332 | 0, 0 | 0) | 0;
     if (!$6_1) {
      break label$8
     }
     if (!((HEAPU8[($0_1 + 8 | 0) >> 0] | 0) & 1 | 0)) {
      break label$1
     }
     $4_1 = $386($6_1 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0) | 0;
     break label$1;
    }
    $4_1 = 0;
    $0_1 = $379($5_1 | 0, 4076 | 0, 4124 | 0, 0 | 0) | 0;
    if (!$0_1) {
     break label$1
    }
    $1_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
    if (!$1_1) {
     break label$1
    }
    $4_1 = 0;
    $1_1 = $379($1_1 | 0, 4076 | 0, 4124 | 0, 0 | 0) | 0;
    if (!$1_1) {
     break label$1
    }
    $247($3_1 + 8 | 0 | 4 | 0 | 0, 0 | 0, 52 | 0) | 0;
    HEAP32[($3_1 + 56 | 0) >> 2] = 1;
    HEAP32[($3_1 + 20 | 0) >> 2] = -1;
    HEAP32[($3_1 + 16 | 0) >> 2] = $0_1;
    HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
    FUNCTION_TABLE[HEAP32[((HEAP32[$1_1 >> 2] | 0) + 28 | 0) >> 2] | 0 | 0]($1_1, $3_1 + 8 | 0, HEAP32[$2_1 >> 2] | 0, 1);
    label$9 : {
     $1_1 = HEAP32[($3_1 + 32 | 0) >> 2] | 0;
     if (($1_1 | 0) != (1 | 0)) {
      break label$9
     }
     if (!(HEAP32[$2_1 >> 2] | 0)) {
      break label$9
     }
     HEAP32[$2_1 >> 2] = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
    }
    $4_1 = ($1_1 | 0) == (1 | 0);
    break label$1;
   }
   $4_1 = 0;
  }
  global$0 = $3_1 + 64 | 0;
  return $4_1 | 0;
 }
 
 function $385($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  label$1 : {
   label$2 : while (1) {
    label$3 : {
     if ($1_1) {
      break label$3
     }
     return 0 | 0;
    }
    $2_1 = 0;
    $1_1 = $379($1_1 | 0, 4076 | 0, 4220 | 0, 0 | 0) | 0;
    if (!$1_1) {
     break label$1
    }
    if ((HEAP32[($1_1 + 8 | 0) >> 2] | 0) & ((HEAP32[($0_1 + 8 | 0) >> 2] | 0) ^ -1 | 0) | 0) {
     break label$1
    }
    label$4 : {
     if (!($375(HEAP32[($0_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0, 0 | 0) | 0)) {
      break label$4
     }
     return 1 | 0;
    }
    if (!((HEAPU8[($0_1 + 8 | 0) >> 0] | 0) & 1 | 0)) {
     break label$1
    }
    $3_1 = HEAP32[($0_1 + 12 | 0) >> 2] | 0;
    if (!$3_1) {
     break label$1
    }
    label$5 : {
     $0_1 = $379($3_1 | 0, 4076 | 0, 4220 | 0, 0 | 0) | 0;
     if (!$0_1) {
      break label$5
     }
     $1_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
     continue label$2;
    }
    break label$2;
   };
   $2_1 = 0;
   $0_1 = $379($3_1 | 0, 4076 | 0, 4332 | 0, 0 | 0) | 0;
   if (!$0_1) {
    break label$1
   }
   $2_1 = $386($0_1 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  }
  return $2_1 | 0;
 }
 
 function $386($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = 0;
  label$1 : {
   if (!$1_1) {
    break label$1
   }
   $1_1 = $379($1_1 | 0, 4076 | 0, 4332 | 0, 0 | 0) | 0;
   if (!$1_1) {
    break label$1
   }
   if ((HEAP32[($1_1 + 8 | 0) >> 2] | 0) & ((HEAP32[($0_1 + 8 | 0) >> 2] | 0) ^ -1 | 0) | 0) {
    break label$1
   }
   $2_1 = 0;
   if (!($375(HEAP32[($0_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($1_1 + 12 | 0) >> 2] | 0 | 0, 0 | 0) | 0)) {
    break label$1
   }
   $2_1 = $375(HEAP32[($0_1 + 16 | 0) >> 2] | 0 | 0, HEAP32[($1_1 + 16 | 0) >> 2] | 0 | 0, 0 | 0) | 0;
  }
  return $2_1 | 0;
 }
 
 function $387($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  HEAP8[($1_1 + 53 | 0) >> 0] = 1;
  label$1 : {
   if ((HEAP32[($1_1 + 4 | 0) >> 2] | 0 | 0) != ($3_1 | 0)) {
    break label$1
   }
   HEAP8[($1_1 + 52 | 0) >> 0] = 1;
   label$2 : {
    label$3 : {
     $3_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
     if ($3_1) {
      break label$3
     }
     HEAP32[($1_1 + 36 | 0) >> 2] = 1;
     HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
     HEAP32[($1_1 + 16 | 0) >> 2] = $2_1;
     if (($4_1 | 0) != (1 | 0)) {
      break label$1
     }
     if ((HEAP32[($1_1 + 48 | 0) >> 2] | 0 | 0) == (1 | 0)) {
      break label$2
     }
     break label$1;
    }
    label$4 : {
     if (($3_1 | 0) != ($2_1 | 0)) {
      break label$4
     }
     label$5 : {
      $3_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
      if (($3_1 | 0) != (2 | 0)) {
       break label$5
      }
      HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
      $3_1 = $4_1;
     }
     if ((HEAP32[($1_1 + 48 | 0) >> 2] | 0 | 0) != (1 | 0)) {
      break label$1
     }
     if (($3_1 | 0) == (1 | 0)) {
      break label$2
     }
     break label$1;
    }
    HEAP32[($1_1 + 36 | 0) >> 2] = (HEAP32[($1_1 + 36 | 0) >> 2] | 0) + 1 | 0;
   }
   HEAP8[($1_1 + 54 | 0) >> 0] = 1;
  }
 }
 
 function $388($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  label$1 : {
   if ((HEAP32[($1_1 + 4 | 0) >> 2] | 0 | 0) != ($2_1 | 0)) {
    break label$1
   }
   if ((HEAP32[($1_1 + 28 | 0) >> 2] | 0 | 0) == (1 | 0)) {
    break label$1
   }
   HEAP32[($1_1 + 28 | 0) >> 2] = $3_1;
  }
 }
 
 function $389($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, $4_1 | 0) | 0)) {
    break label$1
   }
   $388($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
   return;
  }
  label$2 : {
   label$3 : {
    if (!($375($0_1 | 0, HEAP32[$1_1 >> 2] | 0 | 0, $4_1 | 0) | 0)) {
     break label$3
    }
    label$4 : {
     label$5 : {
      if ((HEAP32[($1_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0)) {
       break label$5
      }
      if ((HEAP32[($1_1 + 20 | 0) >> 2] | 0 | 0) != ($2_1 | 0)) {
       break label$4
      }
     }
     if (($3_1 | 0) != (1 | 0)) {
      break label$2
     }
     HEAP32[($1_1 + 32 | 0) >> 2] = 1;
     return;
    }
    HEAP32[($1_1 + 32 | 0) >> 2] = $3_1;
    label$6 : {
     if ((HEAP32[($1_1 + 44 | 0) >> 2] | 0 | 0) == (4 | 0)) {
      break label$6
     }
     HEAP16[($1_1 + 52 | 0) >> 1] = 0;
     $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
     FUNCTION_TABLE[HEAP32[((HEAP32[$0_1 >> 2] | 0) + 20 | 0) >> 2] | 0 | 0]($0_1, $1_1, $2_1, $2_1, 1, $4_1);
     label$7 : {
      if (!(HEAPU8[($1_1 + 53 | 0) >> 0] | 0)) {
       break label$7
      }
      HEAP32[($1_1 + 44 | 0) >> 2] = 3;
      if (!(HEAPU8[($1_1 + 52 | 0) >> 0] | 0)) {
       break label$6
      }
      break label$2;
     }
     HEAP32[($1_1 + 44 | 0) >> 2] = 4;
    }
    HEAP32[($1_1 + 20 | 0) >> 2] = $2_1;
    HEAP32[($1_1 + 40 | 0) >> 2] = (HEAP32[($1_1 + 40 | 0) >> 2] | 0) + 1 | 0;
    if ((HEAP32[($1_1 + 36 | 0) >> 2] | 0 | 0) != (1 | 0)) {
     break label$2
    }
    if ((HEAP32[($1_1 + 24 | 0) >> 2] | 0 | 0) != (2 | 0)) {
     break label$2
    }
    HEAP8[($1_1 + 54 | 0) >> 0] = 1;
    return;
   }
   $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
   FUNCTION_TABLE[HEAP32[((HEAP32[$0_1 >> 2] | 0) + 24 | 0) >> 2] | 0 | 0]($0_1, $1_1, $2_1, $3_1, $4_1);
  }
 }
 
 function $390($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, $4_1 | 0) | 0)) {
    break label$1
   }
   $388($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
   return;
  }
  label$2 : {
   if (!($375($0_1 | 0, HEAP32[$1_1 >> 2] | 0 | 0, $4_1 | 0) | 0)) {
    break label$2
   }
   label$3 : {
    label$4 : {
     if ((HEAP32[($1_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0)) {
      break label$4
     }
     if ((HEAP32[($1_1 + 20 | 0) >> 2] | 0 | 0) != ($2_1 | 0)) {
      break label$3
     }
    }
    if (($3_1 | 0) != (1 | 0)) {
     break label$2
    }
    HEAP32[($1_1 + 32 | 0) >> 2] = 1;
    return;
   }
   HEAP32[($1_1 + 20 | 0) >> 2] = $2_1;
   HEAP32[($1_1 + 32 | 0) >> 2] = $3_1;
   HEAP32[($1_1 + 40 | 0) >> 2] = (HEAP32[($1_1 + 40 | 0) >> 2] | 0) + 1 | 0;
   label$5 : {
    if ((HEAP32[($1_1 + 36 | 0) >> 2] | 0 | 0) != (1 | 0)) {
     break label$5
    }
    if ((HEAP32[($1_1 + 24 | 0) >> 2] | 0 | 0) != (2 | 0)) {
     break label$5
    }
    HEAP8[($1_1 + 54 | 0) >> 0] = 1;
   }
   HEAP32[($1_1 + 44 | 0) >> 2] = 4;
  }
 }
 
 function $391($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, $5_1 | 0) | 0)) {
    break label$1
   }
   $387($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0, $4_1 | 0);
   return;
  }
  $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
  FUNCTION_TABLE[HEAP32[((HEAP32[$0_1 >> 2] | 0) + 20 | 0) >> 2] | 0 | 0]($0_1, $1_1, $2_1, $3_1, $4_1, $5_1);
 }
 
 function $392($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  label$1 : {
   if (!($375($0_1 | 0, HEAP32[($1_1 + 8 | 0) >> 2] | 0 | 0, $5_1 | 0) | 0)) {
    break label$1
   }
   $387($1_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0, $4_1 | 0);
  }
 }
 
 function $393($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  return ($379($0_1 | 0, 4076 | 0, 4220 | 0, 0 | 0) | 0 | 0) != (0 | 0) | 0;
 }
 
 function $394($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $395($0_1) {
  $0_1 = $0_1 | 0;
  $394($0_1 | 0) | 0;
  $298($0_1 | 0);
 }
 
 function $396($0_1) {
  $0_1 = $0_1 | 0;
  return 1190 | 0;
 }
 
 function $397($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = $303($0_1 | 0) | 0;
  HEAP32[$0_1 >> 2] = 4852 + 8 | 0;
  return $0_1 | 0;
 }
 
 function $398($0_1) {
  $0_1 = $0_1 | 0;
  $394($0_1 | 0) | 0;
  $298($0_1 | 0);
 }
 
 function $399($0_1) {
  $0_1 = $0_1 | 0;
  return 1438 | 0;
 }
 
 function $400($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = $397($0_1 | 0) | 0;
  HEAP32[$0_1 >> 2] = 4872 + 8 | 0;
  return $0_1 | 0;
 }
 
 function $401($0_1) {
  $0_1 = $0_1 | 0;
  $394($0_1 | 0) | 0;
  $298($0_1 | 0);
 }
 
 function $402($0_1) {
  $0_1 = $0_1 | 0;
  return 1230 | 0;
 }
 
 function $403($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[$0_1 >> 2] = 5004 + 8 | 0;
  $404($0_1 + 4 | 0 | 0) | 0;
  return $394($0_1 | 0) | 0 | 0;
 }
 
 function $404($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  label$1 : {
   if (!($307($0_1 | 0) | 0)) {
    break label$1
   }
   $1_1 = $405(HEAP32[$0_1 >> 2] | 0 | 0) | 0;
   if (($406($1_1 + 8 | 0 | 0) | 0 | 0) > (-1 | 0)) {
    break label$1
   }
   $298($1_1 | 0);
  }
  return $0_1 | 0;
 }
 
 function $405($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 + -12 | 0 | 0;
 }
 
 function $406($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (HEAP32[$0_1 >> 2] | 0) + -1 | 0;
  HEAP32[$0_1 >> 2] = $1_1;
  return $1_1 | 0;
 }
 
 function $407($0_1) {
  $0_1 = $0_1 | 0;
  $403($0_1 | 0) | 0;
  $298($0_1 | 0);
 }
 
 function $408($0_1) {
  $0_1 = $0_1 | 0;
  return $409($0_1 + 4 | 0 | 0) | 0 | 0;
 }
 
 function $409($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[$0_1 >> 2] | 0 | 0;
 }
 
 function $410($0_1) {
  $0_1 = $0_1 | 0;
  $403($0_1 | 0) | 0;
  $298($0_1 | 0);
 }
 
 function $411($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $412($0_1) {
  $0_1 = $0_1 | 0;
  global$1 = $0_1;
 }
 
 function $413() {
  return global$1 | 0;
 }
 
 function $414() {
  return global$0 | 0;
 }
 
 function $415($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $416($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (global$0 - $0_1 | 0) & -16 | 0;
  global$0 = $1_1;
  return $1_1 | 0;
 }
 
 function $417() {
  global$3 = 5250080;
  global$2 = (7192 + 15 | 0) & -16 | 0;
 }
 
 function $418() {
  return global$0 - global$2 | 0 | 0;
 }
 
 function $419() {
  return global$3 | 0;
 }
 
 function $420() {
  return global$2 | 0;
 }
 
 function $421($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, i64toi32_i32$1 = 0, $2_1 = 0, i64toi32_i32$0 = 0, $3_1 = 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   $1_1 = 0;
   label$2 : {
    if (!(HEAP32[(0 + 5272 | 0) >> 2] | 0)) {
     break label$2
    }
    $1_1 = $421(HEAP32[(0 + 5272 | 0) >> 2] | 0 | 0) | 0;
   }
   label$3 : {
    if (!(HEAP32[(0 + 5424 | 0) >> 2] | 0)) {
     break label$3
    }
    $1_1 = $421(HEAP32[(0 + 5424 | 0) >> 2] | 0 | 0) | 0 | $1_1 | 0;
   }
   label$4 : {
    $0_1 = HEAP32[($258() | 0) >> 2] | 0;
    if (!$0_1) {
     break label$4
    }
    label$5 : while (1) {
     $2_1 = 0;
     label$6 : {
      if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
       break label$6
      }
      $2_1 = $254($0_1 | 0) | 0;
     }
     label$7 : {
      if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
       break label$7
      }
      $1_1 = $421($0_1 | 0) | 0 | $1_1 | 0;
     }
     label$8 : {
      if (!$2_1) {
       break label$8
      }
      $255($0_1 | 0);
     }
     $0_1 = HEAP32[($0_1 + 56 | 0) >> 2] | 0;
     if ($0_1) {
      continue label$5
     }
     break label$5;
    };
   }
   $259();
   return $1_1 | 0;
  }
  $2_1 = 0;
  label$9 : {
   if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
    break label$9
   }
   $2_1 = $254($0_1 | 0) | 0;
  }
  label$10 : {
   label$11 : {
    label$12 : {
     if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
      break label$12
     }
     FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
     if (HEAP32[($0_1 + 20 | 0) >> 2] | 0) {
      break label$12
     }
     $1_1 = -1;
     if ($2_1) {
      break label$11
     }
     break label$10;
    }
    label$13 : {
     $1_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
     $3_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
     if (($1_1 | 0) == ($3_1 | 0)) {
      break label$13
     }
     i64toi32_i32$1 = $1_1 - $3_1 | 0;
     i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
     i64toi32_i32$0 = FUNCTION_TABLE[HEAP32[($0_1 + 40 | 0) >> 2] | 0 | 0]($0_1, i64toi32_i32$1, i64toi32_i32$0, 1) | 0;
     i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    }
    $1_1 = 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$1;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = 0;
    HEAP32[($0_1 + 8 | 0) >> 2] = i64toi32_i32$1;
    if (!$2_1) {
     break label$10
    }
   }
   $255($0_1 | 0);
  }
  return $1_1 | 0;
 }
 
 function $422($0_1, $1_1, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$0 = FUNCTION_TABLE[$0_1 | 0]($1_1, $2_1, i64toi32_i32$0, $3_1) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $423($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $17_1 = 0, $18_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0, $9$hi = 0, $12$hi = 0, $5_1 = 0, $5$hi = 0;
  $6_1 = $0_1;
  $7_1 = $1_1;
  i64toi32_i32$0 = 0;
  $9_1 = $2_1;
  $9$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
   $17_1 = 0;
  } else {
   i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
   $17_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
  }
  $12$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $9$hi;
  i64toi32_i32$0 = $9_1;
  i64toi32_i32$2 = $12$hi;
  i64toi32_i32$3 = $17_1;
  i64toi32_i32$2 = i64toi32_i32$1 | i64toi32_i32$2 | 0;
  i64toi32_i32$2 = $422($6_1 | 0, $7_1 | 0, i64toi32_i32$0 | i64toi32_i32$3 | 0 | 0, i64toi32_i32$2 | 0, $4_1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $5_1 = i64toi32_i32$2;
  $5$hi = i64toi32_i32$0;
  i64toi32_i32$1 = i64toi32_i32$2;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$4 | 0) | 0;
  }
  $412($18_1 | 0);
  i64toi32_i32$2 = $5$hi;
  return $5_1 | 0;
 }
 
 function $424($0_1, $1_1, $2_1, $3_1, $3$hi, $4_1, $4$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  $4_1 = $4_1 | 0;
  $4$hi = $4$hi | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$3 = 0, i64toi32_i32$2 = 0, $18_1 = 0, $19_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0, $12_1 = 0, $14_1 = 0;
  $5_1 = $0_1;
  $6_1 = $1_1;
  $7_1 = $2_1;
  i64toi32_i32$0 = $3$hi;
  $9_1 = $3_1;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  $12_1 = $18_1;
  i64toi32_i32$1 = $4$hi;
  $14_1 = $4_1;
  i64toi32_i32$0 = $4_1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $19_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   $19_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
  }
  fimport$20($5_1 | 0, $6_1 | 0, $7_1 | 0, $9_1 | 0, $12_1 | 0, $14_1 | 0, $19_1 | 0);
 }
 
 function $425($0_1, $1_1, $1$hi, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $12_1 = 0, $4_1 = 0, $6_1 = 0, i64toi32_i32$2 = 0;
  $4_1 = $0_1;
  i64toi32_i32$0 = $1$hi;
  $6_1 = $1_1;
  i64toi32_i32$2 = $1_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $12_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $12_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  return fimport$21($4_1 | 0, $6_1 | 0, $12_1 | 0, $2_1 | 0, $3_1 | 0) | 0 | 0;
 }
 
 function _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, var$2 = 0, i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, var$3 = 0, var$4 = 0, var$5 = 0, $21_1 = 0, $22_1 = 0, var$6 = 0, $24_1 = 0, $17_1 = 0, $18_1 = 0, $23_1 = 0, $29_1 = 0, $45_1 = 0, $56$hi = 0, $62$hi = 0;
  i64toi32_i32$0 = var$1$hi;
  var$2 = var$1;
  var$4 = var$2 >>> 16 | 0;
  i64toi32_i32$0 = var$0$hi;
  var$3 = var$0;
  var$5 = var$3 >>> 16 | 0;
  $17_1 = Math_imul(var$4, var$5);
  $18_1 = var$2;
  i64toi32_i32$2 = var$3;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $21_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  $23_1 = $17_1 + Math_imul($18_1, $21_1) | 0;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$0 = var$1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $22_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   $22_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
  }
  $29_1 = $23_1 + Math_imul($22_1, var$3) | 0;
  var$2 = var$2 & 65535 | 0;
  var$3 = var$3 & 65535 | 0;
  var$6 = Math_imul(var$2, var$3);
  var$2 = (var$6 >>> 16 | 0) + Math_imul(var$2, var$5) | 0;
  $45_1 = $29_1 + (var$2 >>> 16 | 0) | 0;
  var$2 = (var$2 & 65535 | 0) + Math_imul(var$4, var$3) | 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$1 = $45_1 + (var$2 >>> 16 | 0) | 0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
   $24_1 = 0;
  } else {
   i64toi32_i32$0 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$1 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
   $24_1 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
  }
  $56$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  $62$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $56$hi;
  i64toi32_i32$2 = $24_1;
  i64toi32_i32$1 = $62$hi;
  i64toi32_i32$3 = var$2 << 16 | 0 | (var$6 & 65535 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
  i64toi32_i32$2 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$2 | 0;
 }
 
 function _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, i64toi32_i32$4 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$5 = 0, var$2 = 0, var$3 = 0, var$4 = 0, var$5 = 0, var$5$hi = 0, var$6 = 0, var$6$hi = 0, i64toi32_i32$6 = 0, $37_1 = 0, $38_1 = 0, $39_1 = 0, $40_1 = 0, $41_1 = 0, $42_1 = 0, $43_1 = 0, $44_1 = 0, var$8$hi = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, var$7$hi = 0, $49_1 = 0, $63$hi = 0, $65_1 = 0, $65$hi = 0, $120$hi = 0, $129$hi = 0, $134$hi = 0, var$8 = 0, $140_1 = 0, $140$hi = 0, $142$hi = 0, $144_1 = 0, $144$hi = 0, $151_1 = 0, $151$hi = 0, $154$hi = 0, var$7 = 0, $165$hi = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            label$11 : {
             i64toi32_i32$0 = var$0$hi;
             i64toi32_i32$2 = var$0;
             i64toi32_i32$1 = 0;
             i64toi32_i32$3 = 32;
             i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
             if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
              i64toi32_i32$1 = 0;
              $37_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
             } else {
              i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
              $37_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
             }
             var$2 = $37_1;
             if (var$2) {
              i64toi32_i32$1 = var$1$hi;
              var$3 = var$1;
              if (!var$3) {
               break label$11
              }
              i64toi32_i32$1 = var$1$hi;
              i64toi32_i32$0 = var$1;
              i64toi32_i32$2 = 0;
              i64toi32_i32$3 = 32;
              i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
              if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
               i64toi32_i32$2 = 0;
               $38_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
              } else {
               i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
               $38_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
              }
              var$4 = $38_1;
              if (!var$4) {
               break label$9
              }
              var$2 = Math_clz32(var$4) - Math_clz32(var$2) | 0;
              if (var$2 >>> 0 <= 31 >>> 0) {
               break label$8
              }
              break label$2;
             }
             i64toi32_i32$2 = var$1$hi;
             i64toi32_i32$1 = var$1;
             i64toi32_i32$0 = 1;
             i64toi32_i32$3 = 0;
             if (i64toi32_i32$2 >>> 0 > i64toi32_i32$0 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$0 | 0) & i64toi32_i32$1 >>> 0 >= i64toi32_i32$3 >>> 0 | 0) | 0) {
              break label$2
             }
             i64toi32_i32$1 = var$0$hi;
             var$2 = var$0;
             i64toi32_i32$1 = var$1$hi;
             var$3 = var$1;
             var$2 = (var$2 >>> 0) / (var$3 >>> 0) | 0;
             i64toi32_i32$1 = 0;
             __wasm_intrinsics_temp_i64 = var$0 - Math_imul(var$2, var$3) | 0;
             __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
             i64toi32_i32$1 = 0;
             i64toi32_i32$2 = var$2;
             i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
             return i64toi32_i32$2 | 0;
            }
            i64toi32_i32$2 = var$1$hi;
            i64toi32_i32$3 = var$1;
            i64toi32_i32$1 = 0;
            i64toi32_i32$0 = 32;
            i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
            if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
             i64toi32_i32$1 = 0;
             $39_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
            } else {
             i64toi32_i32$1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
             $39_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
            }
            var$3 = $39_1;
            i64toi32_i32$1 = var$0$hi;
            if (!var$0) {
             break label$7
            }
            if (!var$3) {
             break label$6
            }
            var$4 = var$3 + -1 | 0;
            if (var$4 & var$3 | 0) {
             break label$6
            }
            i64toi32_i32$1 = 0;
            i64toi32_i32$2 = var$4 & var$2 | 0;
            i64toi32_i32$3 = 0;
            i64toi32_i32$0 = 32;
            i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
            if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
             i64toi32_i32$3 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
             $40_1 = 0;
            } else {
             i64toi32_i32$3 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
             $40_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
            }
            $63$hi = i64toi32_i32$3;
            i64toi32_i32$3 = var$0$hi;
            i64toi32_i32$1 = var$0;
            i64toi32_i32$2 = 0;
            i64toi32_i32$0 = -1;
            i64toi32_i32$2 = i64toi32_i32$3 & i64toi32_i32$2 | 0;
            $65_1 = i64toi32_i32$1 & i64toi32_i32$0 | 0;
            $65$hi = i64toi32_i32$2;
            i64toi32_i32$2 = $63$hi;
            i64toi32_i32$3 = $40_1;
            i64toi32_i32$1 = $65$hi;
            i64toi32_i32$0 = $65_1;
            i64toi32_i32$1 = i64toi32_i32$2 | i64toi32_i32$1 | 0;
            __wasm_intrinsics_temp_i64 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
            __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
            i64toi32_i32$1 = 0;
            i64toi32_i32$3 = var$2 >>> ((__wasm_ctz_i32(var$3 | 0) | 0) & 31 | 0) | 0;
            i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
            return i64toi32_i32$3 | 0;
           }
          }
          var$4 = var$3 + -1 | 0;
          if (!(var$4 & var$3 | 0)) {
           break label$5
          }
          var$2 = (Math_clz32(var$3) + 33 | 0) - Math_clz32(var$2) | 0;
          var$3 = 0 - var$2 | 0;
          break label$3;
         }
         var$3 = 63 - var$2 | 0;
         var$2 = var$2 + 1 | 0;
         break label$3;
        }
        var$4 = (var$2 >>> 0) / (var$3 >>> 0) | 0;
        i64toi32_i32$3 = 0;
        i64toi32_i32$2 = var$2 - Math_imul(var$4, var$3) | 0;
        i64toi32_i32$1 = 0;
        i64toi32_i32$0 = 32;
        i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
        if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
         i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
         $41_1 = 0;
        } else {
         i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
         $41_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
        }
        __wasm_intrinsics_temp_i64 = $41_1;
        __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
        i64toi32_i32$1 = 0;
        i64toi32_i32$2 = var$4;
        i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
        return i64toi32_i32$2 | 0;
       }
       var$2 = Math_clz32(var$3) - Math_clz32(var$2) | 0;
       if (var$2 >>> 0 < 31 >>> 0) {
        break label$4
       }
       break label$2;
      }
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$2 = 0;
      __wasm_intrinsics_temp_i64 = var$4 & var$0 | 0;
      __wasm_intrinsics_temp_i64$hi = i64toi32_i32$2;
      if ((var$3 | 0) == (1 | 0)) {
       break label$1
      }
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$2 = 0;
      $120$hi = i64toi32_i32$2;
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$3 = var$0;
      i64toi32_i32$1 = $120$hi;
      i64toi32_i32$0 = __wasm_ctz_i32(var$3 | 0) | 0;
      i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
      if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
       i64toi32_i32$1 = 0;
       $42_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
      } else {
       i64toi32_i32$1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
       $42_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
      }
      i64toi32_i32$3 = $42_1;
      i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
      return i64toi32_i32$3 | 0;
     }
     var$3 = 63 - var$2 | 0;
     var$2 = var$2 + 1 | 0;
    }
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$3 = 0;
    $129$hi = i64toi32_i32$3;
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$2 = var$0;
    i64toi32_i32$1 = $129$hi;
    i64toi32_i32$0 = var$2 & 63 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = 0;
     $43_1 = i64toi32_i32$3 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$1 = i64toi32_i32$3 >>> i64toi32_i32$4 | 0;
     $43_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$3 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
    }
    var$5 = $43_1;
    var$5$hi = i64toi32_i32$1;
    i64toi32_i32$1 = var$0$hi;
    i64toi32_i32$1 = 0;
    $134$hi = i64toi32_i32$1;
    i64toi32_i32$1 = var$0$hi;
    i64toi32_i32$3 = var$0;
    i64toi32_i32$2 = $134$hi;
    i64toi32_i32$0 = var$3 & 63 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$3 << i64toi32_i32$4 | 0;
     $44_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$3 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
     $44_1 = i64toi32_i32$3 << i64toi32_i32$4 | 0;
    }
    var$0 = $44_1;
    var$0$hi = i64toi32_i32$2;
    label$13 : {
     if (var$2) {
      i64toi32_i32$2 = var$1$hi;
      i64toi32_i32$1 = var$1;
      i64toi32_i32$3 = -1;
      i64toi32_i32$0 = -1;
      i64toi32_i32$4 = i64toi32_i32$1 + i64toi32_i32$0 | 0;
      i64toi32_i32$5 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
      if (i64toi32_i32$4 >>> 0 < i64toi32_i32$0 >>> 0) {
       i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
      }
      var$8 = i64toi32_i32$4;
      var$8$hi = i64toi32_i32$5;
      label$15 : while (1) {
       i64toi32_i32$5 = var$5$hi;
       i64toi32_i32$2 = var$5;
       i64toi32_i32$1 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$3 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
        $45_1 = 0;
       } else {
        i64toi32_i32$1 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$5 << i64toi32_i32$3 | 0) | 0;
        $45_1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
       }
       $140_1 = $45_1;
       $140$hi = i64toi32_i32$1;
       i64toi32_i32$1 = var$0$hi;
       i64toi32_i32$5 = var$0;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 63;
       i64toi32_i32$3 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = 0;
        $46_1 = i64toi32_i32$1 >>> i64toi32_i32$3 | 0;
       } else {
        i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$3 | 0;
        $46_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$5 >>> i64toi32_i32$3 | 0) | 0;
       }
       $142$hi = i64toi32_i32$2;
       i64toi32_i32$2 = $140$hi;
       i64toi32_i32$1 = $140_1;
       i64toi32_i32$5 = $142$hi;
       i64toi32_i32$0 = $46_1;
       i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
       var$5 = i64toi32_i32$1 | i64toi32_i32$0 | 0;
       var$5$hi = i64toi32_i32$5;
       $144_1 = var$5;
       $144$hi = i64toi32_i32$5;
       i64toi32_i32$5 = var$8$hi;
       i64toi32_i32$5 = var$5$hi;
       i64toi32_i32$5 = var$8$hi;
       i64toi32_i32$2 = var$8;
       i64toi32_i32$1 = var$5$hi;
       i64toi32_i32$0 = var$5;
       i64toi32_i32$3 = i64toi32_i32$2 - i64toi32_i32$0 | 0;
       i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0;
       i64toi32_i32$4 = i64toi32_i32$6 + i64toi32_i32$1 | 0;
       i64toi32_i32$4 = i64toi32_i32$5 - i64toi32_i32$4 | 0;
       i64toi32_i32$5 = i64toi32_i32$3;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 63;
       i64toi32_i32$1 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = i64toi32_i32$4 >> 31 | 0;
        $47_1 = i64toi32_i32$4 >> i64toi32_i32$1 | 0;
       } else {
        i64toi32_i32$2 = i64toi32_i32$4 >> i64toi32_i32$1 | 0;
        $47_1 = (((1 << i64toi32_i32$1 | 0) - 1 | 0) & i64toi32_i32$4 | 0) << (32 - i64toi32_i32$1 | 0) | 0 | (i64toi32_i32$5 >>> i64toi32_i32$1 | 0) | 0;
       }
       var$6 = $47_1;
       var$6$hi = i64toi32_i32$2;
       i64toi32_i32$2 = var$1$hi;
       i64toi32_i32$2 = var$6$hi;
       i64toi32_i32$4 = var$6;
       i64toi32_i32$5 = var$1$hi;
       i64toi32_i32$0 = var$1;
       i64toi32_i32$5 = i64toi32_i32$2 & i64toi32_i32$5 | 0;
       $151_1 = i64toi32_i32$4 & i64toi32_i32$0 | 0;
       $151$hi = i64toi32_i32$5;
       i64toi32_i32$5 = $144$hi;
       i64toi32_i32$2 = $144_1;
       i64toi32_i32$4 = $151$hi;
       i64toi32_i32$0 = $151_1;
       i64toi32_i32$1 = i64toi32_i32$2 - i64toi32_i32$0 | 0;
       i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0;
       i64toi32_i32$3 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
       i64toi32_i32$3 = i64toi32_i32$5 - i64toi32_i32$3 | 0;
       var$5 = i64toi32_i32$1;
       var$5$hi = i64toi32_i32$3;
       i64toi32_i32$3 = var$0$hi;
       i64toi32_i32$5 = var$0;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
        $48_1 = 0;
       } else {
        i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
        $48_1 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
       }
       $154$hi = i64toi32_i32$2;
       i64toi32_i32$2 = var$7$hi;
       i64toi32_i32$2 = $154$hi;
       i64toi32_i32$3 = $48_1;
       i64toi32_i32$5 = var$7$hi;
       i64toi32_i32$0 = var$7;
       i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
       var$0 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
       var$0$hi = i64toi32_i32$5;
       i64toi32_i32$5 = var$6$hi;
       i64toi32_i32$2 = var$6;
       i64toi32_i32$3 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$3 = i64toi32_i32$5 & i64toi32_i32$3 | 0;
       var$6 = i64toi32_i32$2 & i64toi32_i32$0 | 0;
       var$6$hi = i64toi32_i32$3;
       var$7 = var$6;
       var$7$hi = i64toi32_i32$3;
       var$2 = var$2 + -1 | 0;
       if (var$2) {
        continue label$15
       }
       break label$15;
      };
      break label$13;
     }
    }
    i64toi32_i32$3 = var$5$hi;
    __wasm_intrinsics_temp_i64 = var$5;
    __wasm_intrinsics_temp_i64$hi = i64toi32_i32$3;
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$5 = var$0;
    i64toi32_i32$2 = 0;
    i64toi32_i32$0 = 1;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
     $49_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
     $49_1 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
    }
    $165$hi = i64toi32_i32$2;
    i64toi32_i32$2 = var$6$hi;
    i64toi32_i32$2 = $165$hi;
    i64toi32_i32$3 = $49_1;
    i64toi32_i32$5 = var$6$hi;
    i64toi32_i32$0 = var$6;
    i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$3 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
    i64toi32_i32$HIGH_BITS = i64toi32_i32$5;
    return i64toi32_i32$3 | 0;
   }
   i64toi32_i32$3 = var$0$hi;
   __wasm_intrinsics_temp_i64 = var$0;
   __wasm_intrinsics_temp_i64$hi = i64toi32_i32$3;
   i64toi32_i32$3 = 0;
   var$0 = 0;
   var$0$hi = i64toi32_i32$3;
  }
  i64toi32_i32$3 = var$0$hi;
  i64toi32_i32$5 = var$0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$3;
  return i64toi32_i32$5 | 0;
 }
 
 function __wasm_i64_mul(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_i64_udiv(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 function __wasm_ctz_i32(var$0) {
  var$0 = var$0 | 0;
  if (var$0) {
   return 31 - Math_clz32((var$0 + -1 | 0) ^ var$0 | 0) | 0 | 0
  }
  return 32 | 0;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, $60, $64, $67, $75, $1, $4, $5, $38, $6, $7, $10, $9, $90, $95, $104, $110, $117, $133, $139, $403, $394, $244, $250, $249, $251, $277, $278, $309, $311, $366, $369, $367, $368, $374, $370, $377, $371, $378, $392, $390, $381, $372, $391, $389, $382, $373, $384, $398, $399, $401, $402, $395, $396, $407, $408, $410]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "__wasm_call_ctors": $0, 
  "malloc": $287, 
  "main": $240, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "__getTypeName": $241, 
  "_embind_initialize_bindings": $242, 
  "__errno_location": $264, 
  "fflush": $421, 
  "free": $288, 
  "setTempRet0": $412, 
  "getTempRet0": $413, 
  "emscripten_stack_init": $417, 
  "emscripten_stack_get_free": $418, 
  "emscripten_stack_get_base": $419, 
  "emscripten_stack_get_end": $420, 
  "stackSave": $414, 
  "stackRestore": $415, 
  "stackAlloc": $416, 
  "__cxa_is_pointer_type": $393, 
  "dynCall_jiji": $423
 };
}

  return asmFunc(info);
}

)(asmLibraryArg);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module)
        });
        // Emulate a simple WebAssembly.instantiate(..).then(()=>{}).catch(()=>{}) syntax.
        return { catch: function() {} };
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];

// end include: wasm2js.js
if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.
/**
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 0x10FFFF) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i); // possibly a lead surrogate
    if (c <= 0x7F) {
      len++;
    } else if (c <= 0x7FF) {
      len += 2;
    } else if (c >= 0xD800 && c <= 0xDFFF) {
      len += 4; ++i;
    } else {
      len += 3;
    }
  }
  return len;
}

// end include: runtime_strings.js
// Memory management

var HEAP,
/** @type {!ArrayBuffer} */
  buffer,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536
    });
  }

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
assert(INITIAL_MEMORY % 65536 === 0);
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x2135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten at 0x' + max.toString(16) + ', expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' 0x' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function keepRuntimeAlive() {
  return noExitRuntime;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile;
  wasmBinaryFile = 'grid.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');

  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      // Warn on some common problems.
      if (isFileURI(wasmBinaryFile)) {
        err('warning: Loading from a file URI (' + wasmBinaryFile + ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing');
      }
      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(wasmBinaryFile) &&
        typeof fetch == 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        // Suppress closure warning here since the upstream definition for
        // instantiateStreaming only allows Promise<Repsponse> rather than
        // an actual Response.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
        /** @suppress {checkTypes} */
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  // Also pthreads and wasm workers initialize the wasm instance through this path.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync().catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      warnOnce('warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': return HEAP8[((ptr)>>0)];
        case 'i8': return HEAP8[((ptr)>>0)];
        case 'i16': return HEAP16[((ptr)>>1)];
        case 'i32': return HEAP32[((ptr)>>2)];
        case 'i64': return HEAP32[((ptr)>>2)];
        case 'float': return HEAPF32[((ptr)>>2)];
        case 'double': return HEAPF64[((ptr)>>3)];
        case '*': return HEAPU32[((ptr)>>2)];
        default: abort('invalid type for getValue: ' + type);
      }
      return null;
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }

  function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var chr = array[i];
      if (chr > 0xFF) {
        if (ASSERTIONS) {
          assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
        }
        chr &= 0xFF;
      }
      ret.push(String.fromCharCode(chr));
    }
    return ret.join('');
  }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only
        // populated if an Error object is thrown, so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': HEAP8[((ptr)>>0)] = value; break;
        case 'i8': HEAP8[((ptr)>>0)] = value; break;
        case 'i16': HEAP16[((ptr)>>1)] = value; break;
        case 'i32': HEAP32[((ptr)>>2)] = value; break;
        case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
        case 'float': HEAPF32[((ptr)>>2)] = value; break;
        case 'double': HEAPF64[((ptr)>>3)] = value; break;
        case '*': HEAPU32[((ptr)>>2)] = value; break;
        default: abort('invalid type for setValue: ' + type);
      }
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }

  function writeArrayToMemory(array, buffer) {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    }

  function ___cxa_allocate_exception(size) {
      // Thrown object is prepended by exception metadata block
      return _malloc(size + 24) + 24;
    }

  /** @constructor */
  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
  
      this.set_type = function(type) {
        HEAPU32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAPU32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAPU32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAPU32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[((this.ptr)>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        var value = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = value + 1;
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = prev - 1;
        assert(prev > 0);
        return prev === 1;
      };
  
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAPU32[(((this.ptr)+(16))>>2)] = adjustedPtr;
      };
  
      this.get_adjusted_ptr = function() {
        return HEAPU32[(((this.ptr)+(16))>>2)];
      };
  
      // Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
      // when the pointer is casted to some of the exception object base classes (e.g. when virtual
      // inheritance is used). When a pointer is thrown this method should return the thrown pointer
      // itself.
      this.get_exception_ptr = function() {
        // Work around a fastcomp bug, this code is still included for some reason in a build without
        // exceptions support.
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
          return HEAPU32[((this.excPtr)>>2)];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.excPtr;
      };
    }
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
    }

  function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

  function getShiftFromSize(size) {
      switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
              throw new TypeError('Unknown type size: ' + size);
      }
    }
  
  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
  var embind_charCodes = undefined;
  function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
  
  var awaitingDependencies = {};
  
  var registeredTypes = {};
  
  var typeDependencies = {};
  
  var char_0 = 48;
  
  var char_9 = 57;
  function makeLegalFunctionName(name) {
      if (undefined === name) {
        return '_unknown';
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return '_' + name;
      }
      return name;
    }
  function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      /*jshint evil:true*/
      return new Function(
          "body",
          "return function " + name + "() {\n" +
          "    \"use strict\";" +
          "    return body.apply(this, arguments);\n" +
          "};\n"
      )(body);
    }
  function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
  
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
          this.stack = this.toString() + '\n' +
              stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === undefined) {
          return this.name;
        } else {
          return this.name + ': ' + this.message;
        }
      };
  
      return errorClass;
    }
  var BindingError = undefined;
  function throwBindingError(message) {
      throw new BindingError(message);
    }
  
  var InternalError = undefined;
  function throwInternalError(message) {
      throw new InternalError(message);
    }
  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
      });
  
      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
          }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
  
      var name = registeredInstance.name;
      if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
              return;
          } else {
              throwBindingError("Cannot register type '" + name + "' twice");
          }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function(pointer) {
              // TODO: if heap is fixed (like in asm.js) this could be executed outside
              var heap;
              if (size === 1) {
                  heap = HEAP8;
              } else if (size === 2) {
                  heap = HEAP16;
              } else if (size === 4) {
                  heap = HEAP32;
              } else {
                  throw new TypeError("Unknown boolean type size: " + name);
              }
              return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    }

  function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
        return false;
      }
      if (!(other instanceof ClassHandle)) {
        return false;
      }
  
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
  
      while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
      }
  
      while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
      }
  
      return leftClass === rightClass && left === right;
    }
  
  function shallowCopyInternalPointer(o) {
      return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      };
    }
  
  function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    }
  
  var finalizationRegistry = false;
  
  function detachFinalizer(handle) {}
  
  function runDestructor($$) {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    }
  function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    }
  
  function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (undefined === desiredClass.baseClass) {
        return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    }
  
  var registeredPointers = {};
  
  function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length;
    }
  
  function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
          rv.push(registeredInstances[k]);
        }
      }
      return rv;
    }
  
  var deletionQueue = [];
  function flushPendingDeletes() {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
      }
    }
  
  var delayFunction = undefined;
  function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
    }
  function init_embind() {
      Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
      Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
      Module['flushPendingDeletes'] = flushPendingDeletes;
      Module['setDelayFunction'] = setDelayFunction;
    }
  var registeredInstances = {};
  
  function getBasestPointer(class_, ptr) {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    }
  function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    }
  
  function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
        $$: {
            value: record,
        },
      }));
    }
  function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
        // JS object has been neutered, time to repopulate it
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance['clone']();
        } else {
          // else, just increment reference count on existing object
          // it already has a reference to the smart pointer
          var rv = registeredInstance['clone']();
          this.destructor(ptr);
          return rv;
        }
      }
  
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: rawPointer,
            smartPtrType: this,
            smartPtr: ptr,
          });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr: ptr,
          });
        }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
        });
      }
    }
  function attachFinalizer(handle) {
      if ('undefined' === typeof FinalizationRegistry) {
        attachFinalizer = (handle) => handle;
        return handle;
      }
      // If the running environment has a FinalizationRegistry (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationRegistry
      // at run-time, not build-time.
      finalizationRegistry = new FinalizationRegistry((info) => {
        console.warn(info.leakWarning.stack.replace(/^Error: /, ''));
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle) => {
        var $$ = handle.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          // We should not call the destructor on raw pointers in case other code expects the pointee to live
          var info = { $$: $$ };
          // Create a warning as an Error instance in advance so that we can store
          // the current stacktrace and point to it when / if a leak is detected.
          // This is more useful than the empty stacktrace of `FinalizationRegistry`
          // callback.
          var cls = $$.ptrType.registeredClass;
          info.leakWarning = new Error("Embind found a leaked C++ instance " + cls.name + " <0x" + $$.ptr.toString(16) + ">.\n" +
          "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" +
          "Make sure to invoke .delete() manually once you're done with the instance instead.\n" +
          "Originally allocated"); // `.stack` will add "at ..." after this sentence
          if ('captureStackTrace' in Error) {
            Error.captureStackTrace(info.leakWarning, RegisteredPointer_fromWireType);
          }
          finalizationRegistry.register(handle, info, handle);
        }
        return handle;
      };
      detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
      return attachFinalizer(handle);
    }
  function ClassHandle_clone() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this;
      } else {
        var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: shallowCopyInternalPointer(this.$$),
          }
        }));
  
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone;
      }
    }
  
  function ClassHandle_delete() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError('Object already scheduled for deletion');
      }
  
      detachFinalizer(this);
      releaseClassHandle(this.$$);
  
      if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = undefined;
        this.$$.ptr = undefined;
      }
    }
  
  function ClassHandle_isDeleted() {
      return !this.$$.ptr;
    }
  
  function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError('Object already scheduled for deletion');
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
      this.$$.deleteScheduled = true;
      return this;
    }
  function init_ClassHandle() {
      ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
      ClassHandle.prototype['clone'] = ClassHandle_clone;
      ClassHandle.prototype['delete'] = ClassHandle_delete;
      ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
      ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
    }
  function ClassHandle() {
    }
  
  function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
          // TODO This check can be removed in -O3 level "unsafe" optimizations.
          if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
          }
          return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
  /** @param {number=} numArguments */
  function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
  
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
      }
      else {
        Module[name] = value;
        if (undefined !== numArguments) {
          Module[name].numArguments = numArguments;
        }
      }
    }
  
  /** @constructor */
  function RegisteredClass(name,
                               constructor,
                               instancePrototype,
                               rawDestructor,
                               baseClass,
                               getActualType,
                               upcast,
                               downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    }
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError('null is not a valid ' + this.name);
        }
  
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
  
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
          throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
  
        switch (this.sharingPolicy) {
          case 0: // NONE
            // no upcasting
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
            }
            break;
  
          case 1: // INTRUSIVE
            ptr = handle.$$.smartPtr;
            break;
  
          case 2: // BY_EMVAL
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle['clone']();
              ptr = this.rawShare(
                ptr,
                Emval.toHandle(function() {
                  clonedHandle['delete']();
                })
              );
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
  
          default:
            throwBindingError('Unsupporting sharing policy');
        }
      }
      return ptr;
    }
  
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      if (handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  function simpleReadValueFromPointer(pointer) {
      return this['fromWireType'](HEAP32[((pointer)>>2)]);
    }
  
  function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
      }
      return ptr;
    }
  
  function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
        this.rawDestructor(ptr);
      }
    }
  
  function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
        handle['delete']();
      }
    }
  function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype['argPackAdvance'] = 8;
      RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
      RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
    }
  /** @constructor
      @param {*=} pointeeType,
      @param {*=} sharingPolicy,
      @param {*=} rawGetPointee,
      @param {*=} rawConstructor,
      @param {*=} rawShare,
      @param {*=} rawDestructor,
       */
  function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
          this['toWireType'] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
      }
    }
  
  /** @param {number=} numArguments */
  function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
      }
      else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    }
  
  function dynCallLegacy(sig, ptr, args) {
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - dynCall function not found for sig \'' + sig + '\'');
      if (args && args.length) {
        // j (64-bit integer) must be passed in as two numbers [low 32, high 32].
        assert(args.length === sig.substring(1).replace(/j/g, '--').length);
      } else {
        assert(sig.length == 1);
      }
      var f = Module['dynCall_' + sig];
      return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
    }
  
  var wasmTableMirror = [];
  function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
      return func;
    }
  /** @param {Object=} args */
  function dynCall(sig, ptr, args) {
      // Without WASM_BIGINT support we cannot directly call function with i64 as
      // part of thier signature, so we rely the dynCall functions generated by
      // wasm-emscripten-finalize
      if (sig.includes('j')) {
        return dynCallLegacy(sig, ptr, args);
      }
      assert(getWasmTableEntry(ptr), 'missing table entry in dynCall: ' + ptr);
      var rtn = getWasmTableEntry(ptr).apply(null, args);
      return rtn;
    }
  function getDynCaller(sig, ptr) {
      assert(sig.includes('j') || sig.includes('p'), 'getDynCaller should only be called with i64 sigs')
      var argCache = [];
      return function() {
        argCache.length = 0;
        Object.assign(argCache, arguments);
        return dynCall(sig, ptr, argCache);
      };
    }
  function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
  
      function makeDynCaller() {
        if (signature.includes('j')) {
          return getDynCaller(signature, rawFunction);
        }
        return getWasmTableEntry(rawFunction);
      }
  
      var fp = makeDynCaller();
      if (typeof fp != "function") {
          throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
      }
      return fp;
    }
  
  var UnboundTypeError = undefined;
  
  function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
  function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
    }
  function __embind_register_class(rawType,
                                     rawPointerType,
                                     rawConstPointerType,
                                     baseClassRawType,
                                     getActualTypeSignature,
                                     getActualType,
                                     upcastSignature,
                                     upcast,
                                     downcastSignature,
                                     downcast,
                                     name,
                                     destructorSignature,
                                     rawDestructor) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast);
      }
      if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast);
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
          base = base[0];
  
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
  
          var constructor = createNamedFunction(legalFunctionName, function() {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError("Use 'new' to construct " + name);
            }
            if (undefined === registeredClass.constructor_body) {
              throw new BindingError(name + " has no accessible constructor");
            }
            var body = registeredClass.constructor_body[arguments.length];
            if (undefined === body) {
              throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
            }
            return body.apply(this, arguments);
          });
  
          var instancePrototype = Object.create(basePrototype, {
            constructor: { value: constructor },
          });
  
          constructor.prototype = instancePrototype;
  
          var registeredClass = new RegisteredClass(name,
                                                    constructor,
                                                    instancePrototype,
                                                    rawDestructor,
                                                    baseClass,
                                                    getActualType,
                                                    upcast,
                                                    downcast);
  
          var referenceConverter = new RegisteredPointer(name,
                                                         registeredClass,
                                                         true,
                                                         false,
                                                         false);
  
          var pointerConverter = new RegisteredPointer(name + '*',
                                                       registeredClass,
                                                       false,
                                                       false,
                                                       false);
  
          var constPointerConverter = new RegisteredPointer(name + ' const*',
                                                            registeredClass,
                                                            false,
                                                            true,
                                                            false);
  
          registeredPointers[rawType] = {
            pointerType: pointerConverter,
            constPointerType: constPointerConverter
          };
  
          replacePublicSymbol(legalFunctionName, constructor);
  
          return [referenceConverter, pointerConverter, constPointerConverter];
        }
      );
    }

  function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
          // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
          // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
          array.push(HEAPU32[(((firstElement)+(i * 4))>>2)]);
      }
      return array;
    }
  
  function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
  
  function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
      }
      /*
       * Previously, the following line was just:
       *   function dummy() {};
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
       * though at creation, the 'dummy' has the correct constructor name.  Thus,
       * objects created with IMVU.new would show up in the debugger as 'dummy',
       * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
       * issue.  Doublely-unfortunately, there's no way to write a test for this
       * behavior.  -NRD 2013.02.22
       */
      var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function(){});
      dummy.prototype = constructor.prototype;
      var obj = new dummy;
  
      var r = constructor.apply(obj, argumentList);
      return (r instanceof Object) ? r : obj;
    }
  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
  // TODO: This omits argument count check - enable only at -O3 or similar.
  //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
  //       return FUNCTION_TABLE[fn];
  //    }
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = false;
  
      for (var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
          needsDestructorStack = true;
          break;
        }
      }
  
      var returns = (argTypes[0].name !== "void");
  
      var argsList = "";
      var argsListWired = "";
      for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
      }
  
      var invokerFnBody =
          "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
          "if (arguments.length !== "+(argCount - 2)+") {\n" +
              "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
          "}\n";
  
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
  
      if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
      }
  
      for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
      }
  
      if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
  
      invokerFnBody +=
          (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
  
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
          var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
            args1.push(paramName+"_dtor");
            args2.push(argTypes[i].destructorFunction);
          }
        }
      }
  
      if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" +
                         "return ret;\n";
      } else {
      }
  
      invokerFnBody += "}\n";
  
      args1.push(invokerFnBody);
  
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }
  function __embind_register_class_constructor(
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = 'constructor ' + classType.name;
  
        if (undefined === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
        };
  
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          // Insert empty slot for context type (argTypes[1]).
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    }

  function __embind_register_class_function(rawClassType,
                                              methodName,
                                              argCount,
                                              rawArgTypesAddr, // [ReturnType, ThisType, Args...]
                                              invokerSignature,
                                              rawInvoker,
                                              context,
                                              isPureVirtual) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
  
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
  
        function unboundTypesHandler() {
          throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
        }
  
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
          // This is the first overload to be registered, OR we are replacing a
          // function in the base class with a function in the derived class.
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
  
          // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
          // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
          if (undefined === proto[methodName].overloadTable) {
            // Set argCount in case an overload is registered later
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
  
          return [];
        });
        return [];
      });
    }

  var emval_free_list = [];
  
  var emval_handle_array = [{},{value:undefined},{value:null},{value:true},{value:false}];
  function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
      }
    }
  
  function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          ++count;
        }
      }
      return count;
    }
  
  function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          return emval_handle_array[i];
        }
      }
      return null;
    }
  function init_emval() {
      Module['count_emval_handles'] = count_emval_handles;
      Module['get_first_emval'] = get_first_emval;
    }
  var Emval = {toValue:(handle) => {
        if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
        }
        return emval_handle_array[handle].value;
      },toHandle:(value) => {
        switch (value) {
          case undefined: return 1;
          case null: return 2;
          case true: return 3;
          case false: return 4;
          default:{
            var handle = emval_free_list.length ?
                emval_free_list.pop() :
                emval_handle_array.length;
  
            emval_handle_array[handle] = {refcount: 1, value: value};
            return handle;
          }
        }
      }};
  function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        },
        'toWireType': function(destructors, value) {
          return Emval.toHandle(value);
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: null, // This type does not need a destructor
  
        // TODO: do we need a deleteObject here?  write a test where
        // emval is passed into JS via an interface
      });
    }

  function enumReadValueFromPointer(name, shift, signed) {
      switch (shift) {
          case 0: return function(pointer) {
              var heap = signed ? HEAP8 : HEAPU8;
              return this['fromWireType'](heap[pointer]);
          };
          case 1: return function(pointer) {
              var heap = signed ? HEAP16 : HEAPU16;
              return this['fromWireType'](heap[pointer >> 1]);
          };
          case 2: return function(pointer) {
              var heap = signed ? HEAP32 : HEAPU32;
              return this['fromWireType'](heap[pointer >> 2]);
          };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }
  function __embind_register_enum(rawType, name, size, isSigned) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
  
      function ctor() {}
      ctor.values = {};
  
      registerType(rawType, {
        name: name,
        constructor: ctor,
        'fromWireType': function(c) {
          return this.constructor.values[c];
        },
        'toWireType': function(destructors, c) {
          return c.value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': enumReadValueFromPointer(name, shift, isSigned),
        destructorFunction: null,
      });
      exposePublicSymbol(name, ctor);
    }

  function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
          throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }
  function __embind_register_enum_value(rawEnumType, name, enumValue) {
      var enumType = requireRegisteredType(rawEnumType, 'enum');
      name = readLatin1String(name);
  
      var Enum = enumType.constructor;
  
      var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
      });
      Enum.values[enumValue] = Value;
      Enum[name] = Value;
    }

  function embindRepr(v) {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    }
  
  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2: return function(pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function(pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
              throw new TypeError("Unknown float type: " + name);
      }
    }
  function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
           return value;
        },
        'toWireType': function(destructors, value) {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + this.name);
          }
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': floatReadValueFromPointer(name, shift),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  function integerReadValueFromPointer(name, shift, signed) {
      // integers are quite common, so generate very specialized functions
      switch (shift) {
          case 0: return signed ?
              function readS8FromPointer(pointer) { return HEAP8[pointer]; } :
              function readU8FromPointer(pointer) { return HEAPU8[pointer]; };
          case 1: return signed ?
              function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } :
              function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; };
          case 2: return signed ?
              function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } :
              function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }
  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come
      // out as 'i32 -1'. Always treat those as max u32.
      if (maxRange === -1) {
          maxRange = 4294967295;
      }
  
      var shift = getShiftFromSize(size);
  
      var fromWireType = (value) => value;
  
      if (minRange === 0) {
          var bitshift = 32 - 8*size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
      }
  
      var isUnsignedType = (name.includes('unsigned'));
      var checkAssertions = (value, toTypeName) => {
        if (typeof value != "number" && typeof value != "boolean") {
          throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + toTypeName);
        }
        if (value < minRange || value > maxRange) {
          throw new TypeError('Passing a number "' + embindRepr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
        }
      }
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        }
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        }
      }
      registerType(primitiveType, {
        name: name,
        'fromWireType': fromWireType,
        'toWireType': toWireType,
        'argPackAdvance': 8,
        'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle]; // in elements
        var data = heap[handle + 1]; // byte offset into emscripten heap
        return new TA(buffer, data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': decodeMemoryView,
        'argPackAdvance': 8,
        'readValueFromPointer': decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    }

  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join('');
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes 4-byte alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;;
  function UTF16ToString(ptr, maxBytesToRead) {
      assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
      var endPtr = ptr;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // Also, use the length info to avoid running tiny strings through
      // TextDecoder, since .subarray() allocates garbage.
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
  
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  
      // Fallback: decode without UTF16Decoder
      var str = '';
  
      // If maxBytesToRead is not passed explicitly, it will be undefined, and the
      // for-loop's condition will always evaluate to true. The loop is then
      // terminated on the first null char.
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
        if (codeUnit == 0) break;
        // fromCharCode constructs a character from a UTF-16 code unit, so we can
        // pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
  
      return str;
    }
  
  function stringToUTF16(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF16(str) {
      return str.length*2;
    }
  
  function UTF32ToString(ptr, maxBytesToRead) {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;
  
      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (utf32 == 0) break;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
  
  function stringToUTF32(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
        }
        HEAP32[((outPtr)>>2)] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
        len += 4;
      }
  
      return len;
    }
  function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = () => HEAPU16;
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = () => HEAPU32;
        shift = 2;
      }
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
  
          var decodeStartPtr = value + 4;
          // Looping here to support possible embedded '0' bytes
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (!(typeof value == 'string')) {
            throwBindingError('Cannot pass non-string to C++ string type ' + name);
          }
  
          // assumes 4-byte alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function() {
              return undefined;
          },
          'toWireType': function(destructors, o) {
              // TODO: assert if anything else is given?
              return undefined;
          },
      });
    }

  function _abort() {
      abort('native code called abort()');
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function getHeapMax() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('Cannot enlarge memory arrays to size ' + requestedSize + ' bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ' + HEAP8.length + ', (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0');
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  var SYSCALLS = {varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      }};
  function _fd_close(fd) {
      abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    }

  function convertI32PairToI53Checked(lo, hi) {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    }
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      return 70;
    }

  var printCharBuffers = [null,[],[]];
  function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    }
  function _fd_write(fd, iov, iovcnt, pnum) {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    }

  function _proc_exit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
  /** @param {boolean|number=} implicit */
  function exitJS(status, implicit) {
      EXITSTATUS = status;
  
      checkUnflushedContent();
  
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
        readyPromiseReject(msg);
        err(msg);
      }
  
      _proc_exit(status);
    }
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
init_ClassHandle();
init_embind();;
init_RegisteredPointer();
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');;
init_emval();;
var ASSERTIONS = true;

// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob == 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var asmLibraryArg = {
  "__cxa_allocate_exception": ___cxa_allocate_exception,
  "__cxa_throw": ___cxa_throw,
  "_embind_register_bigint": __embind_register_bigint,
  "_embind_register_bool": __embind_register_bool,
  "_embind_register_class": __embind_register_class,
  "_embind_register_class_constructor": __embind_register_class_constructor,
  "_embind_register_class_function": __embind_register_class_function,
  "_embind_register_emval": __embind_register_emval,
  "_embind_register_enum": __embind_register_enum,
  "_embind_register_enum_value": __embind_register_enum_value,
  "_embind_register_float": __embind_register_float,
  "_embind_register_integer": __embind_register_integer,
  "_embind_register_memory_view": __embind_register_memory_view,
  "_embind_register_std_string": __embind_register_std_string,
  "_embind_register_std_wstring": __embind_register_std_wstring,
  "_embind_register_void": __embind_register_void,
  "abort": _abort,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_close": _fd_close,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
  "memory": wasmMemory
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc");

/** @type {function(...*):?} */
var _main = Module["_main"] = createExportWrapper("main");

/** @type {function(...*):?} */
var ___getTypeName = Module["___getTypeName"] = createExportWrapper("__getTypeName");

/** @type {function(...*):?} */
var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush");

/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free");

/** @type {function(...*):?} */
var setTempRet0 = Module["setTempRet0"] = createExportWrapper("setTempRet0");

/** @type {function(...*):?} */
var getTempRet0 = Module["getTempRet0"] = createExportWrapper("getTempRet0");

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
  return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
  return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function() {
  return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");

/** @type {function(...*):?} */
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = createExportWrapper("__cxa_is_pointer_type");

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");





// === Auto-generated postamble setup entry stuff ===

Module["addOnPostRun"] = addOnPostRun;
var unexportedRuntimeSymbols = [
  'run',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createDataFile',
  'FS_createPreloadedFile',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_unlink',
  'getLEB',
  'getFunctionTables',
  'alignFunctionTables',
  'registerFunctions',
  'prettyPrint',
  'getCompilerSetting',
  'print',
  'printErr',
  'callMain',
  'abort',
  'keepRuntimeAlive',
  'wasmMemory',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'ptrToString',
  'zeroMemory',
  'stringToNewUTF8',
  'exitJS',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'emscripten_realloc_buffer',
  'ENV',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'DNS',
  'getHostByName',
  'Protocols',
  'Sockets',
  'getRandomDevice',
  'warnOnce',
  'traverseStack',
  'UNWIND_CACHE',
  'convertPCtoSourceLocation',
  'readAsmConstArgsArray',
  'readAsmConstArgs',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'handleException',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'freeTableIndexes',
  'functionsInTableMap',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'intArrayFromString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'writeArrayToMemory',
  'writeAsciiToMemory',
  'SYSCALLS',
  'getSocketFromFD',
  'getSocketAddress',
  'JSEvents',
  'registerKeyEventCallback',
  'specialHTMLTargets',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'demangle',
  'demangleAll',
  'jsStackTrace',
  'stackTrace',
  'ExitStatus',
  'getEnvStrings',
  'checkWasiClock',
  'flush_NO_FILESYSTEM',
  'dlopenMissingError',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'exception_addRef',
  'exception_decRef',
  'Browser',
  'setMainLoop',
  'wget',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  '_setNetworkCallback',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'GL',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'AL',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'SDL',
  'SDL_gfx',
  'GLUT',
  'EGL',
  'GLFW_Window',
  'GLFW',
  'GLEW',
  'IDBStore',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'InternalError',
  'BindingError',
  'UnboundTypeError',
  'PureVirtualError',
  'init_embind',
  'throwInternalError',
  'throwBindingError',
  'throwUnboundTypeError',
  'ensureOverloadTable',
  'exposePublicSymbol',
  'replacePublicSymbol',
  'extendError',
  'createNamedFunction',
  'embindRepr',
  'registeredInstances',
  'getBasestPointer',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'getInheritedInstance',
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  'registeredTypes',
  'awaitingDependencies',
  'typeDependencies',
  'registeredPointers',
  'registerType',
  'whenDependentTypesAreResolved',
  'embind_charCodes',
  'embind_init_charCodes',
  'readLatin1String',
  'getTypeName',
  'heap32VectorToArray',
  'requireRegisteredType',
  'getShiftFromSize',
  'integerReadValueFromPointer',
  'enumReadValueFromPointer',
  'floatReadValueFromPointer',
  'simpleReadValueFromPointer',
  'runDestructors',
  'new_',
  'craftInvokerFunction',
  'embind__requireFunction',
  'tupleRegistrations',
  'structRegistrations',
  'genericPointerToWireType',
  'constNoSmartPtrRawPointerToWireType',
  'nonConstNoSmartPtrRawPointerToWireType',
  'init_RegisteredPointer',
  'RegisteredPointer',
  'RegisteredPointer_getPointee',
  'RegisteredPointer_destructor',
  'RegisteredPointer_deleteObject',
  'RegisteredPointer_fromWireType',
  'runDestructor',
  'releaseClassHandle',
  'finalizationRegistry',
  'detachFinalizer_deps',
  'detachFinalizer',
  'attachFinalizer',
  'makeClassHandle',
  'init_ClassHandle',
  'ClassHandle',
  'ClassHandle_isAliasOf',
  'throwInstanceAlreadyDeleted',
  'ClassHandle_clone',
  'ClassHandle_delete',
  'deletionQueue',
  'ClassHandle_isDeleted',
  'ClassHandle_deleteLater',
  'flushPendingDeletes',
  'delayFunction',
  'setDelayFunction',
  'RegisteredClass',
  'shallowCopyInternalPointer',
  'downcastPointer',
  'upcastPointer',
  'validateThis',
  'char_0',
  'char_9',
  'makeLegalFunctionName',
  'emval_handle_array',
  'emval_free_list',
  'emval_symbols',
  'init_emval',
  'count_emval_handles',
  'get_first_emval',
  'getStringOrSymbol',
  'Emval',
  'emval_newers',
  'craftEmvalAllocator',
  'emval_get_global',
  'emval_lookupTypes',
  'emval_allocateDestructors',
  'emval_methodCallers',
  'emval_addMethodCaller',
  'emval_registeredMethods',
];
unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);
var missingLibrarySymbols = [
  'ptrToString',
  'zeroMemory',
  'stringToNewUTF8',
  'emscripten_realloc_buffer',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'getRandomDevice',
  'traverseStack',
  'convertPCtoSourceLocation',
  'readAsmConstArgs',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayFromString',
  'AsciiToString',
  'stringToAscii',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'getSocketFromFD',
  'getSocketAddress',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'getEnvStrings',
  'checkWasiClock',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'exception_addRef',
  'exception_decRef',
  'setMainLoop',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'GLFW_Window',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'validateThis',
  'getStringOrSymbol',
  'craftEmvalAllocator',
  'emval_get_global',
  'emval_lookupTypes',
  'emval_allocateDestructors',
  'emval_addMethodCaller',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)


var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = Module['_main'];

  var argc = 0;
  var argv = 0;

  try {

    var ret = entryFunction(argc, argv);

    // In PROXY_TO_PTHREAD builds, we should never exit the runtime below, as
    // execution is asynchronously handed off to a pthread.
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();







  return Module.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Module; });
else if (typeof exports === 'object')
  exports["Module"] = Module;
