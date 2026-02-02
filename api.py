from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import yfinance as yf
import pandas as pd
import numpy as np
from bist_symbols import BIST_SYMBOLS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MARKET VERİSİ (1 KEZ)
# =========================
market = yf.download("XU100.IS", period="1y", progress=False)
if market.empty:
    raise RuntimeError("BIST100 market verisi alınamadı")

market_returns = market["Close"].squeeze().pct_change().dropna()


@app.get("/symbols")
def get_symbols():
    return BIST_SYMBOLS


def calculate_beta(stock_returns):
    common = pd.concat([stock_returns, market_returns], axis=1).dropna()

    if len(common) < 30:
        return None

    cov = common.iloc[:, 0].cov(common.iloc[:, 1])
    var = common.iloc[:, 1].var()

    if var == 0 or np.isnan(cov):
        return None

    return cov / var


# =========================
# TEK HİSSE ANALİZ
# =========================
@app.get("/analyze/{symbol}")
def analyze_stock(symbol: str):

    symbol = symbol.strip().upper()

    if symbol not in BIST_SYMBOLS:
        return {"error": "Geçersiz sembol"}

    stock = yf.download(f"{symbol}.IS", period="1y", progress=False)

    if stock.empty:
        return {"error": "Veri yok"}

    # 🔧 Close kesin Series
    stock_returns = stock["Close"].squeeze().pct_change().dropna()

    if len(stock_returns) < 30:
        return {"error": "Yetersiz veri"}

    beta = calculate_beta(stock_returns)

    if beta is None:
        return {"error": "Beta hesaplanamadı"}

    # 🔧 KESİN FLOAT
    real_return = float(stock_returns.mean() * 252)
    expected_return = float(beta * market_returns.mean() * 252)

    decision = "UYUMLU" if real_return >= expected_return else "ALINMAMALI"

    return {
        "symbol": symbol,
        "beta": round(float(beta), 2),
        "realReturn": round(real_return * 100, 2),
        "expectedReturn": round(expected_return * 100, 2),
        "decision": decision
    }


# =========================
# TOPLU ANALİZ
# =========================
@app.get("/analyze_all")
def analyze_all():
    results = []

    for symbol in BIST_SYMBOLS[:100]:  # test için 100 hisse
        stock = yf.download(f"{symbol}.IS", period="1y", progress=False)

        if stock.empty:
            continue

        # 🔧 burada da squeeze
        stock_returns = stock["Close"].squeeze().pct_change().dropna()

        if len(stock_returns) < 30:
            continue

        beta = calculate_beta(stock_returns)

        if beta is None:
            continue

        real_return = float(stock_returns.mean() * 252)
        expected_return = float(beta * market_returns.mean() * 252)

        results.append({
            "symbol": symbol,
            "beta": round(float(beta), 2),
            "realReturn": round(real_return * 100, 2),
            "expectedReturn": round(expected_return * 100, 2),
            "decision": "UYUMLU" if real_return >= expected_return else "ALINMAMALI"
        })

    return results
