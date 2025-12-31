const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PROTOCOLS_DIR = path.join(__dirname, "protocols");

app.get("/", (_, res) => res.send("ARC OK"));
app.get("/health", (_, res) => res.send("ARC OK"));

app.get("/protocols", (_, res) => {
	if (!fs.existsSync(PROTOCOLS_DIR)) return res.json([]);
	const files = fs.readdirSync(PROTOCOLS_DIR);
	res.json(files);
});

app.listen(8080, () => console.log("RUNNING 8080"));
