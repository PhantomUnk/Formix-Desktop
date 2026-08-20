import useHideShortcut from "@/hooks/useHideShortcut";
import MainScreen from "@/screens/MainScreen";
import "./App.css";

function App() {
  useHideShortcut();

  return <MainScreen />;
}

export default App;
