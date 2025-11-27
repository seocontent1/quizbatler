import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jesusquiz.battle33",
  appName: "Quiz Battle",
  webDir: "dist",
  server: {
    androidScheme: "https", // ✅ necessário para OAuth no Android
  },
  plugins: {
    Purchases: {
      apiKey: "test_UflLjfTtuznBWVaEARsmhEdbsCB",
    },
  },
};

export default config;
