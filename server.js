const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const read = f => JSON.parse(fs.readFileSync(f,"utf8"));
const list = d => fs.existsSync(d) ? fs.readdirSync(d) : [];

app.get("/", (_,res)=>res.send("ARC OK"));

app.get("/protocols", (_,res)=>res.json(list("protocols")));
app.get("/agents", (_,res)=>res.json(list("agents")));

app.get("/agent/:id", (req,res)=>{
	const f = path.join("agents", req.params.id + ".json");
	if (!fs.existsSync(f)) return res.status(404).send("NOT FOUND");
	res.json(read(f));
});

app.listen(8080, ()=>console.log("RUNNING 8080"));
