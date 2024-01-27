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
import ScoutingData, { AllianceColor } from './components/ScoutingData';
import createTheme from '@mui/material/styles/createTheme';
import { ThemeProvider } from '@emotion/react';

export default function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  
  // TODO: Remove this when done testing
  const scoutingData = ScoutingData("2023wasno_q7", 8248, AllianceColor.Blue); 

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
