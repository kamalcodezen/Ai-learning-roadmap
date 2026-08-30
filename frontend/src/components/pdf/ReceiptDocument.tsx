import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { StaticImageData } from "next/image";

import brandLogo from "../../../public/brand/AI-Pather-white.png";

const BRAND = "#9F54F7";
const BRAND_DARK = "#8523F5";
const LAVENDER_BG = "#f5efff";
const LAVENDER_BORDER = "#e5dcff";
const INK = "#201a35";
const MUTED = "#6b6478";
const LINE = "#e7e2f2";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    color: INK,
    fontFamily: "Helvetica",
  },
  headerBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BRAND_DARK,
    paddingHorizontal: 36,
    paddingVertical: 26,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 20,
    height: 20,
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.4,
  },
  headerTag: {
    fontSize: 8,
    color: "#e9d9ff",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: INK,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: BRAND,
  },
  subtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 14,
  },
  metaLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND_DARK,
    marginTop: 3,
  },
  block: {
    borderWidth: 1,
    borderColor: LAVENDER_BORDER,
    backgroundColor: LAVENDER_BG,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  blockLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    color: INK,
  },
  detail: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },
  noteText: {
    fontSize: 9,
    color: MUTED,
    marginTop: 6,
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  rowLabel: {
    color: MUTED,
    fontSize: 10,
  },
  rowValue: {
    color: INK,
    fontWeight: "bold",
    fontSize: 10,
  },
  totalBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: INK,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_DARK,
    letterSpacing: -0.3,
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  footerInner: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: "bold",
    color: BRAND,
  },
  bandSpacer: {
    backgroundColor: BRAND,
    height: 4,
  },
});

function formatAmount(amountTotal: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amountTotal / 100);
}

export interface ReceiptDocumentProps {
  receiptId: string;
  issuedAt: Date;
  customerName: string;
  customerEmail: string;
  planName: string;
  note?: string;
  billing: string;
  amountTotal: number;
  currency: string;
}

export const ReceiptDocument = ({
  receiptId,
  issuedAt,
  customerName,
  customerEmail,
  planName,
  note,
  billing,
  amountTotal,
  currency,
}: ReceiptDocumentProps) => {
  const amount = formatAmount(amountTotal, currency);
  const intervalLabel = billing === "yearly" ? "year" : "month";
  const periodLabel = billing === "yearly" ? "Billed annually" : "Billed monthly";

  return (
    <Document
      title={`Payment Receipt — ${planName}`}
      author="AI Pather"
      subject="Payment receipt"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerBrand}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src={(brandLogo as StaticImageData).src}
              fixed
              style={styles.headerLogo}
            />
            <Text style={styles.headerBrandText}>AI Pather</Text>
          </View>
          <Text style={styles.headerTag}>Payment Receipt</Text>
        </View>

        <View style={styles.bandSpacer} />

        <View style={styles.body}>
          <Text style={styles.title}>
            Thank you, <Text style={styles.titleAccent}>{customerName}</Text>
          </Text>
          <Text style={styles.subtitle}>Your payment has been confirmed and your plan is active.</Text>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Receipt No.</Text>
              <Text style={styles.metaValue}>{receiptId}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>
                {issuedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Billed To</Text>
              <Text style={styles.name}>{customerName}</Text>
              <Text style={styles.detail}>{customerEmail}</Text>
              {note ? <Text style={styles.noteText}>“{note}”</Text> : null}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={[styles.block, { backgroundColor: "#ffffff" }]}>
              <Text style={styles.blockLabel}>Order Summary</Text>
              <View style={[styles.row, { borderTopWidth: 0 }]}>
                <Text style={styles.rowLabel}>{planName}</Text>
                <Text style={styles.rowValue}>
                  {amount} / {intervalLabel}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Billing period</Text>
                <Text style={styles.rowLabel}>{periodLabel}</Text>
              </View>

              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>{amount}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.footer, { marginHorizontal: 36 }]}>
          <View style={styles.footerInner}>
            <Text style={styles.footerText}>aipather.vercel.app</Text>
            <Text style={styles.footerBrand}>AI Pather</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};