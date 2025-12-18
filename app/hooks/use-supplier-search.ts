import { useState, useMemo } from "react";
import type { Supplier } from "~/types";

/**
 * Hook for filtering suppliers by search term
 * Searches across code, name, CNPJ, and CPF fields
 */
export function useSupplierSearch(suppliers: Supplier[]) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    const searchLower = searchTerm.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.code?.toLowerCase().includes(searchLower) ||
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.cnpj?.toLowerCase().includes(searchLower) ||
        supplier.cpf?.toLowerCase().includes(searchLower)
    );
  }, [suppliers, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredSuppliers,
  };
}
