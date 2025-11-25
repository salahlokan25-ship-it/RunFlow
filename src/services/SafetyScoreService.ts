import { GPSPoint } from '../types';

export interface SafetyFactors {
  lighting: number;        // 0-100 (100 = well-lit)
  traffic: number;         // 0-100 (100 = low traffic)
  crime: number;           // 0-100 (100 = low crime)
  pedestrianPath: boolean;
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
  communityReports: number;
  population: number;      // Area population density
}

export interface SafetyScore {
  overall: number;         // 0-100
  level: 'very-safe' | 'safe' | 'moderate' | 'caution' | 'unsafe';
  factors: SafetyFactors;
  recommendations: string[];
  color: string;
}

class SafetyScoreServiceClass {
  calculateSafetyScore(location: GPSPoint, factors: Partial<SafetyFactors>): SafetyScore {
    // Default values
    const defaultFactors: SafetyFactors = {
      lighting: 70,
      traffic: 60,
      crime: 80,
      pedestrianPath: true,
      timeOfDay: this.getTimeOfDay(),
      communityReports: 75,
      population: 50,
      ...factors,
    };

    // Calculate weighted score
    const weights = {
      lighting: 0.25,
      traffic: 0.20,
      crime: 0.30,
      pedestrianPath: 0.10,
      communityReports: 0.10,
      population: 0.05,
    };

    // Adjust weights for time of day
    if (defaultFactors.timeOfDay === 'night') {
      weights.lighting = 0.35;
      weights.crime = 0.35;
      weights.traffic = 0.15;
    } else if (defaultFactors.timeOfDay === 'dawn' || defaultFactors.timeOfDay === 'dusk') {
      weights.lighting = 0.30;
    }

    let overall = 0;
    overall += defaultFactors.lighting * weights.lighting;
    overall += defaultFactors.traffic * weights.traffic;
    overall += defaultFactors.crime * weights.crime;
    overall += (defaultFactors.pedestrianPath ? 100 : 30) * weights.pedestrianPath;
    overall += defaultFactors.communityReports * weights.communityReports;
    overall += defaultFactors.population * weights.population;

    // Determine safety level
    let level: SafetyScore['level'];
    let color: string;
    if (overall >= 80) {
      level = 'very-safe';
      color = '#22c55e'; // Green
    } else if (overall >= 65) {
      level = 'safe';
      color = '#84cc16'; // Light green
    } else if (overall >= 50) {
      level = 'moderate';
      color = '#eab308'; // Yellow
    } else if (overall >= 35) {
      level = 'caution';
      color = '#f97316'; // Orange
    } else {
      level = 'unsafe';
      color = '#ef4444'; // Red
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (defaultFactors.lighting < 50 && defaultFactors.timeOfDay === 'night') {
      recommendations.push('Poor lighting - wear reflective gear');
    }
    if (defaultFactors.traffic < 40) {
      recommendations.push('High traffic area - stay on sidewalks');
    }
    if (defaultFactors.crime < 50) {
      recommendations.push('Higher crime area - run with a partner');
    }
    if (!defaultFactors.pedestrianPath) {
      recommendations.push('No dedicated path - use extreme caution');
    }
    if (defaultFactors.timeOfDay === 'night' && overall < 60) {
      recommendations.push('Consider running during daylight hours');
    }

    if (recommendations.length === 0) {
      recommendations.push('Route appears safe - enjoy your run!');
    }

    return {
      overall: Math.round(overall),
      level,
      factors: defaultFactors,
      recommendations,
      color,
    };
  }

  private getTimeOfDay(): 'day' | 'night' | 'dawn' | 'dusk' {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }

  // Simulate route safety (in real app, would call external APIs)
  async getRouteSafety(route: GPSPoint[]): Promise<SafetyScore> {
    // In production, this would:
    // 1. Call OpenStreetMap for lighting data
    // 2. Call traffic API for congestion
    // 3. Call crime data API
    // 4. Check for pedestrian paths
    
    // For now, return a simulated score
    const avgLat = route.reduce((sum, p) => sum + p.latitude, 0) / route.length;
    const avgLon = route.reduce((sum, p) => sum + p.longitude, 0) / route.length;
    
    // Simulate based on location (this is just for demo)
    const factors: Partial<SafetyFactors> = {
      lighting: 60 + Math.random() * 30,
      traffic: 50 + Math.random() * 40,
      crime: 70 + Math.random() * 25,
      pedestrianPath: Math.random() > 0.3,
      communityReports: 60 + Math.random() * 35,
    };

    return this.calculateSafetyScore(route[0], factors);
  }
}

export const SafetyScoreService = new SafetyScoreServiceClass();
