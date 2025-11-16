const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const setAdminSession = (username, persistent) => {
  const token = { username, ts: Date.now() };
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem("adminSession", JSON.stringify(token));
};

const getAdminSession = () => {
  const fromSession = sessionStorage.getItem("adminSession");
  const fromLocal = localStorage.getItem("adminSession");
  const raw = fromSession || fromLocal;
  return raw ? JSON.parse(raw) : null;
};

const clearAdminSession = () => {
  sessionStorage.removeItem("adminSession");
  localStorage.removeItem("adminSession");
};

const isLoggedIn = () => !!getAdminSession();

const formatCurrency = (n) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
};

const seedIfEmpty = () => {
  const reservations = readJSON("reservations", null);
  const orders = readJSON("orders", null);
  const menuItems = readJSON("adminMenuItems", null);
  if (!reservations) {
    writeJSON("reservations", [
      { id: "R-1001", name: "Budi Santoso", date: "2025-11-12", time: "19:00", guests: 4, phone: "081234567890", status: "pending", createdAt: Date.now() - 86400000 },
      { id: "R-1002", name: "Siti Aminah", date: "2025-11-12", time: "12:00", guests: 2, phone: "081298765432", status: "confirmed", createdAt: Date.now() - 43200000 }
    ]);
  }
  if (!orders) {
    writeJSON("orders", [
      { id: "O-2001", customerName: "Andi", totalPrice: 85000, paymentMethod: "Cash", status: "pending", date: "2025-11-11", items: [{ name: "Nasi Goreng", qty: 1, price: 35000 }, { name: "Es Teh", qty: 2, price: 25000 }] },
      { id: "O-2002", customerName: "Dewi", totalPrice: 120000, paymentMethod: "QRIS", status: "processing", date: "2025-11-11", items: [{ name: "Sate Ayam", qty: 2, price: 60000 }] }
    ]);
  }
  if (!menuItems) {
    writeJSON("adminMenuItems", [
      { id: "M-1", name: "Nasi Goreng", category: "main-course", price: 35000, description: "Nasi goreng spesial", image: "" },
      { id: "M-2", name: "Sate Ayam", category: "main-course", price: 60000, description: "Sate ayam bumbu kacang", image: "" },
      { id: "M-3", name: "Es Teh", category: "beverage", price: 25000, description: "Es teh manis", image: "" }
    ]);
  }
  const hours = readJSON("operatingHours", null);
  if (!hours) writeJSON("operatingHours", { openTime: "10:00", closeTime: "22:00" });
  const info = readJSON("restaurantInfo", null);
  if (!info) writeJSON("restaurantInfo", { address: "Jl. Kabul No. 123, Jakarta", phone: "(021) 1234-5678" });
};

const setupLogin = () => {
  const form = document.getElementById("adminLoginForm");
  const usernameEl = document.getElementById("adminUsername");
  const passwordEl = document.getElementById("adminPassword");
  const rememberEl = document.getElementById("rememberMe");
  const errorEl = document.getElementById("loginError");

  if (isLoggedIn()) {
    window.location.href = "dashboard.html";
    return;
  }

  window.togglePassword = () => {
    const type = passwordEl.getAttribute("type") === "password" ? "text" : "password";
    passwordEl.setAttribute("type", type);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = (usernameEl.value || "").trim();
    const p = (passwordEl.value || "").trim();
    const remember = !!rememberEl?.checked;
    const validUser = (u === "gemoy");
    const validPass = (p === "gemoy123");
    if (!validUser || !validPass) {
      errorEl.textContent = "Username atau password salah";
      errorEl.classList.add("show");
      return;
    }
    errorEl.textContent = "";
    errorEl.classList.remove("show");
    setAdminSession(u, remember);
    window.location.href = "dashboard.html";
  });
};

const updateBadges = (reservations, orders) => {
  const rCount = document.getElementById("reservationCount");
  const oCount = document.getElementById("orderCount");
  const nCount = document.getElementById("notificationCount");
  const rLen = reservations.length;
  const oLen = orders.length;
  if (rCount) rCount.textContent = String(rLen);
  if (oCount) oCount.textContent = String(oLen);
  if (nCount) nCount.textContent = String(rLen + oLen);
};

const renderStats = (reservations, orders) => {
  const totalReservations = document.getElementById("totalReservations");
  const totalOrders = document.getElementById("totalOrders");
  const totalCustomers = document.getElementById("totalCustomers");
  const totalRevenue = document.getElementById("totalRevenue");
  if (totalReservations) totalReservations.textContent = String(reservations.length);
  if (totalOrders) totalOrders.textContent = String(orders.length);
  const customers = new Set([...
    reservations.map(r => r.name), ...orders.map(o => o.customerName)
  ].filter(Boolean));
  if (totalCustomers) totalCustomers.textContent = String(customers.size);
  const revenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  if (totalRevenue) totalRevenue.textContent = formatCurrency(revenue);
};

const renderReservationsTable = (reservations) => {
  const tbody = document.getElementById("reservationsTableBody");
  const search = document.getElementById("reservationSearch");
  const filter = document.getElementById("reservationFilter");
  if (!tbody) return;
  const q = (search?.value || "").toLowerCase();
  const f = filter?.value || "all";
  const rows = reservations
    .filter(r => f === "all" ? true : r.status === f)
    .filter(r => !q || `${r.id} ${r.name} ${r.phone}`.toLowerCase().includes(q))
    .map(r => {
      const statusClass = {
        pending: "status-badge pending",
        confirmed: "status-badge confirmed",
        cancelled: "status-badge cancelled",
        completed: "status-badge confirmed"
      }[r.status] || "status-badge";
      return `
        <tr>
          <td>${r.id}</td>
          <td>${r.name}</td>
          <td>${r.date}</td>
          <td>${r.time}</td>
          <td>${r.guests}</td>
          <td>${r.phone}</td>
          <td><span class="${statusClass}">${r.status}</span></td>
          <td class="action-buttons">
            <button class="btn-action btn-confirm" onclick="confirmReservation('${r.id}')">Konfirmasi</button>
            <button class="btn-action btn-cancel" onclick="cancelReservation('${r.id}')">Batalkan</button>
            <button class="btn-action btn-view" onclick="viewReservation('${r.id}')">Lihat</button>
          </td>
        </tr>`;
    }).join("");
  tbody.innerHTML = rows || `<tr><td colspan="8" class="no-data">Tidak ada data</td></tr>`;
};

const renderOrdersTable = (orders) => {
  const tbody = document.getElementById("ordersTableBody");
  const search = document.getElementById("orderSearch");
  const filter = document.getElementById("orderFilter");
  if (!tbody) return;
  const q = (search?.value || "").toLowerCase();
  const f = filter?.value || "all";
  const rows = orders
    .filter(o => f === "all" ? true : o.status === f)
    .filter(o => !q || `${o.id} ${o.customerName}`.toLowerCase().includes(q))
    .map(o => {
      const statusClass = {
        pending: "status-badge pending",
        processing: "status-badge pending",
        ready: "status-badge confirmed",
        delivered: "status-badge confirmed",
        completed: "status-badge confirmed",
        cancelled: "status-badge cancelled"
      }[o.status] || "status-badge";
      return `
        <tr>
          <td>${o.id}</td>
          <td>${o.customerName || '-'}</td>
          <td>${formatCurrency(o.totalPrice)}</td>
          <td>${o.paymentMethod || '-'}</td>
          <td><span class="${statusClass}">${o.status}</span></td>
          <td>${o.date || '-'}</td>
          <td class="action-buttons">
            <button class="btn-action btn-info" onclick="viewOrder('${o.id}')">Lihat</button>
            <button class="btn-action btn-success" onclick="advanceOrderStatus('${o.id}')">Naikkan Status</button>
            <button class="btn-action btn-cancel" onclick="cancelOrder('${o.id}')">Batalkan</button>
          </td>
        </tr>`;
    }).join("");
  tbody.innerHTML = rows || `<tr><td colspan="7" class="no-data">Tidak ada data</td></tr>`;
};

const openModal = (id) => {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add("show");
};

const closeModal = (id) => {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove("show");
};

const viewReservation = (id) => {
  const reservations = readJSON("reservations", []);
  const r = reservations.find(x => x.id === id);
  const body = document.getElementById("reservationModalBody");
  if (r && body) {
    body.innerHTML = `
      <p><strong>ID:</strong> ${r.id}</p>
      <p><strong>Nama:</strong> ${r.name}</p>
      <p><strong>Tanggal:</strong> ${r.date}</p>
      <p><strong>Waktu:</strong> ${r.time}</p>
      <p><strong>Tamu:</strong> ${r.guests}</p>
      <p><strong>Telepon:</strong> ${r.phone}</p>
      <p><strong>Status:</strong> ${r.status}</p>
    `;
    openModal("reservationModal");
  }
};

const viewOrder = (id) => {
  const orders = readJSON("orders", []);
  const o = orders.find(x => x.id === id);
  const body = document.getElementById("orderModalBody");
  if (o && body) {
    const items = (o.items || []).map(it => `<li>${it.name} x ${it.qty} - ${formatCurrency(it.price * it.qty)}</li>`).join("");
    body.innerHTML = `
      <p><strong>ID:</strong> ${o.id}</p>
      <p><strong>Pelanggan:</strong> ${o.customerName || '-'}</p>
      <p><strong>Total:</strong> ${formatCurrency(o.totalPrice)}</p>
      <p><strong>Metode:</strong> ${o.paymentMethod || '-'}</p>
      <p><strong>Status:</strong> ${o.status}</p>
      <p><strong>Tanggal:</strong> ${o.date || '-'}</p>
      <hr>
      <p><strong>Item:</strong></p>
      <ul>${items}</ul>
    `;
    openModal("orderModal");
  }
};

const confirmReservation = (id) => {
  const reservations = readJSON("reservations", []);
  const idx = reservations.findIndex(r => r.id === id);
  if (idx >= 0) {
    reservations[idx].status = "confirmed";
    writeJSON("reservations", reservations);
    renderReservationsTable(reservations);
    renderStats(reservations, readJSON("orders", []));
  }
};

const cancelReservation = (id) => {
  const reservations = readJSON("reservations", []);
  const idx = reservations.findIndex(r => r.id === id);
  if (idx >= 0) {
    reservations[idx].status = "cancelled";
    writeJSON("reservations", reservations);
    renderReservationsTable(reservations);
    renderStats(reservations, readJSON("orders", []));
  }
};

const advanceOrderStatus = (id) => {
  const orders = readJSON("orders", []);
  const idx = orders.findIndex(o => o.id === id);
  if (idx >= 0) {
    const flow = ["pending", "processing", "ready", "delivered", "completed"];
    const cur = orders[idx].status || "pending";
    const next = flow[Math.min(flow.indexOf(cur) + 1, flow.length - 1)];
    orders[idx].status = next;
    writeJSON("orders", orders);
    renderOrdersTable(orders);
    renderStats(readJSON("reservations", []), orders);
  }
};

const cancelOrder = (id) => {
  const orders = readJSON("orders", []);
  const idx = orders.findIndex(o => o.id === id);
  if (idx >= 0) {
    orders[idx].status = "cancelled";
    writeJSON("orders", orders);
    renderOrdersTable(orders);
    renderStats(readJSON("reservations", []), orders);
  }
};

const filterMenu = (category) => {
  const items = readJSON("adminMenuItems", []);
  const grid = document.getElementById("menuItemsGrid");
  if (!grid) return;
  const filtered = category === "all" ? items : items.filter(m => m.category === category);
  grid.innerHTML = filtered.map(m => `
    <div class="menu-item-card">
      <div class="menu-item-header">
        <span class="menu-item-name">${m.name}</span>
        <span class="menu-item-price">${formatCurrency(m.price)}</span>
      </div>
      <p class="menu-item-description">${m.description || ''}</p>
      <div class="menu-item-actions">
        <button class="btn btn-info btn-sm" onclick="editMenuItem('${m.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${m.id}')">Hapus</button>
      </div>
    </div>
  `).join("");
};

const showAddMenuModal = () => openModal("addMenuModal");

const saveNewMenu = (e) => {
  e.preventDefault();
  const name = document.getElementById("newMenuName").value.trim();
  const category = document.getElementById("newMenuCategory").value;
  const price = parseInt(document.getElementById("newMenuPrice").value, 10) || 0;
  const description = document.getElementById("newMenuDescription").value.trim();
  const image = document.getElementById("newMenuImage").value.trim();
  if (!name || !category) return;
  const items = readJSON("adminMenuItems", []);
  const id = `M-${Date.now()}`;
  items.push({ id, name, category, price, description, image });
  writeJSON("adminMenuItems", items);
  closeModal("addMenuModal");
  filterMenu("all");
};

const editMenuItem = (id) => {
  const items = readJSON("adminMenuItems", []);
  const idx = items.findIndex(m => m.id === id);
  if (idx < 0) return;
  const name = prompt("Nama Menu", items[idx].name);
  if (name === null) return;
  items[idx].name = name.trim() || items[idx].name;
  writeJSON("adminMenuItems", items);
  filterMenu("all");
};

const deleteMenuItem = (id) => {
  const items = readJSON("adminMenuItems", []);
  const next = items.filter(m => m.id !== id);
  writeJSON("adminMenuItems", next);
  filterMenu("all");
};

const updateOperatingHours = () => {
  const open = document.getElementById("openTime")?.value || "10:00";
  const close = document.getElementById("closeTime")?.value || "22:00";
  writeJSON("operatingHours", { openTime: open, closeTime: close });
  alert("Jam operasional disimpan");
};

const updateRestaurantInfo = () => {
  const address = document.getElementById("restaurantAddress")?.value || "";
  const phone = document.getElementById("restaurantPhone")?.value || "";
  writeJSON("restaurantInfo", { address, phone });
  alert("Informasi restoran disimpan");
};

const showSection = (key) => {
  const all = document.querySelectorAll(".content-section");
  all.forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`${key}-section`);
  if (target) target.classList.add("active");
  const title = document.getElementById("sectionTitle");
  if (title) title.textContent = {
    dashboard: "Dashboard",
    reservations: "Manajemen Reservasi",
    orders: "Manajemen Pesanan Online",
    menu: "Manajemen Menu",
    settings: "Pengaturan",
    profile: "Profil"
  }[key] || "Dashboard";
  document.querySelectorAll(".nav-item").forEach(li => li.classList.remove("active"));
  const nav = document.querySelector(`.nav-link[href='#${key}']`)?.parentElement;
  if (nav) nav.classList.add("active");
};

const toggleSidebar = () => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("show");
};

const toggleNotifications = () => {};

const toggleUserMenu = () => {
  const dd = document.getElementById("userDropdown");
  if (dd) dd.classList.toggle("show");
};

const refreshReservations = () => {
  const reservations = readJSON("reservations", []);
  renderReservationsTable(reservations);
  renderStats(reservations, readJSON("orders", []));
  updateBadges(reservations, readJSON("orders", []));
};

const refreshOrders = () => {
  const orders = readJSON("orders", []);
  renderOrdersTable(orders);
  renderStats(readJSON("reservations", []), orders);
  updateBadges(readJSON("reservations", []), orders);
};

const logout = () => {
  clearAdminSession();
  window.location.href = "login.html";
};

const setupDashboard = () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  seedIfEmpty();
  const reservations = readJSON("reservations", []);
  const orders = readJSON("orders", []);
  const userEl = document.getElementById("currentUser");
  const sidebarUser = document.getElementById("adminUsername");
  const sess = getAdminSession();
  if (userEl && sess) userEl.textContent = sess.username;
  if (sidebarUser && sess) sidebarUser.textContent = sess.username;
  updateBadges(reservations, orders);
  renderStats(reservations, orders);
  renderReservationsTable(reservations);
  renderOrdersTable(orders);
  filterMenu("all");
  const rSearch = document.getElementById("reservationSearch");
  const rFilter = document.getElementById("reservationFilter");
  const oSearch = document.getElementById("orderSearch");
  const oFilter = document.getElementById("orderFilter");
  rSearch?.addEventListener("input", refreshReservations);
  rFilter?.addEventListener("change", refreshReservations);
  oSearch?.addEventListener("input", refreshOrders);
  oFilter?.addEventListener("change", refreshOrders);
  const addForm = document.getElementById("addMenuForm");
  addForm?.addEventListener("submit", saveNewMenu);
  showSection("dashboard");
};

document.addEventListener("DOMContentLoaded", () => {
  const isLogin = !!document.getElementById("adminLoginForm");
  if (isLogin) setupLogin(); else setupDashboard();
});

window.togglePassword = window.togglePassword || (() => {});
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.toggleNotifications = toggleNotifications;
window.toggleUserMenu = toggleUserMenu;
window.refreshReservations = refreshReservations;
window.refreshOrders = refreshOrders;
window.viewReservation = viewReservation;
window.confirmReservation = confirmReservation;
window.cancelReservation = cancelReservation;
window.viewOrder = viewOrder;
window.advanceOrderStatus = advanceOrderStatus;
window.cancelOrder = cancelOrder;
window.filterMenu = filterMenu;
window.showAddMenuModal = showAddMenuModal;
window.closeModal = closeModal;
window.updateOperatingHours = updateOperatingHours;
window.updateRestaurantInfo = updateRestaurantInfo;
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.logout = logout;