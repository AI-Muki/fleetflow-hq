// Mock data for FleetFlow Phase 1 UI. Replaced by Supabase in Phase 2.

export type AssetStatus = "active" | "service" | "out" | "reserved";
export type AssetCategory =
  | "Car" | "Van" | "Truck" | "Bus" | "Forklift" | "Excavator"
  | "Tractor" | "Trailer" | "Generator" | "Motorcycle";

export interface Asset {
  id: string;
  name: string;
  plate: string;
  vin: string;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  year: number;
  status: AssetStatus;
  mileage: number;
  fuel: string;
  driver?: string;
  location: string;
  nextService: string;
  regExpiry: string;
  image?: string;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

const makers = [
  ["Mercedes-Benz", "Sprinter"], ["Volvo", "FH16"], ["Ford", "Transit"],
  ["Scania", "R500"], ["MAN", "TGX"], ["Iveco", "Daily"], ["Toyota", "Hilux"],
  ["Renault", "Kangoo"], ["Peugeot", "Boxer"], ["Caterpillar", "320"],
  ["Komatsu", "PC210"], ["John Deere", "6155R"], ["Yale", "GDP25"],
  ["Ford", "F-150"], ["VW", "Crafter"], ["BMW", "R1250GS"],
];
const cats: AssetCategory[] = ["Car","Van","Truck","Bus","Forklift","Excavator","Tractor","Trailer","Generator","Motorcycle"];
const statuses: AssetStatus[] = ["active","active","active","active","service","out","reserved"];
const drivers = ["Ahmed Karim","John Peters","Michael Novak","Sara Lindqvist","Ivan Petrov","—","Elena Rossi","David Cohen","Marko Jović","Fatima Al-Zahra"];
const cities = ["Warehouse A","Downtown HQ","Site B - North","Airport Depot","Yard 3","Client Site"];

export const assets: Asset[] = Array.from({ length: 28 }, (_, i) => {
  const [manufacturer, model] = makers[i % makers.length];
  const category = cats[i % cats.length];
  return {
    id: `AST-${String(1001 + i)}`,
    name: `${manufacturer} ${model}`,
    plate: `${["BE","GR","FL","MU","ZG"][i%5]}-${100 + i}-${String.fromCharCode(65 + (i%26))}${String.fromCharCode(65 + ((i*3)%26))}`,
    vin: `WDB${rand(1000000000,9999999999)}${i}`,
    category,
    manufacturer,
    model,
    year: 2015 + (i % 10),
    status: statuses[i % statuses.length],
    mileage: rand(5000, 340000),
    fuel: ["Diesel","Petrol","Electric","Hybrid"][i%4],
    driver: drivers[i % drivers.length] === "—" ? undefined : drivers[i % drivers.length],
    location: cities[i % cities.length],
    nextService: `2026-${String(1 + (i%12)).padStart(2,"0")}-${String(1 + (i%27)).padStart(2,"0")}`,
    regExpiry: `2026-${String(1 + ((i+3)%12)).padStart(2,"0")}-${String(1 + ((i+7)%27)).padStart(2,"0")}`,
  };
});

export const kpis = {
  totalAssets: assets.length,
  active: assets.filter(a => a.status === "active").length,
  inService: assets.filter(a => a.status === "service").length,
  outOfService: assets.filter(a => a.status === "out").length,
  upcomingReg: 7,
  upcomingInsurance: 4,
  upcomingInspections: 5,
  upcomingMaintenance: 9,
  upcomingLicense: 2,
  assignedToday: 12,
  monthlyExpenses: 48250,
  yearlyExpenses: 512400,
  healthScore: 87,
  openDamage: 4,
};

export const monthlyExpenses = [
  { month: "Jan", fuel: 8200, maintenance: 3400, insurance: 2100, other: 1200 },
  { month: "Feb", fuel: 7900, maintenance: 4100, insurance: 2100, other: 900 },
  { month: "Mar", fuel: 9100, maintenance: 2800, insurance: 2100, other: 1500 },
  { month: "Apr", fuel: 8600, maintenance: 5200, insurance: 2100, other: 1300 },
  { month: "May", fuel: 9400, maintenance: 3100, insurance: 2100, other: 1100 },
  { month: "Jun", fuel: 10200, maintenance: 4700, insurance: 2100, other: 1700 },
  { month: "Jul", fuel: 11100, maintenance: 3900, insurance: 2100, other: 1400 },
  { month: "Aug", fuel: 10800, maintenance: 6100, insurance: 2100, other: 1600 },
  { month: "Sep", fuel: 9700, maintenance: 3300, insurance: 2100, other: 1200 },
  { month: "Oct", fuel: 9200, maintenance: 4200, insurance: 2100, other: 1000 },
  { month: "Nov", fuel: 8500, maintenance: 3600, insurance: 2100, other: 1300 },
  { month: "Dec", fuel: 9800, maintenance: 4400, insurance: 2100, other: 1500 },
];

export const fuelConsumption = monthlyExpenses.map((m, i) => ({
  month: m.month,
  liters: 3200 + (i * 40) + Math.sin(i) * 200,
  avgConsumption: 8.4 + Math.sin(i / 2) * 0.6,
}));

export const expensesByCategory = [
  { name: "Fuel", value: 112400 },
  { name: "Maintenance", value: 48900 },
  { name: "Insurance", value: 25200 },
  { name: "Tolls", value: 8100 },
  { name: "Parking", value: 3400 },
  { name: "Other", value: 14200 },
];

export const utilization = [
  { week: "W1", hours: 42 }, { week: "W2", hours: 48 }, { week: "W3", hours: 51 },
  { week: "W4", hours: 46 }, { week: "W5", hours: 55 }, { week: "W6", hours: 58 },
  { week: "W7", hours: 52 }, { week: "W8", hours: 60 },
];

export const todaysTasks = [
  { icon: "reg", severity: "warning", text: "3 vehicles have registration expiring in 7 days" },
  { icon: "license", severity: "warning", text: "2 drivers have licenses expiring soon" },
  { icon: "maint", severity: "danger", text: "1 truck is 1,200 km overdue for minor service" },
  { icon: "damage", severity: "danger", text: "4 open Damage Reports awaiting action" },
  { icon: "out", severity: "info", text: "2 vehicles are currently out of service" },
  { icon: "insp", severity: "warning", text: "5 vehicles need technical inspection this month" },
];

export const recentActivity = [
  { time: "2 min ago", who: "Ahmed Karim", what: "checked out", target: "Mercedes Sprinter · BE-142-AC" },
  { time: "18 min ago", who: "Sara Lindqvist", what: "logged fuel", target: "62 L · Shell Airport" },
  { time: "1 h ago", who: "Michael Novak", what: "closed damage report", target: "DR-2041 · rear bumper" },
  { time: "3 h ago", who: "Fleet Manager", what: "scheduled service", target: "Volvo FH16 · Feb 12" },
  { time: "yesterday", who: "Ivan Petrov", what: "returned", target: "Ford Transit · +312 km" },
  { time: "yesterday", who: "System", what: "reminder sent", target: "Insurance expires in 30d · 4 vehicles" },
];

export interface Driver {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  license: string;
  licenseExpiry: string;
  status: "active" | "leave" | "inactive";
  currentVehicle?: string;
}

export const driversList: Driver[] = [
  { id: "DRV-001", name: "Ahmed Karim", employeeId: "E-0091", phone: "+387 61 234 567", email: "ahmed@acme.co", license: "B, C, CE", licenseExpiry: "2026-08-14", status: "active", currentVehicle: "BE-142-AC" },
  { id: "DRV-002", name: "John Peters", employeeId: "E-0114", phone: "+44 7700 900123", email: "john@acme.co", license: "B, C", licenseExpiry: "2027-03-02", status: "active", currentVehicle: "GR-108-BM" },
  { id: "DRV-003", name: "Michael Novak", employeeId: "E-0138", phone: "+420 723 555 220", email: "michael@acme.co", license: "B", licenseExpiry: "2026-02-19", status: "active", currentVehicle: "FL-129-CP" },
  { id: "DRV-004", name: "Sara Lindqvist", employeeId: "E-0142", phone: "+46 70 555 8123", email: "sara@acme.co", license: "B, D", licenseExpiry: "2028-11-30", status: "active" },
  { id: "DRV-005", name: "Ivan Petrov", employeeId: "E-0157", phone: "+7 916 555 4402", email: "ivan@acme.co", license: "B, C, CE, D", licenseExpiry: "2026-05-05", status: "leave" },
  { id: "DRV-006", name: "Elena Rossi", employeeId: "E-0163", phone: "+39 335 555 9018", email: "elena@acme.co", license: "B", licenseExpiry: "2027-09-22", status: "active", currentVehicle: "MU-118-DR" },
  { id: "DRV-007", name: "David Cohen", employeeId: "E-0180", phone: "+972 54 555 6621", email: "david@acme.co", license: "B, C1", licenseExpiry: "2026-04-11", status: "active" },
  { id: "DRV-008", name: "Marko Jović", employeeId: "E-0182", phone: "+381 60 555 7742", email: "marko@acme.co", license: "B, C, CE", licenseExpiry: "2026-01-28", status: "active", currentVehicle: "ZG-131-EM" },
];

export const damageReports = [
  { id: "DR-2041", vehicle: "Ford Transit · BE-108-AC", driver: "Ivan Petrov", date: "2026-07-18", severity: "Minor", status: "Open", cost: 420 },
  { id: "DR-2042", vehicle: "Volvo FH16 · GR-102-BB", driver: "John Peters", date: "2026-07-19", severity: "Moderate", status: "In Progress", cost: 1850 },
  { id: "DR-2043", vehicle: "Mercedes Sprinter · FL-121-CC", driver: "Michael Novak", date: "2026-07-20", severity: "Minor", status: "Waiting Parts", cost: 320 },
  { id: "DR-2044", vehicle: "MAN TGX · MU-119-DD", driver: "Marko Jović", date: "2026-07-21", severity: "Major", status: "Open", cost: 4200 },
];

export const upcomingAlerts = [
  { when: "in 2 days", type: "Insurance", target: "BE-142-AC · Mercedes Sprinter" },
  { when: "in 4 days", type: "Registration", target: "GR-108-BM · Volvo FH16" },
  { when: "in 7 days", type: "Inspection", target: "FL-129-CP · Ford Transit" },
  { when: "in 12 days", type: "Driver License", target: "Michael Novak" },
  { when: "in 18 days", type: "Maintenance", target: "MU-118-DR · MAN TGX (10k service)" },
];
