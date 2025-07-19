import "./TabGroup.css";

function TabGroup({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-group">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
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
