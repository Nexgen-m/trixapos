import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Equal, Plus, Minus, Divide, Percent, Info, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onResult?: (result: number) => void;
}

const MAX_DISPLAY_LENGTH = 12;

export function Calculator({ isOpen, onClose, onResult }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Format number for display with digit separators
  const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) {
      return 'Error';
    }

    const absNum = Math.abs(num);
    if (absNum > 999999999999) {
      return num.toExponential(6);
    }

    const numStr = num.toString();
    if (numStr.length > MAX_DISPLAY_LENGTH) {
      if (numStr.includes('.')) {
        return num.toFixed(MAX_DISPLAY_LENGTH - numStr.split('.')[0].length - 1);
      }
      return num.toExponential(6);
    }

    // Add thousand separators
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();

    if (error) {
      if (event.key === 'Escape') {
        handleClear();
      }
      return;
    }

    // Numbers
    if (/^[0-9]$/.test(event.key)) {
      handleNumber(event.key);
    }
    // Operators
    else if (['+', '-', '*', '/', '%'].includes(event.key)) {
      const opMap: { [key: string]: string } = {
        '*': '×',
        '/': '÷'
      };
      handleOperation(opMap[event.key] || event.key);
    }
    // Special keys
    else {
      switch (event.key) {
        case 'Enter':
        case '=':
          handleEqual();
          break;
        case '.':
          handleDecimal();
          break;
        case 'Backspace':
          handleDelete();
          break;
        case 'Escape':
          handleClear();
          break;
        case 'm':
          if (event.ctrlKey || event.metaKey) {
            if (event.shiftKey) {
              handleMemoryAdd();
            } else {
              handleMemorySubtract();
            }
          }
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            handleMemoryRecall();
          }
          break;
      }
    }
  }, [display, operation, previousValue, error]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleNumber = (num: string) => {
    if (error) return;
    
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      if (display.replace(/[.-]/g, '').length >= MAX_DISPLAY_LENGTH) {
        return; // Prevent adding more digits
      }
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (error) return;

    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    if (error) return;

    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      try {
        const result = calculate(previousValue, current, operation);
        if (!isFinite(result) || isNaN(result)) {
          throw new Error('Invalid calculation');
        }
        setPreviousValue(result);
        setDisplay(formatNumber(result));
        addToHistory(`${formatNumber(previousValue)} ${operation} ${formatNumber(current)} = ${formatNumber(result)}`);
      } catch (err) {
        setError('Math Error');
        return;
      }
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': 
        if (b === 0) throw new Error('Division by zero');
        result = a / b; 
        break;
      case '%': result = (a * b) / 100; break;
      default: result = b;
    }

    if (Math.abs(result) > 999999999999) {
      throw new Error('Number too large');
    }

    return Number(result.toFixed(10)); // Maintain precision but limit decimal places
  };

  const handleEqual = () => {
    if (error) return;

    const current = parseFloat(display);
    
    if (operation && previousValue !== null) {
      try {
        const result = calculate(previousValue, current, operation);
        if (!isFinite(result) || isNaN(result)) {
          throw new Error('Invalid calculation');
        }
        setDisplay(formatNumber(result));
        addToHistory(`${formatNumber(previousValue)} ${operation} ${formatNumber(current)} = ${formatNumber(result)}`);
        setPreviousValue(null);
        setOperation(null);
        setNewNumber(true);
        onResult?.(result);
      } catch (err) {
        setError('Math Error');
      }
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
    setError(null);
  };

  const handleReset = () => {
    handleClear();
    setHistory([]);
    setMemory(0);
  };

  const handleDelete = () => {
    if (error) return;

    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleMemoryAdd = () => {
    if (error) return;
    try {
      const newMemory = memory + parseFloat(display);
      if (!isFinite(newMemory) || isNaN(newMemory)) throw new Error('Invalid memory operation');
      setMemory(newMemory);
    } catch (err) {
      setError('Memory Error');
    }
  };

  const handleMemorySubtract = () => {
    if (error) return;
    try {
      const newMemory = memory - parseFloat(display);
      if (!isFinite(newMemory) || isNaN(newMemory)) throw new Error('Invalid memory operation');
      setMemory(newMemory);
    } catch (err) {
      setError('Memory Error');
    }
  };

  const handleMemoryRecall = () => {
    if (error) return;
    setDisplay(formatNumber(memory));
    setNewNumber(true);
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const addToHistory = (entry: string) => {
    setHistory(prev => [...prev.slice(-4), entry]);
  };

  const buttonClass = "h-14 flex items-center justify-center rounded-xl transition-all duration-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900";
  const numberClass = `${buttonClass} bg-slate-800 hover:bg-slate-700 text-slate-200`;
  const operatorClass = `${buttonClass} bg-blue-600 hover:bg-blue-500 text-white`;
  const actionClass = `${buttonClass} bg-slate-700 hover:bg-slate-600 text-slate-200`;
  const memoryClass = `${buttonClass} bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 bg-slate-900 border-slate-800 [&>button]:text-slate-200 [&>button]:hover:text-white [&>button]:bg-transparent [&>button]:hover:bg-slate-800/50">
        {/* Display */}
        <div className="p-6 pb-2">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold text-slate-200">Calculator</DialogTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                      <Info className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-slate-800 border-slate-700 text-slate-200">
                    <div className="space-y-2">
                      <h4 className="font-medium">Keyboard Shortcuts</h4>
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>• Numbers 0-9 for input</p>
                        <p>• Enter or = for equals</p>
                        <p>• Backspace to delete</p>
                        <p>• Escape to clear</p>
                        <p>• +, -, *, / for operations</p>
                      </div>
                      <h4 className="font-medium pt-2">Memory Operations</h4>
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>• Ctrl+M to add to memory</p>
                        <p>• Ctrl+Shift+M to subtract from memory</p>
                        <p>• Ctrl+R to recall memory</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </DialogHeader>

          {/* History */}
          <div className="bg-slate-800/50 rounded-lg p-2 mb-2 h-20 overflow-y-auto">
            {history.map((entry, index) => (
              <div key={index} className="text-xs text-slate-400 text-right mb-1">
                {entry}
              </div>
            ))}
          </div>

          {/* Main Display */}
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <div className="text-right">
              {operation && !error && (
                <div className="text-sm text-slate-400 mb-1">
                  {formatNumber(previousValue!)} {operation}
                </div>
              )}
              <div className={`text-3xl font-bold font-mono ${error ? 'text-red-500' : 'text-white'}`}>
                {error || (display.includes('.') ? display : formatNumber(parseFloat(display)))}
              </div>
            </div>
          </div>

          {/* Memory Display and Reset */}
          <div className="flex justify-between items-center mb-2 px-1 text-xs">
            <span className="text-slate-400">Memory: {formatNumber(memory)}</span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
              title="Reset calculator"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Memory Functions */}
        <div className="px-4 grid grid-cols-4 gap-2">
          <button onClick={handleMemoryAdd} className={memoryClass}>M+</button>
          <button onClick={handleMemorySubtract} className={memoryClass}>M-</button>
          <button onClick={handleMemoryRecall} className={memoryClass}>MR</button>
          <button onClick={handleMemoryClear} className={memoryClass}>MC</button>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {/* First Row */}
          <button onClick={handleClear} className={actionClass}>C</button>
          <button onClick={() => handleOperation('%')} className={actionClass}>
            <Percent className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className={actionClass}>
            <Delete className="w-5 h-5" />
          </button>
          <button onClick={() => handleOperation('÷')} className={operatorClass}>
            <Divide className="w-5 h-5" />
          </button>

          {/* Number Pad */}
          <button onClick={() => handleNumber('7')} className={numberClass}>7</button>
          <button onClick={() => handleNumber('8')} className={numberClass}>8</button>
          <button onClick={() => handleNumber('9')} className={numberClass}>9</button>
          <button onClick={() => handleOperation('×')} className={operatorClass}>×</button>

          <button onClick={() => handleNumber('4')} className={numberClass}>4</button>
          <button onClick={() => handleNumber('5')} className={numberClass}>5</button>
          <button onClick={() => handleNumber('6')} className={numberClass}>6</button>
          <button onClick={() => handleOperation('-')} className={operatorClass}>
            <Minus className="w-5 h-5" />
          </button>

          <button onClick={() => handleNumber('1')} className={numberClass}>1</button>
          <button onClick={() => handleNumber('2')} className={numberClass}>2</button>
          <button onClick={() => handleNumber('3')} className={numberClass}>3</button>
          <button onClick={() => handleOperation('+')} className={operatorClass}>
            <Plus className="w-5 h-5" />
          </button>

          <button onClick={() => handleNumber('0')} className={`${numberClass} col-span-2`}>0</button>
          <button onClick={handleDecimal} className={numberClass}>.</button>
          <button onClick={handleEqual} className={`${operatorClass} bg-green-600 hover:bg-green-500`}>
            <Equal className="w-5 h-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}