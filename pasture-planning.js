/* eslint-env node */
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

    const classifyForage = (avgTemp, precipitation) => {
      if (avgTemp < 15 || avgTemp > 33 || precipitation < 40) {
        return 'Poor';
      }
      
      if (avgTemp >= 22 && precipitation >= 100) {
        return 'Excellent';
      }
      
      if (avgTemp >= 20 && avgTemp <= 30 && precipitation >= 80 && precipitation <= 100) {
        return 'Good';
      }
      
      if (((avgTemp >= 15 && avgTemp < 20) || (avgTemp > 30 && avgTemp <= 33)) && precipitation >= 80) {
        return 'Good';
      }
      
      if (((avgTemp >= 15 && avgTemp < 20) || (avgTemp > 30 && avgTemp <= 33)) && 
          precipitation >= 40 && precipitation <= 80) {
        return 'Medium';
      }
      
      if (avgTemp >= 20 && avgTemp <= 30 && precipitation >= 40 && precipitation < 80) {
        return 'Medium';
      }
      
      if (avgTemp >= 20 && avgTemp < 22 && precipitation >= 100) {
        return 'Good';
      }
      
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

    const calculateBreedingSeason = (monthlyResults) => {
      const breedingMonths = [];
      
      monthlyResults.forEach(result => {
        if (result.classification === 'Excellent') {
          const birthMonth = monthNames.indexOf(result.month) + 1;
          
          let breedingMonthNum = birthMonth - 9;
          
          if (breedingMonthNum <= 0) {
            breedingMonthNum += 12;
          }
          
          const breedingMonth = monthNames[breedingMonthNum - 1];
          
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
