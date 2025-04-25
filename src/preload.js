
const { contextBridge, ipcRenderer } = require("electron");



contextBridge.exposeInMainWorld("electronAPI", {
  loginSuccess: (userData) => {
    ipcRenderer.send("login-success", userData);
  },



  setUserData: (data) => {
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('email', data.email);
    sessionStorage.setItem('contact', data.contact);
  }
});
