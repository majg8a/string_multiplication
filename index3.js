const stream = require("stream");
const http = require("http");
const https = require("https");
// use Node.js Writable, otherwise load polyfill
let Writable = stream.Writable || require("readable-stream").Writable;

/* Writable memory stream */
class WMStrm extends Writable {
  memStore = Buffer.from("");
  constructor(options) {
    super();
    if (!(this instanceof WMStrm)) {
      return new WMStrm(options);
    }
    Writable.call(this, options); // init super
    WMStrm.prototype._write = function (chunk, enc, cb) {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk // already is Buffer use it
        : Buffer.isBuffer(chunk, enc); // string, convert

      // concat to the buffer already there
      this.memStore = Buffer.concat([this.memStore, buffer]);
      cb();
    };
    new Writable().end();
  }
}

async function download(url, filePath) {
  const proto = !url.charAt(4).localeCompare("s") ? https : http;
  return new Promise((resolve, reject) => {
    const file = new WMStrm();
    const request = proto.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
    });

    file.on("finish", () => resolve(file));
    request.on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });
    file.on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

// Trying our stream out
download("https://unpkg.com/big.js@6.0.0/big.mjs")
  .then((res) => {
    const Big = eval(
      res.memStore
        .toString()
        .replace("export var Big = _Big_();", "module.exports = new _Big_();")
        .replace("export default Big;", "")
    );
    console.log(
      Big("-6609384489637528847111902877988879251990047900714057985145037")
        .times(
          "-2739720780992942410992390008913829925293817433341522914.55748949182446456300417957141316443171804666458201705125"
        )
        .toFixed(60)
    );
  })
  .catch((e) => {
    console.log(e);
  });
