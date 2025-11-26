import React from 'react'

function usePreventInvalidInput() {

    const parse = (s: string) => {
    if (s === "" || s === "." ) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // block minus, scientific 'e' and plus sign if you want
    if (e.key === "-" || e.key.toLowerCase() === "e" || e.key === "+") {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.trim().startsWith("-")) {
      e.preventDefault();
    }
  };

  const handleBlur = (input:string, onChange:(param:number)=>void) => {
    // clamp to 0 if negative or empty -> treat empty as 0 (adjust if you prefer "")
    const n = parse(input);
    if (Number.isNaN(n)) {
      onChange(0);
      return;
    }
    if (n < 0) {
      onChange?.(0);
      return;
    }
    onChange(n);
  };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, onChange:(amount:number)=>void) => {
    // allow digits and one dot, or empty string
    let v = e.target.value;
    // normalize commas (optional): v = v.replace(",", ".");
    // strip illegal chars
    v = v.replace(/[^\d.]/g, "");
    // allow only one dot
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    // prevent leading zeros like "00" -> keep single "0" unless decimal
    if (!v.includes(".") && v.length > 1 && v.startsWith("0")) v = String(Number(v));

    const n = parse(v);
    if (!Number.isNaN(n) && n >= 0 && onChange) onChange(n);
  };


  return {handlePaste, handleKeyDown, handleBlur, handleChange}
}

export default usePreventInvalidInput