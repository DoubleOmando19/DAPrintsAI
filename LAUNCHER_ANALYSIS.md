# Complete Analysis: "Failed to Fetch" Error in Da Prints Launcher

## Summary of Investigation

### Files Examined:
1. launch.js - One-click launcher (73 lines)
2. start.sh - Shell wrapper --> calls node launch.js
3. Start Da Prints.command - macOS double-click wrapper --> calls node launch.js
4. package.json - scripts.start = "node launch.js"
5. backend/server.js - Express server on port 3000
6. .env (root) - Environment variables including BASE_URL=http://localhost:5500
7. backend/.env - Identical copy of root .env
8. scripts/checkout/paymentSummary.js - Frontend fetch to localhost:3000/api/create-checkout-session
9. scripts/integration.js - Frontend fetch to localhost:3000/api/session-status

### How the Launcher Works:
1. launch.js spawns §node backend/server.js§ with cwd=__dirname (project root)
2. Polls http://localhost:3000/ every 1000ms, up to 10 attempts
3. When server responds, opens browser to http://localhost:3000/amazon.html

### How Manual Start Works:
1. User runs §node backend/server.js§ from project root
2. Server starts, user manually opens browser

## ROOT CAUSES IDENTIFIED:

### Issue 1: CRITICAL - Race Condition / Timing (Primary Cause)
- launch.js opens browser as soon as server responds to HTTP GET on root URL
- Server may be "listening" but Stripe/middleware not fully initialized
- More importantly: browser opens, page loads, but user may click "Place Order" 
  before page JavaScript is fully loaded and before server is truly stable
- The checkServer only verifies static file serving works (GET /), NOT that API routes work

### Issue 2: VS Code Live Server Conflict (Port 5500)
- VS Code Live Server runs on port 5500 simultaneously
- Both .env files have BASE_URL=http://localhost:5500
- If user has been using Live Server (localhost:5500) and then uses launcher (localhost:3000),
  browser may have cached the Live Server page or have multiple tabs open
- Stripe redirect URLs use BASE_URL (port 5500), but after checkout Stripe redirects
  back to port 5500 where there's no backend API

### Issue 3: Stale Port / Zombie Processes
- If a previous server process didn't shut down cleanly, port 3000 may be occupied
- launch.js checks if server is "already running" first (lines 50-57)
- If a zombie process holds port 3000 but isn't actually functional, the launcher
  opens browser thinking server is ready, but API calls fail
- The "already running" check only does HTTP GET /, doesn't verify API health

### Issue 4: Process Lifecycle
- When launcher is run via §npm start§, npm creates a parent process
- If the user closes the terminal or npm process, the child (server) may be orphaned
- With stdio:"inherit", server output goes to launcher's terminal
- But if launcher exits (e.g., via the process.exit(0) on line 56 when server 
  is "already running"), the server continues but errors aren't visible

### Issue 5: .env and BASE_URL Misconfiguration
- BASE_URL=http://localhost:5500 in both .env files
- This was configured for VS Code Live Server workflow
- Stripe checkout success_url and cancel_url point to port 5500
- After Stripe payment, user gets redirected to localhost:5500/checkout.html
- If Live Server isn't running, this redirect fails silently
- Even with launcher, Stripe redirects to wrong port

### Issue 6: Duplicate .env Files
- Root .env and backend/.env are identical
- server.js uses require('dotenv').config() which loads from CWD
- When run via launcher (cwd=project root), it loads ROOT .env
- When run manually from backend/ dir, it would load backend/.env
- Currently identical, but could diverge and cause confusion

## WHAT WORKS AND WHY:

### Manual Start Works Because:
1. User runs §node backend/server.js§ from project root
2. dotenv loads root .env correctly
3. Server fully starts before user opens browser
4. User naturally waits for "server running" message before opening browser
5. No race condition - human introduces natural delay
6. If using Live Server on port 5500, CORS allows cross-origin fetch to port 3000

### Launcher Fails Because:
1. Browser opens programmatically as soon as server socket is listening
2. No guarantee that server-side initialization (Stripe, etc.) is complete
3. Possible port conflicts from previous sessions not cleaned up
4. BASE_URL mismatch causes post-payment redirect failures
5. No health check on API routes - only checks if static files are served

## RECOMMENDED FIXES:

### Fix 1: Add API Health Check to Launcher
Instead of checking GET /, check GET /api/session-status or add a /health endpoint

### Fix 2: Add Startup Delay
Add a small delay (500-1000ms) after server responds before opening browser

### Fix 3: Fix BASE_URL in .env
Change BASE_URL=http://localhost:3000 in both .env files

### Fix 4: Add Port Cleanup to Launcher
Kill any existing process on port 3000 before starting

### Fix 5: Consolidate .env Files
Remove backend/.env, use only root .env

### Fix 6: Add /health Endpoint to Server
Add a simple health check that verifies Stripe and all middleware are ready
