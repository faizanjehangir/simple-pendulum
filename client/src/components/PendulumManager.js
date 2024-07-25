import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mqtt from 'mqtt';

const colors = ['blue', 'red', 'green', 'purple', 'orange'];
const POLLING_INTERVAL = 2000;

const PendulumManager = () => {
  const [pendulums, setPendulums] = useState({});
  const [configs, setConfigs] = useState({});
  const [running, setRunning] = useState(false);
  const ports = [3001, 3002, 3003, 3004, 3005];
  const canvasRef = useRef(null);
  const client = useRef(null);

  useEffect(() => {
    client.current = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');
    client.current.on('message', (topic, message) => {
      if (topic === 'pendulum/stop') {
        setRunning(false);
        setTimeout(() => {
          ports.forEach(port => {
            client.current.publish('pendulum/restart', JSON.stringify({ port }));
          });
        }, 5000);
      } else if (topic === 'pendulum/restart') {
        const restartMessages = JSON.parse(localStorage.getItem('restartMessages')) || {};
        restartMessages[message] = true;
        localStorage.setItem('restartMessages', JSON.stringify(restartMessages));
        if (Object.keys(restartMessages).length === 5) {
          setRunning(true);
          localStorage.removeItem('restartMessages');
        }
      }
    });

    return () => {
      client.current.end();
    };
  }, []);

  const handleInputChange = (port, field, value) => {
    setConfigs(prevConfigs => ({
      ...prevConfigs,
      [port]: { ...prevConfigs[port], [field]: parseFloat(value) }
    }));
  };

  const handleSetup = (port) => {
    const config = configs[port] || {};
    axios.post(`http://localhost:${port}/setup`, config)
      .then(response => {
        setPendulums(prevPendulums => ({ 
          ...prevPendulums, 
          [port]: { ...config, color: colors[ports.indexOf(port)] } 
        }));
      })
      .catch(error => {
        console.error('Error setting up pendulum', error);
      });
  };

  const handleControl = (action) => {
    setRunning(action === 'start');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        ports.forEach(port => {
          axios.get(`http://localhost:${port}/coordinates`)
            .then(response => {
              setPendulums(prevPendulums => ({
                ...prevPendulums,
                [port]: { ...prevPendulums[port], coordinates: response.data }
              }));
            })
            .catch(error => {
              console.error(`Error fetching coordinates from port ${port}`, error);
            });
        });
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const originY = 20; // The horizontal line position
    const width = canvas.width;
    const segmentWidth = width / ports.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the horizontal line
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ports.forEach((port, index) => {
      const pendulum = pendulums[port];
      if (pendulum && pendulum.coordinates) {
        const originX = segmentWidth * index + segmentWidth / 2;
        const { x, y } = pendulum.coordinates;
        const canvasX = originX + x;
        const canvasY = originY + y;

        // Draw the string
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(canvasX, canvasY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Determine the size based on mass (for simplicity, we use mass as radius)
        const size = Math.max(pendulum.mass / 2, 5);

        // Draw the pendulum
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, size, 0, Math.PI * 2);
        ctx.fillStyle = pendulum.color || 'blue'; 
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [pendulums]);

  return (
    <div>
      <canvas ref={canvasRef} width="1200" height="500" />
      <div>
        <button onClick={() => handleControl('start')}>Start</button>
        <button onClick={() => handleControl('pause')}>Pause</button>
        <button onClick={() => handleControl('stop')}>Stop</button>
      </div>
      {ports.map(port => (
        <div key={port}>
          <h3>Pendulum on port {port}</h3>
          <label>
            Angle:
            <input type="number" onChange={(e) => handleInputChange(port, 'angle', e.target.value)} />
          </label>
          <label>
            Mass:
            <input type="number" onChange={(e) => handleInputChange(port, 'mass', e.target.value)} />
          </label>
          <label>
            Length:
            <input type="number" onChange={(e) => handleInputChange(port, 'length', e.target.value)} />
          </label>
          <button onClick={() => handleSetup(port)}>Setup Pendulum</button>
        </div>
      ))}
    </div>
  );
};

export default PendulumManager;
