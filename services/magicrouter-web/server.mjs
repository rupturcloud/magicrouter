import express from 'express';
const app = express();
const port = process.env.PORT || 8088;
const api = process.env.MAGICROUTER_API || 'http://127.0.0.1:4000';
app.use(express.json());
app.get('/health', (_req,res)=>res.json({ok:true,api}));
app.get('/', (_req,res)=>res.send(`<!doctype html><html><body style="font-family:Arial;padding:24px"><h1>MagicRouter</h1><p>Mirror UI</p><ul><li><a href='/health'>health</a></li><li>Upstream: ${api}</li></ul></body></html>`));
app.listen(port, ()=>console.log('magicrouter-web on '+port));
