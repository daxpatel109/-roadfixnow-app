import app from './api/index.js';
import sweeper from './api/sweeper.js';

app.listen(3001, () => {
  console.log('Backend server started successfully on port 3001');
  
  // Test sweeper handler signature
  if (typeof sweeper === 'function') {
    console.log('Sweeper is a function and loaded successfully.');
  } else {
    console.error('Sweeper is not a function!');
    process.exit(1);
  }
  
  process.exit(0); // Exit successfully
});
