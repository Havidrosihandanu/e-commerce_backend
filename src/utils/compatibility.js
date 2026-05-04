/**
 * PC Builder Compatibility Helper
 * Fungsi untuk memvalidasi kompatibilitas komponen PC
 */

/**
 * Validasi kompatibilitas antara komponen-komponen yang dipilih.
 * @param {Object} components - Object berisi product records dari DB
 * @returns {{ compatible: boolean, issues: string[] }}
 */
function validateCompatibility(components) {
    const { cpu, motherboard, ram, storage, gpu, psu, casing } = components;
    const issues = [];

    // ── 1. Validasi socket CPU vs Motherboard ─────────────────────────────────
    if (cpu && motherboard) {
        const cpuSocket = cpu.specs?.socket;
        const mbSocket = motherboard.specs?.socket;

        if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
            issues.push(
                `Socket tidak cocok: CPU menggunakan socket ${cpuSocket}, ` +
                `sedangkan Motherboard menggunakan socket ${mbSocket}`
            );
        }
    }

    // ── 2. Validasi tipe RAM vs Motherboard ──────────────────────────────────
    if (ram && motherboard) {
        const ramType = ram.specs?.type;       // e.g. "DDR4"
        const mbRamType = motherboard.specs?.ram_type; // e.g. "DDR4"

        if (ramType && mbRamType && ramType !== mbRamType) {
            issues.push(
                `RAM tidak kompatibel: RAM bertipe ${ramType}, ` +
                `sedangkan Motherboard mendukung ${mbRamType}`
            );
        }
    }

    // ── 3. Validasi tipe RAM vs CPU ──────────────────────────────────────────
    if (ram && cpu) {
        const ramType = ram.specs?.type;
        const cpuSupportedRam = cpu.specs?.supported_ram; // array e.g. ["DDR4"]

        if (ramType && cpuSupportedRam && Array.isArray(cpuSupportedRam)) {
            if (!cpuSupportedRam.includes(ramType)) {
                issues.push(
                    `RAM tidak didukung oleh CPU: CPU mendukung ${cpuSupportedRam.join(', ')}, ` +
                    `sedangkan RAM bertipe ${ramType}`
                );
            }
        }
    }

    // ── 4. Validasi form factor Motherboard vs Casing ────────────────────────
    if (motherboard && casing) {
        const mbFormFactor = motherboard.specs?.form_factor;  // e.g. "ATX"
        const casingSupportedMb = casing.specs?.supported_mb;     // e.g. ["ATX", "mATX"]

        if (mbFormFactor && casingSupportedMb && Array.isArray(casingSupportedMb)) {
            if (!casingSupportedMb.includes(mbFormFactor)) {
                issues.push(
                    `Form factor tidak cocok: Motherboard berform factor ${mbFormFactor}, ` +
                    `Casing mendukung ${casingSupportedMb.join(', ')}`
                );
            }
        }
    }

    // ── 5. Estimasi PSU cukup ────────────────────────────────────────────────
    if (psu) {
        const psuWattage = psu.specs?.wattage || 0;
        let totalTdp = 0;

        if (cpu) totalTdp += (cpu.specs?.tdp || 0);
        if (gpu) totalTdp += (gpu.specs?.tdp || 0);

        // Tambah 100W overhead untuk komponen lain
        const recommended = totalTdp + 100;

        if (psuWattage < recommended) {
            issues.push(
                `PSU mungkin kurang: Estimasi kebutuhan daya ~${recommended}W ` +
                `(CPU: ${cpu?.specs?.tdp || 0}W + GPU: ${gpu?.specs?.tdp || 0}W + overhead), ` +
                `PSU yang dipilih hanya ${psuWattage}W`
            );
        }
    }

    return {
        compatible: issues.length === 0,
        issues,
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

    const parts = [cpu, motherboard, ram, storage, gpu, psu, casing];
    for (const part of parts) {
        if (part) total += parseFloat(part.price);
    }

    return total;
}

module.exports = { validateCompatibility, calculateTotalPrice };
