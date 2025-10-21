// Cyprus delivery route pricing system
// Calculates delivery costs between different areas in Cyprus

export interface DeliveryRoute {
  from: string;
  to: string;
  cost: number;
  distance?: string;
  estimatedTime?: string;
}

// Cyprus areas available for delivery
export const CYPRUS_AREAS = [
  { value: "lefkosia-center", label: "Lefkosia Center" },
  { value: "mesa-geietonia", label: "Mesa Geietonia" },
  { value: "strovolos", label: "Strovolos" },
  { value: "engomi", label: "Engomi" },
  { value: "lakatamia", label: "Lakatamia" },
  { value: "anthoupoli", label: "Anthoupoli" },
  { value: "kaimakli", label: "Kaimakli" },
  { value: "pallouriotissa", label: "Pallouriotissa" },
  { value: "agios-dometios", label: "Agios Dometios" },
  { value: "latsia", label: "Latsia" },
];

// Route pricing matrix - costs between different areas
export const CYPRUS_ROUTE_PRICING: Record<string, Record<string, number>> = {
  "lefkosia-center": {
    "mesa-geietonia": 8,
    strovolos: 6,
    engomi: 7,
    lakatamia: 9,
    anthoupoli: 10,
    kaimakli: 5,
    pallouriotissa: 6,
    "agios-dometios": 8,
    latsia: 9,
  },
  "mesa-geietonia": {
    "lefkosia-center": 8,
    strovolos: 7,
    engomi: 6,
    lakatamia: 8,
    anthoupoli: 9,
    kaimakli: 9,
    pallouriotissa: 8,
    "agios-dometios": 7,
    latsia: 8,
  },
  strovolos: {
    "lefkosia-center": 6,
    "mesa-geietonia": 7,
    engomi: 5,
    lakatamia: 7,
    anthoupoli: 8,
    kaimakli: 7,
    pallouriotissa: 6,
    "agios-dometios": 6,
    latsia: 7,
  },
  engomi: {
    "lefkosia-center": 7,
    "mesa-geietonia": 6,
    strovolos: 5,
    lakatamia: 6,
    anthoupoli: 7,
    kaimakli: 8,
    pallouriotissa: 7,
    "agios-dometios": 5,
    latsia: 6,
  },
  lakatamia: {
    "lefkosia-center": 9,
    "mesa-geietonia": 8,
    strovolos: 7,
    engomi: 6,
    anthoupoli: 5,
    kaimakli: 10,
    pallouriotissa: 9,
    "agios-dometios": 7,
    latsia: 4,
  },
  anthoupoli: {
    "lefkosia-center": 10,
    "mesa-geietonia": 9,
    strovolos: 8,
    engomi: 7,
    lakatamia: 5,
    kaimakli: 11,
    pallouriotissa: 10,
    "agios-dometios": 8,
    latsia: 5,
  },
  kaimakli: {
    "lefkosia-center": 5,
    "mesa-geietonia": 9,
    strovolos: 7,
    engomi: 8,
    lakatamia: 10,
    anthoupoli: 11,
    pallouriotissa: 4,
    "agios-dometios": 9,
    latsia: 10,
  },
  pallouriotissa: {
    "lefkosia-center": 6,
    "mesa-geietonia": 8,
    strovolos: 6,
    engomi: 7,
    lakatamia: 9,
    anthoupoli: 10,
    kaimakli: 4,
    "agios-dometios": 8,
    latsia: 9,
  },
  "agios-dometios": {
    "lefkosia-center": 8,
    "mesa-geietonia": 7,
    strovolos: 6,
    engomi: 5,
    lakatamia: 7,
    anthoupoli: 8,
    kaimakli: 9,
    pallouriotissa: 8,
    latsia: 6,
  },
  latsia: {
    "lefkosia-center": 9,
    "mesa-geietonia": 8,
    strovolos: 7,
    engomi: 6,
    lakatamia: 4,
    anthoupoli: 5,
    kaimakli: 10,
    pallouriotissa: 9,
    "agios-dometios": 6,
  },
};

/**
 * Get area key from display value
 */
export const getAreaKeyFromValue = (value: string): string | null => {
  const area = CYPRUS_AREAS.find(
    (area) => area.value === value || area.label === value
  );
  return area ? area.value : null;
};

/**
 * Get area label from key
 */
export const getAreaLabelFromKey = (key: string): string | null => {
  const area = CYPRUS_AREAS.find((area) => area.value === key);
  return area ? area.label : null;
};

/**
 * Calculate delivery cost between two Cyprus areas
 */
export const calculateDeliveryCost = (
  fromArea: string,
  toArea: string
): number => {
  console.log("🚚 Calculating delivery cost:", { fromArea, toArea });

  // Handle same area delivery
  if (fromArea === toArea) {
    console.log("📍 Same area delivery, cost: 3");
    return 3;
  }

  // Convert display values to keys if needed
  const fromKey = getAreaKeyFromValue(fromArea) || fromArea;
  const toKey = getAreaKeyFromValue(toArea) || toArea;

  console.log("🔍 Area keys:", { fromKey, toKey });

  // Get cost from pricing matrix
  const fromAreaPricing = CYPRUS_ROUTE_PRICING[fromKey];
  if (!fromAreaPricing) {
    console.warn("⚠️ No pricing found for from area:", fromKey);
    return 10; // Default fallback cost
  }

  const cost = fromAreaPricing[toKey];
  if (cost === undefined) {
    console.warn("⚠️ No pricing found for route:", { fromKey, toKey });
    return 10; // Default fallback cost
  }

  console.log("💰 Calculated delivery cost:", cost);
  return cost;
};

/**
 * Get all possible routes from an area
 */
export const getRoutesFromArea = (fromArea: string): DeliveryRoute[] => {
  const fromKey = getAreaKeyFromValue(fromArea) || fromArea;
  const fromAreaPricing = CYPRUS_ROUTE_PRICING[fromKey];

  if (!fromAreaPricing) {
    return [];
  }

  return Object.entries(fromAreaPricing).map(([toKey, cost]) => ({
    from: fromKey,
    to: toKey,
    cost,
    distance: "N/A",
    estimatedTime: "15-30 min",
  }));
};

/**
 * Get the cheapest route from an area
 */
export const getCheapestRouteFromArea = (
  fromArea: string
): DeliveryRoute | null => {
  const routes = getRoutesFromArea(fromArea);
  if (routes.length === 0) return null;

  return routes.reduce((cheapest, current) =>
    current.cost < cheapest.cost ? current : cheapest
  );
};

/**
 * Get all routes sorted by cost
 */
export const getAllRoutesSortedByCost = (): DeliveryRoute[] => {
  const allRoutes: DeliveryRoute[] = [];

  Object.entries(CYPRUS_ROUTE_PRICING).forEach(([fromKey, toAreas]) => {
    Object.entries(toAreas).forEach(([toKey, cost]) => {
      allRoutes.push({
        from: fromKey,
        to: toKey,
        cost,
        distance: "N/A",
        estimatedTime: "15-30 min",
      });
    });
  });

  return allRoutes.sort((a, b) => a.cost - b.cost);
};
