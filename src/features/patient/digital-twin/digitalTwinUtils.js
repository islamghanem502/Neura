/**
 * Calculates Body Mass Index (BMI) from metric units.
 * 
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number|null} Calculated BMI or null if inputs are invalid
 */
export const bmiFromMetricKgCm = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  
  const w = Number(weightKg);
  const hCm = Number(heightCm);
  
  if (isNaN(w) || isNaN(hCm) || hCm <= 0) return null;
  
  const hM = hCm / 100;
  return w / (hM * hM);
};

/**
 * Returns the BMI category based on the calculated value.
 * 
 * @param {number} bmi - The BMI value
 * @returns {string} Category name
 */
export const getBmiCategory = (bmi) => {
  if (bmi == null || isNaN(bmi)) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};
