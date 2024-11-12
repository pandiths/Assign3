import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import Exporting from "highcharts/modules/exporting";

HighchartsMore(Highcharts);
Exporting(Highcharts);

interface HourlyWeatherData {
  date: string;
  status: string;
  maxTemp: string;
  minTemp: string;
  apparentTemp: string;
  sunrise: string;
  sunset: string;
  humidity: string;
  windSpeed: string;
  visibility: string;
  cloudCover: string;
}

const convertToCelsius = (temp: string) => {
  const numericValue = parseFloat(temp.replace("°F", ""));
  return ((numericValue - 32) * 5) / 9;
};

const convertToKmh = (speed: string) => {
  const numericValue = parseFloat(speed.replace(" mph", ""));
  return numericValue * 1.60934;
};

interface MeteogramProps {
  data: HourlyWeatherData[];
}

const Meteogram: React.FC<MeteogramProps> = ({ data }) => {
  // Get the start date from the first data point
  const startDate = new Date(data[0].date);
  
  // ... (keeping all the data mapping functions the same)
  const temperatureData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: convertToCelsius(point.maxTemp),
      status: point.status,
    };
  });

  const humidityData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: parseFloat(point.humidity.replace("%", "")),
    };
  });

  const windSpeedData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: convertToKmh(point.windSpeed),
    };
  });

  const apparentTemperatureData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: convertToCelsius(point.apparentTemp),
    };
  });

  const sunriseData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: new Date(`${point.date} ${point.sunrise}`).getTime() - date.getTime(),
    };
  });

  const sunsetData = data.map((point, index) => {
    const date = new Date(startDate);
    date.setTime(startDate.getTime() + (index * 3600 * 1000));

    return {
      x: date.getTime(),
      y: new Date(`${point.date} ${point.sunset}`).getTime() - date.getTime(),
    };
  });

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      spacing: [10, 10, 10, 10] // Add some overall chart spacing
    },
    title: {
      text: "Meteogram - Hourly Weather Forecast",
      align: "left",
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M}",
        step: 1,
      },
      tickInterval: 3600 * 1000,
      minTickInterval: 3600 * 1000,
      dateTimeLabelFormats: {
        day: '%H:%M'
      }
    },
    yAxis: [
      {
        title: {
          text: "Temperature (°C)",
        },
        labels: {
          format: "{value}°C",
        },
      },
      {
        title: {
          text: "Humidity (%)",
        },
        labels: {
          format: "{value}%",
        },
        opposite: true,
      },
      {
        title: {
          text: "Wind Speed (km/h)",
        },
        labels: {
          format: "{value} km/h",
        },
        opposite: true,
      },
      {
        title: {
          text: "Time (ms)",
        },
        labels: {
          format: "{value}ms",
        },
        opposite: true,
      },
      {
        title: {
          text: "Cloud Cover (%)",
        },
        labels: {
          format: "{value}%",
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      xDateFormat: "%Y-%m-%d %H:%M",
    },
    plotOptions: {
      column: {
        pointPadding: 0.4,    // Increased from 0.2
        groupPadding: 0.3,    // Increased from 0.1
        borderWidth: 0,
        pointInterval: 3600 * 1000,
        maxPointWidth: 15,    // Added to control maximum width of bars
        minPointLength: 3     // Added to ensure minimum visible bar size
      },
      series: {
        pointInterval: 3600 * 1000,
      }
    },
    series: [
      {
        type: "column",
        name: "Temperature",
        data: temperatureData,
        tooltip: {
          valueSuffix: "°C",
        },
        yAxis: 0,
        color: "#68cee9",
        pointWidth: 6,
        dataLabels: {
          enabled: true,
          useHTML: true,
          style: {
            fontSize: "12px",
            fontWeight: "bold",
          },
          formatter: function () {
            const icon =
              //@ts-ignore
              this.point.status === "Cloudy"
                ? "https://openweathermap.org/img/wn/04d.png"
                : "https://openweathermap.org/img/wn/01d.png";
            return `<div style="display: flex; flex-direction: column; align-items: center;">
                      <img src="${icon}" style="width: 30px; height: 30px;margin-bottom:5px;background-color:grey" />
                   </div>`;
          },
          verticalAlign: "top",
          y: -20,
        },
      },
      {
        type: "line",
        name: "Apparent Temperature",
        data: apparentTemperatureData,
        tooltip: {
          valueSuffix: "°C",
        },
        yAxis: 0,
        color: "#FFA500",
      },
      {
        type: "line",
        name: "Humidity",
        data: humidityData,
        tooltip: {
          valueSuffix: "%",
        },
        yAxis: 1,
        color: "#3498DB",
      },
      {
        type: "line",
        name: "Wind Speed",
        data: windSpeedData,
        tooltip: {
          valueSuffix: " km/h",
        },
        yAxis: 2,
        color: "#2ECC71",
        dashStyle: "Dot",
      },
      {
        type: "line",
        name: "Sunrise",
        data: sunriseData,
        yAxis: 3,
        color: "#9B59B6",
      },
      {
        type: "column",
        name: "Sunset",
        data: sunsetData,
        yAxis: 3,
        color: "#8E44AD",
        pointWidth: 8,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default Meteogram;