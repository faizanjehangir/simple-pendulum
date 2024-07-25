const ports = [3001, 3002, 3003, 3004, 3005];

const neighbors = {
  3001: [3002],
  3002: [3001, 3003],
  3003: [3002, 3004],
  3004: [3003, 3005],
  3005: [3004]
};

const getNeighbors = (port) => {
  return neighbors[port] || [];
};

const areTooClose = (coords1, coords2) => {
  const distance = Math.sqrt(Math.pow(coords1.x - coords2.x, 2) + Math.pow(coords1.y - coords2.y, 2));
  return distance < 50; // Threshold distance
};

export { ports, getNeighbors, areTooClose };
