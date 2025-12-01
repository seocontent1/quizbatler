// src/utils/statusBar.ts
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

export async function setAppStatusBar() {
  try {
    if (Capacitor.getPlatform() === "web") return; // evita rodar no browser
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: "#003997" });
    await StatusBar.setStyle({ style: Style.Dark }); // ou Style.Dark dependendo do texto
  } catch (e) {
    console.warn("StatusBar plugin not available", e);
  }
}
