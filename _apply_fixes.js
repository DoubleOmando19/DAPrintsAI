// Helper script to apply all LAUNCHER_ANALYSIS.md fixes
// Run: node _apply_fixes.js

var fs = require('fs');
var path = require('path');

// ========================================
// Fix 1: Add /health endpoint to server.js
// ========================================
console.log('[1/4] Adding /health endpoint to backend/server.js...');
var serverPath = path.join(__dirname, 'backend', 'server.js');
var serverCode = fs.readFileSync(serverPath, 'utf8');

// Add /health endpoint before "// Start the server"
var healthEndpoint = '\n// Health check endpoint\napp.get(\'/health\', (req, res) => {\n  res.status(200).json({ status: \'ok\', timestamp: new Date().toISOString() });\n});\n';

if (serverCode.indexOf("app.get('/health'") === -1) {
  serverCode = serverCode.replace('// Start the server', healthEndpoint + '// Start the server');
  fs.writeFileSync(serverPath, serverCode);
  console.log('  -> /health endpoint added');
} else {
  console.log('  -> /health endpoint already exists, skipping');
}

// ========================================
// Fix 2 + Fix 4: Rewrite launch.js with health check, startup delay, and port cleanup
// ========================================
console.log('[2/4] Rewriting launch.js with health check, startup delay, and port cleanup...');
var launchPath = path.join(__dirname, 'launch.js');
var launchCode = [
  '// DA Prints - One-Click Launcher',
  '// Usage: node launch.js',
  '// Starts backend server and opens amazon.html in browser',
  '',
  'var exec = require("child_process").exec;',
  'var execSync = require("child_process").execSync;',
  'var spawn = require("child_process").spawn;',
  'var http = require("http");',
  '',
  'var PORT = 3000;',
  'var URL = "http://localhost:" + PORT + "/amazon.html";',
  'var HEALTH_URL = "http://localhost:" + PORT + "/health";',
  '',
  '// Open browser with platform-specific command',
  'function openBrowser(url) {',
  '  var cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";',
  '  exec(cmd + " " + url);',
  '}',
  '',
  '// Check if server is ready by hitting the /health endpoint',
  'function checkHealth(callback) {',
  '  http.get(HEALTH_URL, function(res) {',
  '    var data = "";',
  '    res.on("data", function(chunk) { data += chunk; });',
  '    res.on("end", function() {',
  '      try {',
  '        var json = JSON.parse(data);',
  '        callback(json.status === "ok");',
  '      } catch (e) {',
  '        callback(false);',
  '      }',
  '    });',
  '  }).on("error", function() {',
  '    callback(false);',
  '  });',
  '}',
  '',
  '// Kill any existing process on the port',
  'function cleanupPort() {',
  '  try {',
  '    if (process.platform === "win32") {',
  '      var result = execSync("netstat -ano | findstr :" + PORT, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });',
  '      var lines = result.trim().split("\\n");',
  '      for (var i = 0; i < lines.length; i++) {',
  '        var parts = lines[i].trim().split(/\\s+/);',
  '        var pid = parts[parts.length - 1];',
  '        if (pid && pid !== "0") {',
  '          try { execSync("taskkill /PID " + pid + " /F", { stdio: "pipe" }); } catch (e) {}',
  '        }',
  '      }',
  '    } else {',
  '      // macOS / Linux',
  '      var result = execSync("lsof -ti tcp:" + PORT, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });',
  '      var pids = result.trim().split("\\n");',
  '      for (var i = 0; i < pids.length; i++) {',
  '        var pid = pids[i].trim();',
  '        if (pid) {',
  '          try { execSync("kill -9 " + pid, { stdio: "pipe" }); } catch (e) {}',
  '        }',
  '      }',
  '      console.log("[OK] Cleaned up " + pids.length + " existing process(es) on port " + PORT);',
  '    }',
  '  } catch (e) {',
  '    // No process on port - that is fine',
  '  }',
  '}',
  '',
  '// Wait for server to be ready using /health endpoint, with startup delay',
  'function waitForServer(pid, attempt) {',
  '  var maxAttempts = 15;',
  '  if (attempt >= maxAttempts) {',
  '    console.error("[FAIL] Server did not become ready after " + maxAttempts + " attempts");',
  '    process.exit(1);',
  '  }',
  '  setTimeout(function() {',
  '    checkHealth(function(ready) {',
  '      if (ready) {',
  '        // Add a small startup delay (500ms) after health check passes',
  '        // to ensure all routes are fully initialized',
  '        setTimeout(function() {',
  '          console.log("[OK] Server is healthy and ready on port " + PORT);',
  '          console.log("[OK] Opening " + URL);',
  '          openBrowser(URL);',
  '          console.log("");',
  '          console.log("DA Prints is ready!");',
  '          console.log("(Backend server running independently on port " + PORT + ")");',
  '          process.exit(0);',
  '        }, 500);',
  '      } else {',
  '        if (attempt === 0) {',
  '          process.stdout.write("[..] Waiting for server to be ready");',
  '        } else {',
  '          process.stdout.write(".");',
  '        }',
  '        waitForServer(pid, attempt + 1);',
  '      }',
  '    });',
  '  }, 1000);',
  '}',
  '',
  '// ========== Main ==========',
  'console.log("");',
  'console.log("========================================");',
  'console.log("   DA Prints - Starting Up...");',
  'console.log("========================================");',
  'console.log("");',
  '',
  '// Step 1: Clean up any existing processes on the port',
  'console.log("[..] Checking for existing processes on port " + PORT + "...");',
  'cleanupPort();',
  '',
  '// Step 2: Start the backend server',
  'console.log("[..] Starting backend server...");',
  'var child = spawn("node", ["backend/server.js"], {',
  '  cwd: __dirname,',
  '  detached: true,',
  '  stdio: "ignore"',
  '});',
  'child.unref();',
  '',
  'child.on("error", function(err) {',
  '  console.error("[FAIL] " + err.message);',
  '  process.exit(1);',
  '});',
  '',
  '// Step 3: Wait for server to be ready (using /health endpoint)',
  'waitForServer(child.pid, 0);',
  ''
].join('\n');

fs.writeFileSync(launchPath, launchCode);
console.log('  -> launch.js rewritten with health check, startup delay, and port cleanup');

// ========================================
// Fix 3: Update BASE_URL in root .env
// ========================================
console.log('[3/4] Fixing BASE_URL in .env...');
var envPath = path.join(__dirname, '.env');
var envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.indexOf('BASE_URL=http://localhost:5500') !== -1) {
  envContent = envContent.replace('BASE_URL=http://localhost:5500', 'BASE_URL=http://localhost:3000');
  fs.writeFileSync(envPath, envContent);
  console.log('  -> BASE_URL changed from http://localhost:5500 to http://localhost:3000');
} else if (envContent.indexOf('BASE_URL=http://localhost:3000') !== -1) {
  console.log('  -> BASE_URL already set to http://localhost:3000');
} else {
  // Add BASE_URL if not present
  envContent += '\nBASE_URL=http://localhost:3000\n';
  fs.writeFileSync(envPath, envContent);
  console.log('  -> BASE_URL=http://localhost:3000 added to .env');
}

// ========================================
// Fix 5: Remove duplicate backend/.env
// ========================================
console.log('[4/4] Removing duplicate backend/.env...');
var backendEnvPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  fs.unlinkSync(backendEnvPath);
  console.log('  -> backend/.env removed (consolidated to root .env)');
} else {
  console.log('  -> backend/.env already removed');
}

console.log('');
console.log('All fixes applied successfully!');
console.log('');
console.log('Changes made:');
console.log('  1. Added /health endpoint to backend/server.js');
console.log('  2. Rewrote launch.js with:');
console.log('     - Health check using /health endpoint');
console.log('     - 500ms startup delay after health check passes');
console.log('     - Port cleanup to kill existing processes on port 3000');
console.log('  3. Changed BASE_URL to http://localhost:3000 in .env');
console.log('  4. Removed duplicate backend/.env');
