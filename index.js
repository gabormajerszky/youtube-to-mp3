var fs = require('fs');
var https = require('https');
var express = require('express');
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

var args = process.argv.slice(2);

function getArg(args, argName) {
  var target = args.find(function (item) {
    return item.split('=')[0] === argName
  });
  if (target) {
    return target.split('=')[1];
  }
}

var DEFAULT_PRIVATE_KEY_PATH = 'keys/server.key';
var DEFAULT_CERTIFICATE_PATH = 'keys/server.cert';
var DEFAULT_PORT = 8443;

var ffmpegPath = getArg(args, 'ffmpeg');
var outputPath = getArg(args, 'out');
var password = getArg(args, 'pw');
var privateKeyPath = getArg(args, 'key') || DEFAULT_PRIVATE_KEY_PATH;
var certificatePath = getArg(args, 'cert') || DEFAULT_CERTIFICATE_PATH;
var port = getArg(args, 'port') || DEFAULT_PORT;

console.log('ffmpegPath = ' + ffmpegPath);
console.log('outputPath = ' + outputPath);
console.log('password = ' + password);
console.log('privateKeyPath = ' + privateKeyPath);
console.log('certificatePath = ' + certificatePath);
console.log('port = ' + port);

var credentials = {
  key: fs.readFileSync(privateKeyPath, 'utf8'),
  cert: fs.readFileSync(certificatePath, 'utf8')
};
var app = express();
var downloader = new YoutubeMp3Downloader({
  'ffmpegPath': ffmpegPath,
  'outputPath': outputPath,
  'youtubeVideoQuality': 'highest',
  'queueParallelism': 2,
  'progressTimeout': 2000
});

app.post('/getmp3', function (req, res) {
  let body = '';
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    let requestObject;
    try {
      requestObject = JSON.parse(body);
    } catch (e) {
      res.end('Invalid JSON');
      return;
    }
    if (requestObject.password !== password) {
      res.end('Incorrect password');
      return;
    }
    let fileName = requestObject.fileName ? requestObject.fileName + '.mp3' : undefined;
    startDownload(res, requestObject.videoId, fileName);
  });
});

function startDownload(res, videoId, fileName) {
  downloader.download(videoId, fileName);
  let downloadData = {
    videoId: videoId,
    fileName: fileName
  };
  console.log('Download started: ' + JSON.stringify(downloadData));

  downloader.on('progress', function (progressData) {
    console.log('Progress: ' + JSON.stringify(progressData));
  });

  downloader.on('finished', function (err, finishedData) {
    console.log('Download finished: ' + JSON.stringify(finishedData));
    res.end(JSON.stringify({
      status: 'success',
      data: finishedData
    }));
  });

  downloader.on('error', function (errorData) {
    console.log('Error: ' + JSON.stringify(errorData));
    res.end(JSON.stringify({
      status: 'error',
      data: errorData
    }));
  });
}

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port);
