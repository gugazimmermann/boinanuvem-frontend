import { useState, useEffect, useRef } from "react";
import { useAuth } from "~/contexts/auth-context";
import { getCompany, type EnhancedCompany } from "~/services/companies.service";

interface UseCompanyTrialReturn {
  company: EnhancedCompany | null;
  isLoading: boolean;
  error: string | null;
  isOnTrial: boolean;
  trialDaysRemaining: number;
}

/**
 * Hook to fetch and manage company trial information
 * Caches company data to avoid unnecessary API calls
 */
export function useCompanyTrial(): UseCompanyTrialReturn {
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId;

  const [company, setCompany] = useState<EnhancedCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track loading state and prevent infinite loops
  const loadedCompanyIdRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Prevent loading if we're already loading or if we've already loaded this companyId
    if (isLoadingRef.current) {
      return;
    }

    if (!companyId) {
      setIsLoading(false);
      setError("Company ID not found");
      return;
    }

    // If we've already loaded this companyId, don't reload
    if (loadedCompanyIdRef.current === companyId) {
      return;
    }

    let cancelled = false;
    isLoadingRef.current = true;

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const companyData = await getCompany(companyId);

        if (!cancelled) {
          setCompany(companyData);
          loadedCompanyIdRef.current = companyId;
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load company data";
          setError(errorMessage);
          console.error("Failed to load company data:", errorMessage);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    fetchCompany();

    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
  }, [companyId]);

  const isOnTrial = company?.trial?.isOnTrial ?? false;
  const trialDaysRemaining = company?.trial?.trialDaysRemaining ?? 0;

  return {
    company,
    isLoading,
    error,
    isOnTrial,
    trialDaysRemaining,
  };
}
