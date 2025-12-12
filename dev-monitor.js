const { exec } = require('child_process');
const http = require('http');

// Service configurations
const services = {
  pocketbase: {
    url: 'http://localhost:8090/api/health',
    name: 'PocketBase Database',
    expectedStatus: 200
  },
  sveltekit: {
    url: 'http://localhost:5176',
    name: 'SvelteKit Frontend',
    expectedStatus: 200
  }
};

// Function to check service health
function checkService(service) {
  return new Promise((resolve) => {
    const req = http.request(service.url, { timeout: 5000 }, (res) => {
      const status = res.statusCode === service.expectedStatus;
      resolve({
        name: service.name,
        status: status ? 'UP' : 'DOWN',
        statusCode: res.statusCode,
        url: service.url
      });
    });

    req.on('error', () => {
      resolve({
        name: service.name,
        status: 'DOWN',
        error: 'Connection failed',
        url: service.url
      });
    });

    req.on('timeout', () => {
      resolve({
        name: service.name,
        status: 'TIMEOUT',
        error: 'Request timed out',
        url: service.url
      });
      req.destroy();
    });

    req.end();
  });
}

// Function to display status
function displayStatus(results) {
  console.clear();
  console.log('🚀 QCS Cargo Development Environment Status');
  console.log('='.repeat(60));

  const allUp = results.every(r => r.status === 'UP');

  results.forEach(result => {
    const statusEmoji = result.status === 'UP' ? '✅' : '❌';
    console.log(`${statusEmoji} ${result.name}: ${result.status}`);

    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log(`   URL: ${result.url}`);
    console.log('');
  });

  if (allUp) {
    console.log('🎉 All services are running smoothly!');
  } else {
    console.log('⚠️  Some services need attention.');
  }

  console.log('='.repeat(60));
  console.log(`Last checked: ${new Date().toLocaleTimeString()}`);
}

// Main monitoring function
async function monitorServices() {
  try {
    const promises = services.map(service => checkService(service));
    const results = await Promise.all(promises);
    displayStatus(results);
  } catch (error) {
    console.error('Error monitoring services:', error);
  }
}

// Check every 5 seconds
console.log('Starting development environment monitoring...');
setInterval(monitorServices, 5000);

// Initial check
monitorServices();

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nStopping monitoring...');
  process.exit(0);
});