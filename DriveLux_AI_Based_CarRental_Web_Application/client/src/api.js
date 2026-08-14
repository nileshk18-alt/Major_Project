export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("drivelux_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach DriveLux server at ${API}. Start the backend first.`);
  }

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message:text }; }

  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method:"POST", body:JSON.stringify(body) }),
  put: (path, body = {}) => request(path, { method:"PUT", body:JSON.stringify(body) })
};

export async function downloadInvoice(id) {
  const token = localStorage.getItem("drivelux_token");
  if (!token) throw new Error("Please sign in again before downloading your invoice.");

  const res = await fetch(`${API}/bookings/${id}/invoice`, {
    headers:{ Authorization:`Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(()=>({}));
    throw new Error(data.message || "Could not download invoice");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `drivelux-${id}-invoice.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
