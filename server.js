require("dotenv").config();
const express=require("express");
const Database=require("better-sqlite3");

const app=express(); app.use(express.json());
const db=new Database("db/arc.db");

app.get("/",(_,r)=>r.send("ARC OK"));

app.get("/agents",(_,r)=>{
	const rows=db.prepare("SELECT id FROM agents").all();
	r.json(rows.map(x=>x.id));
});
app.post("/agent",(q,r)=>{
	db.prepare("INSERT OR REPLACE INTO agents VALUES (?,?)")
		.run(q.body.id, JSON.stringify(q.body));
	r.json({created:q.body.id});
});
app.get("/agent/:id",(q,r)=>{
	const row=db.prepare("SELECT data FROM agents WHERE id=?").get(q.params.id);
	if(!row)return r.sendStatus(404);
	r.json(JSON.parse(row.data));
});

app.listen(process.env.PORT||8080);
const express=require("express");
const fs=require("fs");
const path=require("path");
const http=require("http");
const WebSocket=require("ws");

const config=require("./config.json");
const logFile=fs.createWriteStream("./logs/arc.log",{flags:"a"});
const log=m=>logFile.write(new Date().toISOString()+" "+m+"\n");
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

app.use((q,r,n)=>{log(q.method+" "+q.url);n();});

app.get("/",(_,r)=>r.send("ARC OK"));
app.get("/agents",auth,(_,r)=>r.json(list(AGENTS)));
app.post("/agent",auth,(q,r)=>{
	if(!q.body.id)return r.sendStatus(400);
	write(af(q.body.id),q.body);
	broadcast({event:"agent_created",id:q.body.id});
	log("agent "+q.body.id+" created");
	r.json({created:q.body.id});
});
app.get("/protocols",auth,(_,r)=>r.json(list(PROTOCOLS)));

wss.on("connection",ws=>{log("ws connected");ws.send(JSON.stringify({event:"connected"}));});

server.listen(config.port,()=>log("server started"));
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
