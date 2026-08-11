const QRIS_URL = "https://files.catbox.moe/cjyw52.png";
const PAYMENT_DURATION = 3 * 60 * 60;

// Ambil data dari URL
const params = new URLSearchParams(window.location.search);

const price = Number(
  String(params.get("price") || "").replace(/[^\d]/g, "")
);

const reference =
  params.get("external_reference") ||
  params.get("reference") ||
  params.get("externalReference") ||
  params.get("transaction_id") ||
  "UNKNOWN";

// Nominal
const amount = Number.isFinite(price) && price > 0
  ? price

document.getElementById("amount").textContent =
  "Rp" + new Intl.NumberFormat("id-ID").format(amount);

// External Reference sebagai Order ID
document.getElementById("orderId").textContent = reference;


// =====================
// QRIS
// =====================

const qrImage = document.getElementById("qrisImage");
const qrPlaceholder = document.getElementById("qrPlaceholder");
const downloadBtn = document.getElementById("downloadBtn");

if (QRIS_URL.trim() !== "") {
  qrImage.src = QRIS_URL;
  qrImage.style.display = "block";

  if (qrPlaceholder)
    qrPlaceholder.style.display = "none";

  if (downloadBtn)
    downloadBtn.style.display = "block";

  qrImage.onerror = function () {
    qrImage.style.display = "none";

    if (qrPlaceholder) {
      qrPlaceholder.style.display = "flex";
      qrPlaceholder.innerHTML =
        "QRIS gagal dimuat.<br>Periksa link QRIS Anda.";
    }

    if (downloadBtn)
      downloadBtn.style.display = "none";
  };
}


// =====================
// TIMER 3 JAM
// =====================

const STORAGE_KEY = "payment_start_" + reference;

let startTime = sessionStorage.getItem(STORAGE_KEY);

if (!startTime) {
  startTime = Date.now();
  sessionStorage.setItem(STORAGE_KEY, startTime);
} else {
  startTime = Number(startTime);
}

function updateTimer() {

  const elapsed =
    Math.floor((Date.now() - startTime) / 1000);

  const remaining =
    Math.max(0, PAYMENT_DURATION - elapsed);

  const hours =
    Math.floor(remaining / 3600);

  const minutes =
    Math.floor((remaining % 3600) / 60);

  const seconds =
    remaining % 60;

  document.getElementById("timer").textContent =
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");

  if (remaining <= 0) {

    clearInterval(timerInterval);

    document.getElementById("paymentArea").style.display =
      "none";

    document.getElementById("expiredArea").style.display =
      "block";
  }
}

updateTimer();

const timerInterval =
  setInterval(updateTimer, 1000);


// =====================
// SALIN NOMOR
// =====================

async function copyText(text) {

  try {

    await navigator.clipboard.writeText(text);

    showToast("Nomor berhasil disalin");

  } catch (e) {

    const input =
      document.createElement("input");

    input.value = text;

    document.body.appendChild(input);

    input.select();

    document.execCommand("copy");

    input.remove();

    showToast("Nomor berhasil disalin");
  }
}


// =====================
// DOWNLOAD QRIS
// =====================

function downloadQR() {

  if (!QRIS_URL) return;

  const link =
    document.createElement("a");

  link.href = QRIS_URL;
  link.download = "qris-" + reference + ".png";
  link.target = "_blank";

  document.body.appendChild(link);

  link.click();

  link.remove();
}


// =====================
// CEK STATUS
// =====================

function checkStatus() {

  showToast(
    "Memeriksa transaksi " + reference + "..."
  );

}


// =====================
// TOAST
// =====================

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 1800);
}
