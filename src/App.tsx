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
}

interface GeoRoute {
  sourceName: string;
  destName: string;
  junctions: GeoStation[];
}

const geoRoutes: Record<string, GeoRoute> = {
  'Mine A-Plant X': {
    sourceName: 'Dhanbad Siding (JH)',
    destName: 'NTPC Dadri (UP)',
    junctions: [
      { name: 'Dhanbad Coal Siding', coord: [23.7957, 86.4304], desc: 'Source: loading station' },
      { name: 'Gaya Junction', coord: [24.7964, 85.0076], desc: 'Junction stop: crew change' },
      { name: 'Pt. Deen Dayal Upadhyaya Jn', coord: [25.2818, 83.1235], desc: 'Intermediate: rake sorting' },
      { name: 'Prayagraj Junction', coord: [25.4484, 81.8284], desc: 'Junction stop: yard control' },
      { name: 'Kanpur Central', coord: [26.4542, 80.3503], desc: 'Intermediate: congestion check' },
      { name: 'Tundla Junction', coord: [27.2052, 78.0207], desc: 'Junction stop: traffic clear' },
      { name: 'NTPC Dadri Siding', coord: [28.5992, 77.5544], desc: 'Destination: unloading yard' }
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
  return geoRoutes['Mine A-Plant X'];
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

  // Layout preview states
  const [isRealMobile, setIsRealMobile] = useState(false);
  const isMobile = isRealMobile;

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
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const stationMarkersRef = useRef<L.Marker[]>([]);

  // Telemetry tracking useEffect hook
  useEffect(() => {
    if (currentScreen !== 'tracking' || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        trainMarkerRef.current = null;
        routePolylineRef.current = null;
        completedPolylineRef.current = null;
        stationMarkersRef.current = [];
      }
      return;
    }

    const active = rakes.find((r) => r.id === selectedRakeId) || rakes[0];
    const route = getRouteData(active.source, active.destination);
    const coords = route.junctions.map((j) => j.coord);
    const trainPos = interpolateCoordinates(coords, active.routeProgress);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(trainPos, 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove old markers
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    const createCustomIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="flex flex-col items-center">
                 <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md" style="background-color: ${color}"></div>
                 <span class="text-[9px] font-bold text-slate-800 bg-white/95 border border-slate-200 rounded px-1.5 py-0.5 mt-0.5 whitespace-nowrap shadow-xs">${label}</span>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 6]
      });
    };

    route.junctions.forEach((j, index) => {
      let color = '#3b82f6';
      if (index === 0) color = '#10b981';
      if (index === route.junctions.length - 1) color = '#8b5cf6';

      const marker = L.marker(j.coord, {
        icon: createCustomIcon(color, j.name)
      })
      .bindPopup(`<strong>${j.name}</strong><br/>${j.desc || 'Railway Point'}`)
      .addTo(map);

      stationMarkersRef.current.push(marker);
    });

    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(coords);
    } else {
      routePolylineRef.current = L.polyline(coords, {
        color: '#94a3b8',
        weight: 3,
        dashArray: '5, 8',
        opacity: 0.8
      }).addTo(map);
    }

    const completedCoords = coords.slice(0, Math.floor((active.routeProgress / 100) * coords.length) + 1);
    completedCoords.push(trainPos);

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedCoords);
    } else {
      completedPolylineRef.current = L.polyline(completedCoords, {
        color: active.status === 'DELAYED' ? '#f43f5e' : '#2563eb',
        weight: 4,
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
      .bindPopup(`<strong>Rake ${active.id}</strong><br/>Speed: 52 km/h<br/>Status: ${active.status}`)
      .addTo(map);
    }

    map.flyTo(trainPos, 6, {
      animate: true,
      duration: 1.2
    });
  }, [currentScreen, selectedRakeId, rakes]);

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
      setLoginLoading(false);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
      triggerToast('Successfully logged in as Admin');
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
            <h2 className="text-2xl font-bold text-slate-900 font-display">Hello, Admin</h2>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Rake:</span>
            <select
              value={selectedRakeId}
              onChange={(e) => setSelectedRakeId(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
            >
              {rakes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.status})
                </option>
              ))}
            </select>
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

            {/* Map Telemetry Overlay card */}
            <div className="absolute top-4 right-4 z-[1000] p-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl shadow-lg w-52 leading-tight space-y-2 text-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Live Telemetry</span>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Position:</span>
                <strong className="text-slate-800 font-bold font-mono">
                  {interpolateCoordinates(
                    getRouteData(activeRake.source, activeRake.destination).junctions.map((j) => j.coord),
                    activeRake.routeProgress
                  )[0].toFixed(4)}° N
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium"></span>
                <strong className="text-slate-800 font-bold font-mono">
                  {interpolateCoordinates(
                    getRouteData(activeRake.source, activeRake.destination).junctions.map((j) => j.coord),
                    activeRake.routeProgress
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
              {getRouteData(activeRake.source, activeRake.destination).junctions.map((j, index, arr) => {
                const totalStations = arr.length;
                const progressPercentage = (index / (totalStations - 1)) * 100;
                const visited = activeRake.routeProgress >= progressPercentage;
                const active = Math.abs(activeRake.routeProgress - progressPercentage) < (100 / (totalStations - 1)) * 0.5;

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
            AD
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Admin</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Railway Operations Manager</p>
            <p className="text-xs text-slate-400 mt-1">admin@railrake.com</p>
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
                      AD
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-slate-200 block group-hover:underline">Admin</span>
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
                      AD
                    </div>
                    <div className="text-left leading-tight hidden md:block">
                      <span className="text-xs font-bold text-slate-700 block group-hover:underline">Admin</span>
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
