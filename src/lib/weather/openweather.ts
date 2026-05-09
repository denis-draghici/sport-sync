export interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  precipProbability?: number
}

export async function getWeather(
  lat: number,
  lng: number,
  date?: Date
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return null

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return null

    const data = await res.json()
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0]?.description ?? "",
      icon: data.weather[0]?.icon ?? "01d",
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed ?? 0),
    }
  } catch {
    return null
  }
}
