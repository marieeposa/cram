export const GLOSSARY = {
  brrs: {
    title: "Barangay Resilience Readiness Score (BRRS)",
    content: "A composite score (0-100) measuring how prepared a barangay is to handle climate hazards. Combines hazard exposure (40%), health sensitivity (30%), and adaptive capacity (30%). Higher scores indicate greater vulnerability."
  },
  
  liquefaction: {
    title: "Liquefaction Susceptibility",
    content: "When earthquake shaking causes water-saturated soil to act like a liquid, losing its strength. Buildings can sink or tilt. Coastal and low-lying areas with sandy soil are most at risk."
  },
  
  hazardExposure: {
    title: "Hazard Exposure Score",
    content: "Measures how much a barangay is exposed to natural hazards (floods, storms, landslides, liquefaction). Based on NOAH flood maps, storm surge models, and historical cyclone data. Accounts for 40% of BRRS."
  },
  
  healthSensitivity: {
    title: "Health Sensitivity Score",
    content: "Measures vulnerability of the population based on demographics (elderly, children, poverty rate) and environmental health (air quality). Vulnerable groups face higher impacts from disasters. Accounts for 30% of BRRS."
  },
  
  adaptiveCapacity: {
    title: "Adaptive Capacity Score",
    content: "Measures resources available for disaster response and recovery (healthcare facilities, evacuation centers, infrastructure). Higher capacity means faster recovery. Accounts for 30% of BRRS."
  },
  
  floodRisk: {
    title: "Flood Risk Assessment",
    content: "Based on NOAH flood hazard maps showing 5-year, 25-year, and 100-year flood scenarios. Shows percentage of barangay area at risk during different severity floods."
  },
  
  stormSurge: {
    title: "Storm Surge Risk",
    content: "Abnormal rise in sea level during tropical cyclones. Coastal barangays face risk of flooding from storm surges. Based on PAGASA Storm Surge Advisory levels 1-4."
  },
  
  landslide: {
    title: "Landslide Susceptibility",
    content: "Risk of soil and rock sliding down slopes during heavy rain or earthquakes. Mountainous and hilly areas face higher risk. Based on LDRRMD hazard assessments."
  },
  
  airQuality: {
    title: "Air Quality Index (AQI)",
    content: "Measures air pollution levels. AQI 1-2 is Good/Fair, 3 is Moderate, 4-5 is Poor/Very Poor. Poor air quality increases health sensitivity, especially for vulnerable groups."
  },
  
  riskLevel: {
    title: "Risk Level Classification",
    content: "Low (<40): Well-prepared, low exposure. Medium (40-70): Moderate vulnerability, needs attention. High (>70): High vulnerability, priority for interventions."
  },
  
  coastal: {
    title: "Coastal Barangay",
    content: "Barangays located along the coastline face additional risks from storm surges, sea level rise, and coastal erosion. Require specific adaptation measures like mangrove protection and seawalls."
  }
};