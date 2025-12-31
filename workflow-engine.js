const Database = require("better-sqlite3");
const db = new Database("db/arc.db");

const readJSON = (s) => JSON.parse(s);
const write = (sql, params) => db.prepare(sql).run(params);
const get = (sql, params) => db.prepare(sql).get(params);

const ACTIONS = {
  noop: async () => true,
  wait: async (ctx) => new Promise(r => setTimeout(r, ctx.ms || 1000)),
  log: async (ctx) => { console.log("WF:", ctx); return true; }
};

setInterval(async () => {
  const wf = get("SELECT * FROM workflows WHERE state='running'", []);
  if (!wf) return;

  const def = readJSON(wf.definition);
  const step = def.steps[wf.pointer];

  if (!step) {
    write("UPDATE workflows SET state='done' WHERE id=?", [wf.id]);
    return;
  }

  if (step.condition && !step.condition === true) {
    write("UPDATE workflows SET pointer=pointer+1 WHERE id=?", [wf.id]);
    return;
  }

  try {
    const action = ACTIONS[step.action];
    if (!action) throw new Error("UNKNOWN_ACTION");
    await action(step.payload || {});
    write("UPDATE workflows SET pointer=pointer+1 WHERE id=?", [wf.id]);
  } catch (e) {
    write("UPDATE workflows SET state='failed' WHERE id=?", [wf.id]);
  }
}, 1000);
