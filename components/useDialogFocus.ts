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
        previous.focus({ preventScroll: true });
        return;
      }
      const focusKey = previous?.dataset.focusKey;
      const replacement = focusKey
        ? Array.from(
            document.querySelectorAll<HTMLElement>("[data-focus-key]"),
          ).find((element) => element.dataset.focusKey === focusKey)
        : null;
      if (replacement) {
        replacement.scrollIntoView({ block: "nearest", inline: "nearest" });
        replacement.focus({ preventScroll: true });
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
