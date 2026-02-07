const API = "https://fvfm-risk-analiz.onrender.com";
const list = document.getElementById("stockList");
const searchInput = document.getElementById("searchInput");

let allStocks = [];

fetch(`${API}/analyze_all`)
    .then(r => r.json())
    .then(data => {

        // 🔠 sembole göre sırala
        data.sort((a, b) => a.symbol.localeCompare(b.symbol));

        allStocks = data;
        renderList(allStocks);
    })
    .catch(err => {
        console.error(err);
        list.textContent = "Veriler yüklenemedi";
    });

function renderList(data) {
    list.innerHTML = "";

    data.forEach(s => {
        const div = document.createElement("div");
        div.className = `stock-card ${s.decision === "UYUMLU" ? "good" : "bad"}`;

        div.innerHTML = `
      <span><strong>${s.symbol}</strong></span>
      <span>β ${s.beta.toFixed(2)}</span>
      <span>Gerçek %${s.realReturn.toFixed(2)}</span>
      <span>Beklenen %${s.expectedReturn.toFixed(2)}</span>
    `;

        list.appendChild(div);
    });
}

// 🔍 canlı arama
searchInput.addEventListener("input", e => {
    const q = e.target.value.toUpperCase();

    const filtered = allStocks.filter(s =>
        s.symbol.startsWith(q)
    );

    renderList(filtered);
});



function renderList(data) {
    list.innerHTML = "";

    if (data.length === 0) {
        list.textContent = "Sonuç bulunamadı";
        return;
    }

    data.forEach(s => {
        const div = document.createElement("div");
        div.className = `stock-card ${s.decision === "UYUMLU" ? "good" : "bad"}`;

        div.innerHTML = `
          <span><strong>${s.symbol}</strong></span>
          <span>β ${s.beta.toFixed(2)}</span>
          <span>Gerçek %${s.realReturn.toFixed(2)}</span>
          <span>Beklenen %${s.expectedReturn.toFixed(2)}</span>
        `;

        list.appendChild(div);
    });
}