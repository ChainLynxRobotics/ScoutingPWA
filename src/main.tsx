import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Layout from './pages/Layout'
import NoPage from './pages/NoPage';
import ScoutPage from './pages/scout/ScoutLayout';
import DataPage from './pages/DataPage';
import SettingsPage from './pages/SettingsPage';
import IndexPage from './pages/IndexPage';
import PreMatch from './pages/scout/PreMatch';
import DuringMatch from './pages/scout/DuringMatch';
import PostMatch from './pages/scout/PostMatch';
import createTheme from '@mui/material/styles/createTheme';
import { ThemeProvider } from '@emotion/react';
import { DEFAULT_COMPETITION_ID } from './constants';
import SettingsContextProvider from './components/context/SettingsContextProvider';
import CurrentMatchContextProvider from './components/context/CurrentMatchContextProvider';
import ReloadPrompt from './components/ReloadPrompt';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AnalyticsTeamPage from './pages/analytics/AnalyticsTeamPage';
import AnalyticsMatchPage from './pages/analytics/AnalyticsMatchPage';
import AnalyticsLayout from './pages/analytics/AnalyticsLayout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5B7FC5'
    },
    secondary: {
      main: '#696969'
    },
    success: {
      main: '#82ec7a'
    },
    warning: {
      main: '#f7b955'
    },
    error: {
      main: '#f77070'
    },
  },
});

export default function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <SettingsContextProvider defaultCompetitionId={DEFAULT_COMPETITION_ID}>
          <CurrentMatchContextProvider>
            
            <Routes>
              <Route index element={<IndexPage />} />

              <Route path="/" element={<Layout />}>
                <Route path="scout" element={<ScoutPage />}>
                  <Route index element={<PreMatch />} />
                  <Route path="during" element={<DuringMatch />} />
                  <Route path="post" element={<PostMatch />} />
                  <Route path="*" element={<NoPage />} />
                </Route>
                <Route path="data" element={<DataPage />} />
                <Route path="analytics" element={<AnalyticsLayout />}>
                  <Route index element={<AnalyticsPage />} />
                  <Route path="team/:team" element={<AnalyticsTeamPage />} />
                  <Route path="match/:matchId" element={<AnalyticsMatchPage />} />
                </Route>
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NoPage />} />
              </Route>
              <Route path="*" element={<NoPage />} />
            </Routes>
            
          </CurrentMatchContextProvider>
        </SettingsContextProvider>
      </BrowserRouter>
      <ReloadPrompt />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)