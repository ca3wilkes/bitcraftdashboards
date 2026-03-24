let darkMode = window.localStorage.darkMode;

if (darkMode === undefined){
  darkMode = String(window.matchMedia('(prefers-color-scheme: dark)').matches);
  saveDarkMode(darkMode)
}

if (darkMode === "true"){
  document.body.classList.toggle("dark");
  checkbox.checked = true;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const toggleValue = document.body.classList.contains("dark");
  saveDarkMode(toggleValue);
}

/**
 * Updates the darkmode variable in Local Storage
 * @param {string} mode - Boolean value: True is Dark mode, False is Light mode.
 */
function saveDarkMode(mode) {
  window.localStorage.setItem("darkMode", mode);
}