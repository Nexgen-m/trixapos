// hooks/useCashmatic.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useCashmaticData } from "@/hooks/fetchers/cashmaticAPI";
// import { usePOSStore } from "../Stores/usePOSStore";
// import { createInvoice } from "@/lib/createInvoice";
import { CartItem } from "@/types/pos";
import { usePOSStore } from "../Stores/usePOSStore";

export const useCashmatic = () => {
  const [cashmaticMessage, setCashmaticMessage] = useState("pending");
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [insertedAmount, setInsertedAmount] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [payStatus, setPayStatus] = useState("pending");
  const [cashmaticProgress, setCashmaticProgress] = useState(10);
  const [token, setToken] = useState<string | null>(null);

  const payStatusRef = useRef(payStatus);
  useEffect(() => {
    payStatusRef.current = payStatus;
  }, [payStatus]);
  // const [refId, setRefId] = useState<string | null>(null);

  // const {
  //   cart,
  //   total: cartTotal,
  //   orderDiscount: storeOrderDiscount,
  //   setOrderDiscount,
  //   customer, // Added customer from the store
  //   isVerticalLayout, // Get isVerticalLayout from the store
  // } = usePOSStore();

  interface ExtendedCartItem extends CartItem {
    discount?: number; // Percentage-based discount
  }

  const { cashmaticData } = useCashmaticData();
  const CASHMATIC_API_URL = `http://${cashmaticData.ip}:${cashmaticData.port}/api`;

  const checkCashmatic = useCallback(async () => {
    setPayStatus("logging In");
        const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cashmaticData.username,
            password: cashmaticData.password,
          }),
        });

        const loginData = await loginResponse.json();
        if (loginData.code !== 0) {
          setPayStatus("Login failed");
          toast.error("❌ Login failed: " + loginData.message);
          return false;
        }

        const authToken = loginData.data.token;
        setToken(authToken);
        toast.success("✅ Logged in successfully.");
        const levelsResponse = await fetch(
          `${CASHMATIC_API_URL}/device/AllLevels`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const levelsData = await levelsResponse.json();
        if (levelsData.code !== 0) {
          toast.error("❌ Error fetching cash levels.");
          return false;
        }
        const recyclableLevels = levelsData.data.filter((level: any) => level.routing === "recycle");
        usePOSStore.getState().setCashLevels(recyclableLevels);
        console.log("Cashmatic levels set: ", JSON.stringify(recyclableLevels));
      }, [CASHMATIC_API_URL, cashmaticData.username, cashmaticData.password]);

  const checkChangeBeforePayment = useCallback(
    async (cartTotal: number, authToken?: string) => {
      if (!authToken) {
        setPayStatus("logging In");
        const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cashmaticData.username,
            password: cashmaticData.password,
          }),
        });

        const loginData = await loginResponse.json();
        if (loginData.code !== 0) {
          setPayStatus("Login failed");
          toast.error("❌ Login failed: " + loginData.message);
          return false;
        }

        const authToken = loginData.data.token;
        setToken(authToken);
        toast.success("✅ Logged in successfully.");
        return await checkChangeBeforePayment(cartTotal, authToken);
      }
      const levelsResponse = await fetch(
        `${CASHMATIC_API_URL}/device/AllLevels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const levelsData = await levelsResponse.json();
      if (levelsData.code !== 0) {
        toast.error("❌ Error fetching cash levels.");
        return false;
      }
      const recyclableLevels = levelsData.data.filter((level: any) => level.routing === "recycle");
      usePOSStore.getState().setCashLevels(recyclableLevels);
      console.log("Cashmatic levels set: ", recyclableLevels);
      const priceDollars = Math.round(cartTotal);
      const canChangeAll = canHandleAllChangePossibilities(
        levelsData.data,
        priceDollars
      );

      if (!canChangeAll) {
        toast.warning(
          "⚠️ Machine may not have enough change. Please insert the exact amount."
        );
        return false;
      }

      return true;
    },
    [CASHMATIC_API_URL]
  );

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

  const payWithCashmatic = useCallback(
    async (cartTotal: number) => {
      setCashmaticMessage("🔄 Logging into Cashmatic...");
      setPayStatus("idle");

      try {
        setPayStatus("logging In");
        const loginResponse = await fetch(`${CASHMATIC_API_URL}/user/Login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cashmaticData.username,
            password: cashmaticData.password,
          }),
        });

        const loginData = await loginResponse.json();
        if (loginData.code !== 0) {
          setPayStatus("Login failed");
          setCashmaticMessage("Login failed, please try again");
          throw new Error("Login failed: " + loginData.message);
        }

        setPayStatus("✅ Logged In");
        setCashmaticMessage("✅ Logged In successfully");
        setCashmaticProgress(30);
        const authToken = loginData.data.token;
        setToken(authToken);

        const check = await checkChangeBeforePayment(cartTotal, authToken);
        if (!check) {
          setPayStatus("Cancelled");
          setCashmaticMessage("❌ Machine cannot provide change right now.");
          return null;
        }

        const refillResponse = await fetch(
          `${CASHMATIC_API_URL}/transaction/StartPayment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              amount: cartTotal * 100,
            }),
          }
        );

        const refillData = await refillResponse.json();

        if (refillData.code === 0) {
          setCashmaticMessage(`💰 Insert cash into Cashmatic.`);
          return { authToken };
        } else {
          setPayStatus("Cancelled");
          setCashmaticMessage("❌ Error: " + refillData.message);
          return null;
        }
      } catch (error) {
        if (error instanceof Error) {
          setPayStatus("Cancelled");
          setCashmaticMessage(`❌ ${error.message}`);
        } else {
          setPayStatus("Cancelled");
          setCashmaticMessage("❌ An unknown error occurred.");
        }
        return null;
      }
    },
    [CASHMATIC_API_URL, cashmaticData, checkChangeBeforePayment]
  );

  const trackActiveTransaction = useCallback(
    async (
      authToken: string,
      cartTotal: number,
      customerName: string,
      cart: ExtendedCartItem[]
    ) => {
      let maxAttempts = 150;
      let attempt = 0;
      let completed = false;
      let previousDispensed = 0;
      setReturnedAmount(0);

      while (
        attempt < maxAttempts &&
        !completed &&
        payStatusRef.current !== "Cancelled" &&
        payStatusRef.current !== "Completed" &&
        !payStatusRef.current.includes("Cancelling")
      ) {
        try {
          const response = await fetch(
            `${CASHMATIC_API_URL}/device/ActiveTransaction`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();
          if (data.code === 0) {
            const { inserted, dispensed, notDispensed, operation } = data.data;

            if (payStatusRef.current === "Cancelled") break;
            setInsertedAmount(inserted);
            setRequestedAmount(cartTotal * 100);
            setReturnedAmount(dispensed / 100);

            // if (operation === "idle") {
            //   setPayStatus("Dispensing");
            // }

            if (cartTotal * 100 > 0) {
              const progressValue = Math.min(
                (inserted / (cartTotal * 100)) * 100,
                100
              );
              setCashmaticProgress(progressValue);
            }

            if (operation === "idle") {
              // setPayStatus("Processing");
              setCashmaticMessage("💳 Processing payment, please wait...");

              const lastTransactionResponse = await fetch(
                `${CASHMATIC_API_URL}/device/LastTransaction`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              const lastTransactionData = await lastTransactionResponse.json();
              const { dispensed, notDispensed, end } = lastTransactionData.data;
              let change = dispensed;
              setReturnedAmount(change / 100);
              previousDispensed = change / 100;

              if (end === "canceled") {
                setPayStatus("Cancelled");
                setCashmaticMessage(
                  `❌ Payment Cancelled. Returned: $${(dispensed / 100).toFixed(
                    2
                  )}`
                );
                // resetCashmaticState();
                return;
              }

              // const stopRefill = await fetch(
              //   `${CASHMATIC_API_URL}/transaction/StopDeposit`,
              //   {
              //     method: "POST",
              //     headers: {
              //       "Content-Type": "application/json",
              //       Authorization: `Bearer ${authToken}`,
              //     },
              //   }
              // );

              // const stopRefillData = await stopRefill.json();
              // if (stopRefillData.code === 0) {
              //   setPayStatus("Verifying Change");
              //   setCashmaticMessage(
              //     "🔄 Checking if exact change is available..."
              //   );

              //   const lastTransactionResponse = await fetch(
              //     `${CASHMATIC_API_URL}/device/LastTransaction`,
              //     {
              //       method: "POST",
              //       headers: {
              //         "Content-Type": "application/json",
              //         Authorization: `Bearer ${authToken}`,
              //       },
              //     }
              //   );

              //   const lastData = await lastTransactionResponse.json();
              //   if (lastData.code === 0 && operation !== "idle") {
              //     const { inserted } = lastData.data;
              //     let change = inserted - cartTotal * 100;
              //     setReturnedAmount(change / 100);
              //     previousDispensed = change / 100;

              //     const withdrawResponse = await fetch(
              //       `${CASHMATIC_API_URL}/transaction/StartWithdrawal`,
              //       {
              //         method: "POST",
              //         headers: {
              //           "Content-Type": "application/json",
              //           Authorization: `Bearer ${authToken}`,
              //         },
              //         body: JSON.stringify({ amount: change }),
              //       }
              //     );

              //     const response = await withdrawResponse.json();
              //     if (response.code === 0) {
              //       const { requested, dispensed } = lastData.data;
              //       setReturnedAmount(dispensed);
              //       setPayStatus("Dispensing");
              //     }
              //   }
              // }

              if (
                notDispensed === 0 &&
                end !== "canceled" &&
                operation === "idle" &&
                payStatusRef.current !== "Cancelled" &&
                payStatusRef.current !== "Cancelling" &&
                !completed
              ) {
                completed = true;
                setPayStatus("Completed");
                setCashmaticMessage(
                  `✅ Payment Completed. Change returned: $${previousDispensed}`
                );

                setCashmaticProgress(100);
                const invoice = {
                  id: `invoice-${Date.now()}`, // Generate a unique ID
                  timestamp: Date.now(), // Set creation timestamp
                  status: "Paid" as const, // Default status
                  customer: customerName || "Guest Customer",
                  items: cart,
                  total: cartTotal,
                  // discount: orderDiscountAmount,
                  // paymentMethod: selectedMethod,
                };

                // if (customer) {
                try {
                  const { createInvoice } = usePOSStore.getState();
                  await createInvoice(invoice);
                  console.log("invoice created: ", invoice);
                } catch (error) {
                  console.log(error);
                }
                // } else {
                //   console.error("Customer information is missing.");
                // }
              }
            }
          } else {
            setCashmaticMessage(`⚠️ Error: ${data.message}`);
          }
        } catch (error) {
          console.error("❌ Error tracking payment:", error);
          setCashmaticMessage(
            "❌ Connection error. Please check network and retry."
          );
        }

        if (
          !completed &&
          payStatusRef.current !== "Cancelled" &&
          payStatusRef.current !== "Completed" &&
          !payStatusRef.current.includes("Cancelling")
        ) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempt++;
        } else {
          break;
        }
      }
    },
    [CASHMATIC_API_URL]
  );

  const cancelPayment = useCallback(async () => {
    if (!token) {
      setCashmaticMessage("⚠️ No active transaction to cancel.");
      return;
    }

    if (payStatus.includes("Dispensing")) return;

    try {
      setCashmaticMessage("⏳ Cancelling Payment...");
      setPayStatus("Cancelling");

      const stopResponse = await fetch(
        `${CASHMATIC_API_URL}/transaction/CancelPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const stopData = await stopResponse.json();
      if (stopData.code !== 0)
        throw new Error("Cancel failed: " + stopData.message);

      setCashmaticMessage("💵 Returning inserted cash...");
      // const withdrawResponse = await fetch(
      //   `${CASHMATIC_API_URL}/transaction/StartWithdrawal`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ amount: insertedAmount }),
      //   }
      // );
      // const withdrawData = await withdrawResponse.json();
      // if (withdrawData.code !== 0)
      //   throw new Error("Withdrawal failed: " + withdrawData.message);

      // let withdrawalAttempts = 0;
      // let withdrawalCompleted = false;
      // while (withdrawalAttempts < 30 && !withdrawalCompleted) {
      //   const activeTxn = await fetch(
      //     `${CASHMATIC_API_URL}/device/ActiveTransaction`,
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   );
      //   const activeData = await activeTxn.json();
      //   if (activeData.code === 0) {
      //     const { dispensed, notDispensed, operation } = activeData.data;
      //     setReturnedAmount(dispensed / 100);
      //     if (notDispensed === 0 && operation === "idle") {
      //       withdrawalCompleted = true;
      //       break;
      //     }
      //   }
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      //   withdrawalAttempts++;
      // }
      while (!payStatusRef.current.includes("Cancelled")) {
        try {
          const response = await fetch(
            `${CASHMATIC_API_URL}/device/ActiveTransaction`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (data.code === 0) {
            const { operation, dispensed } = data.data;
            if (operation === "idle") {
              setPayStatus("Cancelled");
              setCashmaticMessage(
                `⏳ Cancelling Payment. Returned so far: $${(dispensed / 100).toFixed(
                  2
                )}`
              );
            }
          }
        } catch (error) {
          console.error("❌ Error tracking payment:", error);
          setCashmaticMessage(
            "❌ Connection error. Please check network and retry."
          );
        }
      }

      const lastTransactionResponse = await fetch(
        `${CASHMATIC_API_URL}/device/LastTransaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const lastTransactionData = await lastTransactionResponse.json();
      const { dispensed, notDispensed, end } = lastTransactionData.data;

      setPayStatus("Cancelled");
      setCashmaticMessage(
        `❌ Payment Cancelled. Returned: $${(dispensed / 100).toFixed(2)}`
      );
      
      // setReturnedAmount(insertedAmount / 100);
      // resetCashmaticState();
    } catch (error) {
      if (error instanceof Error) {
        setCashmaticMessage(`❌ Cancellation Error: ${error.message}`);
      } else {
        setCashmaticMessage("❌ An unknown error occurred.");
      }
    }
  }, [CASHMATIC_API_URL, payStatus, token]);

  const handlePayment = useCallback(
    async (
      cartTotal: number,
      customerName: string,
      cart: ExtendedCartItem[]
    ) => {
      const paymentDetails = await payWithCashmatic(cartTotal);
      if (!paymentDetails) return;

      const { authToken } = paymentDetails;
      await trackActiveTransaction(authToken, cartTotal, customerName, cart);
      if (payStatusRef.current === "Completed") {
        // resetCashmaticState();
        setCashmaticMessage("Payment Completed");
        setPayStatus("Completed");
        toast.success("✅ Payment Completed");
      }
    },
    [payWithCashmatic, trackActiveTransaction]
  );

  const resetCashmaticState = useCallback(() => {
    setCashmaticMessage("pending");
    setReturnedAmount(0);
    setInsertedAmount(0);
    setRequestedAmount(0);
    usePOSStore.getState().clearCart();
    setPayStatus("pending");
    setCashmaticProgress(0);
    setToken(null);
  }, []);

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
      resetCashmaticState,
      checkChangeBeforePayment,
      checkCashmatic
    },
    setCashmaticMessage,
    setPayStatus,
  };
};
