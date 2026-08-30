"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, LoaderCircle } from "lucide-react";

import { ReceiptDocument } from "./ReceiptDocument";

interface DownloadReceiptButtonProps {
  sessionId: string;
  planName?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  interval?: string | null;
}

interface CheckoutMetadata {
  plan?: string;
  customerName?: string;
  customerEmail?: string;
  note?: string;
  billing?: string;
}

function readCheckoutMetadata(): CheckoutMetadata {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem("checkout_metadata");
    return raw ? (JSON.parse(raw) as CheckoutMetadata) : {};
  } catch {
    return {};
  }
}

export const DownloadReceiptButton = ({
  sessionId,
  planName,
  amountTotal,
  currency,
  interval,
}: DownloadReceiptButtonProps) => {
  const [metadata] = useState<CheckoutMetadata>(readCheckoutMetadata);

  const customerName = metadata.customerName || "Customer";
  const customerEmail = metadata.customerEmail || "";
  const plan = metadata.plan || planName || "AI Pather Membership";
  const billing =
    metadata.billing || (interval === "year" ? "yearly" : "monthly");

  const document = (
    <ReceiptDocument
      receiptId={sessionId}
      issuedAt={new Date()}
      customerName={customerName}
      customerEmail={customerEmail}
      planName={plan}
      note={metadata.note || undefined}
      billing={billing}
      amountTotal={amountTotal ?? 0}
      currency={currency || "USD"}
    />
  );

  return (
    <PDFDownloadLink
      document={document}
      fileName={`receipt_${sessionId}.pdf`}
      className="group relative inline-flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground py-3 pl-5 pr-5 text-base font-medium text-background transition-colors duration-300 hover:bg-primary"
    >
      {({ loading }) => (
        <>
          {loading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {loading ? "Generating PDF…" : "Download Receipt PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
};