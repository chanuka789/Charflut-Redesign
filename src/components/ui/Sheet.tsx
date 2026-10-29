"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "right" | "left" | "bottom";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const panel = {
  right: "inset-y-0 right-0 h-dvh w-full max-w-md data-[state=open]:animate-[sheet-in-right_420ms_var(--ease-out-quint)] data-[state=closed]:animate-[sheet-out-right_260ms_var(--ease-in-out-soft)]",
  left: "inset-y-0 left-0 h-dvh w-[86%] max-w-sm data-[state=open]:animate-[sheet-in-left_420ms_var(--ease-out-quint)] data-[state=closed]:animate-[sheet-out-left_260ms_var(--ease-in-out-soft)]",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl data-[state=open]:animate-[sheet-in-bottom_420ms_var(--ease-out-quint)] data-[state=closed]:animate-[sheet-out-bottom_260ms_var(--ease-in-out-soft)]",
};

/** Accessible slide-over panel (focus trap, Esc to close, focus returns to the trigger). */
export function Sheet({ open, onOpenChange, title, description, side = "right", children, footer, className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-[fade-in_300ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]" />
        <Dialog.Content
          className={cn("fixed z-[100] flex flex-col bg-paper-raised shadow-panel outline-none", panel[side], className)}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
            <Dialog.Close
              className="-mr-2 grid size-11 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </header>
          {description && <Dialog.Description className="sr-only">{description}</Dialog.Description>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <footer className="border-t border-line px-5 py-5 sm:px-6">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
