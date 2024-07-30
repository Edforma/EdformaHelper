import { Hono } from 'hono'
import axios from 'axios'

import { SocksProxyAgent } from 'socks-proxy-agent';
const app = new Hono()
const agent = new SocksProxyAgent("socks5://localhost:1055/");

const axiosInstance = axios.create({
    httpAgent: agent,
    httpsAgent: agent
})
async function processAuthRequest(clientId: any, cookie: any) {
    let cisdUrl = "";
    let finalCookie = {};

    await axiosInstance.request({
        url: "https://launchpad.classlink.com/oauth2/v2/auth",
        method: "GET",
        params: {
            scope: 'full,profile,oneroster',
            redirect_uri: 'https://pac.conroeisd.net/Oauth/default.asp',
            client_id: clientId,
            response_type: 'code'
        },
        headers: {
            cookie: cookie,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
    }).then((response) => {
        console.log(`[*] Received response from ClassLink: ${response.status}`);
        console.log(`[*] Loc: ${JSON.stringify(response.headers["location"])}`);
        cisdUrl = response.headers["location"];
    })

    await axiosInstance.request({
        url: cisdUrl,
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
    }).then((response) => {
        console.log(`[*] Received response from CISD: ${response.status}`);
        console.log(`[*] Loc: ${JSON.stringify(response.headers["location"])}`);
        console.log(`[*] Cookies: ${JSON.stringify(response.headers["set-cookie"])}`);
        finalCookie = response.headers["set-cookie"];
    })

    return {
        finalCookie: finalCookie,
    }
}

app.get('/auth', async (c) => {
    const clientId = c.req.query('clientId')
    const cookie = c.req.query('cookie')

    console.log(`[*] Received request with clientId: ${clientId} and cookie: ${cookie}`);

    const result = await processAuthRequest(clientId, cookie);

    return c.json(result)
})

export default app