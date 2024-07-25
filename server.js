import express from 'express';
import mqtt from 'mqtt';
import axios from 'axios';
import cors from 'cors';
import Pendulum from './pendulum.js';
import { ports, getNeighbors, areTooClose } from './config.js';

const app = express(); 
const port = process.env.PORT || 3000;
const pendulums = {};

app.use(express.json());
app.use(cors());

const client = mqtt.connect('mqtt://broker.hivemq.com');
client.on('connect', () => {
  client.subscribe('pendulum/stop');
  client.subscribe('pendulum/restart');
});

client.on('message', (topic, message) => {
  if (pendulums[port]) {
    if (topic === 'pendulum/stop') {
      pendulums[port].stop();
    } else if (topic === 'pendulum/restart') {
      pendulums[port].restart();
    }
  }
});

app.post('/setup', (req, res) => {
  const { angle, mass, length } = req.body;
  pendulums[port] = new Pendulum(angle, mass, length);
  res.json({ message: 'Pendulum set up successfully' });
});

app.get('/coordinates', (req, res) => {
  const pendulum = pendulums[port];
  if (pendulum) {
    res.json(pendulum.getCoordinates());
  } else {
    res.status(404).json({ error: 'Pendulum not found' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  setInterval(() => {
    if (pendulums[port]) {
      pendulums[port].update();
      // Check neighbors' positions
      const neighbors = getNeighbors(port);
      neighbors.forEach(neighborPort => {
        if (pendulums[neighborPort]) {
          axios.get(`http://localhost:${neighborPort}/coordinates`)
            .then(response => {
              const neighborCoordinates = response.data;
              if (areTooClose(pendulums[port].getCoordinates(), neighborCoordinates)) {
                client.publish('pendulum/stop', JSON.stringify({ port }));
              }
            })
            .catch(err => {
              // Handle error, likely because neighbor pendulum is not yet set up
              console.error(`Error fetching coordinates from neighbor on port ${neighborPort}:`, err.message);
            });
        }
      });
    }
  }, 1000);
});
