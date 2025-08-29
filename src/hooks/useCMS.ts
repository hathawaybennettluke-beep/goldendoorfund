import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type PageType = "home" | "about" | "contact";

export function useCMSContent(pageType: PageType, sectionType?: string) {
  const content = useQuery(api.cms.getPageContent, {
    pageType,
    sectionType,
    activeOnly: true,
  });

  return content || [];
}

export function useSiteSettings(category?: string) {
  const settings = useQuery(api.cms.getSiteSettings, {
    category,
    publicOnly: true,
  });

  // Convert to key-value object for easier access
  const settingsObject = settings?.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>
  );

  return {
    settings: settings || [],
    settingsObject: settingsObject || {},
  };
}

export function useSiteSetting(key: string) {
  const setting = useQuery(api.cms.getSetting, { key });
  return setting?.value;
}

// Helper function to get content by identifier
export function useContentByIdentifier(identifier: string) {
  const content = useQuery(api.cms.getByIdentifier, { identifier });
  return content;
}
