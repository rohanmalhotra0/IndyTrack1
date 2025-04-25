import pandas as pd
import numpy as np
import yfinance as yf
from flask import Flask, request, jsonify
def rsi(data, period=14):
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - 100 / (1 + rs)
    return rsi
def macd(data, fast=12, slow=26, signal=9):
    exp1 = data['close'].ewm(span=fast, adjust=False).mean()
    exp2 = data['close'].ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=signal, adjust=False).mean()
    return macd, signal

def close_price(data):
    return data['close']

def sma(data, period=20):
    return data['close'].rolling(window=period).mean()

def ema(data, period=20):
    return data['close'].ewm(span=period, adjust=False).mean()

