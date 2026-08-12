import React, { useState, useEffect, useRef } from 'react';
import {
  Train,
  Activity,
  Calendar,
  AlertTriangle,
  TrendingUp,
  User,
  LogOut,
  Menu,
  Bell,
  FileText,
  ChevronRight,
  Plus,
  Download,
  Cpu,
  FileCode,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowUpRight,
  Shield,
  Info,
  RefreshCw,
  Sliders
} from 'lucide-react';
import {
  initialRakes,
  initialSidings,
  initialAlerts,
  initialForecasts,
  initialAnalytics,
  codeFiles
} from './mockData';
import type { Rake, Siding, Alert } from './mockData';
import L from 'leaflet';

interface GeoStation {
  name: string;
  coord: [number, number];
  desc?: string;
  isMain?: boolean;
}

interface GeoRoute {
  sourceName: string;
  destName: string;
  junctions: GeoStation[];
}

interface RailNode {
  id: string;
  name: string;
  coord: [number, number];
}

const railJunctions: Record<string, RailNode> = {
  'Punjab': { id: 'Punjab', name: 'Ludhiana Jn (PB)', coord: [30.9010, 75.8573] },
  'Delhi': { id: 'Delhi', name: 'New Delhi (DL)', coord: [28.6139, 77.2090] },
  'Gujarat': { id: 'Gujarat', name: 'Vadodara Jn (GJ)', coord: [22.3106, 73.1812] },
  'Jharkhand': { id: 'Jharkhand', name: 'Dhanbad Jn (JH)', coord: [23.7957, 86.4304] },
  'WB': { id: 'WB', name: 'Howrah Jn (WB)', coord: [22.5850, 88.3386] },
  'MP': { id: 'MP', name: 'Singrauli (MP)', coord: [24.1039, 82.6842] },
  'Telangana': { id: 'Telangana', name: 'Secunderabad Jn (TS)', coord: [17.4334, 78.5015] },
  'Andhra': { id: 'Andhra', name: 'Nellore (AP)', coord: [14.4492, 79.9822] },
  'Chennai': { id: 'Chennai', name: 'Chennai Central (TN)', coord: [13.0827, 80.2707] },
  
  // Intermediate routing hubs
  'Kanpur': { id: 'Kanpur', name: 'Kanpur Central (UP)', coord: [26.4542, 80.3503] },
  'Prayagraj': { id: 'Prayagraj', name: 'Prayagraj Jn (UP)', coord: [25.4484, 81.8284] },
  'DDU': { id: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn (UP)', coord: [25.2818, 83.1235] },
  'Katni': { id: 'Katni', name: 'Katni Jn (MP)', coord: [23.8344, 80.4005] },
  'Bhopal': { id: 'Bhopal', name: 'Bhopal Jn (MP)', coord: [23.2599, 77.4126] },
  'Bhusaval': { id: 'Bhusaval', name: 'Bhusaval Jn (MH)', coord: [21.0475, 75.7903] },
  'Wardha': { id: 'Wardha', name: 'Wardha Jn (MH)', coord: [20.7408, 78.6022] },
  'Balharshah': { id: 'Balharshah', name: 'Balharshah Jn (MH)', coord: [19.8524, 79.3512] },
  'Vijayawada': { id: 'Vijayawada', name: 'Vijayawada Jn (AP)', coord: [16.5062, 80.6480] }
};

const railConnections: Record<string, string[]> = {
  'Punjab': ['Delhi'],
  'Delhi': ['Punjab', 'Kanpur', 'Bhopal', 'Gujarat'],
  'Gujarat': ['Delhi', 'Bhusaval'],
  'Bhusaval': ['Gujarat', 'Bhopal', 'Wardha'],
  'Bhopal': ['Delhi', 'Bhusaval', 'Katni'],
  'Kanpur': ['Delhi', 'Prayagraj'],
  'Prayagraj': ['Kanpur', 'DDU', 'Katni'],
  'DDU': ['Prayagraj', 'Jharkhand', 'MP'],
  'Jharkhand': ['DDU', 'WB', 'Vijayawada'],
  'WB': ['Jharkhand', 'Vijayawada'],
  'MP': ['DDU', 'Katni'],
  'Katni': ['Bhopal', 'Prayagraj', 'MP', 'Wardha'],
  'Wardha': ['Bhusaval', 'Katni', 'Balharshah'],
  'Balharshah': ['Wardha', 'Telangana'],
  'Telangana': ['Balharshah', 'Vijayawada'],
  'Vijayawada': ['Telangana', 'Jharkhand', 'WB', 'Andhra'],
  'Andhra': ['Vijayawada', 'Chennai'],
  'Chennai': ['Andhra']
};

const trackSegments: Record<string, [number, number][]> = {
  'Punjab-Delhi': [
    [30.9010, 75.8573], // Punjab
    [30.3752, 76.7821], // Ambala
    [29.6857, 76.9905], // Karnal
    [29.3989, 76.9696], // Panipat
    [28.9931, 77.0151], // Sonipat
    [28.5139, 77.2890]  // Delhi
  ],
  'Delhi-Kanpur': [
    [28.5139, 77.2890], // Delhi
    [28.4089, 77.3178], // Faridabad
    [28.1487, 77.3320], // Palwal
    [27.4924, 77.6737], // Mathura
    [27.1767, 78.0081], // Agra
    [26.9840, 78.7842], // Etawah
    [26.4499, 80.3319]  // Kanpur
  ],
  'Kanpur-Prayagraj': [
    [26.4499, 80.3319], // Kanpur
    [25.9262, 80.8093], // Fatehpur
    [25.4358, 81.8463]  // Prayagraj
  ],
  'Prayagraj-DDU': [
    [25.4358, 81.8463], // Prayagraj
    [25.1373, 82.5644], // Mirzapur
    [25.2818, 83.1166]  // DDU
  ],
  'DDU-Jharkhand': [
    [25.2818, 83.1166], // DDU
    [24.7955, 84.9994], // Gaya
    [23.7957, 86.4304]  // Jharkhand
  ],
  'Jharkhand-WB': [
    [23.7957, 86.4304], // Jharkhand
    [23.5653, 87.2796], // Durgapur
    [23.2324, 87.8630], // Bardhaman
    [22.5830, 88.3429]  // WB
  ],
  'WB-Vijayawada': [
    [22.5830, 88.3429], // WB
    [21.5036, 86.9246], // Balasore
    [20.4625, 85.8830], // Cuttack
    [20.2724, 85.8438], // Bhubaneswar
    [19.3150, 84.7941], // Brahmapur
    [17.6896, 83.2185], // Visakhapatnam
    [16.9891, 82.2475], // Kakinada
    [16.5062, 80.6480]  // Vijayawada
  ],
  'Jharkhand-Vijayawada': [
    [23.7957, 86.4304], // Jharkhand
    [22.7987, 86.1866], // Jamshedpur
    [21.4682, 84.0047], // Sambalpur
    [20.9507, 85.2286], // Talcher
    [17.6322, 83.1558], // Simhadri
    [16.5062, 80.6480]  // Vijayawada
  ],
  'Delhi-Bhopal': [
    [28.5139, 77.2890], // Delhi
    [27.4924, 77.6737], // Mathura
    [27.1767, 78.0081], // Agra
    [26.2183, 78.1828], // Gwalior
    [25.4484, 78.5685], // Jhansi
    [24.0750, 78.2910], // Bina
    [23.2599, 77.4126]  // Bhopal
  ],
  'Delhi-Gujarat': [
    [28.5139, 77.2890], // Delhi
    [28.2046, 76.8483], // Rewari
    [27.5620, 76.6226], // Alwar
    [26.9124, 75.7873], // Jaipur
    [26.4498, 74.6399], // Ajmer
    [25.0441, 73.7126], // Marwar
    [24.5925, 72.7156], // Abu Road
    [24.1724, 72.4251], // Palanpur
    [23.5879, 72.3693]  // Gujarat
  ],
  'Gujarat-Bhusaval': [
    [23.5879, 72.3693], // Gujarat (Mehsana)
    [23.5050, 72.3810],
    [23.4470, 72.3930],
    [23.3610, 72.4130],
    [23.2500, 72.4410],
    [23.1818, 72.5020],
    [23.0838, 72.5640],
    [23.0670, 72.5830],
    [23.0269, 72.6012], // Ahmedabad
    [23.0016, 72.6050],
    [22.9610, 72.6140],
    [22.8980, 72.6380],
    [22.8270, 72.7150],
    [22.6860, 72.8200],
    [22.6090, 72.9230],
    [22.5564, 72.9350], // Anand
    [22.4730, 72.9980],
    [22.4430, 73.0180],
    [22.3850, 73.0900],
    [22.3520, 73.1200],
    [22.3270, 73.1650],
    [22.3106, 73.1812], // Vadodara
    [22.2960, 73.1780],
    [22.2810, 73.1690],
    [22.1520, 73.1090],
    [22.0160, 73.0680],
    [21.8790, 73.0280],
    [21.8020, 73.0130],
    [21.7088, 72.9934],
    [21.6280, 73.0180],
    [21.4670, 72.9590],
    [21.4020, 72.9320],
    [21.3210, 72.8870],
    [21.2049, 72.8406], // Surat
    [21.1600, 72.8440],
    [21.1480, 72.9620],
    [21.1210, 73.1160],
    [21.1090, 73.2320],
    [21.1180, 73.3980],
    [21.1550, 73.8050],
    [21.7469, 74.1240],
    [21.3290, 74.4780],
    [21.0430, 75.0560],
    [21.0110, 75.2670],
    [21.0076, 75.5626],
    [21.0310, 75.7000],
    [21.0475, 75.7903]  // Bhusaval
  ],
  'Bhusaval-Bhopal': [
    [21.0475, 75.7903], // Bhusaval
    [21.6375, 76.3496], // Khandwa
    [22.5024, 77.7212], // Itarsi
    [23.2599, 77.4126]  // Bhopal
  ],
  'Bhopal-Katni': [
    [23.2599, 77.4126], // Bhopal
    [23.5255, 77.8211], // Vidisha
    [23.8342, 78.4388], // Saugor
    [23.8360, 79.4445], // Damoh
    [23.9857, 80.3980]  // Katni
  ],
  'Prayagraj-Katni': [
    [25.4358, 81.8463], // Prayagraj
    [25.1764, 80.7937], // Manikpur
    [24.5804, 80.8294], // Satna
    [23.9857, 80.3980]  // Katni
  ],
  'DDU-MP': [
    [25.2818, 83.1166], // DDU
    [24.4764, 82.9905], // MP
  ],
  'MP-Katni': [
    [24.4764, 82.9905], // MP
    [24.1950, 81.7950], // Beohari
    [23.9857, 80.3980]  // Katni
  ],
  'Katni-Wardha': [
    [23.9857, 80.3980], // Katni
    [23.1815, 79.9864], // Jabalpur
    [22.7524, 77.7212], // Itarsi
    [21.9015, 77.9004], // Betul
    [21.1458, 79.0882], // Nagpur
    [20.7408, 78.6022]  // Wardha
  ],
  'Bhusaval-Wardha': [
    [21.0475, 75.7903], // Bhusaval
    [21.0410, 75.8800],
    [20.8870, 76.1980],
    [20.7930, 76.6940],
    [20.7096, 77.0027], // Akola
    [20.8800, 77.7200], // Badnera
    [20.7800, 78.1300],
    [20.7270, 78.3180],
    [20.7450, 78.5500],
    [20.7408, 78.6022]  // Wardha
  ],
  'Wardha-Balharshah': [
    [20.7408, 78.6022], // Wardha
    [20.7000, 78.6800],
    [20.5600, 78.8400],
    [20.2300, 79.0000],
    [19.9570, 79.2970],
    [19.9000, 79.3250],
    [19.8524, 79.3512]  // Balharshah
  ],
  'Balharshah-Telangana': [
    [19.8524, 79.3512], // Balharshah
    [19.7800, 79.3800],
    [19.3300, 79.4800],
    [18.8020, 79.4440],
    [17.9780, 79.5200],
    [17.9720, 79.5700],
    [17.9689, 79.5941]  // Telangana
  ],
  'Telangana-Vijayawada': [
    [17.9689, 79.5941], // Telangana
    [17.9100, 79.6200],
    [17.2470, 80.1380],
    [16.5500, 80.6100],
    [16.5062, 80.6480]  // Vijayawada
  ],
  'Vijayawada-Andhra': [
    [16.5062, 80.6480], // Vijayawada
    [16.4800, 80.6420],
    [16.4400, 80.6350],
    [16.2400, 80.6400], // Tenali
    [15.9000, 80.4700],
    [15.8200, 80.3500],
    [15.5000, 80.0500],
    [14.9120, 79.9920],
    [14.4492, 79.9822], // Nellore
    [14.3575, 79.9926],
    [14.3458, 80.0460],
    [14.3420, 80.0750],
    [14.3351, 80.1065],
    [14.3262, 80.1388]  // Nellore SDSTPS Siding
  ],
  'Andhra-Chennai': [
    [14.3262, 80.1388], // Andhra (Nellore)
    [13.8244, 79.9796], // Gudur
    [13.4880, 80.0120], // Sullurupeta
    [13.0827, 80.2707]  // Chennai
  ]
};

const findRailRoute = (startId: string, endId: string): GeoStation[] => {
  if (startId === endId) {
    const node = railJunctions[startId];
    return [{ name: node.name, coord: node.coord, desc: 'Source & Destination', isMain: true }];
  }

  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);
  let pathFound: string[] | null = null;

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNode = path[path.length - 1];

    if (lastNode === endId) {
      pathFound = path;
      break;
    }

    const neighbors = railConnections[lastNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  if (pathFound) {
    const junctions: GeoStation[] = [];
    
    for (let i = 0; i < pathFound.length; i++) {
      const currentId = pathFound[i];
      const currentNode = railJunctions[currentId];
      
      junctions.push({
        name: currentNode.name,
        coord: currentNode.coord,
        desc: i === 0 ? 'Source Station' : i === pathFound.length - 1 ? 'Destination Station' : 'Intermediate Hub',
        isMain: true
      });
      
      if (i < pathFound.length - 1) {
        const nextId = pathFound[i + 1];
        let segmentCoords = trackSegments[`${currentId}-${nextId}`];
        let reverse = false;
        
        if (!segmentCoords) {
          segmentCoords = trackSegments[`${nextId}-${currentId}`];
          reverse = true;
        }
        
        if (segmentCoords) {
          let points = [...segmentCoords];
          if (reverse) {
            points.reverse();
          }
          
          const intermediatePoints = points.slice(1, -1);
          intermediatePoints.forEach((coord, ptIdx) => {
            junctions.push({
              name: `Track Bend ${i + 1}-${ptIdx + 1}`,
              coord: coord,
              desc: 'Physical track alignment',
              isMain: false
            });
          });
        }
      }
    }
    
    return junctions;
  }

  const start = railJunctions[startId] || railJunctions['Punjab'];
  const end = railJunctions[endId] || railJunctions['Telangana'];
  return [
    { name: start.name, coord: start.coord, desc: 'Start station', isMain: true },
    { name: end.name, coord: end.coord, desc: 'End station', isMain: true }
  ];
};

const geoRoutes: Record<string, GeoRoute> = {
  'Mine A-Plant X': {
    sourceName: 'Mehsana Siding (GJ)',
    destName: 'Nellore SDSTPS (AP)',
    junctions: [
      { name: 'Mehsana Coal Siding', coord: [23.5879, 72.3693], desc: 'Source: Gujarat loading station', isMain: true },
      { name: 'Bhandu Motidau', coord: [23.5050, 72.3810], desc: 'Track alignment', isMain: false },
      { name: 'Jagudan Siding', coord: [23.4470, 72.3930], desc: 'Track alignment', isMain: false },
      { name: 'Dangarwa Junction', coord: [23.3610, 72.4130], desc: 'Track alignment', isMain: false },
      { name: 'Kalol Junction', coord: [23.2500, 72.4410], desc: 'Intermediate junction', isMain: false },
      { name: 'Khodiyar Siding', coord: [23.1818, 72.5020], desc: 'Track alignment', isMain: false },
      { name: 'Sabarmati Siding', coord: [23.0838, 72.5640], desc: 'Intermediate junction', isMain: false },
      { name: 'Ranip Crossing', coord: [23.0670, 72.5830], desc: 'Track alignment', isMain: false },
      { name: 'Ahmedabad Junction', coord: [23.0269, 72.6012], desc: 'Junction stop: traffic clearance', isMain: true },
      { name: 'Maninagar Siding', coord: [23.0016, 72.6050], desc: 'Track alignment', isMain: false },
      { name: 'Vatva Yard', coord: [22.9610, 72.6140], desc: 'Track alignment', isMain: false },
      { name: 'Barejadi Siding', coord: [22.8980, 72.6380], desc: 'Track alignment', isMain: false },
      { name: 'Mehmdavad Junction', coord: [22.8270, 72.7150], desc: 'Track alignment', isMain: false },
      { name: 'Nadiad Junction', coord: [22.6860, 72.8200], desc: 'Intermediate junction', isMain: false },
      { name: 'Kanjari Boriyavi', coord: [22.6090, 72.9230], desc: 'Track alignment', isMain: false },
      { name: 'Anand Junction', coord: [22.5564, 72.9350], desc: 'Intermediate junction', isMain: false },
      { name: 'Adas Road', coord: [22.4730, 72.9980], desc: 'Track alignment', isMain: false },
      { name: 'Vasad Junction', coord: [22.4430, 73.0180], desc: 'Track alignment', isMain: false },
      { name: 'Ranoli Siding', coord: [22.3850, 73.0900], desc: 'Track alignment', isMain: false },
      { name: 'Bajva Yard', coord: [22.3520, 73.1200], desc: 'Track alignment', isMain: false },
      { name: 'Vadodara North Entry', coord: [22.3270, 73.1650], desc: 'Track alignment', isMain: false },
      { name: 'Vadodara Junction', coord: [22.3106, 73.1812], desc: 'Intermediate point', isMain: true },
      { name: 'Vadodara South Exit', coord: [22.2960, 73.1780], desc: 'Track alignment', isMain: false },
      { name: 'Vishvamitri Junction', coord: [22.2810, 73.1690], desc: 'Track alignment', isMain: false },
      { name: 'Itola Crossing', coord: [22.1520, 73.1090], desc: 'Track alignment', isMain: false },
      { name: 'Miyagam Karjan', coord: [22.0160, 73.0680], desc: 'Track alignment', isMain: false },
      { name: 'Palej Junction', coord: [21.8790, 73.0280], desc: 'Track alignment', isMain: false },
      { name: 'Nabipur Crossing', coord: [21.8020, 73.0130], desc: 'Track alignment', isMain: false },
      { name: 'Bharuch Junction', coord: [21.7088, 72.9934], desc: 'Intermediate junction', isMain: false },
      { name: 'Ankleshwar Junction', coord: [21.6280, 73.0180], desc: 'Track alignment', isMain: false },
      { name: 'Kosamba Junction', coord: [21.4670, 72.9590], desc: 'Track alignment', isMain: false },
      { name: 'Kim Crossing', coord: [21.4020, 72.9320], desc: 'Track alignment', isMain: false },
      { name: 'Sayan Junction', coord: [21.3210, 72.8870], desc: 'Track alignment', isMain: false },
      { name: 'Surat Junction', coord: [21.2049, 72.8406], desc: 'Junction stop: crew change', isMain: true },
      { name: 'Udhna Junction', coord: [21.1600, 72.8440], desc: 'Track alignment', isMain: false },
      { name: 'Chalthan Siding', coord: [21.1480, 72.9620], desc: 'Track alignment', isMain: false },
      { name: 'Bardoli Junction', coord: [21.1210, 73.1160], desc: 'Track alignment', isMain: false },
      { name: 'Madhi Junction', coord: [21.1090, 73.2320], desc: 'Track alignment', isMain: false },
      { name: 'Vyara Junction', coord: [21.1180, 73.3980], desc: 'Intermediate junction', isMain: false },
      { name: 'Nawapur Crossing', coord: [21.1550, 73.8050], desc: 'Track alignment', isMain: false },
      { name: 'Nandurbar Junction', coord: [21.7469, 74.1240], desc: 'Intermediate yard: speed control', isMain: false },
      { name: 'Dondaicha Siding', coord: [21.3290, 74.4780], desc: 'Track alignment', isMain: false },
      { name: 'Amalner Junction', coord: [21.0430, 75.0560], desc: 'Intermediate junction', isMain: false },
      { name: 'Dharangaon Crossing', coord: [21.0110, 75.2670], desc: 'Track alignment', isMain: false },
      { name: 'Jalgaon Junction', coord: [21.0076, 75.5626], desc: 'Intermediate junction', isMain: false },
      { name: 'Bhusaval West Entry', coord: [21.0310, 75.7000], desc: 'Track alignment', isMain: false },
      { name: 'Bhusaval Junction', coord: [21.0475, 75.7903], desc: 'Intermediate point', isMain: true },
      { name: 'Bhusaval East Exit', coord: [21.0410, 75.8800], desc: 'Track alignment', isMain: false },
      { name: 'Malkapur Siding', coord: [20.8870, 76.1980], desc: 'Track alignment', isMain: false },
      { name: 'Shegaon Crossing', coord: [20.7930, 76.6940], desc: 'Track alignment', isMain: false },
      { name: 'Akola Junction', coord: [20.7096, 77.0027], desc: 'Intermediate junction', isMain: false },
      { name: 'Badnera Junction', coord: [20.8800, 77.7200], desc: 'Intermediate junction', isMain: false },
      { name: 'Dhamangaon Jn', coord: [20.7800, 78.1300], desc: 'Intermediate junction', isMain: false },
      { name: 'Pulgaon Crossing', coord: [20.7270, 78.3180], desc: 'Track alignment', isMain: false },
      { name: 'Wardha West Entry', coord: [20.7450, 78.5500], desc: 'Track alignment', isMain: false },
      { name: 'Wardha Junction', coord: [20.7408, 78.6022], desc: 'Intermediate yard: speed control', isMain: true },
      { name: 'Wardha South Exit', coord: [20.7000, 78.6800], desc: 'Track alignment', isMain: false },
      { name: 'Hinganghat Jn', coord: [20.5600, 78.8400], desc: 'Intermediate junction', isMain: false },
      { name: 'Warora Junction', coord: [20.2300, 79.0000], desc: 'Intermediate junction', isMain: false },
      { name: 'Chandrapur Jn', coord: [19.9570, 79.2970], desc: 'Intermediate junction', isMain: false },
      { name: 'Balharshah North Entry', coord: [19.9000, 79.3250], desc: 'Track alignment', isMain: false },
      { name: 'Balharshah Junction', coord: [19.8524, 79.3512], desc: 'Junction stop: border checkpoint', isMain: true },
      { name: 'Balharshah South Exit', coord: [19.7800, 79.3800], desc: 'Track alignment', isMain: false },
      { name: 'Sirpur Kaghaznagar', coord: [19.3300, 79.4800], desc: 'Intermediate junction', isMain: false },
      { name: 'Ramagundam Jn', coord: [18.8020, 79.4440], desc: 'Intermediate junction', isMain: false },
      { name: 'Kazipet Junction', coord: [17.9780, 79.5200], desc: 'Intermediate junction', isMain: false },
      { name: 'Warangal West Entry', coord: [17.9720, 79.5700], desc: 'Track alignment', isMain: false },
      { name: 'Warangal Junction', coord: [17.9689, 79.5941], desc: 'Intermediate point', isMain: true },
      { name: 'Warangal South Exit', coord: [17.9100, 79.6200], desc: 'Track alignment', isMain: false },
      { name: 'Khammam Junction', coord: [17.2470, 80.1380], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada North Entry', coord: [16.5500, 80.6100], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada Junction', coord: [16.5062, 80.6480], desc: 'Junction stop: crew change', isMain: true },
      { name: 'Vijayawada Bridge', coord: [16.4800, 80.6420], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada South Exit', coord: [16.4400, 80.6350], desc: 'Track alignment', isMain: false },
      { name: 'Tenali Junction', coord: [16.2400, 80.6400], desc: 'Intermediate junction', isMain: false },
      { name: 'Bapatla Junction', coord: [15.9000, 80.4700], desc: 'Intermediate junction', isMain: false },
      { name: 'Chirala Junction', coord: [15.8200, 80.3500], desc: 'Intermediate junction', isMain: false },
      { name: 'Ongole Junction', coord: [15.5000, 80.0500], desc: 'Intermediate junction', isMain: false },
      { name: 'Kavali Junction', coord: [14.9120, 79.9920], desc: 'Intermediate junction', isMain: false },
      { name: 'Nellore Junction', coord: [14.4492, 79.9822], desc: 'Nellore junction siding switch', isMain: false },
      { name: 'Venkatachalam Jn', coord: [14.3575, 79.9926], desc: 'Siding junction branch', isMain: false },
      { name: 'SDSTPS Siding Curve', coord: [14.3458, 80.0460], desc: 'Siding curve entrance', isMain: false },
      { name: 'SDSTPS Siding Entry', coord: [14.3420, 80.0750], desc: 'Siding approach track', isMain: false },
      { name: 'SDSTPS Yard Approach', coord: [14.3351, 80.1065], desc: 'Siding terminal approach', isMain: false },
      { name: 'Nellore SDSTPS Siding', coord: [14.3262, 80.1388], desc: 'Destination: South AP unloading yard', isMain: true }
    ]
  },
  'Mehsana Siding (GJ)-Nellore SDSTPS (AP)': {
    sourceName: 'Mehsana Siding (GJ)',
    destName: 'Nellore SDSTPS (AP)',
    junctions: [
      { name: 'Mehsana Coal Siding', coord: [23.5879, 72.3693], desc: 'Source: Gujarat loading station', isMain: true },
      { name: 'Bhandu Motidau', coord: [23.5050, 72.3810], desc: 'Track alignment', isMain: false },
      { name: 'Jagudan Siding', coord: [23.4470, 72.3930], desc: 'Track alignment', isMain: false },
      { name: 'Dangarwa Junction', coord: [23.3610, 72.4130], desc: 'Track alignment', isMain: false },
      { name: 'Kalol Junction', coord: [23.2500, 72.4410], desc: 'Intermediate junction', isMain: false },
      { name: 'Khodiyar Siding', coord: [23.1818, 72.5020], desc: 'Track alignment', isMain: false },
      { name: 'Sabarmati Siding', coord: [23.0838, 72.5640], desc: 'Intermediate junction', isMain: false },
      { name: 'Ranip Crossing', coord: [23.0670, 72.5830], desc: 'Track alignment', isMain: false },
      { name: 'Ahmedabad Junction', coord: [23.0269, 72.6012], desc: 'Junction stop: traffic clearance', isMain: true },
      { name: 'Maninagar Siding', coord: [23.0016, 72.6050], desc: 'Track alignment', isMain: false },
      { name: 'Vatva Yard', coord: [22.9610, 72.6140], desc: 'Track alignment', isMain: false },
      { name: 'Barejadi Siding', coord: [22.8980, 72.6380], desc: 'Track alignment', isMain: false },
      { name: 'Mehmdavad Junction', coord: [22.8270, 72.7150], desc: 'Track alignment', isMain: false },
      { name: 'Nadiad Junction', coord: [22.6860, 72.8200], desc: 'Intermediate junction', isMain: false },
      { name: 'Kanjari Boriyavi', coord: [22.6090, 72.9230], desc: 'Track alignment', isMain: false },
      { name: 'Anand Junction', coord: [22.5564, 72.9350], desc: 'Intermediate junction', isMain: false },
      { name: 'Adas Road', coord: [22.4730, 72.9980], desc: 'Track alignment', isMain: false },
      { name: 'Vasad Junction', coord: [22.4430, 73.0180], desc: 'Track alignment', isMain: false },
      { name: 'Ranoli Siding', coord: [22.3850, 73.0900], desc: 'Track alignment', isMain: false },
      { name: 'Bajva Yard', coord: [22.3520, 73.1200], desc: 'Track alignment', isMain: false },
      { name: 'Vadodara North Entry', coord: [22.3270, 73.1650], desc: 'Track alignment', isMain: false },
      { name: 'Vadodara Junction', coord: [22.3106, 73.1812], desc: 'Intermediate point', isMain: true },
      { name: 'Vadodara South Exit', coord: [22.2960, 73.1780], desc: 'Track alignment', isMain: false },
      { name: 'Vishvamitri Junction', coord: [22.2810, 73.1690], desc: 'Track alignment', isMain: false },
      { name: 'Itola Crossing', coord: [22.1520, 73.1090], desc: 'Track alignment', isMain: false },
      { name: 'Miyagam Karjan', coord: [22.0160, 73.0680], desc: 'Track alignment', isMain: false },
      { name: 'Palej Junction', coord: [21.8790, 73.0280], desc: 'Track alignment', isMain: false },
      { name: 'Nabipur Crossing', coord: [21.8020, 73.0130], desc: 'Track alignment', isMain: false },
      { name: 'Bharuch Junction', coord: [21.7088, 72.9934], desc: 'Intermediate junction', isMain: false },
      { name: 'Ankleshwar Junction', coord: [21.6280, 73.0180], desc: 'Track alignment', isMain: false },
      { name: 'Kosamba Junction', coord: [21.4670, 72.9590], desc: 'Track alignment', isMain: false },
      { name: 'Kim Crossing', coord: [21.4020, 72.9320], desc: 'Track alignment', isMain: false },
      { name: 'Sayan Junction', coord: [21.3210, 72.8870], desc: 'Track alignment', isMain: false },
      { name: 'Surat Junction', coord: [21.2049, 72.8406], desc: 'Junction stop: crew change', isMain: true },
      { name: 'Udhna Junction', coord: [21.1600, 72.8440], desc: 'Track alignment', isMain: false },
      { name: 'Chaltan Siding', coord: [21.1480, 72.9620], desc: 'Track alignment', isMain: false },
      { name: 'Bardoli Junction', coord: [21.1210, 73.1160], desc: 'Track alignment', isMain: false },
      { name: 'Madhi Junction', coord: [21.1090, 73.2320], desc: 'Track alignment', isMain: false },
      { name: 'Vyara Junction', coord: [21.1180, 73.3980], desc: 'Intermediate junction', isMain: false },
      { name: 'Nawapur Crossing', coord: [21.1550, 73.8050], desc: 'Track alignment', isMain: false },
      { name: 'Nandurbar Junction', coord: [21.7469, 74.1240], desc: 'Intermediate yard: speed control', isMain: false },
      { name: 'Dondaicha Siding', coord: [21.3290, 74.4780], desc: 'Track alignment', isMain: false },
      { name: 'Amalner Junction', coord: [21.0430, 75.0560], desc: 'Intermediate junction', isMain: false },
      { name: 'Dharangaon Crossing', coord: [21.0110, 75.2670], desc: 'Track alignment', isMain: false },
      { name: 'Jalgaon Junction', coord: [21.0076, 75.5626], desc: 'Intermediate junction', isMain: false },
      { name: 'Bhusaval West Entry', coord: [21.0310, 75.7000], desc: 'Track alignment', isMain: false },
      { name: 'Bhusaval Junction', coord: [21.0475, 75.7903], desc: 'Intermediate point', isMain: true },
      { name: 'Bhusaval East Exit', coord: [21.0410, 75.8800], desc: 'Track alignment', isMain: false },
      { name: 'Malkapur Siding', coord: [20.8870, 76.1980], desc: 'Track alignment', isMain: false },
      { name: 'Shegaon Crossing', coord: [20.7930, 76.6940], desc: 'Track alignment', isMain: false },
      { name: 'Akola Junction', coord: [20.7096, 77.0027], desc: 'Intermediate junction', isMain: false },
      { name: 'Badnera Junction', coord: [20.8800, 77.7200], desc: 'Intermediate junction', isMain: false },
      { name: 'Dhamangaon Jn', coord: [20.7800, 78.1300], desc: 'Intermediate junction', isMain: false },
      { name: 'Pulgaon Crossing', coord: [20.7270, 78.3180], desc: 'Track alignment', isMain: false },
      { name: 'Wardha West Entry', coord: [20.7450, 78.5500], desc: 'Track alignment', isMain: false },
      { name: 'Wardha Junction', coord: [20.7408, 78.6022], desc: 'Intermediate yard: speed control', isMain: true },
      { name: 'Wardha South Exit', coord: [20.7000, 78.6800], desc: 'Track alignment', isMain: false },
      { name: 'Hinganghat Jn', coord: [20.5600, 78.8400], desc: 'Intermediate junction', isMain: false },
      { name: 'Warora Junction', coord: [20.2300, 79.0000], desc: 'Intermediate junction', isMain: false },
      { name: 'Chandrapur Jn', coord: [19.9570, 79.2970], desc: 'Intermediate junction', isMain: false },
      { name: 'Balharshah North Entry', coord: [19.9000, 79.3250], desc: 'Track alignment', isMain: false },
      { name: 'Balharshah Junction', coord: [19.8524, 79.3512], desc: 'Junction stop: border checkpoint', isMain: true },
      { name: 'Balharshah South Exit', coord: [19.7800, 79.3800], desc: 'Track alignment', isMain: false },
      { name: 'Sirpur Kaghaznagar', coord: [19.3300, 79.4800], desc: 'Intermediate junction', isMain: false },
      { name: 'Ramagundam Jn', coord: [18.8020, 79.4440], desc: 'Intermediate junction', isMain: false },
      { name: 'Kazipet Junction', coord: [17.9780, 79.5200], desc: 'Intermediate junction', isMain: false },
      { name: 'Warangal West Entry', coord: [17.9720, 79.5700], desc: 'Track alignment', isMain: false },
      { name: 'Warangal Junction', coord: [17.9689, 79.5941], desc: 'Intermediate point', isMain: true },
      { name: 'Warangal South Exit', coord: [17.9100, 79.6200], desc: 'Track alignment', isMain: false },
      { name: 'Khammam Junction', coord: [17.2470, 80.1380], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada North Entry', coord: [16.5500, 80.6100], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada Junction', coord: [16.5062, 80.6480], desc: 'Junction stop: crew change', isMain: true },
      { name: 'Vijayawada Bridge', coord: [16.4800, 80.6420], desc: 'Track alignment', isMain: false },
      { name: 'Vijayawada South Exit', coord: [16.4400, 80.6350], desc: 'Track alignment', isMain: false },
      { name: 'Tenali Junction', coord: [16.2400, 80.6400], desc: 'Intermediate junction', isMain: false },
      { name: 'Bapatla Junction', coord: [15.9000, 80.4700], desc: 'Intermediate junction', isMain: false },
      { name: 'Chirala Junction', coord: [15.8200, 80.3500], desc: 'Intermediate junction', isMain: false },
      { name: 'Ongole Junction', coord: [15.5000, 80.0500], desc: 'Intermediate junction', isMain: false },
      { name: 'Kavali Junction', coord: [14.9120, 79.9920], desc: 'Intermediate junction', isMain: false },
      { name: 'Nellore Junction', coord: [14.4492, 79.9822], desc: 'Nellore junction siding switch', isMain: false },
      { name: 'Venkatachalam Jn', coord: [14.3575, 79.9926], desc: 'Siding junction branch', isMain: false },
      { name: 'SDSTPS Siding Curve', coord: [14.3458, 80.0460], desc: 'Siding curve entrance', isMain: false },
      { name: 'SDSTPS Siding Entry', coord: [14.3420, 80.0750], desc: 'Siding approach track', isMain: false },
      { name: 'SDSTPS Yard Approach', coord: [14.3351, 80.1065], desc: 'Siding terminal approach', isMain: false },
      { name: 'Nellore SDSTPS Siding', coord: [14.3262, 80.1388], desc: 'Destination: South AP unloading yard', isMain: true }
    ]
  },
  'Mine A-Plant Y': {
    sourceName: 'Dhanbad Siding (JH)',
    destName: 'Singrauli STPS (MP)',
    junctions: [
      { name: 'Dhanbad Coal Siding', coord: [23.7957, 86.4304], desc: 'Source: loading station' },
      { name: 'Gaya Junction', coord: [24.7964, 85.0076], desc: 'Junction stop: crew change' },
      { name: 'Pt. Deen Dayal Upadhyaya Jn', coord: [25.2818, 83.1235], desc: 'Intermediate: rake sorting' },
      { name: 'Chopan Junction', coord: [24.5165, 83.0298], desc: 'Intermediate: bypass line' },
      { name: 'Singrauli Siding', coord: [24.1039, 82.6842], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine A-Plant Z': {
    sourceName: 'Dhanbad Siding (JH)',
    destName: 'Simhadri STPS (AP)',
    junctions: [
      { name: 'Dhanbad Coal Siding', coord: [23.7957, 86.4304], desc: 'Source: loading station' },
      { name: 'Asansol Junction', coord: [23.6871, 86.9747], desc: 'Junction stop' },
      { name: 'Kharagpur Junction', coord: [22.3276, 87.3204], desc: 'Intermediate: check post' },
      { name: 'Cuttack Junction', coord: [20.4625, 85.8830], desc: 'Intermediate: traffic clearance' },
      { name: 'Bhubaneswar Yard', coord: [20.2724, 85.8438], desc: 'Junction stop' },
      { name: 'Brahmapur Junction', coord: [19.3150, 84.7941], desc: 'Intermediate: power grid link' },
      { name: 'Simhadri Siding', coord: [17.6322, 83.1558], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine B-Plant X': {
    sourceName: 'Korba Siding (CG)',
    destName: 'NTPC Dadri (UP)',
    junctions: [
      { name: 'Korba Siding', coord: [22.3533, 82.6841], desc: 'Source: loading station' },
      { name: 'Bilaspur Junction', coord: [22.0797, 82.1391], desc: 'Junction stop' },
      { name: 'Anuppur Junction', coord: [23.1072, 81.6888], desc: 'Intermediate check' },
      { name: 'Katni Junction', coord: [23.8344, 80.4005], desc: 'Intermediate: sorting yard' },
      { name: 'Prayagraj Junction', coord: [25.4484, 81.8284], desc: 'Junction stop' },
      { name: 'Kanpur Central', coord: [26.4542, 80.3503], desc: 'Intermediate: speed check' },
      { name: 'NTPC Dadri Siding', coord: [28.5992, 77.5544], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine B-Plant Y': {
    sourceName: 'Korba Siding (CG)',
    destName: 'Singrauli STPS (MP)',
    junctions: [
      { name: 'Korba Siding', coord: [22.3533, 82.6841], desc: 'Source: loading station' },
      { name: 'Pendra Road', coord: [22.7725, 81.9535], desc: 'Intermediate stop' },
      { name: 'Anuppur Junction', coord: [23.1072, 81.6888], desc: 'Junction stop' },
      { name: 'Singrauli Siding', coord: [24.1039, 82.6842], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine B-Plant Z': {
    sourceName: 'Korba Siding (CG)',
    destName: 'Simhadri STPS (AP)',
    junctions: [
      { name: 'Korba Siding', coord: [22.3533, 82.6841], desc: 'Source: loading station' },
      { name: 'Bilaspur Junction', coord: [22.0797, 82.1391], desc: 'Junction stop' },
      { name: 'Raipur Junction', coord: [21.2514, 81.6296], desc: 'Junction stop' },
      { name: 'Titlagarh Junction', coord: [20.2925, 83.0135], desc: 'Intermediate check' },
      { name: 'Rayagada Junction', coord: [19.1678, 83.4158], desc: 'Intermediate bypass' },
      { name: 'Vizianagaram Jn', coord: [18.1130, 83.4004], desc: 'Junction stop' },
      { name: 'Simhadri Siding', coord: [17.6322, 83.1558], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine C-Plant X': {
    sourceName: 'Talcher Siding (OD)',
    destName: 'NTPC Dadri (UP)',
    junctions: [
      { name: 'Talcher Coal Siding', coord: [20.9507, 85.2286], desc: 'Source: loading station' },
      { name: 'Sambalpur Junction', coord: [21.4787, 83.9786], desc: 'Junction stop' },
      { name: 'Jharsuguda Junction', coord: [21.8540, 84.0254], desc: 'Intermediate check' },
      { name: 'Bilaspur Junction', coord: [22.0797, 82.1391], desc: 'Junction stop' },
      { name: 'Katni Junction', coord: [23.8344, 80.4005], desc: 'Intermediate yard' },
      { name: 'Prayagraj Junction', coord: [25.4484, 81.8284], desc: 'Junction stop' },
      { name: 'NTPC Dadri Siding', coord: [28.5992, 77.5544], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine C-Plant Y': {
    sourceName: 'Talcher Siding (OD)',
    destName: 'Singrauli STPS (MP)',
    junctions: [
      { name: 'Talcher Coal Siding', coord: [20.9507, 85.2286], desc: 'Source: loading station' },
      { name: 'Sambalpur Junction', coord: [21.4787, 83.9786], desc: 'Junction stop' },
      { name: 'Jharsuguda Junction', coord: [21.8540, 84.0254], desc: 'Intermediate check' },
      { name: 'Anuppur Junction', coord: [23.1072, 81.6888], desc: 'Junction stop' },
      { name: 'Singrauli Siding', coord: [24.1039, 82.6842], desc: 'Destination: unloading yard' }
    ]
  },
  'Mine C-Plant Z': {
    sourceName: 'Talcher Siding (OD)',
    destName: 'Simhadri STPS (AP)',
    junctions: [
      { name: 'Talcher Coal Siding', coord: [20.9507, 85.2286], desc: 'Source: loading station' },
      { name: 'Cuttack Junction', coord: [20.4625, 85.8830], desc: 'Junction stop' },
      { name: 'Bhubaneswar Yard', coord: [20.2724, 85.8438], desc: 'Junction stop' },
      { name: 'Khurda Road Jn', coord: [20.1706, 85.7335], desc: 'Intermediate check' },
      { name: 'Brahmapur Junction', coord: [19.3150, 84.7941], desc: 'Intermediate stop' },
      { name: 'Simhadri Siding', coord: [17.6322, 83.1558], desc: 'Destination: unloading yard' }
    ]
  }
};

const getRouteData = (source: string, destination: string): GeoRoute => {
  const key = `${source}-${destination}`;
  if (geoRoutes[key]) {
    return geoRoutes[key];
  }
  return geoRoutes['Mehsana Siding (GJ)-Nellore SDSTPS (AP)'] || geoRoutes['Mine A-Plant X'];
};

const interpolateCoordinates = (coords: [number, number][], progress: number): [number, number] => {
  if (coords.length === 0) return [23.7957, 86.4304];
  if (coords.length === 1 || progress <= 0) return coords[0];
  if (progress >= 100) return coords[coords.length - 1];

  const totalSegments = coords.length - 1;
  const rawIndex = (progress / 100) * totalSegments;
  const index = Math.floor(rawIndex);
  const segmentProgress = rawIndex - index;

  const start = coords[index];
  const end = coords[index + 1];

  const lat = start[0] + (end[0] - start[0]) * segmentProgress;
  const lng = start[1] + (end[1] - start[1]) * segmentProgress;

  return [lat, lng];
};

export default function App() {
  // Navigation & authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  
  // Real-time login session details
  const [sessionLoginTime, setSessionLoginTime] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [sessionIP, setSessionIP] = useState<string>('192.168.1.108');
  
  // App data state (enables actual interaction & mutation)
  const [rakes, setRakes] = useState<Rake[]>(initialRakes);
  const [sidings, setSidings] = useState<Siding[]>(initialSidings);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [notifications, setNotifications] = useState<string[]>([
    'Critical stock at Plant X - 3 days remaining',
    'Rake R102 delayed by 4 hours in route',
    'New optimized schedule generated'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Selected item states for detail views
  const [selectedRakeId, setSelectedRakeId] = useState<string>('R1024');
  const [selectedSidingName, setSelectedSidingName] = useState<string>('Siding A');
  const [selectedDestination, setSelectedDestination] = useState<string>('Power Plant A');
  const [selectedLanguage, setSelectedLanguage] = useState<'sql' | 'c' | 'cpp' | 'java'>('java');
  const [sidingHistoryOpen, setSidingHistoryOpen] = useState(false);

  // Custom Dynamic Route Pathfinder States
  const [customRouteFrom, setCustomRouteFrom] = useState<string>('Punjab');
  const [customRouteTo, setCustomRouteTo] = useState<string>('Telangana');
  const [useCustomRoute, setUseCustomRoute] = useState<boolean>(false);

  // Map Layer States
  const [activeMapLayer, setActiveMapLayer] = useState<'standard' | 'satellite' | 'terrain' | 'railway'>('standard');

  // Layout preview states
  const [isRealMobile, setIsRealMobile] = useState(false);
  const isMobile = isRealMobile;

  // Geolocation state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Prompt for browser geolocation on login or load, and save in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('railrake_user_location');
    if (saved) {
      try {
        setUserLocation(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse cached user location:", err);
      }
    }
  }, []);

  // Reverse geocode user location coordinates into City, State, and Pincode using OpenStreetMap Nominatim
  useEffect(() => {
    if (!userLocation) return;

    const cachedAddress = localStorage.getItem('railrake_user_address');
    if (cachedAddress) {
      setUserAddress(cachedAddress);
      return;
    }

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'RAILRAKE-SIH-Prototype'
            }
          }
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.county || 'Unknown City';
          const state = addr.state || 'Unknown State';
          const pincode = addr.postcode || '';
          const formattedAddress = `${city}, ${state}${pincode ? ` - ${pincode}` : ''}`;
          
          setUserAddress(formattedAddress);
          localStorage.setItem('railrake_user_address', formattedAddress);
        }
      } catch (err) {
        console.warn("Failed to reverse geocode user coordinates:", err);
      }
    };

    fetchAddress();
  }, [userLocation]);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      localStorage.removeItem('railrake_user_address');
      setUserAddress(null);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          localStorage.setItem('railrake_user_location', JSON.stringify(loc));
          triggerToast('Current location coordinates loaded. Locating address...', 'info');
        },
        (err) => {
          console.warn("Geolocation access denied or timed out:", err);
          triggerToast('Could not access location. Please enable GPS permissions.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      triggerToast('Geolocation is not supported by your browser.', 'warning');
    }
  };

  // User input states
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Detect real screen sizes for responsive preview logic
  useEffect(() => {
    const handleResize = () => {
      setIsRealMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refs for Leaflet Map
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeOverlayPolylineRef = useRef<L.Polyline | null>(null);
  const stationMarkersRef = useRef<L.Marker[]>([]);
  const lastActiveRouteRef = useRef<string>('');

  // Telemetry tracking useEffect hook
  useEffect(() => {
    if (currentScreen !== 'tracking' || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        trainMarkerRef.current = null;
        userMarkerRef.current = null;
        routePolylineRef.current = null;
        if (routeOverlayPolylineRef.current) {
          routeOverlayPolylineRef.current.remove();
          routeOverlayPolylineRef.current = null;
        }
        if (tileLayerRef.current) {
          tileLayerRef.current.remove();
          tileLayerRef.current = null;
        }
        if (overlayLayerRef.current) {
          overlayLayerRef.current.remove();
          overlayLayerRef.current = null;
        }
        stationMarkersRef.current = [];
      }
      return;
    }

    const active = rakes.find((r) => r.id === selectedRakeId) || rakes[0];
    let route: GeoRoute;
    let progress = active.routeProgress;
    let status = active.status;

    if (useCustomRoute) {
      const customStations = findRailRoute(customRouteFrom, customRouteTo);
      route = {
        sourceName: railJunctions[customRouteFrom]?.name || customRouteFrom,
        destName: railJunctions[customRouteTo]?.name || customRouteTo,
        junctions: customStations
      };
      progress = 50; // Pin custom train at 50% progress
      status = 'IN TRANSIT';
    } else {
      route = getRouteData(active.source, active.destination);
    }

    // Check if the overall route has changed to trigger zoom resetting
    const routeKey = useCustomRoute 
      ? `custom-${customRouteFrom}-${customRouteTo}` 
      : `rake-${selectedRakeId}-${active.source}-${active.destination}`;
    const routeChanged = lastActiveRouteRef.current !== routeKey;
    if (routeChanged) {
      lastActiveRouteRef.current = routeKey;
    }

    const coords = route.junctions.map((j) => j.coord);
    const trainPos = interpolateCoordinates(coords, progress);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(trainPos, 6);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Handle dynamic map tiles swapping in real-time
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }
    if (overlayLayerRef.current) {
      overlayLayerRef.current.remove();
      overlayLayerRef.current = null;
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let options: L.TileLayerOptions = { maxZoom: 18 };

    if (activeMapLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      options = {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      };
    } else if (activeMapLayer === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      options = {
        maxZoom: 17,
        attribution: 'Map &copy; OpenTopoMap'
      };
    }

    tileLayerRef.current = L.tileLayer(url, options).addTo(map);

    if (activeMapLayer === 'railway') {
      overlayLayerRef.current = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map &copy; OpenRailwayMap'
      }).addTo(map);
    }

    // Remove old markers
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    const createCustomIcon = (color: string, label: string, isMain: boolean = false) => {
      const pulsingRing = isMain 
        ? `<span class="animate-ping absolute inline-flex h-7 w-7 rounded-full opacity-35" style="background-color: ${color}"></span>`
        : '';
        
      return L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="relative flex flex-col items-center">
                 <div class="relative flex items-center justify-center w-6 h-6">
                   ${pulsingRing}
                   <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md z-10" style="background-color: ${color}"></div>
                 </div>
                 <span class="text-[10px] font-extrabold text-slate-900 bg-white/95 border border-slate-300 rounded-md px-2 py-0.5 mt-0.5 whitespace-nowrap shadow-md z-10">${label}</span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 12]
      });
    };
 
    route.junctions.forEach((j, index) => {
      // Only render markers for major hubs to avoid cluttering (skip intermediate track points)
      if (j.isMain === false) return;

      let color = '#2563eb';
      let isMain = false;
      
      if (index === 0) {
        color = '#10b981'; // Green for Source Siding
        isMain = true;
      } else if (index === route.junctions.length - 1) {
        color = '#8b5cf6'; // Purple for Target Plant
        isMain = true;
      }

      const marker = L.marker(j.coord, {
        icon: createCustomIcon(color, j.name, isMain)
      })
      .bindPopup(`<strong>${j.name}</strong><br/>${j.desc || 'Railway Junction Point'}`)
      .addTo(map);

      // On marker click, fly in deeply to zoom 16 and activate satellite imagery tiles
      marker.on('click', () => {
        map.flyTo(j.coord, 16, {
          animate: true,
          duration: 1.5
        });
        setActiveMapLayer('satellite');
        triggerToast(`Zooming to siding: ${j.name} (Satellite View)`, 'info');
      });

      stationMarkersRef.current.push(marker);
    });

    const trackColor = status === 'DELAYED' ? '#dc2626' : '#2563eb';

    // Draw solid railroad background path
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(coords);
      routePolylineRef.current.setStyle({ color: trackColor });
    } else {
      routePolylineRef.current = L.polyline(coords, {
        color: trackColor,
        weight: 5,
        opacity: 0.95
      }).addTo(map);
    }

    // Draw white dash overlay to mimic railroad ties
    if (routeOverlayPolylineRef.current) {
      routeOverlayPolylineRef.current.setLatLngs(coords);
    } else {
      routeOverlayPolylineRef.current = L.polyline(coords, {
        color: '#ffffff',
        weight: 1.5,
        dashArray: '6, 8',
        opacity: 0.9
      }).addTo(map);
    }

    const pulsingIcon = L.divIcon({
      className: 'custom-pulsing-marker',
      html: `<div class="relative flex items-center justify-center">
               <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-60"></span>
               <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (trainMarkerRef.current) {
      trainMarkerRef.current.setLatLng(trainPos);
    } else {
      trainMarkerRef.current = L.marker(trainPos, {
        icon: pulsingIcon
      })
      .bindPopup(`<strong>Train Position</strong><br/>Speed: 52 km/h<br/>Status: ${status}`)
      .addTo(map);
    }

    // Render user's current location if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="relative flex items-center justify-center">
                 <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
                 <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white shadow-lg"></span>
                 <span class="absolute top-5 text-[8px] font-bold text-emerald-800 bg-white/90 border border-emerald-100 rounded px-1.5 py-0.5 whitespace-nowrap shadow-xs">You</span>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
        userMarkerRef.current.setPopupContent(`<strong>Your Current Location</strong><br/>${userAddress || 'Locating address...'}`);
      } else {
        userMarkerRef.current = L.marker(userLocation, {
          icon: userIcon
        })
        .bindPopup(`<strong>Your Current Location</strong><br/>${userAddress || 'Locating address...'}`)
        .addTo(map);
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    if (routeChanged) {
      map.flyTo(trainPos, 6, {
        animate: true,
        duration: 1.2
      });
    }
  }, [currentScreen, selectedRakeId, rakes, userLocation, userAddress, useCustomRoute, customRouteFrom, customRouteTo, activeMapLayer]);

  // Back navigation helper
  const navigateTo = (screen: string) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    setShowNotifications(false);
    setSidingHistoryOpen(false);
  };

  const navigateBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory((prevHist) => prevHist.slice(0, prevHist.length - 1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  // Toast notifier helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Authentication logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter username and password.');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);
    setTimeout(() => {
      const now = new Date();
      const loginTimeString = now.toLocaleString();
      const randomToken = 'jwt_sih1319_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const ips = ['10.227.28.56', '192.168.1.108', '172.16.23.45', '10.0.4.92'];
      const randomIP = ips[Math.floor(Math.random() * ips.length)];
      
      setSessionLoginTime(loginTimeString);
      setSessionToken(randomToken);
      setSessionIP(randomIP);

      setLoginLoading(false);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
      triggerToast(`Successfully logged in as ${username}`);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setScreenHistory([]);
    setCurrentScreen('login');
    triggerToast('Logged out successfully', 'info');
  };

  // Siding allocation action
  const handleAllocate = (rakeId: string, sidingName: string) => {
    // Modify status of allocated rake
    setRakes((prevRakes) =>
      prevRakes.map((r) =>
        r.id === rakeId
          ? {
              ...r,
              status: 'IN TRANSIT',
              destination: sidingName === 'Siding A' ? 'Plant X' : sidingName === 'Siding B' ? 'Plant Y' : 'Plant Z',
              currentLocation: 'Mine A Yard',
              eta: '13 Aug, 08:30 PM',
              distanceLeft: sidingName === 'Siding A' ? 82 : sidingName === 'Siding B' ? 105 : 120,
              routeProgress: 10,
              routeStations: ['Mine A', sidingName]
            }
          : r
      )
    );

    // Modify stock/waiting rakes on siding
    setSidings((prevSidings) =>
      prevSidings.map((s) =>
        s.name === sidingName
          ? {
              ...s,
              coalStock: s.coalStock + 4000,
              currentRakes: s.currentRakes + 1
            }
          : s
      )
    );

    // Add alert
    const newAlert: Alert = {
      id: `A${alerts.length + 1}`,
      type: 'warning',
      title: 'Allocation Complete',
      message: `Rake ${rakeId} scheduled for dispatch to ${sidingName}.`,
      time: 'Just Now'
    };
    setAlerts([newAlert, ...alerts]);

    setAllocationSuccess(`Rake ${rakeId} successfully allocated to ${sidingName}.`);
    triggerToast(`Rake ${rakeId} allocated to ${sidingName}`);
    setTimeout(() => setAllocationSuccess(null), 5000);
  };

  // Simulating report downloads
  const handleDownloadReport = (reportName: string) => {
    triggerToast(`Downloading ${reportName}...`);
    setTimeout(() => {
      triggerToast('Report generated successfully.', 'success');
    }, 1200);
  };

  // Get active forecast details
  const activeForecast = initialForecasts.find((f) => f.destination === selectedDestination) || initialForecasts[0];
  // Get active siding details
  const activeSiding = sidings.find((s) => s.name === selectedSidingName) || sidings[0];
  // Get active tracking rake details
  const activeRake = rakes.find((r) => r.id === selectedRakeId) || rakes.find((r) => r.id === 'R1024')!;

  // Screen rendering router function
  const renderScreenContent = () => {
    // If not authenticated, force login screen
    if (!isAuthenticated) {
      return renderLoginScreen();
    }

    switch (currentScreen) {
      case 'dashboard':
        return renderDashboard();
      case 'tracking':
        return renderRakeTracking();
      case 'forecast':
        return renderDemandForecast();
      case 'schedule':
        return renderRakeSchedule();
      case 'allocation':
        return renderRakeAllocation();
      case 'siding':
        return renderSidingDetails();
      case 'alerts':
        return renderAlerts();
      case 'analytics':
        return renderAnalytics();
      case 'reports':
        return renderReports();
      case 'profile':
        return renderProfile();
      case 'menu':
        return renderMenuMobile();
      case 'codeviewer':
        return renderCodeViewer();
      default:
        return renderDashboard();
    }
  };

  // --- COMPONENT RENDERERS ---

  // 1. LOGIN SCREEN
  const renderLoginScreen = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-slate-100 shadow-md">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-blue-50 text-blue-600">
              <Train className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">RAILRAKE</h1>
            <p className="text-sm font-medium text-slate-500">Forecasting & Scheduling System</p>
            <p className="text-xs text-slate-400 mt-1">SIH1319 • Ministry of Coal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('Password reset link sent to registered email', 'info'); }} className="text-xs font-medium text-blue-600 hover:underline">Forgot Password?</a>
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center cursor-pointer"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { setUsername('sih-user'); setPassword('pass123'); triggerToast('Mock credential filled. Click Login.'); }}
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              onClick={() => { setUsername('coal-admin'); setPassword('secure'); triggerToast('Mock credential filled. Click Login.'); }}
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h11v11H0z" />
                <path fill="#80bb0a" d="M12 0h11v11H12z" />
                <path fill="#00a1f1" d="M0 12h11v11H0z" />
                <path fill="#ffb900" d="M12 12h11v11H12z" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('Self-registration is disabled for production prototype.', 'warning'); }} className="text-xs font-semibold text-blue-600 hover:underline">Sign Up</a>
          </div>
        </div>
      </div>
    );
  };

  // 2. DASHBOARD
  const renderDashboard = () => {
    // Calc stats from current state
    const transitCount = rakes.filter((r) => r.status === 'IN TRANSIT').length;
    const loadingCount = rakes.filter((r) => r.status === 'LOADING').length;
    const unloadedCount = rakes.filter((r) => r.status === 'UNLOADED').length;
    const delayedCount = rakes.filter((r) => r.status === 'DELAYED').length;
    const availableCount = rakes.filter((r) => r.status === 'AVAILABLE').length;

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Hello, {username || 'Admin'}</h2>
            <p className="text-sm text-slate-500">Welcome back to Operations Console!</p>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-green-50 text-green-700 font-medium rounded-full border border-green-100 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Live Monitoring
              </span>
            </div>
          )}
        </div>

        {/* 6 Major Status Cards Grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
          <div
            onClick={() => navigateTo('schedule')}
            className="p-5 bg-blue-600 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Train className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">ALL</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Total Rakes</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{rakes.length * 15}</p>
          </div>

          <div
            onClick={() => { setSelectedRakeId('R1024'); navigateTo('tracking'); }}
            className="p-5 bg-emerald-600 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">LIVE</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">In Transit</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{transitCount + 40}</p>
          </div>

          <div
            onClick={() => navigateTo('siding')}
            className="p-5 bg-amber-500 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">LOAD</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Loading</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{loadingCount + 15}</p>
          </div>

          <div
            onClick={() => navigateTo('siding')}
            className="p-5 bg-purple-600 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">YARD</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Unloaded</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{unloadedCount + 30}</p>
          </div>

          <div
            onClick={() => navigateTo('alerts')}
            className="p-5 bg-rose-600 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">RISK</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Delayed</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{delayedCount + 15}</p>
          </div>

          <div
            onClick={() => navigateTo('allocation')}
            className="p-5 bg-cyan-600 text-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Sliders className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">FREE</span>
            </div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Available</p>
            <p className="text-3xl font-extrabold mt-1 font-display">{availableCount + 20}</p>
          </div>
        </div>

        {/* Overview & Quick Actions grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Today Overview */}
          <div className={`p-6 bg-white border border-slate-100 rounded-2xl shadow-sm ${isMobile ? '' : 'lg:col-span-2'}`}>
            <h3 className="text-base font-bold text-slate-800 mb-4 font-display">Today Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${isMobile ? 'p-3' : 'p-4'}`}>
                <span className={`text-slate-400 font-semibold uppercase tracking-wider block ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Coal Stock</span>
                <span className={`font-bold text-slate-800 mt-1 block ${isMobile ? 'text-lg' : 'text-2xl'}`}>1,25,000 MT</span>
                <span className={`text-green-600 font-medium mt-1 inline-flex items-center gap-0.5 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                  <ArrowUpRight className="w-3 h-3" /> +4.2%
                </span>
              </div>
              <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${isMobile ? 'p-3' : 'p-4'}`}>
                <span className={`text-slate-400 font-semibold uppercase tracking-wider block ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Today's Schedule</span>
                <span className={`font-bold text-slate-800 mt-1 block ${isMobile ? 'text-lg' : 'text-2xl'}`}>18 Rakes</span>
                <span className={`text-blue-600 font-medium mt-1 inline-flex items-center gap-0.5 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                  <Info className="w-3 h-3" /> 12 load, 6 transit
                </span>
              </div>
              <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${isMobile ? 'p-3' : 'p-4'}`}>
                <span className={`text-slate-400 font-semibold uppercase tracking-wider block ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Estimated Demurrage</span>
                <span className={`font-bold text-rose-600 mt-1 block ${isMobile ? 'text-lg' : 'text-2xl'}`}>₹5,40,000</span>
                <span className={`text-rose-500 font-medium mt-1 inline-flex items-center gap-0.5 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                  ⚠️ High Risk
                </span>
              </div>
              <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${isMobile ? 'p-3' : 'p-4'}`}>
                <span className={`text-slate-400 font-semibold uppercase tracking-wider block ${isMobile ? 'text-[10px]' : 'text-xs'}`}>On Time Rate</span>
                <span className={`font-bold text-emerald-600 mt-1 block ${isMobile ? 'text-lg' : 'text-2xl'}`}>82%</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Quick Actions & Live Session Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4 font-display">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigateTo('allocation')}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all border border-blue-100 font-medium cursor-pointer"
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-xs">Request Rake</span>
                  </button>
                  <button
                    onClick={() => { setSelectedRakeId('R1024'); navigateTo('tracking'); }}
                    className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all border border-emerald-100 font-medium cursor-pointer"
                  >
                    <Activity className="w-6 h-6 mb-2" />
                    <span className="text-xs">Track Rake</span>
                  </button>
                  <button
                    onClick={() => navigateTo('schedule')}
                    className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all border border-amber-100 font-medium cursor-pointer"
                  >
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-xs">Schedule</span>
                  </button>
                  <button
                    onClick={() => navigateTo('alerts')}
                    className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all border border-rose-100 font-medium cursor-pointer"
                  >
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <span className="text-xs">Alert Center</span>
                  </button>
                </div>
              </div>
              {!isMobile && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700">Code Architecture</span>
                  </div>
                  <button
                    onClick={() => navigateTo('codeviewer')}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View Code <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Active Session Monitor Card */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider uppercase text-blue-400 font-display">Active Session Monitor</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span>Sign In User</span>
                  <span className="font-bold text-white">{username || 'Admin'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span>Connection IP</span>
                  <span className="font-mono font-bold text-white">{sessionIP || '10.227.28.56'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span>Auth Timestamp</span>
                  <span className="text-white font-medium">{sessionLoginTime || 'August 12, 2026, 11:40 AM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Protocol</span>
                  <span className="text-emerald-400 font-bold">SECURE SSL / TLS 1.3</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 block mb-1">Session Auth Token</span>
                  <div className="font-mono text-[9px] bg-slate-950 p-2 rounded text-blue-400 overflow-x-auto whitespace-nowrap scrollbar-thin select-all">
                    {sessionToken || 'JWT_SIH1319_LOCAL_SECURE_DEMO_KEY'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Rakes Mini List */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 font-display">Active In-Transit Rakes</h3>
            <button onClick={() => navigateTo('schedule')} className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-3 px-2">Rake ID</th>
                  <th className="py-3 px-2">Source</th>
                  <th className="py-3 px-2">Destination</th>
                  <th className="py-3 px-2">Load</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rakes.slice(0, 3).map((rake) => (
                  <tr key={rake.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-800">{rake.id}</td>
                    <td className="py-3 px-2 text-slate-500">{rake.source}</td>
                    <td className="py-3 px-2 text-slate-500">{rake.destination}</td>
                    <td className="py-3 px-2 text-slate-600 font-medium">{rake.coalAmount} MT ({rake.grade})</td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                        rake.status === 'IN TRANSIT'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : rake.status === 'DELAYED'
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {rake.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => { setSelectedRakeId(rake.id); navigateTo('tracking'); }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. RAKE TRACKING
  const renderRakeTracking = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Rake Tracking</h2>
            <p className="text-sm text-slate-500">Real-time GPS & RFID sensor updates</p>
          </div>
        </div>

        {/* Selector Header */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Rake:</span>
              <select
                value={selectedRakeId}
                onChange={(e) => {
                  setSelectedRakeId(e.target.value);
                  setUseCustomRoute(false);
                }}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
              >
                {rakes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={requestUserLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                userLocation
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold animate-fade-in'
                  : 'bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {userLocation 
                ? `📍 ${userAddress || 'Locating Address...'}` 
                : '📍 Use Current Location'}
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">From:</span>
              <select
                value={useCustomRoute ? customRouteFrom : ''}
                onChange={(e) => {
                  setCustomRouteFrom(e.target.value);
                  setUseCustomRoute(true);
                }}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="" disabled hidden>Select Start</option>
                {Object.keys(railJunctions).filter(k => !['Kanpur', 'Prayagraj', 'DDU', 'Katni', 'Bhopal', 'Bhusaval', 'Wardha', 'Balharshah', 'Vijayawada'].includes(k)).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">To:</span>
              <select
                value={useCustomRoute ? customRouteTo : ''}
                onChange={(e) => {
                  setCustomRouteTo(e.target.value);
                  setUseCustomRoute(true);
                }}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="" disabled hidden>Select End</option>
                {Object.keys(railJunctions).filter(k => !['Kanpur', 'Prayagraj', 'DDU', 'Katni', 'Bhopal', 'Bhusaval', 'Wardha', 'Balharshah', 'Vijayawada'].includes(k)).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            
            {useCustomRoute && (
              <button
                onClick={() => setUseCustomRoute(false)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md font-bold text-white ${
              activeRake.status === 'IN TRANSIT'
                ? 'bg-green-600'
                : activeRake.status === 'DELAYED'
                ? 'bg-rose-600'
                : activeRake.status === 'LOADING'
                ? 'bg-amber-500'
                : 'bg-purple-600'
            }`}>
              {activeRake.status}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Source</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{activeRake.source}</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Destination</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{activeRake.destination}</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Load Details</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{activeRake.coalAmount} MT ({activeRake.grade})</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Arrival</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">{activeRake.eta}</span>
          </div>
        </div>

        {/* Map Rendering Panel */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Route Map</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> Live GPS Tracking Active
            </span>
          </div>
          
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm" style={{ zIndex: 10 }}>
            {/* The Map Div */}
            <div ref={mapContainerRef} className="h-96 w-full bg-slate-50 relative" />

            {/* Map Layers Selector Overlay - Google Maps style */}
            <div className="absolute bottom-4 left-4 z-[1000] flex items-end gap-2">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-2 flex items-center gap-2 transition-all animate-fade-in">
                <button
                  onClick={() => setActiveMapLayer('standard')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                    activeMapLayer === 'standard'
                      ? 'bg-blue-50 border-2 border-blue-500 font-bold text-blue-700'
                      : 'border-2 border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-semibold">Standard</span>
                </button>

                <button
                  onClick={() => setActiveMapLayer('satellite')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                    activeMapLayer === 'satellite'
                      ? 'bg-blue-50 border-2 border-blue-500 font-bold text-blue-700'
                      : 'border-2 border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-3h1.5a2.5 2.5 0 012.5 2.5V12m-9-3h7.17M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-semibold">Satellite</span>
                </button>

                <button
                  onClick={() => setActiveMapLayer('terrain')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                    activeMapLayer === 'terrain'
                      ? 'bg-blue-50 border-2 border-blue-500 font-bold text-blue-700'
                      : 'border-2 border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-semibold">Terrain</span>
                </button>

                <button
                  onClick={() => setActiveMapLayer('railway')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                    activeMapLayer === 'railway'
                      ? 'bg-blue-50 border-2 border-blue-500 font-bold text-blue-700'
                      : 'border-2 border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-semibold">Railways</span>
                </button>
              </div>
            </div>

            {/* Map Telemetry Overlay card */}
            <div className="absolute top-4 right-4 z-[1000] p-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl shadow-lg w-52 leading-tight space-y-2 text-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Live Telemetry</span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Position:</span>
                <strong className="text-slate-800 font-bold font-mono">
                  {interpolateCoordinates(
                    (useCustomRoute 
                      ? findRailRoute(customRouteFrom, customRouteTo)
                      : getRouteData(activeRake.source, activeRake.destination).junctions
                    ).map((j) => j.coord),
                    useCustomRoute ? 50 : activeRake.routeProgress
                  )[0].toFixed(4)}° N
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium"></span>
                <strong className="text-slate-800 font-bold font-mono">
                  {interpolateCoordinates(
                    (useCustomRoute 
                      ? findRailRoute(customRouteFrom, customRouteTo)
                      : getRouteData(activeRake.source, activeRake.destination).junctions
                    ).map((j) => j.coord),
                    useCustomRoute ? 50 : activeRake.routeProgress
                  )[1].toFixed(4)}° E
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Speed:</span>
                <strong className="text-blue-600 font-bold">52 km/h</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">GPS Lock:</span>
                <strong className="text-green-600 font-bold">LOCKED (99.8%)</strong>
              </div>
            </div>
          </div>

          {/* Real stations checklist */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Route Siding Milestones</h4>
            <div className="flex flex-col gap-2">
              {(useCustomRoute 
                ? findRailRoute(customRouteFrom, customRouteTo)
                : getRouteData(activeRake.source, activeRake.destination).junctions
              )
              .filter(j => j.isMain !== false)
              .map((j, index, arr) => {
                const totalStations = arr.length;
                const progressPercentage = (index / (totalStations - 1)) * 100;
                const activeProgress = useCustomRoute ? 50 : activeRake.routeProgress;
                const visited = activeProgress >= progressPercentage;
                const active = Math.abs(activeProgress - progressPercentage) < (100 / (totalStations - 1)) * 0.5;

                return (
                  <div key={index} className="flex items-center justify-between text-xs border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full border ${
                        active ? 'bg-blue-600 border-blue-200 animate-pulse' : visited ? 'bg-emerald-500 border-emerald-200' : 'bg-slate-200 border-slate-300'
                      }`}></div>
                      <span className={`font-semibold ${active ? 'text-blue-600 font-bold' : visited ? 'text-slate-700' : 'text-slate-400'}`}>{j.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{j.desc || (index === 0 ? 'Start Siding' : index === arr.length - 1 ? 'End Siding' : 'Railway Junction')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Distance Left</span>
              <span className="text-xl font-bold text-slate-800 mt-1 block">{activeRake.distanceLeft} km</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Expected Delay</span>
              <span className={`text-xl font-bold mt-1 block ${
                activeRake.expectedDelay !== '0h 0m' ? 'text-rose-600' : 'text-slate-800'
              }`}>{activeRake.expectedDelay}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => triggerToast(`Connecting to real-time RFID/GPS sensor on ${activeRake.id}...`)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-100 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Sensor Telemetry
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 4. DEMAND FORECAST
  const renderDemandForecast = () => {
    // Generate data for graph based on selected destination stock depletion
    const forecastVals = [
      activeForecast.currentStock,
      activeForecast.tomorrow,
      activeForecast.in3Days,
      activeForecast.in7Days,
      activeForecast.in15Days
    ];
    const labels = ['Current', '1 Day', '3 Days', '7 Days', '15 Days'];
    const maxVal = Math.max(...forecastVals, 50000);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Demand Forecast</h2>
            <p className="text-sm text-slate-500">AI prediction of coal deplete curves and scheduling requirements</p>
          </div>
        </div>

        {/* Siding Selector */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination:</span>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
            >
              {initialForecasts.map((f) => (
                <option key={f.destination} value={f.destination}>
                  {f.destination}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Predicted By</span>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Exponential Decay Model (C Engine)
            </span>
          </div>
        </div>

        {/* Stock status grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Current Stock</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{activeForecast.currentStock.toLocaleString()} MT</span>
          </div>
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Daily Burn Rate</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{activeForecast.dailyConsumption.toLocaleString()} MT</span>
          </div>
        </div>

        {/* Depletion Curve Graphic (SVG-based line graph) */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-display">Inventory Depletion Forecast Curve</h3>
          
          <div className="relative pt-6 pb-2 px-4 bg-slate-50/50 rounded-xl">
            {/* Chart SVG */}
            <svg className="w-full h-48" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#f1f5f9" strokeWidth="1" />
              {/* Critical threshold line */}
              <line x1="0" y1="140" x2="500" y2="140" stroke="#fda4af" strokeWidth="1" strokeDasharray="4 4" />
              <text x="10" y="135" fill="#f43f5e" className="text-[8px] font-bold">Critical Threshold (10k MT)</text>

              {/* Draw Plot Line */}
              {(() => {
                const points = forecastVals.map((val, idx) => {
                  const x = (idx / 4) * 500;
                  // Map val range [0, maxVal] to y-axis range [180, 20]
                  const y = 180 - (Math.max(val, 0) / maxVal) * 160;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      points={points.join(' ')}
                      className="transition-all duration-300"
                    />
                    {/* Dots */}
                    {forecastVals.map((val, idx) => {
                      const x = (idx / 4) * 500;
                      const y = 180 - (Math.max(val, 0) / maxVal) * 160;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="5"
                          className="fill-white stroke-blue-600 stroke-2 cursor-pointer hover:r-7 transition-all"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between mt-3 px-2 text-[10px] font-semibold text-slate-400">
              {labels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>

          <div className={`grid gap-3 pt-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">TOMORROW</span>
              <span className="text-sm font-bold text-slate-700 mt-1 block">{Math.max(activeForecast.tomorrow, 0).toLocaleString()} MT</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">IN 3 DAYS</span>
              <span className={`text-sm font-bold mt-1 block ${activeForecast.in3Days < 10000 ? 'text-rose-600' : 'text-slate-700'}`}>
                {Math.max(activeForecast.in3Days, 0).toLocaleString()} MT
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">IN 7 DAYS</span>
              <span className={`text-sm font-bold mt-1 block ${activeForecast.in7Days < 10000 ? 'text-rose-600' : 'text-slate-700'}`}>
                {Math.max(activeForecast.in7Days, 0).toLocaleString()} MT
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block">IN 15 DAYS</span>
              <span className={`text-sm font-bold mt-1 block ${activeForecast.in15Days < 10000 ? 'text-rose-600' : 'text-slate-700'}`}>
                {Math.max(activeForecast.in15Days, 0).toLocaleString()} MT
              </span>
            </div>
          </div>
        </div>

        {/* Warning card & recommended actions */}
        <div className={`p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col justify-between gap-4 ${isMobile ? '' : 'md:flex-row md:items-center'}`}>
          <div className="flex gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl h-fit">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Critical Stock Expected in {activeForecast.criticalDay} Days</h4>
              <p className="text-xs text-rose-700 mt-0.5">Coal stocks will plummet below emergency reserves unless rakes are dispatched.</p>
            </div>
          </div>
          <div className="bg-white/80 border border-rose-100 rounded-xl p-3 text-center md:min-w-[120px]">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Delivery</span>
            <span className="text-lg font-bold text-rose-600">{activeForecast.recommendedRakes} Rakes</span>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigateTo('allocation')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Allocate Rakes Now
          </button>
        </div>
      </div>
    );
  };

  // 5. RAKE SCHEDULE
  const renderRakeSchedule = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Rake Schedule</h2>
            <p className="text-sm text-slate-500">Daily logistics and dispatch timetable</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <input
              type="date"
              defaultValue="2026-08-12"
              className="bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">Total: {rakes.length} schedules</span>
        </div>

        {/* Table view on Desktop / Card lists on Mobile */}
        {isMobile ? (
          <div className="space-y-4">
            {rakes.map((rake) => (
              <div
                key={rake.id}
                onClick={() => { setSelectedRakeId(rake.id); navigateTo('tracking'); }}
                className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-extrabold text-slate-800">{rake.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                    rake.status === 'IN TRANSIT'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : rake.status === 'DELAYED'
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {rake.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Source:</span>
                    <span className="font-semibold text-slate-700">{rake.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Destination:</span>
                    <span className="font-semibold text-slate-700">{rake.destination}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Time: <strong className="text-slate-700">{rake.eta}</strong></span>
                    <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">Track Rake →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold">
                  <th className="py-3.5 px-6">Rake ID</th>
                  <th className="py-3.5 px-6">Source</th>
                  <th className="py-3.5 px-6">Destination</th>
                  <th className="py-3.5 px-6">ETA / Schedule</th>
                  <th className="py-3.5 px-6">Load Grade</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rakes.map((rake) => (
                  <tr key={rake.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{rake.id}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{rake.source}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{rake.destination}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-semibold">{rake.eta}</td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{rake.coalAmount} MT ({rake.grade})</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                        rake.status === 'IN TRANSIT'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : rake.status === 'DELAYED'
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {rake.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => { setSelectedRakeId(rake.id); navigateTo('tracking'); }}
                        className="px-3 py-1 bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Track Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => handleDownloadReport('System Schedule ScheduleReport.pdf')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Full Schedule
          </button>
        </div>
      </div>
    );
  };

  // 6. RAKE ALLOCATION
  const renderRakeAllocation = () => {
    const unallocatedRake = rakes.find((r) => r.id === 'R4582') || rakes[0];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Rake Allocation</h2>
            <p className="text-sm text-slate-500">Heuristic recommendation solver (C++ Optimizer Engine)</p>
          </div>
        </div>

        {/* Rake Selection details */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pending Allocation Rake</h3>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rake ID</span>
              <span className="text-lg font-bold text-slate-800">{unallocatedRake.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Coal Amount</span>
              <span className="text-lg font-bold text-slate-800">{unallocatedRake.coalAmount} MT</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Coal Grade</span>
              <span className="text-lg font-bold text-slate-800">{unallocatedRake.grade}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Source</span>
              <span className="text-lg font-bold text-slate-800">{unallocatedRake.source}</span>
            </div>
          </div>
        </div>

        {/* Recommended Destination List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">AI Optimizer Recommendations</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <Shield className="w-3.5 h-3.5" /> High Demurrage Risk Mitigation Enabled
            </span>
          </div>

          {/* Allocation Success Toast banner */}
          {allocationSuccess && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
              {allocationSuccess}
            </div>
          )}

          {/* Siding list */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {/* Recommendation 1: Siding A */}
            <div className="p-6 bg-white hover:bg-slate-50/50 border-2 border-emerald-500 rounded-2xl shadow-sm relative transition-all flex flex-col justify-between">
              <div>
                <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  ⭐ Recommended
                </span>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                  <h4 className="font-bold text-slate-800 text-base">Siding A</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex justify-between"><span className="font-medium">Distance:</span> <strong className="text-slate-800">82 km</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Stock:</span> <strong className="text-slate-800">18,000 MT</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Risk Score:</span> <strong className="text-emerald-600 font-bold">LOW RISK</strong></div>
                </div>
              </div>
              <button
                onClick={() => handleAllocate(unallocatedRake.id, 'Siding A')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 cursor-pointer text-center"
              >
                Allocate Siding A
              </button>
            </div>

            {/* Recommendation 2: Siding B */}
            <div className="p-6 bg-white hover:bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                  <h4 className="font-bold text-slate-800 text-base">Siding B</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex justify-between"><span className="font-medium">Distance:</span> <strong className="text-slate-800">105 km</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Stock:</span> <strong className="text-slate-800">9,000 MT</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Risk Score:</span> <strong className="text-amber-500 font-bold">MEDIUM RISK</strong></div>
                </div>
              </div>
              <button
                onClick={() => handleAllocate(unallocatedRake.id, 'Siding B')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer text-center"
              >
                Allocate Siding B
              </button>
            </div>

            {/* Recommendation 3: Siding C */}
            <div className="p-6 bg-white hover:bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                  <h4 className="font-bold text-slate-800 text-base">Siding C</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex justify-between"><span className="font-medium">Distance:</span> <strong className="text-slate-800">120 km</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Stock:</span> <strong className="text-slate-800">3,000 MT</strong></div>
                  <div className="flex justify-between"><span className="font-medium">Risk Score:</span> <strong className="text-rose-600 font-bold">HIGH RISK</strong></div>
                </div>
              </div>
              <button
                onClick={() => handleAllocate(unallocatedRake.id, 'Siding C')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer text-center"
              >
                Allocate Siding C
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 7. SIDING DETAILS
  const renderSidingDetails = () => {
    const stockPercent = Math.round((activeSiding.coalStock / activeSiding.capacity) * 100);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Siding Details</h2>
            <p className="text-sm text-slate-500">Unloading yard efficiency & capacities</p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Siding:</span>
            <select
              value={selectedSidingName}
              onChange={(e) => setSelectedSidingName(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
            >
              {sidings.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
            activeSiding.demurrageRisk === 'LOW'
              ? 'bg-green-50 text-green-700 border-green-100'
              : activeSiding.demurrageRisk === 'MEDIUM'
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            Risk: {activeSiding.demurrageRisk}
          </span>
        </div>

        {/* Coal Stock Progress Bar */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-700">Coal Stock Capacity</span>
            <span className="font-extrabold text-slate-800">{activeSiding.coalStock.toLocaleString()} / {activeSiding.capacity.toLocaleString()} MT ({stockPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stockPercent > 80
                  ? 'bg-rose-500'
                  : stockPercent > 50
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${stockPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Operating metrics grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Loading Capacity</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">{activeSiding.loadingCapacity} Rakes/day</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Unloading Capacity</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">{activeSiding.unloadingCapacity} Rakes/day</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Current / Waiting</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">{activeSiding.currentRakes} Active / {activeSiding.waitingRakes} Waiting</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Demurrage Risk</span>
            <span className={`text-base font-bold mt-1 block ${
              activeSiding.demurrageRisk === 'HIGH' ? 'text-rose-600' : activeSiding.demurrageRisk === 'MEDIUM' ? 'text-amber-500' : 'text-green-600'
            }`}>{activeSiding.demurrageRisk}</span>
          </div>
        </div>

        {/* Loading and Unloading Average times */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Loading Duration</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block font-display">{activeSiding.avgLoadingTime} hrs</span>
            </div>
            <Clock className="w-8 h-8 text-blue-500 opacity-30" />
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Unloading Duration</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block font-display">{activeSiding.avgUnloadingTime} hrs</span>
            </div>
            <Clock className="w-8 h-8 text-indigo-500 opacity-30" />
          </div>
        </div>

        {/* History section */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Performance History</h3>
            <button
              onClick={() => setSidingHistoryOpen(!sidingHistoryOpen)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {sidingHistoryOpen ? 'Collapse History' : 'View Full History'}
            </button>
          </div>

          {sidingHistoryOpen && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Coal Moved (MT)</th>
                    <th className="py-2.5">Rakes Handled</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSiding.history.map((h, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2.5 font-bold text-slate-700">{h.date}</td>
                      <td className="py-2.5 text-slate-600 font-semibold">{h.coalMoved.toLocaleString()} MT</td>
                      <td className="py-2.5 text-slate-600 font-bold">{h.rakesHandled} rakes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 8. ALERTS
  const renderAlerts = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Alert Center</h2>
            <p className="text-sm text-slate-500">Critical system overrides and recommendation flags</p>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border shadow-xs transition-all hover:translate-x-0.5 ${
                alert.type === 'critical'
                  ? 'bg-rose-50 border-rose-100 text-rose-900'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-100 text-amber-900'
                  : 'bg-green-50 border-green-100 text-green-900'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl text-white ${
                  alert.type === 'critical'
                    ? 'bg-rose-600'
                    : alert.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}>
                  {alert.type === 'critical' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : alert.type === 'warning' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider">{alert.title}</h4>
                    <span className="text-[10px] font-bold opacity-60">{alert.time}</span>
                  </div>
                  <p className="text-xs mt-1.5 opacity-90 font-medium">{alert.message}</p>
                  
                  {alert.actionable && (
                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center">
                      <span className="text-[10px] font-bold opacity-75">Quick Action:</span>
                      <button
                        onClick={() => {
                          setSelectedRakeId(alert.actionable!.rakeId);
                          navigateTo('allocation');
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                      >
                        Resolve Allocation →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 9. ANALYTICS
  const renderAnalytics = () => {
    const maxBarVal = Math.max(...initialAnalytics.monthlyData.map((d) => d.value));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Analytics</h2>
            <p className="text-sm text-slate-500">Historical performance & volume tracking</p>
          </div>
        </div>

        {/* Date Filter Panel */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Filters:</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 cursor-pointer">Last 8 Months</button>
            <button onClick={() => triggerToast('Filtering option is disabled for preview', 'warning')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer">Yearly</button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Rakes Handled</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block font-display">{initialAnalytics.totalRakes}</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">On Time Percentage</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-1 block font-display">{initialAnalytics.onTimePercentage}%</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Coal Transported</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block font-display">{initialAnalytics.totalCoalTransported} MT</span>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Demurrage Charges</span>
            <span className="text-xl font-extrabold text-rose-600 mt-1 block font-display">₹{initialAnalytics.totalDemurrage} Lakh</span>
          </div>
        </div>

        {/* Bar chart block */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">Rakes Dispatched per Month</h3>
          
          <div className="flex items-end justify-between h-48 pt-4 px-2 bg-slate-50/50 rounded-xl">
            {initialAnalytics.monthlyData.map((data, index) => {
              const heightPercent = (data.value / maxBarVal) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <span className="text-[9px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.value}
                  </span>
                  <div
                    className="w-8 bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all duration-300 shadow-sm"
                    style={{ height: `${heightPercent * 1.2}px` }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={() => handleDownloadReport('Monthly Rake Analytics.csv')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Analytics CSV
          </button>
        </div>
      </div>
    );
  };

  // 10. MOBILE MORE MENU SCREEN
  const renderMenuMobile = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">System Modules</h2>
          <p className="text-sm text-slate-500">Forecasting & scheduling screens</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
          <div
            onClick={() => navigateTo('dashboard')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => { setSelectedRakeId('R1024'); navigateTo('tracking'); }}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Train className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Rake Tracking</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('schedule')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-slate-800">Scheduling Timetable</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('forecast')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">Demand Forecasting</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('allocation')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-800">Rake Allocation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('siding')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-800">Siding Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('alerts')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-semibold text-slate-800">Alert Center</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('analytics')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-semibold text-slate-800">Analytics</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('reports')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-semibold text-slate-800">Audit Reports</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('codeviewer')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-slate-700" />
              <span className="text-sm font-bold text-slate-800">System Code Architecture</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => navigateTo('profile')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-sky-600" />
              <span className="text-sm font-semibold text-slate-800">Operator Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center justify-between p-4 hover:bg-red-50 text-red-600 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm font-bold">Logout System</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </div>
        </div>
      </div>
    );
  };

  // 11. AUDIT REPORTS
  const renderReports = () => {
    const list = [
      { name: 'Daily Rake Report', type: 'PDF' },
      { name: 'Weekly Rake Report', type: 'PDF' },
      { name: 'Monthly Coal Movement', type: 'Excel' },
      { name: 'Demurrage Report', type: 'PDF' },
      { name: 'Delay Analysis Report', type: 'Excel' },
      { name: 'Siding Performance Index', type: 'PDF' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">System Reports</h2>
            <p className="text-sm text-slate-500">Downloadable audits of rail rake schedules and coal movement</p>
          </div>
        </div>

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {list.map((report) => (
            <div
              key={report.name}
              className="p-5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl ${
                  report.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-700'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{report.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-400">{report.type} Document • Dynamic Generated</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerToast(`Viewing ${report.name} in tab...`, 'info')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownloadReport(report.name)}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 12. PROFILE
  const renderProfile = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">User Profile</h2>
            <p className="text-sm text-slate-500">Manage security settings and account details</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 font-black text-2xl rounded-full flex items-center justify-center border-4 border-blue-50 shadow-sm">
            {(username || 'AD').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">{username || 'Admin'}</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {(username || '').toLowerCase().includes('admin') ? 'System Operations Administrator' : 'Senior Rake Dispatcher'}
            </p>
            <p className="text-xs text-slate-400 mt-1">{(username || 'admin').toLowerCase()}@railrake.gov.in</p>
          </div>
        </div>

        {/* Dynamic Sign-In Session Details Panel */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 font-display">Active Session Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Logged In Username</span>
              <span className="font-bold text-slate-800 block">{username || 'Admin'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Session IP Address</span>
              <span className="font-bold text-slate-800 block font-mono">{sessionIP || '10.227.28.56'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sign-In Timestamp</span>
              <span className="font-bold text-slate-800 block">{sessionLoginTime || 'August 12, 2026, 11:40 AM'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Encryption Protocol</span>
              <span className="font-bold text-emerald-600 block flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span> SECURE TLS 1.3
              </span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Session Token (JWT)</span>
            <div className="font-mono text-xs bg-slate-900 text-blue-400 p-3 rounded-lg overflow-x-auto whitespace-nowrap select-all scrollbar-thin">
              {sessionToken || 'JWT_SIH1319_LOCAL_SECURE_DEMO_KEY'}
            </div>
          </div>
        </div>

        {/* Profile Settings Options */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-50">
          <div
            onClick={() => triggerToast('Feature disabled for live system demo', 'warning')}
            className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-sm"
          >
            <span className="font-semibold text-slate-700">Edit Personal Details</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
          <div
            onClick={() => triggerToast('Feature disabled for live system demo', 'warning')}
            className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-sm"
          >
            <span className="font-semibold text-slate-700">Change System Password</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
          <div
            onClick={() => triggerToast('Notification settings successfully updated')}
            className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-sm"
          >
            <span className="font-semibold text-slate-700">Email Notification Settings</span>
            <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded border border-green-100 uppercase">ENABLED</span>
          </div>
          <div
            onClick={handleLogout}
            className="p-4 hover:bg-red-50 cursor-pointer flex justify-between items-center text-sm text-red-600 font-bold"
          >
            <span>Logout from System</span>
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </div>
    );
  };

  // SYSTEM ARCHITECTURE / CODE VIEWER
  const renderCodeViewer = () => {
    const file = codeFiles[selectedLanguage];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">System Code Architecture</h2>
            <p className="text-sm text-slate-500">Source files for MySQL database and C/C++/Java algorithms</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap border-b border-slate-200">
          {(Object.keys(codeFiles) as Array<'sql' | 'c' | 'cpp' | 'java'>).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2.5 font-bold text-xs border-b-2 uppercase cursor-pointer ${
                selectedLanguage === lang
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {codeFiles[lang].name} ({codeFiles[lang].language.toUpperCase()})
            </button>
          ))}
        </div>

        {/* Editor Screen */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-slate-950 px-4 py-2.5 flex justify-between items-center border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-500" /> {file.path}
            </span>
            <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
              {file.language}
            </span>
          </div>
          <div className="p-6 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[420px] bg-slate-900">
            <pre className="no-scrollbar">
              <code>{file.code}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // Notification panel rendering
  const renderNotificationPanel = () => {
    return (
      <div className="absolute right-4 top-16 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] animate-fade-in divide-y divide-slate-50 p-2">
        <div className="p-3 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <span className="text-xs font-bold text-slate-800">System Notifications</span>
          <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear all</span>
        </div>
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">No new notifications</div>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className="p-3 hover:bg-slate-50/50 transition-colors flex items-start gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
              <span>{n}</span>
            </div>
          ))
        )}
      </div>
    );
  };

  // Main UI wrapper containing the logic for Desktop Layout and Mobile Layout natively.
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Dynamic Toast notifier */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] p-4 rounded-xl border shadow-xl flex items-center gap-2 animate-fade-in bg-white border-slate-100 text-slate-700">
          <div className={`p-1.5 rounded-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {isMobile ? (
        // VIEW 1: NATIVE MOBILE VIEW (FILLS THE MOBILE BROWSER VIEWPORT)
        <div className="flex-1 flex flex-col bg-white min-h-screen relative">
          {/* Application Mobile Header */}
          {isAuthenticated ? (
            <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 pt-1 relative shrink-0">
              <button
                onClick={() => navigateTo('menu')}
                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
              <span className="text-sm font-black text-slate-800 tracking-tight font-display uppercase">RAILRAKE</span>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg relative cursor-pointer"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full border border-white"></span>
                  )}
                </button>
                {showNotifications && renderNotificationPanel()}
              </div>
            </div>
          ) : null}

          {/* Mobile Body Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/50">
            {renderScreenContent()}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          {isAuthenticated ? (
            <div className="h-16 bg-white border-t border-slate-100 grid grid-cols-5 items-center pb-2 pt-1.5 shadow-lg shrink-0">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  currentScreen === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Dashboard</span>
              </button>

              <button
                onClick={() => { setSelectedRakeId('R1024'); navigateTo('tracking'); }}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  currentScreen === 'tracking' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Train className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Rakes</span>
              </button>

              <button
                onClick={() => navigateTo('schedule')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  currentScreen === 'schedule' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Schedule</span>
              </button>

              <button
                onClick={() => navigateTo('alerts')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
                  currentScreen === 'alerts' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-4 bg-rose-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full scale-75">
                    {alerts.length}
                  </span>
                )}
                <span className="text-[9px] font-bold mt-1">Alerts</span>
              </button>

              <button
                onClick={() => navigateTo('menu')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  currentScreen === 'menu' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">More</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        // VIEW 2: FULL WIDTH DESKTOP DASHBOARD WORKSPACE
        <div className="flex-1 flex bg-white min-h-screen overflow-hidden">
          {/* Sidebar Navigation - only when logged in */}
          {isAuthenticated ? (
            <div className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between p-6 border-r border-slate-800 shrink-0">
              <div className="space-y-8">
                {/* Brand logo */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <Train className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white tracking-wider font-display">RAILRAKE</h1>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-sans">Coal Ministry • SIH1319</p>
                  </div>
                </div>

                {/* Sidebar Nav links */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Activity className="w-4 h-4" /> Dashboard</span>
                  </button>

                  <button
                    onClick={() => { setSelectedRakeId('R1024'); navigateTo('tracking'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'tracking'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Train className="w-4 h-4" /> Rake Tracking</span>
                  </button>

                  <button
                    onClick={() => navigateTo('schedule')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'schedule'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Scheduling</span>
                  </button>

                  <button
                    onClick={() => navigateTo('forecast')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'forecast'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><TrendingUp className="w-4 h-4" /> Demand Forecast</span>
                  </button>

                  <button
                    onClick={() => navigateTo('allocation')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'allocation'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Sliders className="w-4 h-4" /> Rake Allocation</span>
                  </button>

                  <button
                    onClick={() => navigateTo('siding')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'siding'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Siding Details</span>
                  </button>

                  <button
                    onClick={() => navigateTo('alerts')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'alerts'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><AlertTriangle className="w-4 h-4" /> Alerts</span>
                    {alerts.length > 0 && (
                      <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full font-sans">
                        {alerts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigateTo('analytics')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'analytics'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Sliders className="w-4 h-4" /> Analytics</span>
                  </button>

                  <button
                    onClick={() => navigateTo('reports')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'reports'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><FileText className="w-4 h-4" /> Reports</span>
                  </button>

                  <button
                    onClick={() => navigateTo('codeviewer')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer ${
                      currentScreen === 'codeviewer'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3"><FileCode className="w-4 h-4" /> Code Viewer</span>
                    <span className="text-[8px] bg-slate-800 text-blue-400 font-bold border border-slate-700 px-1.5 py-0.5 rounded font-sans">DEV</span>
                  </button>
                </nav>
              </div>

              {/* Profile card & logout */}
              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div
                    onClick={() => navigateTo('profile')}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                      {(username || 'AD').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-slate-200 block group-hover:underline">{username || 'Admin'}</span>
                      <span className="text-[10px] text-slate-500 block">Operator</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                    title="Logout System"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Main Application Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
            
            {/* Header Top-Navigation (Desktop) */}
            {isAuthenticated ? (
              <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 relative shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace /</span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{currentScreen}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <button
                      onClick={() => navigateTo('alerts')}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-lg relative cursor-pointer"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                  </div>

                  <div
                    onClick={() => navigateTo('profile')}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
                      {(username || 'AD').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight hidden md:block">
                      <span className="text-xs font-bold text-slate-700 block group-hover:underline">{username || 'Admin'}</span>
                      <span className="text-[10px] text-slate-400 block">Railway Operations Manager</span>
                    </div>
                  </div>
                </div>
              </header>
            ) : null}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {renderScreenContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
