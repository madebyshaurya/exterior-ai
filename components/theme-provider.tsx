"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-specific attributes during SSR
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        <NextThemesProvider
          {...props}
          enableSystem={false}
          defaultTheme="light"
        >
          {children}
        </NextThemesProvider>
      </div>
    );
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
