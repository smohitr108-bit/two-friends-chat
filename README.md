# Two Friends Chat — Computer + Phone

A responsive, real-time **text-only** chat website. One friend can use a computer and the other a phone. Both open the same public website URL and enter the same room code. It uses Node.js, Express and Socket.IO (WebSockets with fallback).

## What is included
- Responsive layout for desktop and mobile browsers
- Live messages, timestamps, typing indicator and online count
- Room code join; a room allows up to two connected people
- Messages are relayed live and **not saved** after they disappear/disconnect
- `/health` endpoint for hosting health checks
- Render deployment blueprint (`render.yaml`)

## Run on your own computer first
1. Install Node.js LTS from https://nodejs.org/ if it is not installed.
2. Extract the ZIP and open the `two_friends_chat` folder in VS Code.
3. In VS Code, select **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   npm start
   ```

5. Open http://localhost:3000 in your browser.
6. Enter a display name and a room code with at least 6 letters/numbers. Both people must use the same code.

`localhost` only works on the computer running the server. To chat from a phone on another network, deploy it publicly using the steps below.

## Free public hosting on Render
Render supports Node web services and Socket.IO/WebSocket connections. Its free service may sleep when idle; the first visit after sleep can take a little while to wake up. Free-plan availability and limits can change.

### A. Upload the project to GitHub
1. Create/sign in to an account at https://github.com/.
2. Create a **new private repository** (recommended), for example `two-friends-chat`.
3. Upload the contents of this project folder to the repository. Ensure `package.json`, `server.js`, `render.yaml`, and `public/index.html` are at the repository root / correct paths. Do not upload `node_modules`.
   - Easiest option: use GitHub's **Add file → Upload files** in the browser and drag in the project files, including the `public` folder and its `index.html`.

### B. Deploy to Render
1. Sign in at https://render.com/ and connect your GitHub account.
2. Choose **New + → Blueprint** if available, then select your `two-friends-chat` repository. Render reads `render.yaml`; review the service and deploy it.
3. If Blueprint is unavailable, choose **New + → Web Service**, connect the repository, and set:
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: **Free** (if offered)
4. Wait for the deploy to finish. Open the public `https://...onrender.com` URL Render provides. The `/health` path should return a small JSON response with `ok: true`.

### C. Chat between computer and phone
1. Open the public Render URL on your computer.
2. Enter your name and a long, hard-to-guess room code (at least 6 characters), then join.
3. Send your friend the **website URL and room code privately**.
4. Your friend opens the URL in their phone browser and enters their name and exactly the same room code.
5. Keep the website open while chatting. If the service has slept, wait for it to wake up and reconnect.

## Important privacy and safety notes
- The room code is a shared secret, **not a password or full security system**. Anyone who learns it may be able to join if the room is not full.
- A room allows up to two connected people, but this is not a substitute for authentication.
- Messages are not stored in a database; refreshing/reconnecting does not restore old messages.
- This starter project does not implement end-to-end encryption, user accounts, message history, or a formal security audit. Do not send passwords, addresses, private photos, or other sensitive information.
- Keep the GitHub repository private if you do not want to publish the source code. The deployed website itself is public, but joining requires the room code.

## Troubleshooting
- **Deploy fails:** check that `package.json`, `server.js`, `render.yaml`, and the `public` folder are in the repository root as shown here. Review Render's deploy logs.
- **Phone cannot connect:** use the public `https://...onrender.com` URL, not `localhost`; ensure both people use the same room code.
- **Room full:** only two connections are allowed per room. Wait for the other connection to leave or use another room code.
- **First load is slow:** the free service may have been sleeping. Wait for it to start, then reload.

## Project structure

```text
two_friends_chat/
├── public/
│   └── index.html
├── server.js
├── package.json
├── render.yaml
├── .gitignore
└── README.md
```
