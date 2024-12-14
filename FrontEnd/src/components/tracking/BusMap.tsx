import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';

interface Waypoint {
  latitude: number;
  longitude: number;
}

interface Bus {
  id: number;
  coordinates: Waypoint;
}

interface BusMapProps {
  buses: Bus[]; // Array of buses
}

const BusMap: React.FC<BusMapProps> = ({ buses }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Point>> | null>(null);
  const busIconUrl = 'images/redbusicon.png';

  useEffect(() => {
    if (mapRef.current) {
      // Initialize vector source only once
      vectorSourceRef.current = new VectorSource<Feature<Point>>();

      // Initialize map only once
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: vectorSourceRef.current,
            style: new Style({
              image: new Icon({
                src: busIconUrl,
                scale: 0.1,
              }),
            }),
          }),
        ],
        // Set initial view to the first bus's coordinates
        view: new View({
          center: fromLonLat([
            buses[0]?.coordinates.longitude || 0,
            buses[0]?.coordinates.latitude || 0,
          ]),
          zoom: 15,
        }),
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
      }
    };
  }, []); 

  useEffect(() => {
    // Update bus markers whenever buses change
    if (vectorSourceRef.current) {
      // Clear existing features
      vectorSourceRef.current.clear();
  
      // Add a feature for each bus
      buses.forEach((bus) => {
        const feature = new Feature({
          geometry: new Point(
            fromLonLat([bus.coordinates.longitude, bus.coordinates.latitude])
          ),
        });
        // Add feature only if vectorSourceRef.current is not null
        vectorSourceRef.current?.addFeature(feature);
      });
    }
  }, [buses]);

  return (
    <div
      ref={mapRef}
      style={{ height: '400px', width: '100%' }}
    />
  );
};

export default BusMap;