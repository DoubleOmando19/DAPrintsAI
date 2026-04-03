// DA Prints - One-Click Launcher
// Usage: node launch.js
// Starts backend server and opens amazon.html in browser

var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var http = require("http");

var PORT = 3000;
var URL = "http://localhost:" + PORT + "/amazon.html";

function openBrowser(url) {
  var p = process.platform;
  if (p === "darwin") exec("open " + url);
  else if (p === "win32") exec("start " + url);
  else exec("xdg-open " + url);
}

function checkServer(cb) {
  var req = http.get("http://localhost:" + PORT + "/", function(res) {
    res.resume();
    cb(true);
  });
  req.on("error", function() { cb(false); });
  req.setTimeout(2000, function() { req.destroy(); cb(false); });
}

function waitForServer(pid, attempts) {
  if (attempts > 10) {
    console.log("[FAIL] Server did not start in time.");
    process.exit(1);
  }
  checkServer(function(running) {
    if (running) {
      console.log("[OK] Server started on port " + PORT);
      console.log("[OK] Opening " + URL);
      console.log("");
      console.log("DA Prints is ready!");
      console.log("Press Ctrl+C to stop the server...");
      openBrowser(URL);
    } else {
      setTimeout(function() { waitForServer(pid, attempts + 1); }, 1000);
    }
  });
}

console.log("============================================");
console.log("  DA Prints - Starting Up...");
console.log("============================================");

checkServer(function(running) {
  if (running) {
    console.log("[OK] Server already running on port " + PORT);
    openBrowser(URL);
    console.log("DA Prints is ready!");
    process.exit(0);
  }
  console.log("[..] Starting backend server...");
  var child = spawn("node", ["backend/server.js"], {
    cwd: __dirname,
    stdio: "inherit"
  });
  child.on("error", function(err) {
    console.error("[FAIL] " + err.message);
    process.exit(1);
  });
  process.on("SIGINT", function() {
    console.log("Shutting down...");
    child.kill();
    process.exit(0);
  });
  waitForServer(child.pid, 0);
});
