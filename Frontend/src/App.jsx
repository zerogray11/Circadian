import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './Components/AuthPage';
import Questionnaire from './Components/StepByStepQuestionnaire';
import Profile from './Components/UserProfile';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;