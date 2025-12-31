const express=require("express");
const fs=require("fs");
const path=require("path");
const http=require("http");
const WebSocket=require("ws");

const config=require("./config.json");

const app=express();
app.use(express.json());
const server=http.createServer(app);
const wss=new WebSocket.Server({server});

const auth=(q,r,n)=>q.headers["x-api-key"]===config.apiKey?n():r.sendStatus(401);

const list=d=>fs.existsSync(d)?fs.readdirSync(d):[];
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const write=(f,o)=>fs.writeFileSync(f,JSON.stringify(o,null,2));

const AGENTS="agents", PROTOCOLS="protocols";
const af=id=>path.join(AGENTS,id+".json");
const pf=id=>path.join(PROTOCOLS,id+".json");
const broadcast=m=>wss.clients.forEach(c=>c.readyState===1&&c.send(JSON.stringify(m)));

app.get("/",(_,r)=>r.send("ARC OK"));
app.get("/agents",auth,(_,r)=>r.json(list(AGENTS)));
app.post("/agent",auth,(q,r)=>{
	if(!q.body.id)return r.sendStatus(400);
	write(af(q.body.id),q.body);
	broadcast({event:"agent_created",id:q.body.id});
	r.json({created:q.body.id});
});
app.get("/protocols",auth,(_,r)=>r.json(list(PROTOCOLS)));

wss.on("connection",ws=>ws.send(JSON.stringify({event:"connected"})));

server.listen(config.port);
