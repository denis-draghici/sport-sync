import { Card, CardContent } from "@/components/ui/card"
import type { WeatherData } from "@/lib/weather/openweather"

export function WeatherWidget({ weather }: { weather: WeatherData }) {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`

  return (
    <Card className="border-border bg-card">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img src={iconUrl} alt={weather.description} className="h-12 w-12" />
          <div className="flex-1">
            <p className="font-semibold capitalize">{weather.description}</p>
            <p className="text-sm text-muted-foreground">
              {weather.temp}°C · Feels like {weather.feelsLike}°C
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground space-y-0.5">
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.windSpeed} m/s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
