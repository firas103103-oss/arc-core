const express=require("express");
const fs=require("fs");
const path=require("path");
const http=require("http");
const WebSocket=require("ws");

const API_KEY=process.env.ARC_KEY || "arc-secret";

const app=express();
app.use(express.json());
const server=http.createServer(app);
const wss=new WebSocket.Server({server});

const auth=(q,r,n)=>q.headers["x-api-key"]===API_KEY?n():r.sendStatus(401);

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
app.put("/agent/:id",auth,(q,r)=>{
	if(!fs.existsSync(af(q.params.id)))return r.sendStatus(404);
	write(af(q.params.id),{...read(af(q.params.id)),...q.body});
	broadcast({event:"agent_updated",id:q.params.id});
	r.json({updated:q.params.id});
});
app.delete("/agent/:id",auth,(q,r)=>{
	if(!fs.existsSync(af(q.params.id)))return r.sendStatus(404);
	fs.unlinkSync(af(q.params.id));
	broadcast({event:"agent_deleted",id:q.params.id});
	r.json({deleted:q.params.id});
});

app.get("/protocols",auth,(_,r)=>r.json(list(PROTOCOLS)));
app.post("/protocol",auth,(q,r)=>{
	if(!q.body.id)return r.sendStatus(400);
	write(pf(q.body.id),q.body);
	broadcast({event:"protocol_created",id:q.body.id});
	r.json({created:q.body.id});
});

wss.on("connection",ws=>ws.send(JSON.stringify({event:"connected"})));

server.listen(8080);
