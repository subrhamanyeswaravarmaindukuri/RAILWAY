export interface Rake {
  id: string;
  status: 'IN TRANSIT' | 'LOADING' | 'UNLOADED' | 'DELAYED' | 'AVAILABLE';
  source: string;
  destination: string;
  coalAmount: number; // in MT
  grade: string;
  currentLocation: string;
  eta: string;
  distanceLeft: number; // in km
  expectedDelay: string; // e.g. "2h 15m"
  routeProgress: number; // 0 to 100
  routeStations: string[];
}

export interface Siding {
  name: string;
  coalStock: number; // in MT
  capacity: number; // in MT
  loadingCapacity: number; // rakes/day
  unloadingCapacity: number; // rakes/day
  currentRakes: number;
  waitingRakes: number;
  avgLoadingTime: number; // hrs
  avgUnloadingTime: number; // hrs
  demurrageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  history: Array<{ date: string; coalMoved: number; rakesHandled: number }>;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'recommendation';
  title: string;
  message: string;
  time: string;
  actionable?: {
    rakeId: string;
    recommendedDestination: string;
  };
}

export interface SidingRecommendation {
  sidingName: string;
  distance: number;
  stock: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ForecastData {
  destination: string;
  currentStock: number;
  dailyConsumption: number;
  tomorrow: number;
  in3Days: number;
  in7Days: number;
  in15Days: number;
  criticalDay: number;
  recommendedRakes: number;
}

export const initialRakes: Rake[] = [
  {
    id: 'R102',
    status: 'IN TRANSIT',
    source: 'Mine A',
    destination: 'Plant X',
    coalAmount: 3800,
    grade: 'G9',
    currentLocation: 'Station 12',
    eta: '11 Aug, 04:30 PM',
    distanceLeft: 85,
    expectedDelay: '0h 0m',
    routeProgress: 65,
    routeStations: ['Mine A', 'Station 8', 'Station 12', 'Plant X']
  },
  {
    id: 'R103',
    status: 'IN TRANSIT',
    source: 'Mine B',
    destination: 'Plant Y',
    coalAmount: 4100,
    grade: 'G10',
    currentLocation: 'Station 22',
    eta: '11 Aug, 06:15 PM',
    distanceLeft: 95,
    expectedDelay: '0h 0m',
    routeProgress: 55,
    routeStations: ['Mine B', 'Station 15', 'Station 22', 'Plant Y']
  },
  {
    id: 'R104',
    status: 'DELAYED',
    source: 'Mine A',
    destination: 'Plant Z',
    coalAmount: 3900,
    grade: 'G11',
    currentLocation: 'Station 31',
    eta: '11 Aug, 09:45 PM',
    distanceLeft: 110,
    expectedDelay: '4h 0m',
    routeProgress: 40,
    routeStations: ['Mine A', 'Station 25', 'Station 31', 'Plant Z']
  },
  {
    id: 'R105',
    status: 'LOADING',
    source: 'Mine C',
    destination: 'Plant X',
    coalAmount: 4200,
    grade: 'G10',
    currentLocation: 'Mine C Siding',
    eta: '12 Aug, 08:30 AM',
    distanceLeft: 240,
    expectedDelay: '0h 0m',
    routeProgress: 5,
    routeStations: ['Mine C', 'Station 14', 'Station 40', 'Plant X']
  },
  {
    id: 'R106',
    status: 'UNLOADED',
    source: 'Mine B',
    destination: 'Plant Z',
    coalAmount: 4000,
    grade: 'G9',
    currentLocation: 'Plant Z Siding',
    eta: '10 Aug, 03:30 PM',
    distanceLeft: 0,
    expectedDelay: '0h 0m',
    routeProgress: 100,
    routeStations: ['Mine B', 'Station 15', 'Station 31', 'Plant Z']
  },
  {
    id: 'R107',
    status: 'AVAILABLE',
    source: 'Mine A',
    destination: 'Plant Y',
    coalAmount: 4000,
    grade: 'G10',
    currentLocation: 'Mine A Yard',
    eta: 'Ready',
    distanceLeft: 180,
    expectedDelay: '0h 0m',
    routeProgress: 0,
    routeStations: ['Mine A', 'Station 8', 'Plant Y']
  },
  {
    id: 'R1024',
    status: 'IN TRANSIT',
    source: 'Mine A',
    destination: 'Plant X',
    coalAmount: 4000,
    grade: 'G10',
    currentLocation: 'Station 47',
    eta: '13 Aug, 06:45 PM',
    distanceLeft: 120,
    expectedDelay: '2h 15m',
    routeProgress: 70,
    routeStations: ['Mine A', 'Station 20', 'Station 47', 'Plant X']
  },
  {
    id: 'R4582',
    status: 'AVAILABLE',
    source: 'Mine A',
    destination: 'Pending',
    coalAmount: 4000,
    grade: 'G10',
    currentLocation: 'Mine A Yard',
    eta: 'Ready',
    distanceLeft: 0,
    expectedDelay: '0h 0m',
    routeProgress: 0,
    routeStations: ['Mine A', 'Siding A']
  }
];

export const initialSidings: Siding[] = [
  {
    name: 'Siding A',
    coalStock: 25400,
    capacity: 40000,
    loadingCapacity: 8,
    unloadingCapacity: 6,
    currentRakes: 2,
    waitingRakes: 1,
    avgLoadingTime: 4.2,
    avgUnloadingTime: 5.1,
    demurrageRisk: 'LOW',
    history: [
      { date: '05 Aug', coalMoved: 18000, rakesHandled: 4 },
      { date: '06 Aug', coalMoved: 22000, rakesHandled: 5 },
      { date: '07 Aug', coalMoved: 26000, rakesHandled: 6 },
      { date: '08 Aug', coalMoved: 20000, rakesHandled: 5 },
      { date: '09 Aug', coalMoved: 24000, rakesHandled: 6 },
      { date: '10 Aug', coalMoved: 25400, rakesHandled: 6 }
    ]
  },
  {
    name: 'Siding B',
    coalStock: 9000,
    capacity: 30000,
    loadingCapacity: 6,
    unloadingCapacity: 4,
    currentRakes: 1,
    waitingRakes: 0,
    avgLoadingTime: 5.0,
    avgUnloadingTime: 6.2,
    demurrageRisk: 'MEDIUM',
    history: [
      { date: '05 Aug', coalMoved: 12000, rakesHandled: 3 },
      { date: '06 Aug', coalMoved: 15000, rakesHandled: 4 },
      { date: '07 Aug', coalMoved: 9000, rakesHandled: 2 }
    ]
  },
  {
    name: 'Siding C',
    coalStock: 3000,
    capacity: 20000,
    loadingCapacity: 4,
    unloadingCapacity: 3,
    currentRakes: 0,
    waitingRakes: 2,
    avgLoadingTime: 6.1,
    avgUnloadingTime: 7.5,
    demurrageRisk: 'HIGH',
    history: [
      { date: '05 Aug', coalMoved: 5000, rakesHandled: 1 },
      { date: '06 Aug', coalMoved: 4000, rakesHandled: 1 },
      { date: '07 Aug', coalMoved: 3000, rakesHandled: 0 }
    ]
  }
];

export const initialAlerts: Alert[] = [
  {
    id: 'A1',
    type: 'critical',
    title: 'Critical Stock Alert',
    message: 'Plant X stock will reach critical in 3 days.',
    time: '10:20 AM'
  },
  {
    id: 'A2',
    type: 'warning',
    title: 'Rake Delay',
    message: 'Rake R102 is delayed by 4 hours.',
    time: '09:45 AM'
  },
  {
    id: 'A3',
    type: 'critical',
    title: 'Demurrage Risk',
    message: 'Rake R451 may incur ₹1.2 Lakh demurrage.',
    time: '09:15 AM'
  },
  {
    id: 'A4',
    type: 'recommendation',
    title: 'Recommended Action',
    message: 'Allocate Rake R451 to Siding C instead of Siding B.',
    time: '08:50 AM',
    actionable: {
      rakeId: 'R4582',
      recommendedDestination: 'Siding A'
    }
  }
];

export const initialForecasts: ForecastData[] = [
  {
    destination: 'Power Plant A',
    currentStock: 42000,
    dailyConsumption: 7500,
    tomorrow: 35000,
    in3Days: 20500,
    in7Days: 8000,
    in15Days: 2500,
    criticalDay: 6,
    recommendedRakes: 6
  },
  {
    destination: 'Plant X',
    currentStock: 18000,
    dailyConsumption: 6000,
    tomorrow: 12000,
    in3Days: -6000, // Critical
    in7Days: -30000,
    in15Days: -78000,
    criticalDay: 3,
    recommendedRakes: 8
  },
  {
    destination: 'Plant Y',
    currentStock: 55000,
    dailyConsumption: 5000,
    tomorrow: 50000,
    in3Days: 40000,
    in7Days: 20000,
    in15Days: -20000,
    criticalDay: 11,
    recommendedRakes: 4
  },
  {
    destination: 'Plant Z',
    currentStock: 31000,
    dailyConsumption: 4000,
    tomorrow: 27000,
    in3Days: 19000,
    in7Days: 3000,
    in15Days: -29000,
    criticalDay: 7,
    recommendedRakes: 5
  }
];

export const initialAnalytics = {
  totalRakes: 1248,
  onTimePercentage: 78,
  totalCoalTransported: 18.6, // MT
  totalDemurrage: 48.6, // Lakh ₹
  monthlyData: [
    { name: 'Jan', value: 68 },
    { name: 'Feb', value: 92 },
    { name: 'Mar', value: 115 },
    { name: 'Apr', value: 102 },
    { name: 'May', value: 135 },
    { name: 'Jun', value: 168 },
    { name: 'Jul', value: 195 },
    { name: 'Aug', value: 180 }
  ]
};

export const codeFiles = {
  sql: {
    name: 'schema.sql',
    language: 'sql',
    path: 'backend-engine/mysql/schema.sql',
    code: `CREATE DATABASE IF NOT EXISTS railrake_db;
USE railrake_db;

-- Table for Rakes
CREATE TABLE IF NOT EXISTS rakes (
    rake_id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(50) NOT NULL CHECK (status IN ('IN TRANSIT', 'LOADING', 'UNLOADED', 'DELAYED', 'AVAILABLE')),
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    coal_amount INT NOT NULL, -- in MT
    grade VARCHAR(10) NOT NULL,
    current_location VARCHAR(100),
    eta VARCHAR(50),
    distance_left INT DEFAULT 0,
    expected_delay VARCHAR(20) DEFAULT '0h',
    route_progress INT DEFAULT 0
);

-- Table for Sidings
CREATE TABLE IF NOT EXISTS sidings (
    siding_name VARCHAR(50) PRIMARY KEY,
    coal_stock INT NOT NULL, -- in MT
    capacity INT NOT NULL,
    loading_capacity INT NOT NULL,
    unloading_capacity INT NOT NULL,
    current_rakes INT DEFAULT 0,
    waiting_rakes INT DEFAULT 0,
    avg_loading_time DECIMAL(4, 2),
    avg_unloading_time DECIMAL(4, 2),
    demurrage_risk VARCHAR(20) CHECK (demurrage_risk IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Table for Allocations Log
CREATE TABLE IF NOT EXISTS rake_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rake_id VARCHAR(50),
    allocated_siding VARCHAR(50),
    allocation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allocated_by VARCHAR(50),
    FOREIGN KEY (rake_id) REFERENCES rakes(rake_id),
    FOREIGN KEY (allocated_siding) REFERENCES sidings(siding_name)
);

-- Table for System Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(10) PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('critical', 'warning', 'recommendation')),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_time VARCHAR(20) NOT NULL
);`
  },
  c: {
    name: 'forecasting.c',
    language: 'c',
    path: 'backend-engine/c/forecasting.c',
    code: `#include <stdio.h>
#include <stdlib.h>

#define FORECAST_DAYS 15

// Structure representing current stock parameters
typedef struct {
    double current_stock;
    double daily_consumption;
    double depletion_rate; // alpha modifier
} CoalStock;

// Double Exponential Smoothing Algorithm
// Used to forecast stock levels for coal fired power plants
void forecast_depletion(CoalStock plant, double *forecast_results) {
    double level = plant.current_stock;
    double trend = -plant.daily_consumption;
    
    // Smoothing constants
    double alpha = 0.2;
    double beta = 0.1;
    
    for (int t = 1; t <= FORECAST_DAYS; t++) {
        double prev_level = level;
        // Simulating the daily consumption draw with a stochastic factor (+- 5% random deviation)
        double noise = 1.0 + (((rand() % 100) - 50) / 1000.0);
        double actual_demand = trend * noise;
        
        level = alpha * (prev_level + actual_demand) + (1 - alpha) * (prev_level + trend);
        trend = beta * (level - prev_level) + (1 - beta) * trend;
        
        // Estimated stock level at time t
        double estimated_stock = level + trend;
        forecast_results[t - 1] = estimated_stock > 0 ? estimated_stock : 0;
    }
}

int main() {
    CoalStock power_plant_a = {42000.0, 7500.0, 0.15};
    double results[FORECAST_DAYS];
    
    printf("Starting demand forecasting simulation for Power Plant A...\\n");
    forecast_depletion(power_plant_a, results);
    
    printf("--- Forecasted Stock levels ---\\n");
    printf("Current Stock: %.1f MT\\n", power_plant_a.current_stock);
    printf("Day 1 (Tomorrow): %.1f MT\\n", results[0]);
    printf("Day 3: %.1f MT\\n", results[2]);
    printf("Day 7: %.1f MT\\n", results[6]);
    printf("Day 15: %.1f MT\\n", results[14]);
    
    // Check for critical stock alerts (stock < 10,000 MT)
    for(int i = 0; i < FORECAST_DAYS; i++) {
        if(results[i] < 10000.0) {
            printf("[ALERT] Critical stock threshold breached on Day %d! Recommended Rakes: %d\\n", 
                   i + 1, (int)((42000.0 - results[i]) / 4000.0) + 1);
            break;
        }
    }
    return 0;
}`
  },
  cpp: {
    name: 'optimizer.cpp',
    language: 'cpp',
    path: 'backend-engine/cpp/optimizer.cpp',
    code: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cmath>

struct Siding {
    std::string name;
    int distance; // km
    int stock;    // MT
    int capacity; // MT
    std::string risk_level; // "LOW", "MEDIUM", "HIGH"
};

struct Rake {
    std::string id;
    int coal_amount;
    std::string grade;
    std::string source;
};

// Optimizer evaluating siding allocations based on multi-criteria heuristic:
// Score = (Distance * w1) + (AvailableStock * w2) - (DemurrageRiskPenalty * w3)
// A lower score indicates a more optimal siding for coal unloading
class RakeAllocationOptimizer {
private:
    const double w_distance = 0.3;
    const double w_stock = 0.5;
    const double w_risk = 0.2;

public:
    std::vector<std::pair<Siding, double>> evaluate_sidings(Rake rake, std::vector<Siding> sidings) {
        std::vector<std::pair<Siding, double>> scoring_sheet;
        
        for (const auto& siding : sidings) {
            double penalty_risk = 0.0;
            if (siding.risk_level == "HIGH") penalty_risk = 100.0;
            else if (siding.risk_level == "MEDIUM") penalty_risk = 40.0;
            else penalty_risk = 0.0;
            
            // Heuristic scoring (normalized values)
            double norm_dist = siding.distance / 150.0; // max distance range
            double norm_stock = (double)siding.stock / siding.capacity;
            
            double score = (norm_dist * w_distance) + (norm_stock * w_stock) + (penalty_risk * w_risk);
            scoring_sheet.push_back({siding, score});
        }
        
        // Sort sidings such that the most recommended (lowest score / best profile) is first
        std::sort(scoring_sheet.begin(), scoring_sheet.end(), 
            [](const auto& a, const auto& b) {
                return a.second < b.second;
            });
            
        return scoring_sheet;
    }
};

int main() {
    Rake rake = {"R4582", 4000, "G10", "Mine A"};
    std::vector<Siding> sidings = {
        {"Siding A", 82, 18000, 40000, "LOW"},
        {"Siding B", 105, 9000, 30000, "MEDIUM"},
        {"Siding C", 120, 3000, 20000, "HIGH"}
    };
    
    RakeAllocationOptimizer optimizer;
    auto recommendations = optimizer.evaluate_sidings(rake, sidings);
    
    std::cout << "Optimized Rake Allocation recommendations for " << rake.id << ":\\n";
    for (size_t i = 0; i < recommendations.size(); ++i) {
        std::cout << i + 1 << ". " << recommendations[i].first.name 
                  << " | Distance: " << recommendations[i].first.distance << " km"
                  << " | Stock: " << recommendations[i].first.stock << " MT"
                  << " | Demurrage Risk: " << recommendations[i].first.risk_level 
                  << " (Score: " << recommendations[i].second << ")\\n";
    }
    
    std::cout << "\\nRecommended target Siding: " << recommendations[0].first.name << std::endl;
    return 0;
}`
  },
  java: {
    name: 'RakeController.java',
    language: 'java',
    path: 'backend-engine/java/RakeController.java',
    code: `package com.sih.coal.railrake.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/rakes")
@CrossOrigin(origins = "*")
public class RakeController {

    // Mock API Database
    private final List<Map<String, Object>> rakeDb = new ArrayList<>();
    
    public RakeController() {
        // Initialize base datasets
        Map<String, Object> rake1 = new HashMap<>();
        rake1.put("id", "R1024");
        rake1.put("status", "IN TRANSIT");
        rake1.put("source", "Mine A");
        rake1.put("destination", "Plant X");
        rake1.put("coalAmount", 4000);
        rake1.put("grade", "G10");
        rakeDb.add(rake1);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRakes() {
        return ResponseEntity.ok(rakeDb);
    }

    @PostMapping("/{rakeId}/allocate")
    public ResponseEntity<Map<String, String>> allocateRake(
            @PathVariable String rakeId, 
            @RequestParam String sidingName,
            @RequestHeader("Authorization") String token) {
            
        // Log allocation in system audits
        System.out.println("Rake " + rakeId + " allocated to " + sidingName + " by token user.");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Rake " + rakeId + " successfully allocated to " + sidingName + ".");
        response.put("timestamp", new Date().toString());
        
        return ResponseEntity.ok(response);
    }
}`
  }
};
