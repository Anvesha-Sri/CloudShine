const apiid = '03502a14e7c39ce84d39af67e5658da0' // 🔑 Replace with your OpenWeatherMap key
let isLoading = false

// DOM References
const cityInput        = document.querySelector('#cityInput')
const searchBtn        = document.querySelector('#searchButton') // Fixed: matches HTML id
const errMsg           = document.querySelector('#err')
const loaderWrap       = document.querySelector('#loader')
const mainOverlay      = document.querySelector('#mainOverlay')
const weatherIcon      = document.querySelector('#weatherIcon')
const bgOverlay        = document.querySelector('#bgOverlay')
const sunGlow          = document.querySelector('#sunGlow')
const rainCanvas       = document.querySelector('#rainCanvas')
const snowCanvas       = document.querySelector('#snowCanvas')
const lightningOverlay = document.querySelector('#lightningOverlay')
const starsEl          = document.querySelector('#stars')
const bgVideoA         = document.querySelector('#bgVideoA')
const bgVideoB         = document.querySelector('#bgVideoB')
const forecastDiv      = document.querySelector('#forecast')

// 🎥 VIDEO BACKGROUND
const videoMap = {
    Clear:        'Videos/clear.mp4',
    Sunny:        'Videos/sunny.mp4',
    Rain:         'Videos/drizzle.mp4',
    Drizzle:      'Videos/drizzle.mp4',
    Thunderstorm: 'Videos/thunder.mp4',
    Snow:         'Videos/snow.mp4',
    Mist:         'Videos/mist.mp4',
    Fog:          'Videos/mist.mp4',
    Haze:         'Videos/mist.mp4',
    Smoke:        'Videos/mist.mp4',
    Default:      'Videos/default.mp4'
}

let activeVideo = 'A'

function switchBackgroundVideo(condition) {
    const src = videoMap[condition] || videoMap.Default

    if (activeVideo === 'A') {
        bgVideoB.src = src
        bgVideoB.load()
        bgVideoB.play().catch(() => {})
        bgVideoB.style.opacity = '1'
        bgVideoA.style.opacity = '0'
        activeVideo = 'B'
    } else {
        bgVideoA.src = src
        bgVideoA.load()
        bgVideoA.play().catch(() => {})
        bgVideoA.style.opacity = '1'
        bgVideoB.style.opacity = '0'
        activeVideo = 'A'
    }
}

const iconMap = {
    Clear:       'Images/clear.png',
    Rain:        'Images/rain.png',
    Drizzle:     'Images/rain.png',
    Mist:        'Images/rain.png',
    Fog:         'Images/clear.png',
    Haze:        'Images/clear.png',
    Snow:        'Images/snow.png',
    Thunderstorm:'Images/thunder.png',
    Sunny:       'Images/sunny.png',
    Default:     'Images/Weather_Icon.png'
}

// 💬 WEATHER CONDITION QUOTES
const weatherQuotes = {

    Clear: {icon: '☀️', text: 'Sunlight spills across the sky like a promise that today still holds something beautiful.' },
    Sunny: { icon: '🌞', text: 'The sky wears gold on sunny days, just to remind the world how bright life can feel.'},
    Rain: { icon: '🌧️', text: 'Rain is the sky slowing down long enough to tell its softest stories to the earth.' },
    Drizzle: {icon: '🌦️',text: 'A gentle drizzle feels like the clouds speaking in whispers instead of storms.' },
    Thunderstorm: { icon: '⛈️',  text: 'Thunderstorms are the sky’s wild symphony — loud, electric, and impossible to ignore.' },
    Snow: { icon: '❄️', text: 'Snow turns the entire world into a quiet dream wrapped in white silence.'   },
    Mist: { icon: '🌫️', text: 'Mist makes the world feel unfinished, like a secret waiting to slowly reveal itself.'},
    Fog: { icon: '😶‍🌫️', text: 'Fog hides the distance so the heart can focus only on the beauty nearby.'},
    Haze: { icon: '🍃',  text: 'Even through the haze, the sky still paints softness where chaos once lived.'},
    Smoke: { icon: '💨', text: 'The smoky sky still carries traces of light fighting gently through the shadows.'},
    Default: { icon: '🌤️', text: 'Every sky has a mood, a memory, and a story waiting above your head.' }

}

function showQuote(condition) {
    const quoteBlock = document.querySelector('#quoteBlock')
    const quoteText  = document.querySelector('#quoteText')
    const quoteIcon  = document.querySelector('#quoteIcon')
    const q = weatherQuotes[condition] || weatherQuotes.Default
    quoteIcon.textContent = q.icon
    quoteText.textContent = q.text
    quoteBlock.classList.remove('visible')
    setTimeout(() => quoteBlock.classList.add('visible'), 50)
}

function updateDateTime() {
    const now = new Date()
    const opts = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const dateTimeEl = document.querySelector('#dateTime')
    if (dateTimeEl) dateTimeEl.textContent = now.toLocaleString('en-US', opts)
}
updateDateTime()
setInterval(updateDateTime, 60000)

// 🌦️ UPDATE MAIN UI
function updateUI(data) {
    const countryEl = document.querySelector('#country')
    const tempEl = document.querySelector('#temp')
    const desEl = document.querySelector('#des')
    const humidityEl = document.querySelector('#humidity')
    const windEl = document.querySelector('#wind')
    const feelsLikeEl = document.querySelector('#feelsLike') // Fixed: matches HTML id
    const visibilityEl = document.querySelector('#visibility')
    
    if (countryEl) countryEl.textContent = `${data.name}, ${data.sys.country}`
    if (tempEl) tempEl.textContent = Math.round(data.main.temp) + '°C'
    if (desEl) desEl.textContent = data.weather[0].description
    if (humidityEl) humidityEl.textContent = data.main.humidity + '%'
    if (windEl) windEl.textContent = Math.round(data.wind.speed * 3.6) + ' km/h'
    if (feelsLikeEl) feelsLikeEl.textContent = Math.round(data.main.feels_like) + '°C'
    if (visibilityEl) visibilityEl.textContent = (data.visibility / 1000).toFixed(1) + ' km'

    const cond = data.weather[0].main
    weatherIcon.src = iconMap[cond] || iconMap.Default

    setWeatherEffects(cond)
    updateDateTime()
}

// ⛅ WEATHER EFFECTS CONTROLLER
function setWeatherEffects(condition) {
    switchBackgroundVideo(condition)
    showQuote(condition)
    
    stopRain(); stopSnow(); stopLightning()
    if (sunGlow) sunGlow.style.opacity = '0'
    if (bgOverlay) bgOverlay.className = 'bg-overlay-global'

    const cond = condition.toLowerCase()

    if (cond.includes('clear') || cond.includes('sunny')) {
        if (bgOverlay) bgOverlay.classList.add('weather-clear')
        showSunGlow()
        showStars()
    } else if (cond.includes('rain') && !cond.includes('thunder')) {
        if (bgOverlay) bgOverlay.classList.add('weather-rain')
        startRain(200)
        hideStars()
    } else if (cond.includes('drizzle')) {
        if (bgOverlay) bgOverlay.classList.add('weather-drizzle')
        startRain(80)
        hideStars()
    } else if (cond.includes('thunder') || cond.includes('storm')) {
        if (bgOverlay) bgOverlay.classList.add('weather-thunder')
        startRain(350)
        startLightning()
        hideStars()
    } else if (cond.includes('snow')) {
        if (bgOverlay) bgOverlay.classList.add('weather-snow')
        startSnow()
        hideStars()
    } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke')) {
        hideStars()
    }
}

function showSunGlow() {
    if (sunGlow) sunGlow.style.opacity = '1'
}

function showStars() {
    if (!starsEl) return
    starsEl.innerHTML = ''
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        const size = Math.random() * 2.5 + 0.5
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            top: ${Math.random() * 60}%;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 3 + 2}s;
            animation-delay: ${Math.random() * 4}s;
        `
        starsEl.appendChild(star)
    }
    starsEl.style.opacity = '1'
}

function hideStars() {
    if (!starsEl) return
    starsEl.style.opacity = '0'
    setTimeout(() => { if (starsEl) starsEl.innerHTML = '' }, 1500)
}

// 🌧️ RAIN ANIMATION
let rainAnimId = null
let rainCtx = null

function startRain(dropCount = 200) {
    if (!rainCanvas) return
    rainCanvas.width = window.innerWidth
    rainCanvas.height = window.innerHeight
    rainCtx = rainCanvas.getContext('2d')
    rainCanvas.style.opacity = '1'

    const drops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * rainCanvas.width,
        y: Math.random() * rainCanvas.height,
        length: Math.random() * 18 + 8,
        speed: Math.random() * 8 + 8,
        opacity: Math.random() * 0.5 + 0.2,
        width: Math.random() * 1.2 + 0.4
    }))

    function drawRain() {
        if (!rainCtx || !rainCanvas) return
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
        drops.forEach(d => {
            rainCtx.beginPath()
            rainCtx.strokeStyle = `rgba(174,214,241,${d.opacity})`
            rainCtx.lineWidth = d.width
            rainCtx.moveTo(d.x, d.y)
            rainCtx.lineTo(d.x - 1, d.y + d.length)
            rainCtx.stroke()
            d.y += d.speed
            if (d.y > rainCanvas.height) {
                d.y = -d.length
                d.x = Math.random() * rainCanvas.width
            }
        })
        rainAnimId = requestAnimationFrame(drawRain)
    }
    drawRain()
}

function stopRain() {
    if (rainAnimId) { cancelAnimationFrame(rainAnimId); rainAnimId = null }
    if (rainCtx && rainCanvas) rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
    if (rainCanvas) rainCanvas.style.opacity = '0'
}

// ❄️ SNOW ANIMATION
let snowAnimId = null
let snowCtx = null

function startSnow() {
    if (!snowCanvas) return
    snowCanvas.width = window.innerWidth
    snowCanvas.height = window.innerHeight
    snowCtx = snowCanvas.getContext('2d')
    snowCanvas.style.opacity = '1'

    const flakes = Array.from({ length: 120 }, () => ({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        radius: Math.random() * 3.5 + 1,
        speed: Math.random() * 1.5 + 0.5,
        drift: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.6 + 0.3
    }))

    function drawSnow() {
        if (!snowCtx || !snowCanvas) return
        snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)
        flakes.forEach(f => {
            snowCtx.beginPath()
            snowCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
            snowCtx.fillStyle = `rgba(255,255,255,${f.opacity})`
            snowCtx.fill()
            f.y += f.speed
            f.x += f.drift
            if (f.y > snowCanvas.height) { f.y = -f.radius; f.x = Math.random() * snowCanvas.width }
        })
        snowAnimId = requestAnimationFrame(drawSnow)
    }
    drawSnow()
}

function stopSnow() {
    if (snowAnimId) { cancelAnimationFrame(snowAnimId); snowAnimId = null }
    if (snowCtx && snowCanvas) snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)
    if (snowCanvas) snowCanvas.style.opacity = '0'
}

// ⚡ LIGHTNING
let lightningInterval = null

function startLightning() {
    lightningInterval = setInterval(() => {
        if (Math.random() > 0.55 && lightningOverlay) {
            lightningOverlay.classList.add('flash')
            setTimeout(() => lightningOverlay.classList.remove('flash'), 200)
        }
    }, 2500)
}

function stopLightning() {
    if (lightningInterval) { clearInterval(lightningInterval); lightningInterval = null }
    if (lightningOverlay) lightningOverlay.classList.remove('flash')
}

// 🌐 WEATHER API
async function checkweather(name) {
    if (isLoading) return

    if (!name.trim()) {
        showError("Please enter a city name ⚠️")
        return
    }

    isLoading = true
    showLoader()

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&appid=${apiid}&units=metric`
        )

        const data = await res.json()

        hideLoader()

        if (res.ok) {
            hideError()
            updateUI(data)
            getForecast(data.coord.lat, data.coord.lon)
        } else {
            showError("Invalid city name ❌")
            resetDisplay()
        }
    } catch (e) {
        hideLoader()
        showError("Network error. Check connection 🌐")
    }

    isLoading = false
}

// 📍 Geolocation
async function getUserLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
        showLoader()
        try {
            const { latitude: lat, longitude: lon } = pos.coords
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiid}&units=metric`)
            const data = await res.json()
            hideLoader()
            if (res.ok) { updateUI(data); getForecast(lat, lon) }
        } catch (e) { hideLoader() }
    }, () => hideLoader())
}


// 📅 7-Day Forecast
async function getForecast(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiid}&units=metric`)
        const data = await res.json()
        if (!res.ok) return

        if (forecastDiv) forecastDiv.innerHTML = ''

        // Group forecasts by date
        const dailyForecasts = {}
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0]
            // Only store the forecast for noon (12:00) or the closest available time for each day
            if (!dailyForecasts[date] || Math.abs(parseInt(item.dt_txt.split(' ')[1].split(':')[0]) - 12) < Math.abs(parseInt(dailyForecasts[date].dt_txt.split(' ')[1].split(':')[0]) - 12)) {
                dailyForecasts[date] = item
            }
        })

        // Get next 7 days (excluding today if it's already passed)
        const days = Object.values(dailyForecasts).slice(0, 7)
        
        days.forEach(day => {
            const d = new Date(day.dt_txt)
            const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            const cond = day.weather[0].main
            const imgSrc = iconMap[cond] || iconMap.Default
            const temp = Math.round(day.main.temp)
            const feelsLike = Math.round(day.main.feels_like)
            const humidity = day.main.humidity
            const description = day.weather[0].description
            
            if (forecastDiv) {
                forecastDiv.innerHTML += `
                    <div class="forecast-card">
                        <div class="fc-day">${label}</div>
                        <img class="fc-img" src="${imgSrc}" alt="${cond}">
                        <div class="fc-temp">${temp}°C</div>
                        <div class="fc-feels">Feels like: ${feelsLike}°C</div>
                        <div class="fc-desc">${description}</div>
                        <div class="fc-humidity">💧 ${humidity}%</div>
                    </div>
                `
            }
        })
    } catch (e) {
        console.warn('Forecast error:', e)
    }
}

function showLoader() {
    if (searchBtn) {
        searchBtn.disabled = true
        searchBtn.style.opacity = '0.6'
    }
    if (loaderWrap) loaderWrap.classList.add('active')
    if (mainOverlay) mainOverlay.style.opacity = '0'
}

function hideLoader() {
    if (searchBtn) {
        searchBtn.disabled = false
        searchBtn.style.opacity = '1'
    }
    if (loaderWrap) loaderWrap.classList.remove('active')
    if (mainOverlay) { 
        mainOverlay.style.opacity = '1'
        mainOverlay.style.transition = 'opacity 0.5s'
    }
}

function showError(msg) { 
    if (errMsg) {
        errMsg.style.display = 'block'
        errMsg.textContent = msg
    }
}

function hideError() {
    if (errMsg) errMsg.style.display = 'none'
}

function resetDisplay() {
    const ids = ['#country', '#temp', '#des', '#humidity', '#wind', '#feelsLike', '#visibility']
    ids.forEach(id => {
        const el = document.querySelector(id)
        if (el) el.textContent = '--'
    })
}

// Event Listeners
if (searchBtn) {
    searchBtn.addEventListener('click', () => checkweather(cityInput ? cityInput.value : ''))
}
if (cityInput) {
    cityInput.addEventListener('keypress', e => { if (e.key === 'Enter') checkweather(cityInput.value) })
}

// Resize canvases
window.addEventListener('resize', () => {
    if (rainAnimId && rainCanvas) { 
        rainCanvas.width = window.innerWidth
        rainCanvas.height = window.innerHeight
    }
    if (snowAnimId && snowCanvas) { 
        snowCanvas.width = window.innerWidth
        snowCanvas.height = window.innerHeight
    }
})

// 🚀 INIT
getUserLocation()