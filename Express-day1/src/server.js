import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Express Server Started
=========================
Port: ${PORT}
PID: ${process.pid}
Environment: ${process.env.NODE_ENV || "development"}
URL: http://localhost:${PORT}
    `);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server...");
  server.close(() => {
    process.exit(0);
  });
});
