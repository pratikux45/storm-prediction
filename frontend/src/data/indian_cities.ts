export interface CityData {
  city: string;
  state: string;
  lat: number;
  lng: number;
  riskLevel: 'High Risk' | 'Moderate Risk' | 'Low Risk';
  stormEventsLast5Years: number;
  avgPrecipitation: number;
}

const RAW_INDIAN_CITIES: CityData[] = [
  // Maharashtra
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, riskLevel: 'High Risk', stormEventsLast5Years: 42, avgPrecipitation: 2400 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, riskLevel: 'Moderate Risk', stormEventsLast5Years: 14, avgPrecipitation: 720 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, riskLevel: 'Low Risk', stormEventsLast5Years: 8, avgPrecipitation: 900 },
  { city: 'Nashik', state: 'Maharashtra', lat: 20.0110, lng: 73.7903, riskLevel: 'Low Risk', stormEventsLast5Years: 5, avgPrecipitation: 700 },
  { city: 'Thane', state: 'Maharashtra', lat: 19.1982, lng: 72.9666, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 1800 },
  { city: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433, riskLevel: 'Low Risk', stormEventsLast5Years: 3, avgPrecipitation: 600 },
  
  // West Bengal
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, riskLevel: 'High Risk', stormEventsLast5Years: 25, avgPrecipitation: 1600 },
  { city: 'Asansol', state: 'West Bengal', lat: 23.6845, lng: 86.9746, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 1400 },
  { city: 'Siliguri', state: 'West Bengal', lat: 26.7130, lng: 88.4230, riskLevel: 'High Risk', stormEventsLast5Years: 18, avgPrecipitation: 2500 },
  
  // Tamil Nadu
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, riskLevel: 'High Risk', stormEventsLast5Years: 38, avgPrecipitation: 1400 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, riskLevel: 'Low Risk', stormEventsLast5Years: 6, avgPrecipitation: 600 },
  { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, riskLevel: 'Moderate Risk', stormEventsLast5Years: 9, avgPrecipitation: 850 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, riskLevel: 'High Risk', stormEventsLast5Years: 20, avgPrecipitation: 900 },
  
  // Karnataka
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, riskLevel: 'Low Risk', stormEventsLast5Years: 15, avgPrecipitation: 950 },
  { city: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394, riskLevel: 'Low Risk', stormEventsLast5Years: 7, avgPrecipitation: 800 },
  { city: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560, riskLevel: 'High Risk', stormEventsLast5Years: 22, avgPrecipitation: 3400 },
  { city: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240, riskLevel: 'Moderate Risk', stormEventsLast5Years: 11, avgPrecipitation: 1200 },
  
  // Gujarat
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, riskLevel: 'Moderate Risk', stormEventsLast5Years: 20, avgPrecipitation: 800 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, riskLevel: 'High Risk', stormEventsLast5Years: 28, avgPrecipitation: 1200 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, riskLevel: 'Moderate Risk', stormEventsLast5Years: 15, avgPrecipitation: 850 },
  { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, riskLevel: 'Moderate Risk', stormEventsLast5Years: 18, avgPrecipitation: 650 },
  { city: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lng: 72.1519, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 600 },
  
  // Uttar Pradesh
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, riskLevel: 'Low Risk', stormEventsLast5Years: 9, avgPrecipitation: 1000 },
  { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 900 },
  { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, riskLevel: 'Low Risk', stormEventsLast5Years: 7, avgPrecipitation: 750 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 1100 },
  { city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064, riskLevel: 'Low Risk', stormEventsLast5Years: 6, avgPrecipitation: 800 },
  { city: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, riskLevel: 'Moderate Risk', stormEventsLast5Years: 11, avgPrecipitation: 1000 },
  
  // Odisha
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, riskLevel: 'High Risk', stormEventsLast5Years: 45, avgPrecipitation: 1500 },
  { city: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828, riskLevel: 'High Risk', stormEventsLast5Years: 42, avgPrecipitation: 1450 },
  { city: 'Rourkela', state: 'Odisha', lat: 22.2604, lng: 84.8536, riskLevel: 'High Risk', stormEventsLast5Years: 25, avgPrecipitation: 1600 },
  { city: 'Puri', state: 'Odisha', lat: 19.8135, lng: 85.8312, riskLevel: 'High Risk', stormEventsLast5Years: 50, avgPrecipitation: 1550 },
  
  // Andhra Pradesh
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, riskLevel: 'High Risk', stormEventsLast5Years: 48, avgPrecipitation: 1100 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, riskLevel: 'High Risk', stormEventsLast5Years: 32, avgPrecipitation: 1050 },
  { city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, riskLevel: 'Moderate Risk', stormEventsLast5Years: 20, avgPrecipitation: 1000 },
  { city: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865, riskLevel: 'High Risk', stormEventsLast5Years: 28, avgPrecipitation: 1100 },
  
  // Telangana
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, riskLevel: 'Moderate Risk', stormEventsLast5Years: 18, avgPrecipitation: 820 },
  { city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941, riskLevel: 'Low Risk', stormEventsLast5Years: 8, avgPrecipitation: 900 },
  
  // Delhi
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 800 },
  
  // Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, riskLevel: 'Low Risk', stormEventsLast5Years: 5, avgPrecipitation: 600 },
  { city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, riskLevel: 'Low Risk', stormEventsLast5Years: 2, avgPrecipitation: 300 },
  { city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, riskLevel: 'Low Risk', stormEventsLast5Years: 3, avgPrecipitation: 650 },
  { city: 'Kota', state: 'Rajasthan', lat: 25.1622, lng: 75.8143, riskLevel: 'Low Risk', stormEventsLast5Years: 4, avgPrecipitation: 700 },
  
  // Kerala
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, riskLevel: 'Low Risk', stormEventsLast5Years: 6, avgPrecipitation: 600 }, // Duplicate intentionally removed below
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, riskLevel: 'High Risk', stormEventsLast5Years: 30, avgPrecipitation: 1700 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, riskLevel: 'High Risk', stormEventsLast5Years: 40, avgPrecipitation: 3000 },
  { city: 'Kozhikode', state: 'Kerala', lat: 11.2588, lng: 75.7804, riskLevel: 'High Risk', stormEventsLast5Years: 35, avgPrecipitation: 3200 },
  
  // Bihar
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, riskLevel: 'Moderate Risk', stormEventsLast5Years: 18, avgPrecipitation: 1150 },
  { city: 'Gaya', state: 'Bihar', lat: 24.7914, lng: 85.0002, riskLevel: 'Moderate Risk', stormEventsLast5Years: 14, avgPrecipitation: 1100 },
  { city: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lng: 86.9842, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 1050 },
  
  // Madhya Pradesh
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 900 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, riskLevel: 'Low Risk', stormEventsLast5Years: 9, avgPrecipitation: 1100 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864, riskLevel: 'Low Risk', stormEventsLast5Years: 8, avgPrecipitation: 1200 },
  { city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2124, lng: 78.1772, riskLevel: 'Low Risk', stormEventsLast5Years: 5, avgPrecipitation: 750 },
  
  // Punjab
  { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8523, riskLevel: 'Low Risk', stormEventsLast5Years: 6, avgPrecipitation: 700 },
  { city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, riskLevel: 'Moderate Risk', stormEventsLast5Years: 10, avgPrecipitation: 650 },
  { city: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, riskLevel: 'Low Risk', stormEventsLast5Years: 7, avgPrecipitation: 720 },
  
  // Haryana
  { city: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178, riskLevel: 'Low Risk', stormEventsLast5Years: 8, avgPrecipitation: 750 },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266, riskLevel: 'Low Risk', stormEventsLast5Years: 11, avgPrecipitation: 800 },
  { city: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635, riskLevel: 'Low Risk', stormEventsLast5Years: 5, avgPrecipitation: 600 },
  
  // Jharkhand
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096, riskLevel: 'Moderate Risk', stormEventsLast5Years: 16, avgPrecipitation: 1300 },
  { city: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 1250 },
  { city: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lng: 86.2029, riskLevel: 'Moderate Risk', stormEventsLast5Years: 14, avgPrecipitation: 1350 },
  
  // Assam
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, riskLevel: 'High Risk', stormEventsLast5Years: 28, avgPrecipitation: 1600 },
  { city: 'Silchar', state: 'Assam', lat: 24.8333, lng: 92.7789, riskLevel: 'Moderate Risk', stormEventsLast5Years: 20, avgPrecipitation: 2800 },
  { city: 'Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120, riskLevel: 'High Risk', stormEventsLast5Years: 25, avgPrecipitation: 2700 },
  
  // Chhattisgarh
  { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 1200 },
  { city: 'Bhilai', state: 'Chhattisgarh', lat: 21.1938, lng: 81.3509, riskLevel: 'Low Risk', stormEventsLast5Years: 8, avgPrecipitation: 1100 },
  { city: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0797, lng: 82.1409, riskLevel: 'Moderate Risk', stormEventsLast5Years: 12, avgPrecipitation: 1250 },
  
  // Uttarakhand
  { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322, riskLevel: 'Moderate Risk', stormEventsLast5Years: 18, avgPrecipitation: 2100 },
  { city: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642, riskLevel: 'Moderate Risk', stormEventsLast5Years: 15, avgPrecipitation: 1200 },
  
  // Himachal Pradesh
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, riskLevel: 'Moderate Risk', stormEventsLast5Years: 22, avgPrecipitation: 1500 },
  
  // Jammu & Kashmir
  { city: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, riskLevel: 'Low Risk', stormEventsLast5Years: 12, avgPrecipitation: 700 },
  { city: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lng: 74.8570, riskLevel: 'Low Risk', stormEventsLast5Years: 10, avgPrecipitation: 1100 },
  
  // Goa
  { city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278, riskLevel: 'Moderate Risk', stormEventsLast5Years: 18, avgPrecipitation: 2900 },
  
  // Andaman and Nicobar
  { city: 'Port Blair', state: 'Andaman & Nicobar', lat: 11.6234, lng: 92.7265, riskLevel: 'High Risk', stormEventsLast5Years: 55, avgPrecipitation: 2800 },
  
  // Lakshadweep
  { city: 'Kavaratti', state: 'Lakshadweep', lat: 10.5593, lng: 72.6376, riskLevel: 'High Risk', stormEventsLast5Years: 35, avgPrecipitation: 1600 }
];

// Clean duplicates
export const INDIAN_CITIES = RAW_INDIAN_CITIES.filter((v,i,a)=>a.findIndex(v2=>(v2.city===v.city))===i);
