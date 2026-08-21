import { DEFAULT_LANGUAGE, DEFAULT_THEME } from "@/lib/constants";
import useHideShortcut from "@/hooks/useHideShortcut";
import { applyLanguage, applyTheme, getSetting } from "@/lib/settings";
import MainScreen from "@/screens/MainScreen";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  useHideShortcut();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      getSetting("theme", DEFAULT_THEME).then(applyTheme),
      getSetting("language", DEFAULT_LANGUAGE).then(applyLanguage),
    ]).finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <MainScreen />;
}

export default App;
