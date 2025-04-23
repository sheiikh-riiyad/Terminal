const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loginSuccess: (userData) => {
    ipcRenderer.send("login-success", userData);
  }
});