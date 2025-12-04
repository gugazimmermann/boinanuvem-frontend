import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";

interface UseEntityTabOptions<T extends string> {
  readonly validTabs: readonly T[];
  readonly defaultTab: T;
  readonly isMainUser?: () => boolean;
  readonly restrictedTabs?: readonly T[];
}

/**
 * Hook to manage entity detail page tabs with URL synchronization and permission checks.
 *
 * @param options - Configuration options
 * @param options.validTabs - Array of valid tab values
 * @param options.defaultTab - Default tab to use when no tab is specified
 * @param options.isMainUser - Optional function to check if user is main user (for restricting tabs)
 * @param options.restrictedTabs - Optional array of tabs that require main user access
 * @returns Tuple of [activeTab, setActiveTab]
 */
export function useEntityTab<T extends string>({
  validTabs,
  defaultTab,
  isMainUser,
  restrictedTabs = ["activities" as T],
}: UseEntityTabOptions<T>): [T, (tab: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeTab = useMemo<T>(() => {
    if (tabParam && validTabs.includes(tabParam as T)) {
      // Check if tab is restricted and user doesn't have access
      if (restrictedTabs.includes(tabParam as T) && isMainUser && !isMainUser()) {
        return defaultTab;
      }
      return tabParam as T;
    }
    return defaultTab;
  }, [tabParam, validTabs, defaultTab, isMainUser, restrictedTabs]);

  useEffect(() => {
    const tab = searchParams.get("tab");

    // Check if tab is restricted and user doesn't have access
    if (tab && restrictedTabs.includes(tab as T) && isMainUser && !isMainUser()) {
      setSearchParams({ tab: defaultTab }, { replace: true });
      return;
    }

    // If no tab in URL and we're not on default, set it
    if (!tab && activeTab !== defaultTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [searchParams, isMainUser, setSearchParams, validTabs, defaultTab, restrictedTabs, activeTab]);

  const handleTabChange = (tab: T) => {
    setSearchParams({ tab });
  };

  return [activeTab, handleTabChange];
}
