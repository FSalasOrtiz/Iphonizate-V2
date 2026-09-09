// Persistencia local en el navegador. Toda la operación (equipos, ventas,
// clientes, etc.) vive como un único documento JSON en localStorage. Es por
// dispositivo: no se comparte entre navegadores ni computadores.
const DATA_KEY = "iphonizate-data";

export async function loadData() {
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("No se pudo leer la información guardada:", err);
    return null;
  }
}

export async function saveData(data) {
  try {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("No se pudo guardar la información:", err);
    return false;
  }
}
