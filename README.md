# OpenGrowBox Frontend

[![License](https://img.shields.io/github/license/OpenGrow-Box/OpenGrowBox-Frontend)](LICENSE)
[![Repo Size](https://img.shields.io/github/repo-size/OpenGrow-Box/OpenGrowBox-Frontend)](https://github.com/OpenGrow-Box/OpenGrowBox-Frontend)
[![Version](https://img.shields.io/github/v/release/OpenGrow-Box/OpenGrowBox-Frontend)](https://github.com/OpenGrow-Box/OpenGrowBox-Frontend/releases)
[![Issues](https://img.shields.io/github/issues/OpenGrow-Box/OpenGrowBox-Frontend)](https://github.com/OpenGrow-Box/OpenGrowBox-Frontend/issues)

**OpenGrowBox Frontend** is the companion web application for the [OpenGrowBox Home Assistant Integration](https://github.com/OpenGrow-Box/OpenGrowBox-HA). It provides a modern, responsive UI for monitoring and controlling your growing environment, visualizing sensor data, reviewing logs, and managing device settings.

---

## 📋 Table of Contents

* [🚀 Features](#-features)
* [💻 Demo / Screenshot](#-demo--screenshot)
* [📦 Installation](#-installation)
* [⚙️ Configuration](#️-configuration)
* [🏗️ Project Structure](#️-project-structure)
* [📖 Usage](#-usage)
* [🛠️ Development](#️-development)
* [🛣️ Roadmap](#️-roadmap)
* [🤝 Contributing](#-contributing)
* [❓ Getting Help](#-getting-help)
* [📝 License](#-license)

---

## 🚀 Features

* **Real-time Monitoring**: Live updates of temperature, humidity, CO₂, pH, EC and other sensor readings.
* **Device Control**: Toggle pumps, fans, lights and other actuators directly from the dashboard.
* **Historical Charts**: Interactive graphs showing environmental trends over time.
* **Notes & Reports**: Add and save grow notes per room or tent, powered by the `text` entity.
* **Configuration Panel**: Adjust thresholds, schedules and modes (e.g. hydro, auto, manual).
* **Responsive Design**: Mobile-first, works on any screen size.
* **Theming**: Multiple built-in themes (Unicorn, Hacky, BookWorm, BlueOcean, CyberPunk, Darkness) via styled-components.

---

## 💻 Demo / Screenshot

![Dashboard Preview](docs/screenshot-dashboard.png)

---

## 📦 Installation

1. **Prerequisites**

   * [Node.js](https://nodejs.org/) v14 or newer
   * [Yarn](https://yarnpkg.com/) (optional, npm also works)
   * A running Home Assistant instance with the [OpenGrowBox-HA](https://github.com/OpenGrow-Box/OpenGrowBox-HA) integration.

2. **Clone this repository**

   ```bash
   git clone https://github.com/OpenGrow-Box/OpenGrowBox-Frontend.git
   cd OpenGrowBox-Frontend
   ```

3. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your Home Assistant URL and access token:

   ```ini
   REACT_APP_HA_URL=https://your-homeassistant.local:8123
   REACT_APP_HA_TOKEN=YOUR_LONG_LIVED_ACCESS_TOKEN
   ```

5. **Start development server**

   ```bash
   yarn start
   # or
   npm start
   ```

   Open [http://localhost:5173/ogb-gui/static/](http://localhost:5173/ogb-gui/static/) in your browser.

---

## ⚙️ Configuration

### Home Assistant Integration

Install the [OpenGrowBox-HA](https://github.com/OpenGrow-Box/OpenGrowBox-HA) custom component in your Home Assistant `custom_components` folder. In `configuration.yaml`:

```yaml
opengrowbox:
  host: 192.168.1.100   # IP of your OpenGrowBox device
  port: 12345           # TCP port
  hydro_mode: true      # start hydro mode on HA startup
```

Restart Home Assistant after adding the integration.

### Frontend Environment

The `.env` file should contain:

```ini
REACT_APP_HA_URL=https://homeassistant.local:8123
REACT_APP_HA_TOKEN=YOUR_LONG_LIVED_TOKEN
```

---

## 🏗️ Project Structure

```
OpenGrowBox-Frontend/
├── public/              # Static assets, index.html, favicon
├── src/                 # React sources
│   ├── assets/          # Images, logos, icons
│   ├── components/      # Reusable UI components (DeviceCard, OGBNotes, etc.)
│   ├── context/         # HomeAssistantContext, ThemeContext
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Route-based views (Dashboard, Settings)
│   ├── services/        # API client, WebSocket handlers
│   ├── styles/          # GlobalStyle, theme definitions
│   ├── utils/           # Helpers, formatters
│   └── index.tsx        # App entrypoint
├── docs/                # Documentation assets (screenshots, diagrams)
├── .env.example         # Env vars example
├── package.json         # Scripts & dependencies
├── tsconfig.json        # TypeScript config
└── README.md            # This file
```

---

## 📖 Usage

* **Dashboard**: Overview of all rooms/grow tents and key metrics.
* **Room View**: Detailed sensor data, control buttons, logs, and note-taking (`OGBNotes`).
* **Settings**: Theme selector, HA connection details, user preferences.

---

## 🛠️ Development

* **Lint & Format**

  ```bash
  yarn lint      # runs ESLint
  yarn format    # runs Prettier
  ```

* **Build for Production**

  ```bash
  yarn build
  ```

  Outputs to `build/`.

* **Run Tests**

  ```bash
  yarn test
  ```

---

## 🛣️ Roadmap

* [x] Add multi-room map view
* [ ] Support custom dashboard layouts
* [ ] Export data CSV/Excel

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Commit your changes (`git commit -m "feat: add new widget"`)
4. Push (`git push origin feature/my-change`)
5. Open a Pull Request

Be sure to follow the existing code style and include tests where applicable.

---

## ❓ Getting Help

If you run into issues or have questions, please open an issue on GitHub or join our Discord channel:

* Issues: [https://github.com/OpenGrow-Box/OpenGrowBox-Frontend/issues](https://github.com/OpenGrow-Box/OpenGrowBox-Frontend/issues)
* Discord: [https://discord.gg/your-invite-link](https://discord.gg/your-invite-link)

---

## 📝 License

This project is licensed under the [GPL-3.0 license](LICENSE).
