const express = require("express");
const app = express();

app.get("/", (_, res) => res.send("ARC OK"));
app.get("/health", (_, res) => res.send("ARC OK"));

app.listen(8080, () => console.log("RUNNING 8080"));
