require("dotenv").config();
const express=require("express");
const fs=require("fs");
const path=require("path");
const http=require("http");
const WebSocket=require("ws");

const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const server=http.createServer(app);
const wss=new WebSocket.Server({server});

const API_KEY=process.env.ARC_KEY;
const PORT=process.env.PORT||8080;

const auth=(q,r,n)=>q.headers["x-api-key"]===API_KEY?n():r.sendStatus(401);
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const write=(f,o)=>fs.writeFileSync(f,JSON.stringify(o,null,2));
const broadcast=m=>wss.clients.forEach(c=>c.readyState===1&&c.send(JSON.stringify(m)));

app.get("/",(_,r)=>r.sendFile(path.join(__dirname,"public/index.html")));

app.get("/tasks",auth,(_,r)=>r.json(read("tasks.json")));
app.post("/task",auth,(q,r)=>{
	const tasks=read("tasks.json");
	const t={id:Date.now(),...q.body,status:"queued"};
	tasks.push(t);
	write("tasks.json",tasks);
	broadcast({event:"task_queued",task:t});
	r.json(t);
});
app.put("/task/:id",auth,(q,r)=>{
	const tasks=read("tasks.json");
	const i=tasks.findIndex(t=>t.id==q.params.id);
	if(i<0)return r.sendStatus(404);
	tasks[i]={...tasks[i],...q.body};
	write("tasks.json",tasks);
	broadcast({event:"task_updated",task:tasks[i]});
	r.json(tasks[i]);
});

wss.on("connection",ws=>ws.send(JSON.stringify({event:"connected"})));

server.listen(PORT,()=>console.log("RUNNING",PORT));
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
