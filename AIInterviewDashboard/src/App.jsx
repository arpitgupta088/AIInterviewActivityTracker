/**
 * Root application component.
 * Defines the client-side routing for all interview and dashboard pages.
 */
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SessionDetails from "./pages/SessionDetails";
import Events from "./pages/Events";
import Sessions from "./pages/Sessions";
import InterviewLanding from "./pages/InterviewLanding";
import InterviewPermission from "./pages/InterviewPermission";
import InterviewIntro from "./pages/InterviewIntro";
import InterviewQuestion from "./pages/InterviewQuestion";
import InterviewComplete from "./pages/InterviewComplete";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events" element={<Events />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/interview" element={<InterviewLanding />} />
      <Route path="/interview/permission" element={<InterviewPermission />} />
      <Route path="/interview/intro" element={<InterviewIntro />} />
      <Route path="/interview/questions" element={<InterviewQuestion />} />
      <Route path="/interview/complete" element={<InterviewComplete />} />
      <Route path="/sessions/:sessionId" element={<SessionDetails />} />
    </Routes>
  );
}

export default App;