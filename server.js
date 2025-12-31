const express=require("express");
const fs=require("fs");
const path=require("path");
const app=express();
app.use(express.json());

const list=d=>fs.existsSync(d)?fs.readdirSync(d):[];
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const write=(f,o)=>fs.writeFileSync(f,JSON.stringify(o,null,2));
const file=id=>path.join("agents",id+".json");

app.get("/",(_,r)=>r.send("ARC OK"));
app.get("/protocols",(_,r)=>r.json(list("protocols")));
app.get("/agents",(_,r)=>r.json(list("agents")));
app.get("/agent/:id",(q,r)=>{
	if(!fs.existsSync(file(q.params.id)))return r.sendStatus(404);
	r.json(read(file(q.params.id)));
});
app.post("/agent",(q,r)=>{
	if(!q.body.id)return r.sendStatus(400);
	write(file(q.body.id),q.body);
	r.json({created:q.body.id});
});
app.put("/agent/:id",(q,r)=>{
	if(!fs.existsSync(file(q.params.id)))return r.sendStatus(404);
	write(file(q.params.id),{...read(file(q.params.id)),...q.body});
	r.json({updated:q.params.id});
});
app.delete("/agent/:id",(q,r)=>{
	if(!fs.existsSync(file(q.params.id)))return r.sendStatus(404);
	fs.unlinkSync(file(q.params.id));
	r.json({deleted:q.params.id});
});

app.listen(8080);
