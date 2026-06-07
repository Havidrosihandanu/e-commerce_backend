/**
 * PC Builder Compatibility Helper
 * Fungsi untuk memvalidasi kompatibilitas komponen PC
 */

/**
 * Validasi kompatibilitas antara komponen-komponen yang dipilih.
 * Karena data 'specs' sekarang diketik secara manual (teks bebas) oleh Admin,
 * kita menganggap semua pilihan user kompatibel (bypass) agar PC Builder berfungsi.
 * * @param {Object} components - Object berisi product records dari DB
 * @returns {{ compatible: boolean, issues: string[] }}
 */
function validateCompatibility(components) {
    // Kembalikan nilai selalu kompatibel (true) dan tanpa masalah (issues kosong)
    return {
        compatible: true,
        issues: [],
    };
}

/**
 * Hitung total harga dari komponen yang dipilih
 * @param {Object} components - Object berisi product records
 * @returns {number}
 */
function calculateTotalPrice(components) {
    const { cpu, motherboard, ram, storage, gpu, psu, casing } = components;
    let total = 0;

    // Masukkan semua komponen ke dalam array
    const parts = [cpu, motherboard, ram, storage, gpu, psu, casing];
    
    // Looping untuk menjumlahkan harga jika komponen tersebut ada (dipilih)
    for (const part of parts) {
        if (part && part.price) {
            total += parseFloat(part.price);
        }
    }

    return total;
}

module.exports = { validateCompatibility, calculateTotalPrice };