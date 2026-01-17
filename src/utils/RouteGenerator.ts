import { GPSPoint } from '../types';

export const RouteGenerator = {
    /**
     * Generates a circular route starting and ending at the given start point.
     * The circumference of the circle approximates the target distance.
     * 
     * @param startPoint The starting GPS point (latitude, longitude)
     * @param distanceMeters The target distance in meters
     * @param pointsCount Number of points to generate for the circle (default 20)
     * @returns Array of GPSPoints representing the route
     */
    generateCircularRoute: (
        startPoint: { latitude: number; longitude: number },
        distanceMeters: number,
        pointsCount: number = 20
    ): GPSPoint[] => {
        const R = 6371e3; // Earth's radius in meters
        const radiusMeters = distanceMeters / (2 * Math.PI); // r = C / 2π

        // Convert logic: 
        // We want the circle to pass through the startPoint. 
        // Let's say startPoint is at the "bottom" (South) of the circle.
        // The center of the circle will be directly North of startPoint by `radiusMeters`.

        // Convert radius to degrees (approximate)
        const latOffset = (radiusMeters / R) * (180 / Math.PI);

        const centerLat = startPoint.latitude + latOffset;
        const centerLon = startPoint.longitude;

        const route: GPSPoint[] = [];

        // Generate points
        for (let i = 0; i <= pointsCount; i++) {
            const theta = (i / pointsCount) * 2 * Math.PI; // Angle in radians

            // Offset from center in meters
            // We start at -PI/2 (South) to match startPoint
            const angle = theta - Math.PI / 2;

            const dx = radiusMeters * Math.cos(angle);
            const dy = radiusMeters * Math.sin(angle);

            // Convert offsets to lat/lon deltas
            // dLat = dy / R
            // dLon = dx / (R * cos(centerLat))

            const dLat = (dy / R) * (180 / Math.PI);
            const dLon = (dx / (R * Math.cos(centerLat * Math.PI / 180))) * (180 / Math.PI);

            route.push({
                latitude: centerLat + dLat,
                longitude: centerLon + dLon,
                timestamp: Date.now(),
            });
        }

        return route;
    }
};
