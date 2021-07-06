import fetch, { Response } from 'node-fetch';
import ProxyAgent from 'proxy-agent';

function proxyFetch(url: string, options: any, useProxy: boolean = true): Promise<Response> {
  const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (useProxy && proxy) {
    const proxyAgent = new ProxyAgent(proxy);
    options.agent = proxyAgent;
    return fetch(url, options);
  } else {
    return fetch(url, options);
  }
}

export default proxyFetch;