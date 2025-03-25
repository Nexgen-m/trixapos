// hooks/useCashmatic.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useCashmaticData } from '@/hooks/fetchers/cashmaticAPI';

export const useCashmatic = () => {
  const [cashmaticMessage, setCashmaticMessage] = useState('pending');
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [insertedAmount, setInsertedAmount] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [payStatus, setPayStatus] = useState('pending');
  const [cashmaticProgress, setCashmaticProgress] = useState(10);
  const [token, setToken] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  
  const { cashmaticData } = useCashmaticData();
  const CASHMATIC_API_URL = `http://${cashmaticData.ip}:${cashmaticData.port}/api`;

  const checkChangeBeforePayment = useCallback(async (cartTotal: number, authToken: string) => {
    const levelsResponse = await fetch(`${CASHMATIC_API_URL}/device/AllLevels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const levelsData = await levelsResponse.json();
    if (levelsData.code !== 0) {
      toast.error("❌ Error fetching cash levels.");
      return false;
    }

    const priceDollars = Math.round(cartTotal);
    const canChangeAll = canHandleAllChangePossibilities(levelsData.data, priceDollars);

    if (!canChangeAll) {
      toast.warning("⚠️ Machine may not have enough change. Please insert the exact amount.");
      return false;
    }

    return true;
  }, [CASHMATIC_API_URL]);

  const canHandleAllChangePossibilities = (
    denoms: any[],
    priceDollars: number,
    maxOverpayDollars = 99
  ) => {
    const maxChange = maxOverpayDollars;

    for (let change = 1; change <= maxChange; change++) {
      const isPossible = canProvideExactChange(denoms, change * 100);
      if (!isPossible) {
        console.warn(`🚫 Cannot provide change for overpayment: $${change}`);
        return false;
      }
    }

    return true;
  };

  const canProvideExactChange = (denominations: any[], change: number) => {
    const sortedDenominations = denominations
      .filter((d) => d.level > 0)
      .sort((a, b) => b.value - a.value);

    let remainingChange = change;

    for (const denomination of sortedDenominations) {
      if (remainingChange === 0) break;

      const maxPossible = Math.min(
        Math.floor(remainingChange / denomination.value),
        denomination.level
      );

      if (maxPossible > 0) {
        remainingChange -= maxPossible * denomination.value;
      }
    }

    return remainingChange === 0;
  };

  const payWithCashmatic = useCallback(async (cartTotal: number) => {
    setCashmaticMessage('🔄 Logging into Cashmatic...');
    setPayStatus('idle');
  
    try {
      setPayStatus("logging In");
      const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cashmaticData.username, password: cashmaticData.password }),
      });

      const loginData = await loginResponse.json();
      if (loginData.code !== 0) {
        setPayStatus("Login failed");
        setCashmaticMessage('Login failed, please try again');
        throw new Error("Login failed: " + loginData.message);
      }
      
      setPayStatus('✅ Logged In');
      setCashmaticMessage('✅ Logged In successfully');
      setCashmaticProgress(30);
      const authToken = loginData.data.token;
      setToken(authToken);

      const check = await checkChangeBeforePayment(cartTotal, authToken);
      if(!check) {
        setPayStatus("Cancelled");
        setCashmaticMessage("❌ Machine cannot provide change right now.");
        return null;
      }

      const refillResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartDeposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          amount: cartTotal * 100,
        }),
      });

      const refillData = await refillResponse.json();
      
      if (refillData.code === 0) {
        setCashmaticMessage(`💰 Insert cash into Cashmatic.`);
        return { authToken };
      } else {
        setCashmaticMessage("❌ Error: " + refillData.message);
        return null;
      }
    } catch (error) {
      if (error instanceof Error) {
        setCashmaticMessage(`❌ ${error.message}`);
      } else {
        setCashmaticMessage('❌ An unknown error occurred.');
      }
      return null;
    }
  }, [CASHMATIC_API_URL, cashmaticData, checkChangeBeforePayment]);

  const trackActiveTransaction = useCallback(async (authToken: string, cartTotal: number) => {
    let maxAttempts = 150;
    let attempt = 0;
    let completed = false;
    let previousDispensed = 0;
    setReturnedAmount(0);

    while ((attempt < maxAttempts) && !completed && (payStatus !== "Cancelled") && (payStatus !== "Completed")) {
      try {
        const response = await fetch(`${CASHMATIC_API_URL}/device/ActiveTransaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        if (data.code === 0) {
          const { inserted, dispensed, notDispensed, operation } = data.data;

          if (payStatus === "Cancelled") break;
          setInsertedAmount(inserted);
          setRequestedAmount(cartTotal * 100);
          setReturnedAmount(dispensed / 100);

          if ((operation == "withdrawal")) {
            setPayStatus("Dispensing");
          }

          if ((cartTotal * 100) > 0) {
            const progressValue = Math.min((inserted / (cartTotal * 100)) * 100, 100);
            setCashmaticProgress(progressValue);
          }

          if ((inserted / 100).toFixed(2) >= (cartTotal).toFixed(2)) {
            setPayStatus("Processing");
            setCashmaticMessage("💳 Processing payment, please wait...");

            const stopRefill = await fetch(`${CASHMATIC_API_URL}/transaction/StopDeposit`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            });

            const stopRefillData = await stopRefill.json();
            if (stopRefillData.code === 0) {
              setPayStatus("Verifying Change");
              setCashmaticMessage("🔄 Checking if exact change is available...");

              const lastTransactionResponse = await fetch(`${CASHMATIC_API_URL}/device/LastTransaction`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
              });

              const lastData = await lastTransactionResponse.json();
              if ((lastData.code === 0) && (operation !== "idle")) {
                const { inserted } = lastData.data;
                let change = inserted - (cartTotal * 100);
                setReturnedAmount(change / 100);
                previousDispensed = change / 100;

                const withdrawResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartWithdrawal`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({ amount: change }),
                });

                const response = await withdrawResponse.json();
                if (response.code === 0) {
                  const { requested, dispensed } = lastData.data;
                  setReturnedAmount(dispensed);
                  setPayStatus("Dispensing");
                }
              }
            }
          }

          if (notDispensed === 0 && operation === "idle" && payStatus !== "Cancelled") {
            completed = true;
            setPayStatus("Completed");
            setCashmaticMessage(`✅ Payment Completed. Change returned: $${previousDispensed}`);
            setCashmaticProgress(100);
          }
        } else {
          setCashmaticMessage(`⚠️ Error: ${data.message}`);
        }
      } catch (error) {
        console.error("❌ Error tracking payment:", error);
        setCashmaticMessage("❌ Connection error. Please check network and retry.");
      }

      if ((!completed) && (payStatus !== "Cancelled") && (payStatus !== "Completed")) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempt++;
      } else {
        break;
      }
    }
  }, [CASHMATIC_API_URL, payStatus]);

  const cancelPayment = useCallback(async () => {
    if (!token) {
      setCashmaticMessage("⚠️ No active transaction to cancel.");
      return;
    }

    if (payStatus.includes('Dispensing')) return;

    try {
      setCashmaticMessage("⏳ Cancelling Payment...");
      setPayStatus("Cancelling");

      const stopResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StopDeposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const stopData = await stopResponse.json();
      if (stopData.code !== 0) throw new Error("Stop deposit failed: " + stopData.message);

      setCashmaticMessage("💵 Returning inserted cash...");
      const withdrawResponse = await fetch(`${CASHMATIC_API_URL}/transaction/StartWithdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: insertedAmount }),
      });
      const withdrawData = await withdrawResponse.json();
      if (withdrawData.code !== 0) throw new Error("Withdrawal failed: " + withdrawData.message);

      let withdrawalAttempts = 0;
      let withdrawalCompleted = false;
      while (withdrawalAttempts < 30 && !withdrawalCompleted) {
        const activeTxn = await fetch(`${CASHMATIC_API_URL}/device/ActiveTransaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const activeData = await activeTxn.json();
        if (activeData.code === 0) {
          const { dispensed, notDispensed, operation } = activeData.data;
          setReturnedAmount(dispensed / 100);
          if (notDispensed === 0 && operation === "idle") {
            withdrawalCompleted = true;
            break;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        withdrawalAttempts++;
      }

      setPayStatus("Cancelled");
      setCashmaticMessage(`❌ Payment Cancelled. Returned: $${(insertedAmount / 100).toFixed(2)}`);
      setReturnedAmount(insertedAmount / 100);
    } catch (error) {
      if (error instanceof Error) {
        setCashmaticMessage(`❌ Cancellation Error: ${error.message}`);
      } else {
        setCashmaticMessage('❌ An unknown error occurred.');
      }
    }
  }, [CASHMATIC_API_URL, insertedAmount, payStatus, token]);

  const handlePayment = useCallback(async (cartTotal: number) => {
    const paymentDetails = await payWithCashmatic(cartTotal);
    if (!paymentDetails) return;

    const { authToken } = paymentDetails;
    await trackActiveTransaction(authToken, cartTotal);
  }, [payWithCashmatic, trackActiveTransaction]);

  return {
    cashmaticState: {
      message: cashmaticMessage,
      status: payStatus,
      progress: cashmaticProgress,
      inserted: insertedAmount,
      requested: requestedAmount,
      returned: returnedAmount,
      token,
    },
    cashmaticActions: {
      handlePayment,
      cancelPayment,
    },
    setCashmaticMessage,
    setPayStatus,
  };
};