const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kouziberDesktopBridge", {
  isDesktopApp: true,
  platform: process.platform,
  printDocument: () => ipcRenderer.invoke("desktop:print-silent"),
});
