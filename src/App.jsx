import { useState, useEffect, useRef, useCallback } from "react";
import LZString from "lz-string";

import TabGroup from "./components/TabGroup/TabGroup";
import People from "./pages/People";
import Items from "./pages/Items";
import Assign from "./pages/Assign";
import Summary from "./pages/Summary";
import UploadReceipt from "./pages/UploadReceipt";
import Card from "./components/Card/Card";
import Footer from "./components/Footer/Footer";
import SharedSplitModal from "./components/SharedSplitModal";
import logo from "./assets/logos/logo.png";
import logoBlurple from "./assets/logos/logo-blurple.png";
import {
  createSharedSplit,
  isSupabaseConfigured,
  joinSharedSplit,
  supabase,
} from "./lib/supabase";
import "./App.css";

const tabs = ["Upload Receipt", "Items", "People", "Assign", "Summary"];

function App() {
  const [sharedSplit, setSharedSplit] = useState(null);
  const [sharedSplitModal, setSharedSplitModal] = useState(null);
  const [sharedSplitJoinCode, setSharedSplitJoinCode] = useState("");
  const [sharedSplitError, setSharedSplitError] = useState("");
  const [sharedSplitBusy, setSharedSplitBusy] = useState(false);
  const remoteStateRef = useRef("");
  const syncTimerRef = useRef(null);
  // Tip input states for Assign/Summary
  const [tipAmountInput, setTipAmountInput] = useState("");
  const [customTipPercentInput, setCustomTipPercentInput] = useState("");
  // Load state from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get("data");
    const splitCode = params.get("split");
    if (splitCode) {
      setSharedSplitJoinCode(splitCode.toUpperCase());
      setSharedSplitModal("join");
    }
    if (compressed) {
      try {
        const raw = LZString.decompressFromEncodedURIComponent(compressed);
        if (raw) {
          const state = JSON.parse(raw);
          if (state.people) setPeople(state.people);
          if (state.items) setItems(state.items);
          if (Array.isArray(state.fees)) setFees(state.fees);
          if (state.assignments) setAssignments(state.assignments);
          if (state.taxMode === "amount") {
            setTaxRate({
              value: state.taxRate || "",
              mode: "amount",
              amount: state.taxAmount || "",
            });
          } else {
            setTaxRate({ value: state.taxRate || "", mode: "percent" });
          }
          // Restore tip mode and value
          if (state.tipMode === "amount") {
            setTipMode("amount");
            setTipAmountInput(state.tipAmount || state.tipAmountInput || "");
            setTip(state.tipAmount || state.tipAmountInput || "");
          } else if (state.tipMode === "customPercent") {
            setTipMode("customPercent");
            setCustomTipPercentInput(
              state.tipPercent || state.customTipPercentInput || ""
            );
            setTip("");
          } else {
            setTipMode(state.tipMode || "percent");
            setTip(state.tip !== undefined ? state.tip : "");
          }
          if (state.tip !== undefined) setTip(state.tip);
          if (state.tipCalc) setTipCalc(state.tipCalc);
          // Optionally handle taxMode and taxAmount if you store them in state
          setActiveTab(4); // Go straight to Summary tab
        }
      } catch (e) {
        // Optionally show error to user
        console.error("Failed to load shared data from URL", e);
      }
    }
  }, []);
  const [activeTab, setActiveTab] = useState(0);
  const [people, setPeople] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [items, setItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [taxRate, setTaxRate] = useState("");
  const [fees, setFees] = useState([]);
  const [tip, setTip] = useState("");
  const [tipCalc, setTipCalc] = useState("proportional");
  const [tipMode, setTipMode] = useState("percent");
  const [tipPreset, setTipPreset] = useState(15);

  const sharedState = {
    people,
    emojis,
    items,
    assignments,
    taxRate,
    fees,
    tip,
    tipCalc,
    tipMode,
    tipPreset,
    tipAmountInput,
    customTipPercentInput,
  };

  const applySharedState = useCallback((state) => {
    if (Array.isArray(state.people)) setPeople(state.people);
    if (Array.isArray(state.emojis)) setEmojis(state.emojis);
    if (Array.isArray(state.items)) setItems(state.items);
    if (Array.isArray(state.assignments)) setAssignments(state.assignments);
    if (state.taxRate !== undefined) setTaxRate(state.taxRate);
    if (Array.isArray(state.fees)) setFees(state.fees);
    if (state.tip !== undefined) setTip(state.tip);
    if (state.tipCalc) setTipCalc(state.tipCalc);
    if (state.tipMode) setTipMode(state.tipMode);
    if (state.tipPreset !== undefined) setTipPreset(state.tipPreset);
    if (state.tipAmountInput !== undefined) setTipAmountInput(state.tipAmountInput);
    if (state.customTipPercentInput !== undefined) {
      setCustomTipPercentInput(state.customTipPercentInput);
    }
  }, []);

  const sharedStateJson = JSON.stringify(sharedState);

  useEffect(() => {
    if (!sharedSplit || remoteStateRef.current === sharedStateJson) return;

    clearTimeout(syncTimerRef.current);
    remoteStateRef.current = sharedStateJson;
    syncTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("shared_splits")
        .update({
          state: JSON.parse(sharedStateJson),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sharedSplit.id);

      if (error) {
        remoteStateRef.current = "";
        setSharedSplitError(`Couldn't sync changes: ${error.message}`);
      }
    }, 350);

    return () => clearTimeout(syncTimerRef.current);
  }, [sharedSplit, sharedStateJson]);

  useEffect(() => {
    if (!sharedSplit || !supabase) return undefined;

    const channel = supabase
      .channel(`shared-split-${sharedSplit.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_splits",
          filter: `id=eq.${sharedSplit.id}`,
        },
        (payload) => {
          const state = payload.new.state;
          if (!state) return;
          remoteStateRef.current = JSON.stringify(state);
          applySharedState(state);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applySharedState, sharedSplit]);

  const createLiveSplit = async () => {
    setSharedSplitBusy(true);
    setSharedSplitError("");
    try {
      const split = await createSharedSplit(sharedState);
      remoteStateRef.current = JSON.stringify(split.state);
      setSharedSplit(split);
      setSharedSplitModal(null);
    } catch (error) {
      setSharedSplitError(error.message);
    } finally {
      setSharedSplitBusy(false);
    }
  };

  const joinLiveSplit = async (code, name) => {
    setSharedSplitBusy(true);
    setSharedSplitError("");
    try {
      const split = await joinSharedSplit(code);
      const state = split.state;
      const normalizedName = name.trim();
      const nextState = state.people?.includes(normalizedName)
        ? state
        : {
            ...state,
            people: [...(state.people || []), normalizedName],
            emojis: [...(state.emojis || []), "🐱"],
          };
      remoteStateRef.current = JSON.stringify(state);
      applySharedState(nextState);
      setSharedSplit(split);
      setSharedSplitModal(null);
      setActiveTab(3);
    } catch (error) {
      setSharedSplitError(error.message);
    } finally {
      setSharedSplitBusy(false);
    }
  };

  const sharedJoinUrl = sharedSplit
    ? `${window.location.origin}${window.location.pathname}?split=${sharedSplit.join_code}`
    : "";

  // Keep assignments array in sync with items
  if (assignments.length !== items.length) {
    setAssignments(items.map((_, idx) => assignments[idx] || []));
  }

  // Convert taxRate and tip to numbers for calculations
  // Helper: get tax mode and value for Summary
  let taxMode = "percent";
  let taxAmount = null;
  let taxRateNum = 0;
  if (typeof taxRate === "object") {
    if (taxRate.mode === "amount") {
      taxMode = "amount";
      taxAmount = taxRate.amount;
      taxRateNum = parseFloat(taxRate.value) || 0;
    } else {
      taxMode = "percent";
      taxRateNum = parseFloat(taxRate.value) || 0;
    }
  } else {
    taxMode = "percent";
    taxRateNum = parseFloat(taxRate) || 0;
  }
  const tipNum = parseFloat(tip) || 0;

  // Detect dark mode and update on theme change
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <main>
      <a
        href={window.location.origin + window.location.pathname}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={0}
        aria-label="Open a new blank TabbySplit tab"
        style={{ display: "inline-block" }}
      >
        <img
          src={isDarkMode ? logoBlurple : logo}
          alt="Tabby Split Logo"
          style={{ height: "100px", marginBottom: "0rem", cursor: "pointer" }}
        />
      </a>
      <h1>TabbySplit</h1>
      <p style={{ marginBottom: "2.5rem" }}>Split the bill, purrfectly.</p>
      <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        style={{
          maxWidth: "700px",
          width: "90vw",
          minWidth: "300px",
          margin: "0 auto",
        }}
      >
        <Card>
          {activeTab === 0 && (
            <UploadReceipt
              isSupabaseConfigured={isSupabaseConfigured}
              onJoinSharedSplit={(code) => {
                setSharedSplitJoinCode(code);
                setSharedSplitError("");
                setSharedSplitModal("join");
              }}
              onNext={({ extractedItems, extractedTaxAmount }) => {
                if (Array.isArray(extractedItems) && extractedItems.length > 0) {
                  setItems(extractedItems);
                }
                if (extractedTaxAmount !== null) {
                  setTaxRate({
                    value: "",
                    mode: "amount",
                    amount: extractedTaxAmount,
                  });
                }
                setActiveTab(1);
              }}
            />
          )}
          {activeTab === 1 && (
            <Items
              items={items}
              setItems={setItems}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              fees={fees}
              setFees={setFees}
              tip={tip}
              setTip={setTip}
              tipCalc={tipCalc}
              setTipCalc={setTipCalc}
              tipMode={tipMode}
              setTipMode={setTipMode}
              tipPreset={tipPreset}
              setTipPreset={setTipPreset}
              tipAmountInput={tipAmountInput}
              setTipAmountInput={setTipAmountInput}
              customTipPercentInput={customTipPercentInput}
              setCustomTipPercentInput={setCustomTipPercentInput}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 2 && (
            <People
              people={people}
              setPeople={setPeople}
              emojis={emojis}
              setEmojis={setEmojis}
              setActiveTab={setActiveTab}
              isSupabaseConfigured={isSupabaseConfigured}
              sharedJoinCode={sharedSplit?.join_code}
              sharedJoinUrl={sharedJoinUrl}
              onStartLiveShare={() => {
                setSharedSplitError("");
                setSharedSplitModal("create");
              }}
              onCopyLiveShare={() => navigator.clipboard.writeText(sharedJoinUrl)}
            />
          )}
          {activeTab === 3 && (
            <Assign
              people={people}
              items={items}
              assignments={assignments}
              setAssignments={setAssignments}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 4 && (
            <Summary
              people={people}
              items={items}
              assignments={assignments}
              taxRate={taxRateNum}
              tip={tipNum}
              tipCalc={tipCalc}
              tipMode={tipMode}
              setActiveTab={setActiveTab}
              taxMode={taxMode}
              taxAmount={taxAmount}
              fees={fees}
              tipAmountInput={tipAmountInput}
              customTipPercentInput={customTipPercentInput}
              isSupabaseConfigured={isSupabaseConfigured}
              sharedJoinUrl={sharedJoinUrl}
              onStartLiveShare={() => {
                setSharedSplitError("");
                setSharedSplitModal("create");
              }}
            />
          )}
        </Card>
      </div>
      <Footer />
      <SharedSplitModal
        open={Boolean(sharedSplitModal)}
        mode={sharedSplitModal}
        joinCode={sharedSplitJoinCode}
        onClose={() => {
          setSharedSplitError("");
          setSharedSplitModal(null);
        }}
        onCreate={createLiveSplit}
        onJoin={joinLiveSplit}
        busy={sharedSplitBusy}
        error={sharedSplitError}
      />
    </main>
  );
}

export default App;
