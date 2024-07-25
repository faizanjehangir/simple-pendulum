import { spawn } from 'child_process';
import { ports } from './config.js';

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: port }
    });

    server.stdout.on('data', (data) => {
      console.log(`Server on port ${port}: ${data}`);
    });

    server.stderr.on('data', (data) => {
      console.error(`Error on port ${port}: ${data}`);
    });

    server.on('close', (code) => {
      console.log(`Server on port ${port} exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Server on port ${port} exited with code ${code}`));
      }
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
};

const startAllServers = async () => {
  try {
    const startPromises = ports.map(port => startServer(port));
    await Promise.all(startPromises);
    console.log('All servers started successfully');
  } catch (error) {
    console.error('Error starting servers:', error);
  }
};

startAllServers();
