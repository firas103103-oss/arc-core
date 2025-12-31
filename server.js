const express=require("express");
const fs=require("fs");
const path=require("path");
const app=express();
app.use(express.json());

const list=d=>fs.existsSync(d)?fs.readdirSync(d):[];
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const write=(f,o)=>fs.writeFileSync(f,JSON.stringify(o,null,2));

const AGENTS="agents";
const PROTOCOLS="protocols";
const af=id=>path.join(AGENTS,id+".json");
const pf=id=>path.join(PROTOCOLS,id+".json");

app.get("/",(_,r)=>r.send("ARC OK"));

app.get("/agents",(_,r)=>r.json(list(AGENTS)));
app.get("/agent/:id",(q,r)=>fs.existsSync(af(q.params.id))?r.json(read(af(q.params.id))):r.sendStatus(404));
app.post("/agent",(q,r)=>q.body.id?(write(af(q.body.id),q.body),r.json({created:q.body.id})):r.sendStatus(400));
app.put("/agent/:id",(q,r)=>fs.existsSync(af(q.params.id))?(write(af(q.params.id),{...read(af(q.params.id)),...q.body}),r.json({updated:q.params.id})):r.sendStatus(404));
app.delete("/agent/:id",(q,r)=>fs.existsSync(af(q.params.id))?(fs.unlinkSync(af(q.params.id)),r.json({deleted:q.params.id})):r.sendStatus(404));

app.get("/protocols",(_,r)=>r.json(list(PROTOCOLS)));
app.get("/protocol/:id",(q,r)=>fs.existsSync(pf(q.params.id))?r.json(read(pf(q.params.id))):r.sendStatus(404));
app.post("/protocol",(q,r)=>q.body.id?(write(pf(q.body.id),q.body),r.json({created:q.body.id})):r.sendStatus(400));
app.put("/protocol/:id",(q,r)=>fs.existsSync(pf(q.params.id))?(write(pf(q.params.id),{...read(pf(q.params.id)),...q.body}),r.json({updated:q.params.id})):r.sendStatus(404));
app.delete("/protocol/:id",(q,r)=>fs.existsSync(pf(q.params.id))?(fs.unlinkSync(pf(q.params.id)),r.json({deleted:q.params.id})):r.sendStatus(404));

app.listen(8080);
