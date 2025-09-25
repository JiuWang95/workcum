# Time Tracker

A simple, elegant time tracking web application built with React, Tailwind CSS, and Vite.

## Features

- **Time Entry**: Record your work hours with start and end times
- **Reporting**: Generate reports for specific date ranges with export to Excel
- **Scheduling**: Plan your weekly schedule with a visual calendar
- **Data Management**: Export and import your data for backup or transfer
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Local Storage**: All data is stored locally in your browser

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd time-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be located in the `dist` directory.

### Deployment

This application can be deployed to any static hosting service, including:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Usage

1. **Time Entry**: Use the Time Entry page to record your work hours
2. **Reports**: Generate reports and export them to Excel on the Reports page
3. **Schedule**: Plan your weekly tasks using the Schedule page
4. **Data**: Backup or restore your data using the Data page

## Technologies Used

- React 18
- React Router v6
- Tailwind CSS
- Vite
- SheetJS (xlsx) for Excel export
- date-fns for date manipulation

## License

This project is licensed under the MIT License.