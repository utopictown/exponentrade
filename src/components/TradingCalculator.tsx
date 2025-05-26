'use client';

import { useState, useEffect } from 'react';

interface CalculationResults {
  positionSize: number;
  positionValue: number;
  leverage: number;
  riskAmount: number;
}

interface ValidationErrors {
  entryPrice?: string;
  stopLoss?: string;
  initialFunds?: string;
  riskTolerance?: string;
}

export default function TradingCalculator() {
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [initialFunds, setInitialFunds] = useState<string>('');
  const [riskTolerance, setRiskTolerance] = useState<string>('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved values from localStorage
  useEffect(() => {
    const savedPositionType = localStorage.getItem('positionType');
    const savedEntryPrice = localStorage.getItem('entryPrice');
    const savedStopLoss = localStorage.getItem('stopLoss');
    const savedInitialFunds = localStorage.getItem('initialFunds');
    const savedRiskTolerance = localStorage.getItem('riskTolerance');

    if (savedPositionType) setPositionType(savedPositionType as 'long' | 'short');
    if (savedEntryPrice) setEntryPrice(savedEntryPrice);
    if (savedStopLoss) setStopLoss(savedStopLoss);
    if (savedInitialFunds) setInitialFunds(savedInitialFunds);
    if (savedRiskTolerance) setRiskTolerance(savedRiskTolerance);

    setIsLoaded(true);
  }, []);

  // Save values to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('positionType', positionType);
    }
  }, [positionType, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('entryPrice', entryPrice);
    }
  }, [entryPrice, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('stopLoss', stopLoss);
    }
  }, [stopLoss, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('initialFunds', initialFunds);
    }
  }, [initialFunds, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('riskTolerance', riskTolerance);
    }
  }, [riskTolerance, isLoaded]);

  const validateInputs = (): boolean => {
    const newErrors: ValidationErrors = {};
    const entryPriceNum = parseFloat(entryPrice);
    const stopLossNum = parseFloat(stopLoss);
    const initialFundsNum = parseFloat(initialFunds);
    const riskToleranceNum = parseFloat(riskTolerance);

    if (isNaN(entryPriceNum) || entryPriceNum <= 0) {
      newErrors.entryPrice = 'Entry price must be a positive number';
    }

    if (isNaN(stopLossNum) || stopLossNum <= 0) {
      newErrors.stopLoss = 'Stop loss must be a positive number';
    } else if (positionType === 'long' && stopLossNum >= entryPriceNum) {
      newErrors.stopLoss = 'Stop loss must be less than entry price for long positions';
    } else if (positionType === 'short' && stopLossNum <= entryPriceNum) {
      newErrors.stopLoss = 'Stop loss must be greater than entry price for short positions';
    }

    if (isNaN(initialFundsNum) || initialFundsNum <= 0) {
      newErrors.initialFunds = 'Initial funds must be a positive number';
    }

    if (isNaN(riskToleranceNum) || riskToleranceNum <= 0 || riskToleranceNum >= 1) {
      newErrors.riskTolerance = 'Risk tolerance must be between 0 and 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateResults = () => {
    if (!validateInputs()) return;

    const entryPriceNum = parseFloat(entryPrice);
    const stopLossNum = parseFloat(stopLoss);
    const initialFundsNum = parseFloat(initialFunds);
    const riskToleranceNum = parseFloat(riskTolerance);

    const riskAmount = initialFundsNum * riskToleranceNum;
    const lossPerUnit = Math.abs(
      positionType === 'long' ? entryPriceNum - stopLossNum : stopLossNum - entryPriceNum
    );
    const positionSize = riskAmount / lossPerUnit;
    const positionValue = positionSize * entryPriceNum;
    const leverage = positionValue / initialFundsNum;

    setResults({
      positionSize: Number(positionSize.toFixed(2)),
      positionValue: Number(positionValue.toFixed(2)),
      leverage: Number(leverage.toFixed(2)),
      riskAmount: Number(riskAmount.toFixed(2)),
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-white">Leverage Calculator</h1>
      
      <div className="space-y-4">
        <div className="flex flex-col justify-center items-center">
          <label className="block text-sm font-medium text-gray-300 mb-1">Position Type</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPositionType('long')}
              className={`px-4 py-2 rounded-md transition-colors ${
                positionType === 'long'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => setPositionType('short')}
              className={`px-4 py-2 rounded-md transition-colors ${
                positionType === 'short'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Short
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400"
            step="any"
          />
          {errors.entryPrice && <p className="text-red-400 text-sm mt-1">{errors.entryPrice}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Stop Loss</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400"
            step="any"
          />
          {errors.stopLoss && <p className="text-red-400 text-sm mt-1">{errors.stopLoss}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Initial Funds</label>
          <input
            type="number"
            value={initialFunds}
            onChange={(e) => setInitialFunds(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400"
            step="any"
          />
          {errors.initialFunds && <p className="text-red-400 text-sm mt-1">{errors.initialFunds}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Risk Tolerance (0-1)</label>
          <input
            type="number"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400"
            step="0.01"
            min="0"
            max="1"
          />
          {errors.riskTolerance && <p className="text-red-400 text-sm mt-1">{errors.riskTolerance}</p>}
        </div>

        <button
          onClick={calculateResults}
          className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Calculate
        </button>

        {results && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <h2 className="text-lg font-semibold mb-4 text-white">Results</h2>
            <div className="space-y-2">
              <p className="text-gray-300">
                Position Size: <span className="font-medium text-white">{results.positionSize}</span> units
              </p>
              <p className="text-gray-300">
                Position Value: <span className="font-medium text-white">${results.positionValue}</span>
              </p>
              <p className="text-gray-300">
                Required Leverage: <span className="font-medium text-white">{results.leverage}x</span>
              </p>
              <p className="text-gray-300 mt-4">
                Note: If the price hits the stop loss, your loss will be limited to <span className="font-medium text-white">${results.riskAmount}</span>, which is <span className="font-medium text-white">{(parseFloat(riskTolerance) * 100).toFixed(2)}%</span> of your initial funds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 