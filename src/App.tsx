import "./App.css";
import PresetListScreen from "@/components/PresetListScreen";
import useHideShortcut from "@/shortcuts/HideNShow/useHideShortcut";

function App() {
  useHideShortcut();

  return <PresetListScreen />;
}

export default App;
