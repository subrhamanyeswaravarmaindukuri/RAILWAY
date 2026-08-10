#include <stdio.h>
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
    
    printf("Starting demand forecasting simulation for Power Plant A...\n");
    forecast_depletion(power_plant_a, results);
    
    printf("--- Forecasted Stock levels ---\n");
    printf("Current Stock: %.1f MT\n", power_plant_a.current_stock);
    printf("Day 1 (Tomorrow): %.1f MT\n", results[0]);
    printf("Day 3: %.1f MT\n", results[2]);
    printf("Day 7: %.1f MT\n", results[6]);
    printf("Day 15: %.1f MT\n", results[14]);
    
    // Check for critical stock alerts (stock < 10,000 MT)
    for(int i = 0; i < FORECAST_DAYS; i++) {
        if(results[i] < 10000.0) {
            printf("[ALERT] Critical stock threshold breached on Day %d! Recommended Rakes: %d\n", 
                   i + 1, (int)((42000.0 - results[i]) / 4000.0) + 1);
            break;
        }
    }
    return 0;
}
