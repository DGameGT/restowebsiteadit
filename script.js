// Restaurant Website JavaScript - Complete Interactive Features

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');

// Restaurant Data
const restaurantData = {
    menu: [
        {
            id: 1,
            name: "Nasi Goreng Spesial",
            category: "main-course",
            price: 25000,
            description: "Nasi goreng dengan campuran telur, ayam, dan sayuran segar",
            image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"
        },
        {
            id: 2,
            name: "Mie Ayam Bakso",
            category: "main-course",
            price: 18000,
            description: "Mie ayam dengan bakso sapi homemade dan kuah gurih",
            image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400"
        },
        {
            id: 3,
            name: "Sate Ayam Madura",
            category: "main-course",
            price: 30000,
            description: "Sate ayam dengan bumbu kacang khas Madura",
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400"
        },
        {
            id: 4,
            name: "Gado-Gado",
            category: "appetizer",
            price: 15000,
            description: "Sayuran segar dengan bumbu kacang dan lontong",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
        },
        {
            id: 5,
            name: "Es Teh Manis",
            category: "beverage",
            price: 5000,
            description: "Es teh manis segar dengan daun teh pilihan",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"
        },
        {
            id: 6,
            name: "Jus Alpukat",
            category: "beverage",
            price: 12000,
            description: "Jus alpukat creamy dengan susu kental manis",
            image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400"
        },
        {
            id: 7,
            name: "Es Campur",
            category: "dessert",
            price: 10000,
            description: "Es campur dengan berbagai macam buah dan jelly",
            image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400"
        },
        {
            id: 8,
            name: "Kopi Tubruk",
            category: "beverage",
            price: 8000,
            description: "Kopi tubruk khas Jawa dengan gula batu",
            image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400"
        },
        {
            id: 9,
            name: "Pisang Goreng",
            category: "dessert",
            price: 8000,
            description: "Pisang goreng crispy dengan topping coklat dan keju",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
        },
        {
            id: 10,
            name: "Bakwan Sayur",
            category: "appetizer",
            price: 5000,
            description: "Bakwan sayur goreng dengan campuran wortel dan kol",
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400"
        }
    ],
    capacity: {
        total: 50,
        occupied: 35,
        isFull: false
    },
    operatingHours: {
        openTime: 10, // 10:00 AM
        closeTime: 22, // 10:00 PM
        days: [0, 1, 2, 3, 4, 5, 6] // Sunday to Saturday (0 = Sunday)
    }
};

// Admin Integration Helpers
function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getEffectiveMenu() {
    const adminMenu = readJSON('adminMenuItems', []);
    if (adminMenu && adminMenu.length) {
        return adminMenu.map((m, idx) => ({
            id: m.id || `A-${idx + 1}`,
            name: m.name,
            category: m.category || 'main-course',
            price: Number(m.price) || 0,
            description: m.description || '',
            image: m.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
        }));
    }
    return restaurantData.menu;
}

function applyAdminOperatingHours() {
    const hours = readJSON('operatingHours', null);
    if (hours) {
        const open = (hours.openTime || '').split(':')[0];
        const close = (hours.closeTime || '').split(':')[0];
        const openNum = parseInt(open, 10);
        const closeNum = parseInt(close, 10);
        if (!isNaN(openNum)) restaurantData.operatingHours.openTime = openNum;
        if (!isNaN(closeNum)) restaurantData.operatingHours.closeTime = closeNum;
    }
}

// Cart Management
let cart = JSON.parse(localStorage.getItem('restaurantCart')) || [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateCartDisplay();
    // Sync operating hours from admin if available
    applyAdminOperatingHours();
    // Load menu, preferring admin-managed items
    loadMenuItems();
    setupEventListeners();
    checkRestaurantStatus();
});

function initializeApp() {
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu after clicking
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// Mobile Navigation
function setupEventListeners() {
    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cart sidebar toggle
    cartIcon.addEventListener('click', function() {
        cartSidebar.classList.toggle('open');
    });

    // Close cart sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
            cartSidebar.classList.remove('open');
        }
    });

    // Setup menu category filters
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterMenuByCategory(category);
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Setup menu search
    const menuSearch = document.querySelector('.menu-search input');
    if (menuSearch) {
        menuSearch.addEventListener('input', function() {
            searchMenuItems(this.value);
        });
    }

    // Setup order category filters
    const orderCategoryButtons = document.querySelectorAll('.order-category');
    orderCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterOrderByCategory(category);
            
            // Update active button
            orderCategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Setup reservation form
    const reservationForm = document.querySelector('.reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReservation(this);
        });
    }

    // Setup contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }

    // Setup checkout button (using class `btn-primary btn-full` in Order section, which calls `proceedToPayment`)
    // No explicit click listener needed here since the HTML element in the Order section
    // already calls `proceedToPayment()` via inline `onclick`.

    // Setup payment modal (DEPRECATED: Now uses separate payment page)
    // The previous logic for paymentForm is removed since we are now redirecting.
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

/**
 * [UPDATE] Mengganti fungsionalitas untuk mengarahkan ke halaman pembayaran.
 * Dipanggil dari tombol "Lanjut ke Pembayaran" di Order Section.
 */
function proceedToPayment() {
    if (cart.length === 0) {
        showNotification('Keranjang Anda kosong. Silakan tambahkan item terlebih dahulu.', 'warning');
        return;
    }
    
    // Hitung rincian total untuk dikirim ke halaman pembayaran
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.1; // Pajak 10%
    const deliveryFee = 10000;
    const tax = Math.round(subtotal * taxRate); // Pembulatan pajak
    const total = subtotal + tax + deliveryFee;

    const paymentSummary = {
        subtotal,
        tax,
        deliveryFee,
        total
    };
    
    // Simpan rincian total ke localStorage untuk diakses di halaman pembayaran
    writeJSON('paymentSummary', paymentSummary);

    // Alihkan ke halaman pembayaran yang baru dibuat
    window.location.href = 'pembayaran/index.html';
}

// Menu Functions
function loadMenuItems() {
    const menuGrid = document.querySelector('.menu-grid');
    const orderItems = document.querySelector('.order-items');
    const effectiveMenu = getEffectiveMenu();
    // Keep in-memory menu in sync for cart operations
    restaurantData.menu = effectiveMenu;

    if (menuGrid) {
        menuGrid.innerHTML = '';
        effectiveMenu.forEach(item => {
            menuGrid.appendChild(createMenuItemCard(item));
        });
    }
    
    if (orderItems) {
        orderItems.innerHTML = '';
        effectiveMenu.forEach(item => {
            orderItems.appendChild(createOrderItemCard(item));
        });
    }
}

function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-item-image">
        <div class="menu-item-content">
            <h4 class="menu-item-title">${item.name}</h4>
            <p class="menu-item-description">${item.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">Rp ${item.price.toLocaleString()}</span>
                <button class="add-to-cart-btn" onclick="addToCart('${item.id}')">
                    <i class="fas fa-cart-plus"></i> Tambah
                </button>
            </div>
        </div>
    `;
    return card;
}

function createOrderItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-item-image">
        <div class="menu-item-content">
            <h4 class="menu-item-title">${item.name}</h4>
            <p class="menu-item-description">${item.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">Rp ${item.price.toLocaleString()}</span>
                <button class="add-to-cart-btn" onclick="addToCart('${item.id}')">
                    <i class="fas fa-cart-plus"></i> Tambah
                </button>
            </div>
        </div>
    `;
    return card;
}

function filterMenuByCategory(category) {
    const menuGrid = document.querySelector('.menu-grid');
    const filteredItems = category === 'all' 
        ? restaurantData.menu 
        : restaurantData.menu.filter(item => item.category === category);
    
    menuGrid.innerHTML = '';
    filteredItems.forEach(item => {
        menuGrid.appendChild(createMenuItemCard(item));
    });
}

function filterOrderByCategory(category) {
    const orderItems = document.querySelector('.order-items');
    const filteredItems = category === 'all' 
        ? restaurantData.menu 
        : restaurantData.menu.filter(item => item.category === category);
    
    orderItems.innerHTML = '';
    filteredItems.forEach(item => {
        orderItems.appendChild(createOrderItemCard(item));
    });
}

function searchMenuItems(searchTerm) {
    const menuGrid = document.querySelector('.menu-grid');
    const filteredItems = restaurantData.menu.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    menuGrid.innerHTML = '';
    filteredItems.forEach(item => {
        menuGrid.appendChild(createMenuItemCard(item));
    });
}

// Cart Functions
function addToCart(itemId) {
    const item = restaurantData.menu.find(item => String(item.id) === String(itemId));
    if (!item) return;
    
    const existingItem = cart.find(cartItem => String(cartItem.id) === String(itemId));
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${item.name} ditambahkan ke keranjang!`);
    
    // Add animation to cart icon
    cartIcon.classList.add('bounce');
    setTimeout(() => cartIcon.classList.remove('bounce'), 600);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => String(item.id) !== String(itemId));
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartQuantity(itemId, change) {
    const item = cart.find(item => String(item.id) === String(itemId));
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCartDisplay();
        saveCartToStorage();
    }
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items (for Order Section)
    const cartItemsContainerOrder = document.getElementById('cartItems');
    
    // Calculate totals for display
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const deliveryFee = 10000; // Fixed delivery fee from HTML
    const total = subtotal + tax + deliveryFee;

    // Update cart items in Order Section
    if (cartItemsContainerOrder) {
        if (cart.length === 0) {
            cartItemsContainerOrder.innerHTML = '<p class="empty-cart">Keranjang kosong</p>';
        } else {
            cartItemsContainerOrder.innerHTML = '';
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Rp ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainerOrder.appendChild(cartItem);
            });
        }
    }

    // Update totals in Order Section
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax'); // Assuming you add this ID in HTML if needed
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `Rp ${subtotal.toLocaleString()}`;
    // if (taxEl) taxEl.textContent = `Rp ${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString()}`;
    
    // Update cart items (for Sidebar)
    const cartSidebarContent = document.getElementById('cartSidebarContent');
    if (cartSidebarContent) {
        if (cart.length === 0) {
            cartSidebarContent.innerHTML = '<p class="empty-cart">Keranjang kosong</p>';
        } else {
             // Re-render sidebar content
            cartSidebarContent.innerHTML = '';
            
            // Add cart items
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.style.borderBottom = '1px solid #eee';
                cartItem.style.marginBottom = '10px';
                
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name} (${item.quantity}x)</h4>
                        <p>Total: Rp ${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" style="padding: 6px 12px;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                cartSidebarContent.appendChild(cartItem);
            });

            // Add checkout button for sidebar
            const sidebarFooter = document.createElement('div');
            sidebarFooter.className = 'sidebar-footer';
            sidebarFooter.innerHTML = `
                <div class="total-row final" style="padding-top: 1rem; margin-top: 1rem; border-top: 2px solid var(--primary-light);">
                    <span>Subtotal:</span>
                    <span>Rp ${subtotal.toLocaleString()}</span>
                </div>
                <button class="btn btn-secondary btn-full" onclick="proceedToPayment()" style="margin-top: 1rem;">
                    Lanjut ke Pembayaran
                </button>
            `;
            cartSidebarContent.appendChild(sidebarFooter);
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

// Capacity Checker
function checkRestaurantCapacity() {
    const capacityIndicator = document.querySelector('.indicator-light');
    const capacityText = document.querySelector('.capacity-text');
    const capacityPercentage = document.querySelector('.capacity-percentage');
    
    if (!capacityIndicator || !capacityText || !capacityPercentage) return;
    
    // First check if restaurant is open
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const { openTime, closeTime, days } = restaurantData.operatingHours;
    const isOpenDay = days.includes(currentDay);
    const isOpenTime = currentHour >= openTime && currentHour < closeTime;
    
    if (!isOpenDay || !isOpenTime) {
        return; // Don't update capacity if restaurant is closed
    }
    
    const percentage = Math.round((restaurantData.capacity.occupied / restaurantData.capacity.total) * 100);
    
    capacityPercentage.textContent = `${percentage}% terisi`;
    
    if (restaurantData.capacity.isFull) {
        capacityIndicator.classList.add('full');
        capacityText.textContent = 'Restoran Penuh';
        capacityText.style.color = 'var(--error-color)';
    } else if (percentage >= 80) {
        capacityIndicator.style.background = 'var(--warning-color)';
        capacityText.textContent = 'Hampir Penuh';
        capacityText.style.color = 'var(--warning-color)';
    } else {
        capacityText.textContent = 'Tersedia';
        capacityText.style.color = 'var(--success-color)';
    }
}

// Check Restaurant Open/Close Status
function checkRestaurantStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const statusElement = document.getElementById('capacityStatus');
    const infoElement = document.getElementById('capacityInfo');
    const indicatorLight = document.getElementById('capacityLight');
    
    if (!statusElement || !infoElement || !indicatorLight) return;
    
    const { openTime, closeTime, days } = restaurantData.operatingHours;
    const isOpenDay = days.includes(currentDay);
    const isOpenTime = currentHour >= openTime && currentHour < closeTime;
    
    if (isOpenDay && isOpenTime) {
        statusElement.textContent = 'BUKA';
        statusElement.style.color = 'var(--success-color)';
        indicatorLight.style.background = 'var(--success-color)';
        infoElement.textContent = `Buka sampai jam ${closeTime}:00`;
        
        // Also check capacity status
        checkRestaurantCapacity();
    } else {
        statusElement.textContent = 'TUTUP';
        statusElement.style.color = 'var(--error-color)';
        indicatorLight.style.background = 'var(--error-color)';
        
        if (!isOpenDay) {
            infoElement.textContent = 'Hari ini libur';
        } else if (currentHour < openTime) {
            infoElement.textContent = `Buka jam ${openTime}:00`;
        } else {
            infoElement.textContent = 'Buka besok';
        }
    }
}

// Reservation System
function handleReservation(form) {
    // Support both: actual form element or container
    const formEl = (form && form.tagName === 'FORM') ? form : document.getElementById('reservationForm');
    const reservation = {
        name: document.getElementById('resName')?.value?.trim() || '',
        phone: document.getElementById('resPhone')?.value?.trim() || '',
        date: document.getElementById('resDate')?.value || '',
        time: document.getElementById('resTime')?.value || '',
        guests: parseInt(document.getElementById('resGuests')?.value || '0', 10),
        specialRequests: document.getElementById('resNotes')?.value?.trim() || ''
    };
    
    // Validate capacity
    const totalGuests = parseInt(reservation.guests);
    const newOccupied = restaurantData.capacity.occupied + totalGuests;
    
    if (newOccupied > restaurantData.capacity.total) {
        showNotification('Maaf, kapasitas restoran tidak mencukupi untuk reservasi ini.', 'error');
        return;
    }
    
    // Simulate reservation processing
    if (formEl) showLoadingState(formEl);
    
    setTimeout(() => {
        // Update capacity
        restaurantData.capacity.occupied = newOccupied;
        restaurantData.capacity.isFull = newOccupied >= restaurantData.capacity.total;
        checkRestaurantCapacity();
        
        // Show success message
        if (formEl) hideLoadingState(formEl);
        showNotification('Reservasi berhasil! Kami akan menghubungi Anda untuk konfirmasi.', 'success');
        if (formEl) formEl.reset();
        
        // Send confirmation email (simulated)
        sendReservationConfirmation(reservation);

        // Persist for Admin Panel consumption
        const existing = readJSON('reservations', []);
        const resId = `R-${Date.now()}`;
        existing.push({
            id: resId,
            name: reservation.name,
            date: reservation.date,
            time: reservation.time,
            guests: reservation.guests,
            phone: reservation.phone,
            status: 'pending',
            createdAt: Date.now()
        });
        writeJSON('reservations', existing);
    }, 2000);
}

function sendReservationConfirmation(reservation) {
    // Simulate sending confirmation
    console.log('Sending reservation confirmation:', reservation);
    
    // In a real application, this would send an email or SMS
    showNotification('Konfirmasi reservasi telah dikirim ke WhatsApp Anda.', 'success');
}

// Payment Processing (DEPRECATED - Replaced by redirect in proceedToPayment)
/*
function showPaymentModal() { ... }
function updatePaymentSummary() { ... }
function processPayment(form) { ... }
function validatePaymentData(data) { ... }
function showSuccessModal(orderNumber) { ... }
function sendOrderConfirmation(orderNumber) { ... }
*/

// Contact Form Handler
function handleContactForm(form) {
    // The previous implementation used `formData.get('name')` etc., but the HTML 
    // uses IDs, so let's adjust for safety (although the structure is functional)
    const contactData = {
        name: document.getElementById('contactName')?.value,
        email: document.getElementById('contactEmail')?.value,
        subject: document.getElementById('contactSubject')?.value,
        message: document.getElementById('contactMessage')?.value
    };
    
    // Validate contact data
    if (!contactData.name || !contactData.email || !contactData.message) {
        showNotification('Mohon lengkapi semua field yang wajib diisi.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
        showNotification('Format email tidak valid.', 'error');
        return;
    }
    
    showLoadingState(form);
    
    // Simulate sending message
    setTimeout(() => {
        hideLoadingState(form);
        showNotification('Pesan Anda telah terkirim! Kami akan segera merespons.', 'success');
        form.reset();
    }, 1500);
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Add animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function showLoadingState(element) {
    const submitButton = element.querySelector('button[type="submit"]');
    if (submitButton) {
        // Save original text before changing it
        submitButton.dataset.originalText = submitButton.textContent; 
        submitButton.innerHTML = '<div class="loading"></div> Processing...';
        submitButton.disabled = true;
    }
}

function hideLoadingState(element) {
    const submitButton = element.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = submitButton.dataset.originalText || 'Kirim Pesan'; // Fallback text
        submitButton.disabled = false;
    }
}

// Close modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
    }
}

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-hover);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 3000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-error {
    border-left: 4px solid var(--error-color);
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification-success .notification-content i {
    color: var(--success-color);
}

.notification-error .notification-content i {
    color: var(--error-color);
}

.notification-info .notification-content i {
    color: var(--primary-color);
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-light);
    padding: 0.25rem;
    border-radius: 4px;
    transition: var(--transition);
}

.notification-close:hover {
    background: var(--background-light);
    color: var(--text-dark);
}
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Add bounce animation for cart icon
const bounceStyles = `
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}

.cart-icon.bounce {
    animation: bounce 0.6s ease;
}
`;

const bounceStyleSheet = document.createElement('style');
bounceStyleSheet.textContent = bounceStyles;
document.head.appendChild(bounceStyleSheet);

// Export functions for global access
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.closeModal = closeModal;
window.closeCartSidebar = closeCartSidebar;
window.checkCapacity = checkRestaurantStatus;
window.proceedToPayment = proceedToPayment; // Export the updated function