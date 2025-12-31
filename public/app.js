let TOKEN = "";

async function login() {
  const r = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });
  const d = await r.json();
  TOKEN = d.token;
  out.textContent = "LOGGED IN";
  load();
}

async function load() {
  const r = await fetch("/secure", {
    headers: { "Authorization": TOKEN }
  });
  out.textContent = JSON.stringify(await r.json(), null, 2);
}
