import stream = require('stream');

class TTY extends stream.Duplex {
  public isRaw: boolean = false;
  public columns: number = 80;
  public rows: number = 120;
  public isTTY: boolean = true;
  private _bufferedWrites: Buffer[] = [];

  constructor() {
    super();
  }

  /**
   * Toggle raw mode.
   */
  public setRawMode(mode: boolean): void {
    if (this.isRaw !== mode) {
      this.isRaw = mode;
      // [BFS] TTY implementations can use this to change their event emitting
      //       patterns.
      this.emit('modeChange');
    }
  }

  /**
   * [BFS] Update the number of columns available on the terminal.
   */
  public changeColumns(columns: number): void {
    if (columns !== this.columns) {
      this.columns = columns;
      // Resize event.
      this.emit('resize');
    }
  }

  /**
   * [BFS] Update the number of rows available on the terminal.
   */
  public changeRows(rows: number): void {
    if (rows !== this.rows) {
      this.rows = rows;
      // Resize event.
      this.emit('resize');
    }
  }

  /**
   * Returns 'true' if the given object is a TTY.
   */
  public static isatty(fd: any): fd is TTY {
    return fd && fd instanceof TTY;
  }

  public _write(chunk: any, encoding: string, cb: Function): void {
    var error: any;
    try {
      var data: Buffer;
      if (typeof(chunk) === 'string') {
        data = new Buffer(chunk, encoding);
      } else {
        data = chunk;
      }
      this._bufferedWrites.push(data);
    } catch (e) {
      error = e;
    } finally {
      cb(error);
    }
  }

  public _read(size: number): void {
    // Size is advisory -- we can ignore it.
    var i: number;
    for (i = 0; i < this._bufferedWrites.length; i++) {
      if (!this.push(this._bufferedWrites[i])) {
        break;
      }
    }
    this._bufferedWrites = this._bufferedWrites.slice(i + 1);
  }
}

export = TTY;
