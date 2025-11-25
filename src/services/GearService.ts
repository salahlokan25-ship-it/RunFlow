import { getDB } from '../db';

export interface GearItem {
  id: string;
  type: 'shoes' | 'socks' | 'shorts' | 'watch' | 'belt' | 'earphones' | 'shirt' | 'hat';
  brand: string;
  model: string;
  purchaseDate: number;
  totalMileage: number;
  runsUsed: number;
  condition: 'new' | 'good' | 'worn' | 'replace';
  photo?: string;
  notes?: string;
  isActive: boolean;
  costPerMile?: number;
}

class GearServiceClass {
  async addGear(gear: Omit<GearItem, 'id' | 'totalMileage' | 'runsUsed' | 'condition'>): Promise<string> {
    const db = getDB();
    const id = Date.now().toString();

    await db.runAsync(
      `INSERT INTO gear (id, type, brand, model, purchaseDate, totalMileage, runsUsed, condition, photo, notes, isActive, costPerMile)
       VALUES (?, ?, ?, ?, ?, 0, 0, 'new', ?, ?, ?, ?)`,
      [id, gear.type, gear.brand, gear.model, gear.purchaseDate, 
       gear.photo || '', gear.notes || '', gear.isActive ? 1 : 0, gear.costPerMile || 0]
    );

    return id;
  }

  async getGear(id: string): Promise<GearItem | null> {
    const db = getDB();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM gear WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      ...result,
      isActive: result.isActive === 1,
    };
  }

  async getAllGear(): Promise<GearItem[]> {
    const db = getDB();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM gear ORDER BY isActive DESC, purchaseDate DESC'
    );

    return results.map(r => ({
      ...r,
      isActive: r.isActive === 1,
    }));
  }

  async getActiveGear(type: GearItem['type']): Promise<GearItem | null> {
    const db = getDB();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM gear WHERE type = ? AND isActive = 1',
      [type]
    );

    if (!result) return null;

    return {
      ...result,
      isActive: true,
    };
  }

  async updateGearMileage(gearId: string, additionalMileage: number): Promise<void> {
    const db = getDB();
    
    await db.runAsync(
      `UPDATE gear 
       SET totalMileage = totalMileage + ?, 
           runsUsed = runsUsed + 1
       WHERE id = ?`,
      [additionalMileage, gearId]
    );

    // Update condition based on mileage
    const gear = await this.getGear(gearId);
    if (gear && gear.type === 'shoes') {
      let newCondition: GearItem['condition'] = 'good';
      
      if (gear.totalMileage > 800000) {
        newCondition = 'replace';
      } else if (gear.totalMileage > 600000) {
        newCondition = 'worn';
      } else if (gear.totalMileage > 300000) {
        newCondition = 'good';
      }

      await db.runAsync(
        'UPDATE gear SET condition = ? WHERE id = ?',
        [newCondition, gearId]
      );
    }
  }

  async setActiveGear(gearId: string, type: GearItem['type']): Promise<void> {
    const db = getDB();
    
    // Deactivate all gear of this type
    await db.runAsync(
      'UPDATE gear SET isActive = 0 WHERE type = ?',
      [type]
    );

    // Activate selected gear
    await db.runAsync(
      'UPDATE gear SET isActive = 1 WHERE id = ?',
      [gearId]
    );
  }

  async deleteGear(gearId: string): Promise<void> {
    const db = getDB();
    await db.runAsync('DELETE FROM gear WHERE id = ?', [gearId]);
  }

  getReplacementAlert(gear: GearItem): string | null {
    if (gear.type === 'shoes') {
      const km = gear.totalMileage / 1000;
      if (km > 800) {
        return `⚠️ Replace immediately! ${km.toFixed(0)}km (recommended: 800km)`;
      } else if (km > 700) {
        return `⚠️ Consider replacement soon. ${km.toFixed(0)}km`;
      } else if (km > 500) {
        return `ℹ️ Halfway to replacement. ${km.toFixed(0)}km`;
      }
    }
    return null;
  }
}

export const GearService = new GearServiceClass();
