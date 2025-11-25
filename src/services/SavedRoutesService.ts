import { getDB } from '../db';
import { GPSPoint } from '../types';

export interface SavedRoute {
  id: string;
  name: string;
  distance: number;
  elevationGain: number;
  safetyScore: number;
  waypoints: GPSPoint[];
  timesCompleted: number;
  bestTime: number;
  notes: string;
  createdAt: number;
}

class SavedRoutesServiceClass {
  async saveRoute(route: Omit<SavedRoute, 'id' | 'timesCompleted' | 'bestTime' | 'createdAt'>): Promise<string> {
    const db = getDB();
    const id = Date.now().toString();
    const waypointsJson = JSON.stringify(route.waypoints);

    await db.runAsync(
      `INSERT INTO saved_routes (id, name, distance, elevationGain, safetyScore, waypointsJson, timesCompleted, bestTime, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [id, route.name, route.distance, route.elevationGain, route.safetyScore, waypointsJson, route.notes, Date.now()]
    );

    return id;
  }

  async getAllRoutes(): Promise<SavedRoute[]> {
    const db = getDB();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM saved_routes ORDER BY timesCompleted DESC, createdAt DESC'
    );

    return results.map(r => ({
      ...r,
      waypoints: JSON.parse(r.waypointsJson),
    }));
  }

  async getRoute(id: string): Promise<SavedRoute | null> {
    const db = getDB();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM saved_routes WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      ...result,
      waypoints: JSON.parse(result.waypointsJson),
    };
  }

  async updateRouteStats(routeId: string, completionTime: number): Promise<void> {
    const db = getDB();
    const route = await this.getRoute(routeId);
    
    if (!route) return;

    const newBestTime = route.bestTime === 0 ? completionTime : Math.min(route.bestTime, completionTime);

    await db.runAsync(
      `UPDATE saved_routes 
       SET timesCompleted = timesCompleted + 1,
           bestTime = ?
       WHERE id = ?`,
      [newBestTime, routeId]
    );
  }

  async deleteRoute(routeId: string): Promise<void> {
    const db = getDB();
    await db.runAsync('DELETE FROM saved_routes WHERE id = ?', [routeId]);
  }
}

export const SavedRoutesService = new SavedRoutesServiceClass();
