#include <iostream>
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
    
    std::cout << "Optimized Rake Allocation recommendations for " << rake.id << ":\n";
    for (size_t i = 0; i < recommendations.size(); ++i) {
        std::cout << i + 1 << ". " << recommendations[i].first.name 
                  << " | Distance: " << recommendations[i].first.distance << " km"
                  << " | Stock: " << recommendations[i].first.stock << " MT"
                  << " | Demurrage Risk: " << recommendations[i].first.risk_level 
                  << " (Score: " << recommendations[i].second << ")\n";
    }
    
    std::cout << "\nRecommended target Siding: " << recommendations[0].first.name << std::endl;
    return 0;
}
