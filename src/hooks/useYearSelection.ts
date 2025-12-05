import { useState } from "react";

export const useYearSelection = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = Array.from({ length: 2030 - currentYear + 1 }, (_, i) => currentYear + i);

  return {
    selectedYear,
    setSelectedYear,
    years,
    currentYear
  };
};