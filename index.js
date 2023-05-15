import createServer from '@tomphttp/bare-server-node';
import http from 'http';
import express from 'express'
import path from 'path'
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const bare =  createServer('/bare/');
const app = express().use(express.static(path.join(__dirname,'/static')))
const server = http.createServer();

app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).send('Something broke!')
})

app.get('/', (req,res) => {
	res.sendFile('/static/index.html')
})

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
		bare.routeRequest(req, res);
	} else {
		try{
			app(req,res)
		}catch( err ){
			console.error(err)
			console.error("File was not found")
		}
	}
});

server.on('upgrade', (req, socket, head) => {
	if (bare.shouldRoute(req, socket, head)) {
		bare.routeUpgrade(req, socket, head);
	}else{
		socket.end();
	}
});

server.listen({
	port: process.env.PORT || 9090,
});

