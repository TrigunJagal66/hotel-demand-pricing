
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard } from './pages/Dashboard';
import { Recommender } from './pages/Recommender';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

import { FormProvider } from './context/FormContext';

function App() {
  return (
    <Router>
      <FormProvider>
        <Layout>
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recommend" element={<Recommender />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      </FormProvider>
    </Router>
  );
}

export default App;
