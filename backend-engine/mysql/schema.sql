CREATE DATABASE IF NOT EXISTS railrake_db;
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
);
