import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

export default function useGlobalShortcut(
  shortcut: string,
  onPressed: () => void,
) {
  useEffect(() => {
    const setup = async () => {
      try {
        await register(shortcut, (event: { state: string }) => {
          if (event.state === "Pressed") onPressed();
        });
      } catch (error) {
        console.error("Failed to register shortcut:", error);
      }
    };
    setup();

    return () => {
      unregister(shortcut).catch((error: Error) =>
        console.error("Failed to unregister shortcut:", error),
      );
    };
  }, [shortcut, onPressed]);
}
