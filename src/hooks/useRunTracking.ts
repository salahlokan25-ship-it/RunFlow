import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { GPSPoint, Split } from '../types';
import { calculateDistance } from '../utils/distance';
import { calculateElevation } from '../utils/elevation';

export const useRunTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRunPoints, setCurrentRunPoints] = useState<GPSPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [splits, setSplits] = useState<Split[]>([]);
  const [elevationGain, setElevationGain] = useState(0);
  const [elevationLoss, setElevationLoss] = useState(0);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastSplitDistanceRef = useRef<number>(0);
  const lowSpeedCountRef = useRef<number>(0);

  // Continuous location tracking for blue dot
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      
      // Get initial position quickly
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      // Continuously watch position even when not "tracking" a run
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setCurrentLocation(loc);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setCurrentRunPoints([]);
    setDistance(0);
    setDuration(0);
    setSplits([]);
    setElevationGain(0);
    setElevationLoss(0);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    lastSplitDistanceRef.current = 0;
    lowSpeedCountRef.current = 0;

    // We use a separate subscription for run tracking logic if needed, 
    // or we could hook into the existing one. For simplicity and separation, 
    // we'll start a dedicated high-accuracy tracker for the run data.
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        // We don't need to set current location here as the effect above handles it for UI
        // But we might want to ensure it's perfectly synced
        setCurrentLocation(location);
        
        const newPoint: GPSPoint = {
          timestamp: location.timestamp,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
        };
        
        // Auto-pause logic
        const speed = location.coords.speed || 0;
        if (speed < 0.5) { // Less than 0.5 m/s (1.8 km/h)
          lowSpeedCountRef.current += 1;
          if (lowSpeedCountRef.current >= 5 && !isPaused) {
            setIsPaused(true);
          }
        } else {
          lowSpeedCountRef.current = 0;
          if (isPaused) {
            setIsPaused(false);
          }
        }
        
        setCurrentRunPoints((prev) => {
          const updated = [...prev, newPoint];
          
          // Calculate distance
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = calculateDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              newPoint.latitude,
              newPoint.longitude
            );
            
            setDistance((d) => {
              const newDistance = d + dist;
              
              // Check for new split (every 1000m)
              const currentKm = Math.floor(newDistance / 1000);
              const lastKm = Math.floor(lastSplitDistanceRef.current / 1000);
              
              if (currentKm > lastKm && startTimeRef.current) {
                const splitTime = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
                const splitDistance = currentKm * 1000;
                
                setSplits((prevSplits) => {
                  const lastSplitTime = prevSplits.length > 0 ? prevSplits[prevSplits.length - 1].time : 0;
                  const splitDuration = splitTime - lastSplitTime;
                  const splitPace = splitDuration / 60; // min/km
                  
                  return [
                    ...prevSplits,
                    {
                      distance: splitDistance,
                      time: splitTime,
                      pace: splitPace,
                    },
                  ];
                });
                
                lastSplitDistanceRef.current = newDistance;
              }
              
              return newDistance;
            });
          }
          
          // Calculate elevation
          if (updated.length > 1) {
            const elevation = calculateElevation(updated);
            setElevationGain(elevation.gain);
            setElevationLoss(elevation.loss);
          }
          
          return updated;
        });
      }
    );

    timerRef.current = setInterval(() => {
      if (startTimeRef.current && !isPaused) {
        setDuration(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
      } else if (isPaused) {
        pausedTimeRef.current += 1000;
      }
    }, 1000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setIsPaused(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    isTracking,
    isPaused,
    currentRunPoints,
    currentLocation,
    distance,
    duration,
    splits,
    elevationGain,
    elevationLoss,
    startTracking,
    stopTracking,
  };
};
