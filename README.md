# OpenGrowBox Frontend

[![License](https://img.shields.io/github/license/OpenGrow-Box/OpenGrowBox-Frontend)](LICENSE)  
[![Repo Size](https://img.shields.io/github/repo-size/OpenGrow-Box/OpenGrowBox-Frontend)](https://github.com/OpenGrow-Box/OpenGrowBox-Frontend)

**OpenGrowBox Frontend** is the companion web application for the [OpenGrowBox Home Assistant Integration](https://github.com/OpenGrow-Box/OpenGrowBox-HA). It provides a modern, responsive UI for monitoring and controlling your growing environment, visualizing sensor data, reviewing logs, and managing device settings.

---

## 🚀 Features

- **Real-time Monitoring**: Live updates of temperature, humidity, CO₂, pH, EC and other sensor readings.  
- **Device Control**: Toggle pumps, fans, lights and other actuators directly from the dashboard.  
- **Historical Charts**: Interactive graphs showing environmental trends over time.  
- **Notes & Reports**: Add and save grow notes per room or tent, powered by the `text` entity.  
- **Configuration Panel**: Adjust thresholds, schedules and modes (e.g. hydro, auto, manual).  
- **Responsive Design**: Works on desktop and mobile devices.  
- **Theming**: Multiple built-in themes (Unicorn, Hacky, BookWorm, BlueOcean, CyberPunk, Darkness) via styled-components.

---

## 📦 Installation

1. **Prerequisites**  
   - [Node.js](https://nodejs.org/) v14 or newer  
   - [Yarn](https://yarnpkg.com/) (optional, npm also works)  
   - A running Home Assistant instance with the [OpenGrowBox-HA](https://github.com/OpenGrow-Box/OpenGrowBox-HA) custom integration installed and configured.

2. **Clone this repository**  
   ```bash
   git clone https://github.com/OpenGrow-Box/OpenGrowBox-Frontend.git
   cd OpenGrowBox-Frontend
