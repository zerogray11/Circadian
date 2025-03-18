import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthPage from './Components/AuthPage';
import Questionnaire from './Components/StepByStepQuestionnaire';
import Profile from './Components/UserProfile';
import CircadianSchedule from './Components/CircadianFitnessTracker';
import Header from './Components/Header';

import CircadianFitnessUI from './Components/CircadianFitnessUI';

const App = () => {
  const location = useLocation(); // Get the current route location

  // Conditionally render the Header based on the route
  const showHeader = !['/', '/questionnaire'].includes(location.pathname);

  return (
    <>
      {/* Conditionally render the Header */}
      {showHeader && <Header />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/circadian-schedule" element={<CircadianSchedule />} />
      </Routes>
    </>
  );
};

// Wrap the App component with Router
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;