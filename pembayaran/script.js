// Payment Page JavaScript - UI Interactions and Simulation

document.addEventListener('DOMContentLoaded', function() {
    // 1. Setup Tab Switching
    setupTabSwitching();

    // 2. Start Countdown Timer
    startCountdownTimer(900); // Start timer from 15 minutes (900 seconds)
});

/**
 * Mengatur fungsionalitas switching tab (DANA, Bank, QR).
 */
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove 'active' class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add 'active' class to the clicked tab
            this.classList.add('active');
            
            // Show the corresponding content
            const targetId = this.dataset.tab;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

/**
 * Mengaktifkan penghitung waktu mundur (countdown timer) untuk batas waktu pembayaran.
 * @param {number} durationSeconds - Durasi countdown dalam detik.
 */
function startCountdownTimer(durationSeconds) {
    let timeLeft = durationSeconds;
    const timerElement = document.getElementById('timer');

    if (!timerElement) return;

    // Set the initial time display
    updateTimerDisplay(timeLeft, timerElement);

    const timerInterval = setInterval(() => {
        timeLeft--;
        
        // Update display
        updateTimerDisplay(timeLeft, timerElement);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Waktu Habis';
            handleTimeout();
        }
    }, 1000);
}

/**
 * Memperbarui tampilan waktu di elemen HTML.
 * @param {number} totalSeconds - Sisa waktu dalam detik.
 * @param {HTMLElement} element - Elemen DOM untuk menampilkan waktu.
 */
function updateTimerDisplay(totalSeconds, element) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    element.textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    // Change color when time is critical (last 2 minutes)
    if (totalSeconds <= 120) {
        element.style.color = 'var(--error-color)';
        element.parentElement.style.borderColor = 'var(--error-color)';
    }
}

/**
 * Fungsi placeholder yang dijalankan saat waktu pembayaran habis.
 */
function handleTimeout() {
    const payButton = document.querySelector('.pay-button');
    if (payButton) {
        payButton.disabled = true;
        payButton.textContent = 'Waktu Pembayaran Habis';
        payButton.style.opacity = 0.6;
    }
    // Masha-Chan tidak menggunakan alert(), tapi notifikasi dari project utama.
    // Jika Dika-Kun mau, bisa tambahkan fungsi showNotification dari script.js utama.
    // Untuk saat ini, kita pakai alert sesuai placeholder di HTML.
    console.log('Payment time limit exceeded.');
}

// **CATATAN PENTING UNTUK DIKA-KUN:**
// Fungsi 'Konfirmasi Pembayaran' saat ini menggunakan `onclick="alert('...')"`
// di dalam file `pembayaran/index.html`. Jika Dika-Kun ingin memindahkannya ke
// sini agar terlihat lebih rapi, Masha-Chan sarankan untuk membuat fungsi
// `handlePaymentConfirmation()` dan mengubah tombol di HTML:
/*
function handlePaymentConfirmation() {
    // Logika validasi dan simulasi sukses (formalitas)
    const selectedTab = document.querySelector('.tab-btn.active').dataset.tab;
    
    alert(`Pembayaran via ${selectedTab} berhasil dikonfirmasi! Pesanan Dika-Kun sedang diproses. Terima kasih!`);
    
    // Di aplikasi nyata, ini akan mengarahkan ke halaman sukses
    // window.location.href = 'success.html';
}

// Export fungsi (jika perlu)
window.handlePaymentConfirmation = handlePaymentConfirmation;
*/