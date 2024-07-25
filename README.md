# Simple Pendulum Simulation

This project simulates a simple pendulum in 1 dimension using Node.js for the backend and React for the frontend. It allows configuring multiple pendulums with different properties and visualizes them on a web interface.

## Demo

https://github.com/user-attachments/assets/eee00555-04b5-47bd-9677-e5ae50363663

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- MQTT broker (e.g., HiveMQ, Mosquitto)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/faizanjehangir/simple-pendulum.git
cd simple-pendulum
```

### 2. Install dependencies for both the backend and frontend:

`npm install`

### 3. Build frontend

Run `npm run build` to build the client project

### 4. Start the Development Server

Run `npm run start` to concurrently start client and server processes on ports defined

### 5. Access the Application

Open your browser and navigate to http://localhost:3000 to view the application.

### 6. Troubleshooting

#### 1. Ports already in use Error:

Ensure the ports between (3000 -> 3005) are available for usage. If not, follow these steps to enable them:

Run `lsof -i tcp:{port}` to get the `pid` running on the port and kill it using `kill -9 {pid}`

#### 2. NPM Install Failures:

Ensure you have the correct version of Node.js and npm installed.

#### 3. Server Not Starting:

Check the logs for any errors and ensure all dependencies are installed.

## REST API

### Setup Pendulum

Endpoint: `/setup`
Method: `POST`
Description: Configures the pendulum with the given properties.

Request Body:
```json
{
  "angle": <initial angle in radians>,
  "mass": <mass of the pendulum>,
  "length": <length of the pendulum string>
}
```

### Get Coordinates
Endpoint: `/coordinates`
Method: `GET`
Description: Returns the current coordinates of the pendulum.

Response:
```json
{
  "x": <x-coordinate of the pendulum bob>,
  "y": <y-coordinate of the pendulum bob>
}
```

## Project Structure

- `server.js`: The main server file for handling requests and running the pendulum simulation.
- `pendulum.js`: The Pendulum class that performs physics calculations.
- `instances.js`: Script to start multiple instances of the server on different ports.
- `client/src`: Contains the React frontend application.

## Usage

- Configure each pendulum using the form in the UI. Set the angle, mass, and length for each pendulum.
- Click the "Start" button to begin the simulation.
- The pendulums will be visualized on the canvas. You can start, pause, and stop the simulation using the provided controls.
