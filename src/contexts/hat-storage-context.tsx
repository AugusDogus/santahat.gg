"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useHatStorage } from "~/hooks/use-hat-storage";

type HatStorageContextType = ReturnType<typeof useHatStorage>;

const HatStorageContext = createContext<HatStorageContextType | null>(null);

export function HatStorageProvider({ children }: { children: ReactNode }) {
  const hatStorage = useHatStorage();

  return (
    <HatStorageContext.Provider value={hatStorage}>
      {children}
    </HatStorageContext.Provider>
  );
}

export function useHatStorageContext() {
  const context = useContext(HatStorageContext);
  if (!context) {
    throw new Error(
      "useHatStorageContext must be used within a HatStorageProvider",
    );
  }
  return context;
}

