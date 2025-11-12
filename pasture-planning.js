/* global fetch, console */

const today = new Date();
const twentyYearsAgo = new Date();
twentyYearsAgo.setFullYear(today.getFullYear() - 20);

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startDate = formatDate(twentyYearsAgo);
const endDate = formatDate(today);

const url = `https://archive-api.open-meteo.com/v1/era5?latitude=-26.559192343952116&longitude=-48.75874347439093&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&timezone=America%2FSao_Paulo`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const { daily } = data;
    const dailyDataByMonth = {};
    const monthlyTotalsByMonth = {};

    daily.time.forEach((dateStr, index) => {
      const monthNum = parseInt(dateStr.substring(5, 7), 10);
      
      if (!dailyDataByMonth[monthNum]) {
        dailyDataByMonth[monthNum] = {
          minTemp: [],
          maxTemp: []
        };
      }

      dailyDataByMonth[monthNum].minTemp.push(daily.temperature_2m_min[index]);
      dailyDataByMonth[monthNum].maxTemp.push(daily.temperature_2m_max[index]);
    });

    const monthlyTotals = {};
    daily.time.forEach((dateStr, index) => {
      const yearMonth = dateStr.substring(0, 7);
      const monthNum = parseInt(dateStr.substring(5, 7), 10);
      
      if (!monthlyTotals[yearMonth]) {
        monthlyTotals[yearMonth] = {
          monthNum,
          precipitation: 0
        };
      }
      
      monthlyTotals[yearMonth].precipitation += daily.precipitation_sum[index];
    });

    Object.values(monthlyTotals).forEach(monthTotal => {
      const monthNum = monthTotal.monthNum;
      if (!monthlyTotalsByMonth[monthNum]) {
        monthlyTotalsByMonth[monthNum] = [];
      }
      monthlyTotalsByMonth[monthNum].push(monthTotal.precipitation);
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    /**
     * Classifies forage quality based on average temperature and monthly precipitation.
     * 
     * Classification hierarchy (checked in order):
     * 1. Poor: Most restrictive - fails if ANY condition is met (temp < 15°C OR > 33°C OR precip < 40mm)
     * 2. Excellent: Most specific - requires BOTH temp >= 22°C AND precip >= 100mm
     * 3. Good: Specific ranges - temp 20-30°C with precip 80-100mm, OR temp 15-20°C/30-33°C with precip >= 80mm
     * 4. Medium: Specific ranges - temp 15-20°C/30-33°C with precip 40-80mm, OR temp 20-30°C with precip 40-80mm
     * 
     * Boundary values are inclusive (e.g., 80mm and 100mm are included in their respective ranges).
     * 
     * @param {number} avgTemp - Average temperature in Celsius (average of min and max)
     * @param {number} precipitation - Average monthly precipitation in mm
     * @returns {string} Classification: 'Poor', 'Medium', 'Good', or 'Excellent'
     */
    const classifyForage = (avgTemp, precipitation) => {
      // 1. POOR: Check first - most restrictive condition
      // Fails if temperature is too low (< 15°C) OR too high (> 33°C) OR precipitation is too low (< 40mm)
      if (avgTemp < 15 || avgTemp > 33 || precipitation < 40) {
        return 'Poor';
      }
      
      // 2. EXCELLENT: Most specific - requires optimal conditions
      // Temperature >= 22°C AND precipitation >= 100mm
      if (avgTemp >= 22 && precipitation >= 100) {
        return 'Excellent';
      }
      
      // 3. GOOD: Good conditions with specific ranges
      // Case 3a: Temperature 20-30°C with precipitation 80-100mm (inclusive)
      if (avgTemp >= 20 && avgTemp <= 30 && precipitation >= 80 && precipitation <= 100) {
        return 'Good';
      }
      
      // Case 3b: Temperature 15-20°C or 30-33°C with precipitation >= 80mm
      // (Temperature is suboptimal but precipitation is good)
      if (((avgTemp >= 15 && avgTemp < 20) || (avgTemp > 30 && avgTemp <= 33)) && precipitation >= 80) {
        return 'Good';
      }
      
      // 4. MEDIUM: Moderate conditions with specific ranges
      // Case 4a: Temperature 15-20°C or 30-33°C with precipitation 40-80mm (inclusive)
      if (((avgTemp >= 15 && avgTemp < 20) || (avgTemp > 30 && avgTemp <= 33)) && 
          precipitation >= 40 && precipitation <= 80) {
        return 'Medium';
      }
      
      // Case 4b: Temperature 20-30°C with precipitation 40-80mm (inclusive)
      // (Temperature is good but precipitation is moderate)
      if (avgTemp >= 20 && avgTemp <= 30 && precipitation >= 40 && precipitation < 80) {
        return 'Medium';
      }
      
      // Case 4c: Temperature 20-22°C with precipitation >= 100mm
      // (Temperature is slightly below Excellent threshold but precipitation is excellent)
      if (avgTemp >= 20 && avgTemp < 22 && precipitation >= 100) {
        return 'Good';
      }
      
      // 5. DEFAULT: Should not reach here if logic is complete, but fallback to Medium
      // This covers any edge cases not explicitly handled above
      return 'Medium';
    };

    const results = Object.keys(dailyDataByMonth)
      .map(monthNum => parseInt(monthNum, 10))
      .sort((a, b) => a - b)
      .map(monthNum => {
        const monthData = dailyDataByMonth[monthNum];
        const monthlyPrecipTotals = monthlyTotalsByMonth[monthNum] || [];
        
        const avgMinTemp = monthData.minTemp.reduce((sum, val) => sum + val, 0) / monthData.minTemp.length;
        const avgMaxTemp = monthData.maxTemp.reduce((sum, val) => sum + val, 0) / monthData.maxTemp.length;
        const avgTemp = (avgMinTemp + avgMaxTemp) / 2;
        const avgMonthlyPrecipitation = monthlyPrecipTotals.length > 0
          ? monthlyPrecipTotals.reduce((sum, val) => sum + val, 0) / monthlyPrecipTotals.length
          : 0;

        const classification = classifyForage(avgTemp, avgMonthlyPrecipitation);

        return {
          month: monthNames[monthNum - 1],
          min: parseFloat(avgMinTemp.toFixed(2)),
          max: parseFloat(avgMaxTemp.toFixed(2)),
          precipitation: parseFloat(avgMonthlyPrecipitation.toFixed(2)),
          classification
        };
      });

    /**
     * Calcula a estação de monta do gado.
     * Um novilho deve nascer sempre que a classificação for "Excellent".
     * A vaca deve emprenhar 9 meses antes do nascimento (gestação de ~280 dias).
     * 
     * @param {Array} monthlyResults - Array com os resultados mensais contendo classification
     * @returns {Array} Array com os nomes dos meses de emprenhamento (sem duplicatas)
     */
    const calculateBreedingSeason = (monthlyResults) => {
      const breedingMonths = [];
      
      monthlyResults.forEach(result => {
        if (result.classification === 'Excellent') {
          // O novilho nasce neste mês
          const birthMonth = monthNames.indexOf(result.month) + 1; // 1-12
          
          // Calcula o mês de emprenhamento (9 meses antes)
          let breedingMonthNum = birthMonth - 9;
          
          // Se o mês de emprenhamento for negativo, ajusta para o ano anterior
          if (breedingMonthNum <= 0) {
            breedingMonthNum += 12;
          }
          
          const breedingMonth = monthNames[breedingMonthNum - 1];
          
          // Adiciona apenas se ainda não estiver no array (evita duplicatas)
          if (!breedingMonths.includes(breedingMonth)) {
            breedingMonths.push(breedingMonth);
          }
        }
      });
      
      return breedingMonths;
    };

    const breedingMonths = calculateBreedingSeason(results);

    console.log(JSON.stringify(results, null, 2));
    console.log(JSON.stringify(breedingMonths, null, 2));
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
