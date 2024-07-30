import { Hono } from 'hono'
import axios from 'axios'

const app = new Hono()

async function processAuthRequest(clientId: any, cookie: any) {
    let cisdUrl = "";
    let finalCookie = {};

    await axios.request({
        url: "https://launchpad.classlink.com/oauth2/v2/auth",
        method: "GET",
        params: {
            scope: 'full,profile,oneroster',
            redirect_uri: 'https://pac.conroeisd.net/Oauth/default.asp',
            client_id: clientId,
            response_type: 'code'
        },
        headers: {
            cookie: cookie
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
    }).then((response) => {
        console.log(`[*] Received response from ClassLink: ${response.status}`);
        console.log(`[*] Loc: ${JSON.stringify(response.headers["location"])}`);
        cisdUrl = response.headers["location"];
    })

    await axios.request({
        url: cisdUrl,
        method: "GET",
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