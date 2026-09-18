/**
 * โมดูลจัดการกราฟิกและชาร์ต (Radar & Bar Chart) ด้วย Chart.js
 */

let radarChartInstance = null;
let barChartInstance = null;

class MICharts {
  /**
   * วาด Radar Chart (กราฟใยแมงมุม)
   * @param {string} canvasId 
   * @param {Array} dimensionResults 
   */
  static renderRadarChart(canvasId, dimensionResults) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (radarChartInstance) {
      radarChartInstance.destroy();
    }

    const labels = dimensionResults.map(d => d.dimension.name);
    const dataValues = dimensionResults.map(d => d.percentage);

    radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'คะแนนร้อยละ (%)',
          data: dataValues,
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          borderColor: '#059669',
          borderWidth: 2.5,
          pointBackgroundColor: dimensionResults.map(d => d.dimension.color),
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#059669',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.25)'
            },
            pointLabels: {
              font: {
                family: "'Prompt', 'Sarabun', sans-serif",
                size: 13,
                weight: '500'
              },
              color: '#1E293B'
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent',
              font: {
                size: 10
              },
              color: '#64748B'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Prompt', sans-serif", size: 14 },
            bodyFont: { family: "'Sarabun', sans-serif", size: 13 },
            padding: 10,
            callbacks: {
              label: function(context) {
                const dim = dimensionResults[context.dataIndex];
                return `${context.dataset.label}: ${context.raw}% (${dim.levelInfo.shortTitle})`;
              }
            }
          }
        }
      }
    });

    return radarChartInstance;
  }

  /**
   * วาด Bar Chart (กราฟแท่งเปรียบเทียบ)
   * @param {string} canvasId 
   * @param {Array} dimensionResults 
   */
  static renderBarChart(canvasId, dimensionResults) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (barChartInstance) {
      barChartInstance.destroy();
    }

    const labels = dimensionResults.map(d => d.dimension.name);
    const dataValues = dimensionResults.map(d => d.percentage);
    const backgroundColors = dimensionResults.map(d => d.dimension.color);

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'คะแนนร้อยละ (%)',
          data: dataValues,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.08)'
        }]
      },
      options: {
        indexAxis: 'y', // แนวนอนเพื่ออ่านชื่อภาษาไทยได้ชัดเจน
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            suggestedMin: 0,
            suggestedMax: 100,
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            },
            ticks: {
              stepSize: 20,
              font: { family: "'Sarabun', sans-serif", size: 11 },
              callback: value => value + '%'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: "'Prompt', sans-serif", size: 12, weight: '500' },
              color: '#334155'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Prompt', sans-serif", size: 14 },
            bodyFont: { family: "'Sarabun', sans-serif", size: 13 },
            callbacks: {
              label: function(context) {
                const dim = dimensionResults[context.dataIndex];
                return `คะแนน: ${context.raw}% | ${dim.levelInfo.title}`;
              }
            }
          }
        }
      }
    });

    return barChartInstance;
  }

  /**
   * ดึงภาพ Base64 ของ Radar Chart สำหรับ PDF
   */
  static getRadarChartImage() {
    return radarChartInstance ? radarChartInstance.toBase64Image() : '';
  }

  /**
   * ดึงภาพ Base64 ของ Bar Chart สำหรับ PDF
   */
  static getBarChartImage() {
    return barChartInstance ? barChartInstance.toBase64Image() : '';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MICharts;
}
