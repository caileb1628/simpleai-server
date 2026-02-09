const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// static files
app.use(express.static(__dirname));

// Node 12 compatible body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const USERS_FILE = path.join(__dirname, "data/users.json");

// clear old users on first run
fs.writeFileSync(USERS_FILE, "[]");

// load/save helpers
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  return JSON.parse(fs.readFileSync(USERS_FILE));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// signup
app.post("/signup", (req, res) => {
  const { username, password, gender } = req.body;
  const users = loadUsers();
  if (!username || !password || !gender) return res.json({ error: "Missing fields" });
  if (users.find(u => u.username === username)) return res.json({ error: "User exists" });

  const id = Math.floor(Math.random() * 1000000);
  users.push({ 
    username, password, gender, id,
    bio: "", join: new Date().toDateString(),
    friends: [], followers: [], comments: [], posts: []
  });
  saveUsers(users);
  res.json({ ok: true });
});

// login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.json({ error: "Invalid login" });
  res.json({ ok: true, user });
});

// switch accounts (same as login)
app.post("/switch", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.json({ error: "Invalid login" });
  res.json({ ok: true, user });
});

// get all users
app.get("/users", (req, res) => {
  const users = loadUsers();
  res.json(users.map(u => ({ username: u.username, id: u.id })));
});

// add friend
app.post("/addfriend", (req, res) => {
  const { me, them } = req.body;
  const users = loadUsers();
  const a = users.find(u => u.username === me);
  const b = users.find(u => u.username === them);
  if (!a || !b) return res.json({ error: "User missing" });
  if (a.friends.indexOf(b.username) === -1) {
    a.friends.push(b.username);
    b.followers.push(a.username);
  }
  saveUsers(users);
  res.json({ ok: true });
});

// post (camera or placeholder)
app.post("/post", (req, res) => {
  const { username, image, text } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ error: "No user" });
  user.posts.push({ image: image || null, text: text || "" });
  saveUsers(users);
  res.json({ ok: true });
});

// edit bio
app.post("/editbio", (req, res) => {
  const { username, bio } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ error: "No user" });
  user.bio = bio;
  saveUsers(users);
  res.json({ ok: true });
});

// get profile
app.get("/profile/:name", (req, res) => {
  const users = loadUsers();
  const u = users.find(x => x.username === req.params.name);
  if (!u) return res.json({ error: "No user" });
  res.json(u);
});

// add comment
app.post("/comment", (req, res) => {
  const { from, to, text } = req.body;
  const users = loadUsers();
  const u = users.find(x => x.username === to);
  if (!u) return res.json({ error: "No user" });
  u.comments.push({ from, text });
  saveUsers(users);
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => console.log("IFlux server running on port " + PORT));
