import { useRef } from "react";
/** Imperative record and command dialogs have no single Radix Trigger. */
export function useDialogFocus() {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      const previous = opener.current;
      if (
        previous?.isConnected &&
        !previous.matches(":disabled") &&
        previous !== document.body
      ) {
        previous.focus();
        return;
      }
      document
        .querySelector<HTMLElement>(
          ".inspector, .command-trigger, .nav-item.active",
        )
        ?.focus();
    },
  };
}
