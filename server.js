const express=require("express");
const fs=require("fs");
const path=require("path");
const app=express();
const list=d=>fs.existsSync(d)?fs.readdirSync(d):[];
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));

app.get("/",(_,r)=>r.send("ARC OK"));
app.get("/protocols",(_,r)=>r.json(list("protocols")));
app.get("/agents",(_,r)=>r.json(list("agents")));
app.get("/agent/:id",(q,r)=>{
	const f=path.join("agents",q.params.id+".json");
	if(!fs.existsSync(f))return r.sendStatus(404);
	r.json(read(f));
});

app.listen(8080);
