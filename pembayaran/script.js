// Payment Page JavaScript - UI Interactions and Simulation

// Utility function to read JSON from localStorage
function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}

// Utility function to format currency
function formatCurrency(n) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
}

document.addEventListener('DOMContentLoaded', function() {
    setupTabSwitching();
    startCountdownTimer(900);
    loadPaymentSummary();
    syncDanaTotal();
});

/**
 * Sync total pembayaran ke bagian DANA
 */
function syncDanaTotal() {
    const danaTotalDisplay = document.getElementById('danaTotalDisplay');
    const totalEl = document.getElementById('summaryTotal');

    if (danaTotalDisplay && totalEl) {
        danaTotalDisplay.textContent = totalEl.textContent;
    }
}

/**
 * Tab switching
 */
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');

            const targetId = this.dataset.tab;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

/**
 * Load summary
 */
function loadPaymentSummary() {
    const summary = readJSON('paymentSummary', { 
        subtotal: 0, 
        tax: 0, 
        deliveryFee: 0, 
        total: 0 
    });

    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryFeeEl = document.getElementById('summaryDeliveryFee');
    const taxEl = document.getElementById('summaryTax');
    const totalEl = document.getElementById('summaryTotal');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(summary.subtotal);
    if (deliveryFeeEl) deliveryFeeEl.textContent = formatCurrency(summary.deliveryFee);
    if (taxEl) taxEl.textContent = formatCurrency(summary.tax);
    if (totalEl) totalEl.textContent = formatCurrency(summary.total);
}

/**
 * Timer
 */
function startCountdownTimer(durationSeconds) {
    let timeLeft = durationSeconds;
    const timerElement = document.getElementById('timer');

    if (!timerElement) return;

    updateTimerDisplay(timeLeft, timerElement);

    const timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft, timerElement);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Waktu Habis';
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay(totalSeconds, element) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    element.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (totalSeconds <= 120) {
        element.style.color = 'var(--error-color)';
        element.parentElement.style.borderColor = 'var(--error-color)';
    }
}

function handleTimeout() {
    const payButton = document.querySelector('.pay-button');
    if (payButton) {
        payButton.disabled = true;
        payButton.textContent = 'Waktu Pembayaran Habis';
        payButton.style.opacity = 0.6;
    }
}
