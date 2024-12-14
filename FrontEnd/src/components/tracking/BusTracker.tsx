import React, { useState, useEffect } from 'react';
import BusMap from './BusMap';

interface Waypoint {
  latitude: number;
  longitude: number;
  sequence: number;
}

interface BusRoute {
  id: number;
  start: string;
  end: string;
  waypoints: Waypoint[];
}

interface Bus {
  id: number;
  coordinates: Waypoint;
  currentSequence: number;
  direction: 'forward' | 'backward';
}

const BusTracker: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);

  useEffect(() => {
    // Fetch routes from the backend
    const fetchRoutes = async () => {
      const response = await fetch('http://localhost:3000/api/routes');
      const data = await response.json();
      setRoutes(data.routes);

      // Initialize buses at the first waypoint of their route
      const initializedBuses = data.routes.map((route: BusRoute) => ({
        id: route.id,
        coordinates: route.waypoints[0],
        currentSequence: 0,
        direction: 'forward' as const
      }));

      setBuses(initializedBuses);
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    buses.forEach((bus) => {
      const route = routes.find((route) => route.id === bus.id);
      if (!route) return;

      const waypoints = route.waypoints;
      let currentSequence = bus.currentSequence;
      let direction = bus.direction;

      // Time interval for moving between waypoints
      const intervalTime = (30 * 60 * 1000) / waypoints.length;

      const interval = setInterval(() => {
        // Determine next sequence and direction
        if (direction === 'forward') {
          if (currentSequence < waypoints.length - 1) {
            currentSequence++;
          } else {
            // Change direction to backward when reaching the end
            direction = 'backward';
            currentSequence--;
          }
        } else {
          if (currentSequence > 0) {
            currentSequence--;
          } else {
            // Change direction to forward when reaching the start
            direction = 'forward';
            currentSequence++;
          }
        }

        setBuses((prevBuses) =>
          prevBuses.map((b) =>
            b.id === bus.id
              ? {
                  ...b,
                  coordinates: waypoints[currentSequence],
                  currentSequence,
                  direction
                }
              : b
          )
        );
      }, intervalTime);

      intervals.push(interval);
    });

    // Cleanup intervals
    return () => {
      intervals.forEach((id) => clearInterval(id));
    };
  }, [buses, routes]);

  return (
    <div>
      <BusMap buses={buses} />
    </div>
  );
};

export default BusTracker;