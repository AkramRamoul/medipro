import { app, BrowserWindow } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";
import { pollResources } from "./resourceManager.js";

app.on("ready", () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isDevelopment()) {
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  pollResources();
});
