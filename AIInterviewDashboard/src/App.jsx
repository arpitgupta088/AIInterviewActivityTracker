import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SessionDetails from "./pages/SessionDetails";
import Events from "./pages/Events";
import Sessions from "./pages/Sessions";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events" element={<Events />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/sessions/:sessionId" element={<SessionDetails />} />
    </Routes>
  );
}

export default App;