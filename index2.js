const fs = require('fs');
const http = require('http');
const https = require('https');

/**
 * Downloads file from remote HTTP[S] host and puts its contents to the
 * specified location.
 */
async function download(url, filePath) {
  const proto = !url.charAt(4).localeCompare('s') ? https : http;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let fileInfo = null;

    const request = proto.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

    //   fileInfo = {
    //     mime: response.headers['content-type'],
    //     size: parseInt(response.headers['content-length'], 10),
    //   };

      response.pipe(file);
      resolve(file)
    });

    // The destination stream is ended by the time it's called
//    file.on('finish', () => resolve(fileInfo));

    request.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    file.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    request.end();
  });
}

(async ()=>{
    console.log(await download("https://unpkg.com/big.js@6.0.0/big.mjs","./"));
})



