export const fetchData = async (lat: string, long: string,setHourlyData:any) => {
    const response = await fetch(`api/hourly?lat=${lat}&long=${long}`)
    const res = await (response.json())
    const intervals = res.data.timelines[0].intervals
    const formattedData = intervals.map((item: any) => ({
      date: (item.startTime),
      status: item.values.cloudCover > 50 ? "Cloudy" : "Clear",
      maxTemp: `${item.values.temperatureMax}°F`,
      minTemp: `${item.values.temperatureMin}°F`,
      apparentTemp: `${item.values.temperatureApparent}°F`,
      sunrise: new Date(item.values.sunriseTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sunset: new Date(item.values.sunsetTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      humidity: `${item.values.humidity}%`,
      windSpeed: `${item.values.windSpeed} mph`,
      visibility: `${item.values.visibility} mi`,
      cloudCover: `${item.values.cloudCover}%`,
    }));

    console.log(formattedData)
    setHourlyData(formattedData)
  }