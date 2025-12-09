"use client";

import { useCallback } from "react";
import { z } from "zod";
import { useZodls } from "./use-zodls";

const DEFAULT_HAT = "/hats/christmas.png";
const STORAGE_KEY = "santahat-selected";

const hatStorageSchema = z.object({
  hat: z.string(),
  custom: z.string().nullable(),
});

const defaultStorage = {
  hat: DEFAULT_HAT,
  custom: null,
};

export function useHatStorage() {
  const [storage, setStorage] = useZodls(
    STORAGE_KEY,
    hatStorageSchema,
    defaultStorage,
  );

  const selectHat = useCallback(
    (hatUrl: string, isCustom = false) => {
      setStorage((current) => ({
        hat: hatUrl,
        custom: isCustom ? hatUrl : current.custom,
      }));
    },
    [setStorage],
  );

  const deleteCustomHat = useCallback(() => {
    setStorage((current) => {
      const wasSelected = current.hat === current.custom;
      return {
        hat: wasSelected ? DEFAULT_HAT : current.hat,
        custom: null,
      };
    });
  }, [setStorage]);

  return {
    selectedHat: storage.hat,
    customHat: storage.custom,
    selectHat,
    deleteCustomHat,
    DEFAULT_HAT,
  };
}
