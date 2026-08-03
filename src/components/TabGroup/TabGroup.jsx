import { useEffect, useRef } from "react";
import "./TabGroup.css";

function TabGroup({ tabs, activeTab, onTabChange }) {
  const tabGroupRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const tabGroup = tabGroupRef.current;

    if (!activeTabElement || !tabGroup) return;

    const paddingLeft = Number.parseFloat(getComputedStyle(tabGroup).paddingLeft);

    tabGroup.scrollTo({
      behavior: "smooth",
      left:
        activeTab === 0
          ? 0
          : Math.max(0, activeTabElement.offsetLeft - paddingLeft),
    });
  }, [activeTab]);

  return (
    <div ref={tabGroupRef} className="tab-group">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          ref={(element) => {
            tabRefs.current[idx] = element;
          }}
          className={activeTab === idx ? "tab active" : "tab"}
          onClick={() => onTabChange(idx)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabGroup;
