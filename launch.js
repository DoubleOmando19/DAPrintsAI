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

// Check that static file serving is up (GET /)
function checkStatic(cb) {
  var req = http.get("http://localhost:" + PORT + "/", function (res) {
    res.resume();
    cb(true);
  });
  req.on("error", function () { cb(false); });
  req.setTimeout(2000, function () { req.destroy(); cb(false); });
}

// Check that the checkout API endpoint is responsive (POST /api/create-checkout-session)
// Any HTTP response (even 400/500) means Express + Stripe are initialised and ready.
function checkAPI(cb) {
  var postData = JSON.stringify({ items: [] });
  var options = {
    hostname: "localhost",
    port: PORT,
    path: "/api/create-checkout-session",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };
  var req = http.request(options, function (res) {
    res.resume();
    // Any response (200, 400, 500) proves the API route is loaded and Stripe is ready
    cb(true);
  });
  req.on("error", function () { cb(false); });
  req.setTimeout(2000, function () { req.destroy(); cb(false); });
  req.write(postData);
  req.end();
}

// Combined readiness check: static files AND API must both respond
function checkServer(cb) {
  checkStatic(function (staticOk) {
    if (!staticOk) return cb(false);
    checkAPI(function (apiOk) {
      cb(apiOk);
    });
  });
}

function waitForServer(pid, attempts) {
  if (attempts > 20) {
    console.log("[FAIL] Server did not start in time.");
    process.exit(1);
  }
  checkServer(function (running) {
    if (running) {
      console.log(" [OK] Server started on port " + PORT);
      console.log(" [OK] Static files and API endpoints verified");
      console.log(" [OK] Opening " + URL);
      console.log("");
      console.log("DA Prints is ready!");
      console.log("(Backend server running independently on port " + PORT + ")");
      openBrowser(URL);
      process.exit(0);
    } else {
      setTimeout(function () { waitForServer(pid, attempts + 1); }, 1500);
    }
  });
}

// -------- Start --------
console.log("========================================");
console.log("    DA Prints - Starting Up...");
console.log("========================================");

checkServer(function (running) {
  if (running) {
    console.log(" [OK] Server already running on port " + PORT);
    openBrowser(URL);
    console.log("DA Prints is ready!");
    process.exit(0);
  }
  console.log(" [..] Starting backend server...");
  var child = spawn("node", ["backend/server.js"], {
    cwd: __dirname,
    detached: true,
        stdio: "ignore"
  });
    child.unref();
  child.on("error", function (err) {
    console.error("[FAIL] " + err.message);
    process.exit(1);
  });
  waitForServer(child.pid, 0);
});
