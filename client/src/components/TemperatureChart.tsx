import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_exporting from "highcharts/modules/exporting";
import HC_data from "highcharts/modules/data";
import HighchartsMore from "highcharts/highcharts-more";

// Initialize modules
HighchartsMore(Highcharts);
HC_exporting(Highcharts);
HC_data(Highcharts);

interface WeatherData {
  date: string;
  maxTemp: string;
  minTemp: string;
}

interface MeteogramProps {
  data: WeatherData[];
}

const Meteogram: React.FC<MeteogramProps> = ({ data }) => {
  const chartData = data.map(({ date, minTemp, maxTemp }) => ({
    x: new Date(date).getTime(),
    low: parseFloat(minTemp),
    high: parseFloat(maxTemp),
  }));

  const options: Highcharts.Options = {
    chart: {
      type: "arearange",
      zooming: {
        type: "x",
      },
      scrollablePlotArea: {
        minWidth: 600,
        scrollPositionX: 1,
      },
    },
    title: {
      text: "Temperature Variation by Day",
      align: "left",
      style: {
        color: "#333",
      },
    },
    subtitle: {
      text: "Source: <a href='https://veret.gfi.uib.no/' target='_blank'>Universitetet i Bergen</a>",
      align: "left",
    },
    xAxis: {
      type: "datetime",
      crosshair: true,
      labels: {
        formatter: function () {
          const date = new Date(this.value as number);
          const day = date.getDate();
          const month = date.toLocaleString("default", { month: "short" });
          return `${day} ${month}`;
        },
        style: {
          color: "#777",
        },
      },
      title: {
        text: "Date",
        style: {
          color: "#444",
        },
      },
    },
    yAxis: {
      title: {
        text: "Temperature (°C)",
        style: {
          color: "#444",
        },
      },
      labels: {
        style: {
          color: "#777",
        },
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: "°C",
      xDateFormat: "%e %b",
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: "arearange",
        name: "Temperatures",
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1,
          },
          stops: [
            [0, "#f1b036"],
            [1, "#d6d3c3"],
          ],
        },
        data: chartData,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default Meteogram;
