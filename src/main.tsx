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
import ScoutingContext from './components/context/ScoutingContext';
import ScoutingStateData, { AllianceColor } from './components/ScoutingStateData';
import createTheme from '@mui/material/styles/createTheme';
import { ThemeProvider } from '@emotion/react';

export default function App() {

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
  
  // TODO: Remove this when done testing
  const scoutingData = ScoutingStateData("2023wasno_q7", 8248, AllianceColor.Red); 

  return (
    <ThemeProvider theme={darkTheme}>
      <ScoutingContext.Provider value={scoutingData}>
        <BrowserRouter>
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
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NoPage />} />
            </Route>
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
      </ScoutingContext.Provider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
