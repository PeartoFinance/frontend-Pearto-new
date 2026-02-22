export interface WeatherData {
    temp: number;
    city: string;
    code: number;
}

const getBrowserLocation = (): Promise<{ lat: number, lon: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 5000 } // Don't hang forever
        );
    });
};

const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (!res.ok) throw new Error('Failed to get city');
        const data = await res.json();
        return data.city || data.locality || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

const getIPLocation = async (): Promise<{ lat: number, lon: number, city: string }> => {
    const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!geoRes.ok) throw new Error('Failed to fetch IP location');
    const geoData = await geoRes.json();
    return {
        lat: geoData.latitude,
        lon: geoData.longitude,
        city: geoData.city || 'Unknown'
    };
};

export const fetchLocationWeather = async (): Promise<WeatherData | null> => {
    try {
        let lat: number, lon: number, city: string;

        try {
            // First, try browser geolocation (most accurate)
            const coords = await getBrowserLocation();
            lat = coords.lat;
            lon = coords.lon;
            city = await getCityFromCoords(lat, lon);
        } catch (e) {
            // Fallback to IP geolocation
            console.warn('Browser geolocation failed/denied, falling back to IP geolocation', e);
            const ipLoc = await getIPLocation();
            lat = ipLoc.lat;
            lon = ipLoc.lon;
            city = ipLoc.city;
        }

        // Get weather from Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
        const weatherData = await weatherRes.json();

        return {
            temp: Math.round(weatherData.current_weather.temperature),
            city: city,
            code: weatherData.current_weather.weathercode,
        };
    } catch (err) {
        console.error('Failed to fetch weather:', err);
        return null;
    }
};
