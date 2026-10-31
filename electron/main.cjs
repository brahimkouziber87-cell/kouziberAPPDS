const { app, BrowserWindow, shell, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 768,
    minHeight: 600,
    title: "منصة الهندسة البيداغوجية والتقويم التربوي - الرياضيات | Prof Kouziber Brahim",
    backgroundColor: "#090d16",
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // بناء قائمة تطبيق سطح المكتب بالعربية والفرنسية
  const menuTemplate = [
    {
      label: "ملف (Fichier)",
      submenu: [
        {
          label: "طباعة الوثيقة (Imprimer A4)",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            if (mainWindow) mainWindow.webContents.print({ printBackground: true });
          },
        },
        { type: "separator" },
        {
          label: "إعادة تحميل (Actualiser)",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        { type: "separator" },
        {
          label: "خروج (Quitter)",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "عرض (Affichage)",
      submenu: [
        {
          label: "وضع ملء الشاشة للعرض والسبورة التفاعلية (Plein écran)",
          accelerator: "F11",
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
        { role: "zoomIn", label: "تكبير (Zoom +)" },
        { role: "zoomOut", label: "تصغير (Zoom -)" },
        { role: "resetZoom", label: "الحجم الافتراضي (100%)" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // فتح الروابط الخارجية في المتصفح الافتراضي للنظام
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  const devServerUrl = process.env.ELECTRON_START_URL;
  const distIndex = path.join(__dirname, "..", "dist", "index.html");

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(distIndex)) {
    mainWindow.loadFile(distIndex);
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("desktop:print-silent", async () => {
  if (!mainWindow) return false;
  mainWindow.webContents.print({ printBackground: true });
  return true;
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
