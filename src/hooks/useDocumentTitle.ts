// src/hooks/useDocumentTitle.ts
import { useEffect } from "react";

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    const defaultTitle = "OpenPriceCatcher";

    if (title) {
      document.title = `${title} | ${defaultTitle}`;
    } else {
      document.title = defaultTitle;
    }

    // Optional: Revert to default title on unmount
    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
}
