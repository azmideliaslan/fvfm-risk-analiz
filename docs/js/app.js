const API = "https://fvfm-risk-analiz.onrender.com";

const select = document.getElementById("stockSelect");
const resultDiv = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");

/* ---------- SYMBOL LIST ---------- */
fetch(`${API}/symbols`)
    .then(r => {
        if (!r.ok) throw new Error("Symbol list alınamadı");
        return r.json();
    })
    .then(symbols => {
        symbols.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            select.appendChild(opt);
        });
    })
    .catch(err => {
        console.error(err);
        alert("Sembol listesi yüklenemedi");
    });

/* ---------- ANALYZE ---------- */
analyzeBtn.addEventListener("click", async () => {
    let stock = select.value;

    if (!stock) {
        alert("Önce hisse seç");
        return;
    }

    stock = stock.trim().toUpperCase();

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analiz ediliyor...";

    try {
        const r = await fetch(`${API}/analyze/${stock}`);
        const d = await r.json();

        if (d.error) {
            resultDiv.textContent = d.error;
            return;
        }
        // Temizle ve arka plan rengi ekle 
        resultDiv.classList.remove("good", "bad");
        if (d.decision === "UYUMLU") {
            resultDiv.classList.add("good");
        } else {
            resultDiv.classList.add("bad");
        }
        //yazdır  
        resultDiv.innerHTML = `
            <h3>${d.symbol}</h3>
            <p>Beta: <b>${d.beta}</b></p>
            <p>Gerçek Getiri: <b>%${d.realReturn}</b></p>
            <p>Beklenen Getiri: <b> %${d.expectedReturn} </b></p>
            <p>Karar: <b>${d.decision}</b></p>
        `;
    } catch (err) {
        console.error(err);
        resultDiv.textContent = "Analiz sırasında hata oluştu";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analiz Et";
    }
});
