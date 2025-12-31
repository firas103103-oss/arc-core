const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PROTOCOLS_DIR = path.join(__dirname, "protocols");
const AGENTS_DIR = path.join(__dirname, "agents");

app.get("/", (_, res) => res.send("ARC OK"));
app.get("/health", (_, res) => res.send("ARC OK"));

app.get("/protocols", (_, res) => {
	if (!fs.existsSync(PROTOCOLS_DIR)) return res.json([]);
	res.json(fs.readdirSync(PROTOCOLS_DIR));
});

app.get("/agents", (_, res) => {
	if (!fs.existsSync(AGENTS_DIR)) return res.json([]);
	res.json(fs.readdirSync(AGENTS_DIR));
});

app.listen(8080, () => console.log("RUNNING 8080"));
