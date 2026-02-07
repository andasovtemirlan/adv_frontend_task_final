const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Bind the authentication middleware to the app
server.db = router.db;

// Enable default middlewares (logger, static, cors, etc.)
server.use(middlewares);

// Enable json-server-auth
server.use(auth);

// Use the router
server.use(router);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log('Authentication endpoints:');
  console.log(`  POST http://localhost:${PORT}/login`);
  console.log(`  POST http://localhost:${PORT}/register`);
  console.log('\nTest credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
});
