// src/hooks/useSEO.ts
import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
}

export function useSEO({ title, description }: SEOProps) {
  useEffect(() => {
    const defaultTitle = "OpenPriceCatcher";
    const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to safely update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute("content", content);
      }
    };

    // 2. Update OpenGraph & Twitter Titles
    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[name="twitter:title"]', fullTitle);

    // 3. Update Descriptions (if provided)
    if (description) {
      updateMetaTag('meta[name="description"]', description);
      updateMetaTag('meta[property="og:description"]', description);
      updateMetaTag('meta[name="twitter:description"]', description);
    }

    // Optional: Reset on unmount
    return () => {
      document.title = defaultTitle;
      updateMetaTag('meta[property="og:title"]', defaultTitle);
      updateMetaTag('meta[name="twitter:title"]', defaultTitle);
    };
  }, [title, description]);
}
