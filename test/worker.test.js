import puppeteer from 'https://deno.land/x/puppeteer@9.0.1/mod.ts';
import { serve } from 'https://deno.land/std@0.103.0/http/server.ts';
import { readAll } from 'https://deno.land/std@0.103.0/io/util.ts';
import { assert, assertEquals } from './deps.js';

class Server {
  #next;
  #nextResolve;
  #nextReject;
  constructor() {
    this.server = serve({ port: 8082 });
    this.#next = Promise.resolve();
    this.listener = this.listen();
  }
  close() {
    return this.server.close();
  }
  async handle(requestEvent) {
    let url = new URL(requestEvent.url, 'http://example.com');
    if(url.pathname === '/result') {
      let body = new TextDecoder().decode(await readAll(requestEvent.body));
      let json = JSON.parse(body);
      await requestEvent.respond({ status: 200, body: 'OK' });
      this.#nextResolve(json.result);
    } else if(url.pathname === '/error') {
      let body = new TextDecoder().decode(await readAll(requestEvent.body));
      let json = JSON.parse(body);
      await requestEvent.respond({ status: 200 });
      this.#nextReject(json);
    } else if(url.pathname === '/favicon.ico') {
      await requestEvent.respond({ status: 404 });
    } else {
      let fileUrl = new URL('..' + url.pathname, import.meta.url);
      let fileText = await Deno.readTextFile(fileUrl);
      let bytes = new TextEncoder().encode(fileText);
      await requestEvent.respond({
        status: 200,
        headers: new Headers({
          'content-type': fileUrl.pathname.endsWith('.html') ? 'text/html' : 'application/javascript',
          'content-length': bytes.byteLength
        }),
        body: bytes
      });
    }
  }
  async listen() {
    for await (const req of this.server) {
      this.handle(req);
    }
  }
  next() {
    this.#next = new Promise((resolve, reject) => {
      this.#nextResolve = resolve;
      this.#nextReject = reject;
    });
    return this.#next;
  }
}

let browser;
async function getBrowser() {
  if(browser) return browser;
  browser = await puppeteer.launch({ headless: true });
  return browser;
}

Deno.test('Can run in a worker', async () => {
  let server = new Server();
  let browser = await getBrowser();
  let page = await browser.newPage();
  await page.goto('http://localhost:8082/test/worker.html');
  try {
    let result = await server.next();
    assertEquals(result.ok, true);
  } catch(_err) {
    assert(false, 'Got an error');
  } finally {
    await browser.close();
    await server.close();
  }
});

