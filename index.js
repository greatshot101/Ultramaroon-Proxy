import createServer from '@tomphttp/bare-server-node';
import http from 'http';
import express from 'express';
import path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const bare = createServer('/bare/');
const app = express().use(express.static(path.join(__dirname, '/static')));
const server = http.createServer();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.sendFile('/static/index.html', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error sending file');
    }
  });
});

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    try {
      bare.routeRequest(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error routing request');
    }
  } else {
    try {
      app(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing request');
    }
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req, socket, head)) {
    try {
      bare.routeUpgrade(req, socket, head);
    } catch (err) {
      console.error(err);
      socket.end();
    }
  } else {
    socket.end();
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(process.env.PORT || 9090, () => {
  console.log('Server is running on port', server.address().port);
});
