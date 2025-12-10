import app from "./app.js";

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`🚀 Express server started on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    debug('HTTP server closed')
  })
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('SIGINT signal received.');
  });
});