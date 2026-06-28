import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { CreditCard, Copy, Check } from "lucide-react";
import { useState } from "react";

interface DemoDisclaimerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DemoDisclaimerModal({
  open,
  onClose,
  onConfirm,
}: DemoDisclaimerModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const cardDetails = [
    { label: "Card Number", value: "4242 4242 4242 4242", raw: "4242424242424242" },
    { label: "Expiry Date", value: "12/28", raw: "12/28" },
    { label: "CVC", value: "123", raw: "123" },
    { label: "Cardholder Name", value: "Saim Shabbir", raw: "Saim Shabbir" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Demo Project Notice
          </DialogTitle>
          <DialogDescription className="text-center">
            This is a <span className="font-semibold text-foreground">demo / personal project</span>, not a
            real commercial service. You do not need to enter your personal card
            details.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Use the following test credentials
          </p>
          {cardDetails.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-mono font-semibold">{d.value}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(d.raw, d.label)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                {copied === d.label ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={onConfirm}
            className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition"
          >
            Proceed to Payment
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-md border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
