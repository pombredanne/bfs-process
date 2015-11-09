import Process = require('./process');
import TTD = require('./tty');

var process = new Process(),
  processProxy: Process = <any> {};

function defineKey(key: string) {
  if ((<any> processProxy)[key]) {
    // Probably a builtin Object property we don't care about.
    return;
  }
  if (typeof (<any> process)[key] === 'Function') {
    (<any> processProxy)[key] = function() {
      return (<Function> (<any> process)[key]).apply(process, arguments);
    };
  } else {
    (<any> processProxy)[key] = (<any> process)[key];
  }
}

for (var key in process) {
  // Don't check if process.hasOwnProperty; we want to also expose objects
  // up the prototype hierarchy.
  defineKey(key);
}

export = processProxy;
