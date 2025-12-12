const { PocketBase } = require('pocketbase');
const path = require('path');

// Initialize PocketBase
const pb = new PocketBase(path.join(__dirname, 'pocketbase'));

// Start the server
console.log('Starting PocketBase on port 8090...');
pb.admins.authWithPassword('test@example.com', 'testpassword123')
  .then(() => {
    console.log('PocketBase started successfully');
    console.log('Admin auth: test@example.com / testpassword123');
  })
  .catch((err) => {
    console.log('Admin auth failed, continuing without:', err.message);
  });

pb.server.on('error', (err) => {
  console.error('Server error:', err);
});

pb.server.on('listening', () => {
  console.log('PocketBase is listening on http://localhost:8090');
});