const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const list = d => fs.existsSync(d) ? fs.readdirSync(d) : [];

app.get("/", (_,res)=>res.send("ARC OK"));
app.get("/protocols", (_,res)=>res.json(list("protocols")));
app.get("/agents", (_,res)=>res.json(list("agents")));

app.listen(8080, ()=>console.log("RUNNING 8080"));
