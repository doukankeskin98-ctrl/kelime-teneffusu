// Local, deterministic guest and catalogue responses for the 53-window visual suite.
// Usage: node --experimental-strip-types scripts/visual/menu-fixture-server.mjs <web assets> <port>
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve, sep, extname} from 'node:path';
import {releaseCatalogue} from '../../lib/studio/releases.ts';

const directory = resolve(process.argv[2] || 'dist-mobile');
const port = Number(process.argv[3] || 5385);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css',
  '.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json',
  '.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpeg':'image/jpeg','.mp3':'audio/mpeg'};

function json(response, status, value) {
  response.writeHead(status, {'content-type':'application/json','cache-control':'no-store'});
  response.end(JSON.stringify(value));
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET' && url.pathname === '/api/game' && !url.search) {
      return json(response, 200, {authenticated:false});
    }
    if (request.method === 'GET' && url.pathname === '/api/chapters' && url.searchParams.get('collection') === 'releases') {
      return json(response, 200, releaseCatalogue(Number(url.searchParams.get('offset')), undefined, url.searchParams.get('theme') || undefined));
    }
    // The original scenarios explicitly include retrying the daily ranking list.
    return json(response, 503, {error:'Yerel testte hizmete ulaşılamadı.'});
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, {});
  try {
    const file = resolve(directory, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(directory + sep) || !(await stat(file)).isFile()) return json(response, 404, {});
    response.writeHead(200, {'content-type':mime[extname(file)] || 'application/octet-stream'});
    if (request.method === 'HEAD') return response.end();
    const stream=createReadStream(file);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch {
    json(response, 404, {});
  }
}).listen(port, '127.0.0.1', () => console.log('Yerel ekran ölçümü http://127.0.0.1:' + port));
