package com.sih.coal.railrake.controller;

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
}
