import React from "react";

/**
 * FilterPill Component
 * * @param {string} label - The text displayed inside the button.
 * @param {boolean} active - Determines whether the pill is in its highlighted/selected state.
 * @param {function} onClick - Call-back trigger fired when the user clicks the pill.
 * @param {string} activeCls - Custom Tailwind CSS style classes to apply exclusively when active is true.
 */
export default function FilterPill({ 
  label, 
  active = false, 
  onClick, 
  activeCls = "bg-white text-zinc-950 border-white" // Production-safe neutral default active style
}) {
  if (!label) return null;

  return (
    <button
      type="button" // Production best practice: explicitly define type to prevent accidental form submissions
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
        active 
          ? activeCls 
          : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </button>
  );
}