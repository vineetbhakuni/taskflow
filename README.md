# TaskFlow – Daily Task & To-Do Tracker

TaskFlow is a beginner-friendly full-stack task manager built with React, Express, and MongoDB.

## Requirements

- Node.js 18+
- A MongoDB Atlas account (free M0 cluster is enough)

## Setup

```bash
npm install
npm --prefix server install
npm --prefix client install
```

## Connect MongoDB Atlas

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free project and an **M0** cluster.
2. In **Database Access**, create a database user. Keep this username and password separate from your Atlas login.
3. In **Network Access**, add your current IP address. For local development, Atlas can also allow `0.0.0.0/0`, but an IP-specific rule is safer.
4. Click **Connect → Drivers**, choose **Node.js**, and copy the connection string.
5. Copy the example environment file to `server/.env` and replace the placeholders:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/taskflow?retryWrites=true&w=majority&appName=TaskFlow
```

For example, if Atlas gives you a URI ending in `/<database>?retryWrites=true&w=majority`, use `taskflow` as the database name:

```env
MONGODB_URI=mongodb+srv://taskflowUser:yourEncodedPassword@cluster0.abcde.mongodb.net/taskflow?retryWrites=true&w=majority
```

If your password contains characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode it before placing it in the URI. Do not commit `server/.env`; it is ignored by Git.

Start the application:

```bash
npm run dev
```

When the connection succeeds, the server prints `TaskFlow API running on port 5000`. Open `http://localhost:5173`, create a task, and confirm it appears in Atlas under **Database → Browse Collections → taskflow → tasks**.

If Atlas rejects the connection:

- Confirm the IP address is present in **Network Access**.
- Confirm the database username/password in the URI are correct.
- Confirm the password is URL-encoded.
- Make sure the URI begins with `mongodb+srv://`.

## Local development alternative

If you later want to use a local MongoDB server, replace `MONGODB_URI` with:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
```

Start both applications:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## API

- `GET /api/tasks?status=all&search=term`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

The MongoDB connection is established before the server starts accepting requests. API errors are returned as JSON with a helpful `message`.
