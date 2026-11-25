import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import worker from '../dist/server/index.js';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const webhookBodyLimit = 64 * 1024;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > webhookBodyLimit) {
      const error = new Error('Request is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz') {
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : 'ok');
      return;
    }
    const method = req.method;
    const options = { method, headers: req.headers };
    if (method === 'POST' && url.pathname === '/max/webhook') options.body = await readBody(req);
    const response = await worker.fetch(new Request(url, options), process.env, {
      waitUntil(task) { void task.catch(error => console.error(error.message)); },
    });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const stream = Readable.fromWeb(response.body);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    const status = error.statusCode || 500;
    if (status === 500) console.error(error.message);
    res.writeHead(status).end();
  }
}).listen(port, host, () => console.log('Listening on ' + host + ':' + port));
