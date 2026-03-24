import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecognizePage from './pages/RecognizePage';
import SpeakerIdPage from './pages/SpeakerIdPage';
import VerifyPage from './pages/VerifyPage';
import EmotionPage from './pages/EmotionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="recognize"  element={<RecognizePage />} />
          <Route path="speaker-id" element={<SpeakerIdPage />} />
          <Route path="verify"     element={<VerifyPage />} />
          <Route path="emotion"    element={<EmotionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
