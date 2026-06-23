import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const INDIGO = "#4F46E5";
const SLATE_900 = "#0F172A";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748B";
const SLATE_200 = "#E2E8F0";
const SLATE_50 = "#F8FAFC";
const GREEN = "#16A34A";
const AMBER = "#D97706";

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: SLATE_700,
  },
  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: INDIGO,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: INDIGO },
  brandSub: { fontSize: 8, color: SLATE_500, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 8, color: SLATE_500 },
  headerDataset: { fontSize: 9, color: SLATE_900, marginTop: 4, fontFamily: "Helvetica-Bold" },
  // ── Section ─────────────────────────────────────────────
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: INDIGO,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_200,
  },
  // ── Stats grid ──────────────────────────────────────────
  statsRow: { flexDirection: "row" },
  statCard: {
    flex: 1,
    backgroundColor: SLATE_50,
    borderWidth: 0.5,
    borderColor: SLATE_200,
    borderRadius: 6,
    padding: 10,
    marginRight: 8,
  },
  statCardLast: {
    flex: 1,
    backgroundColor: SLATE_50,
    borderWidth: 0.5,
    borderColor: SLATE_200,
    borderRadius: 6,
    padding: 10,
  },
  statLabel: { fontSize: 7, color: SLATE_500, textTransform: "uppercase", letterSpacing: 0.8 },
  statValue: { fontSize: 22, fontFamily: "Helvetica-Bold", color: SLATE_900, marginTop: 4 },
  // ── Insights ────────────────────────────────────────────
  insightRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start" },
  bullet: { fontSize: 9, color: INDIGO, marginRight: 6, marginTop: 1 },
  insightText: { flex: 1, fontSize: 9, color: SLATE_700, lineHeight: 1.5 },
  // ── Table ───────────────────────────────────────────────
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_200,
  },
  tableHeader: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: SLATE_900 },
  tableCell: { flex: 1, fontSize: 8, color: SLATE_700 },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 5,
    backgroundColor: SLATE_50,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
    marginBottom: 1,
  },
  // ── Chart ───────────────────────────────────────────────
  chartTitle: { fontSize: 8, color: SLATE_500, marginBottom: 6 },
  chartImage: { width: "100%", borderRadius: 4 },
  // ── Report text ─────────────────────────────────────────
  reportText: { fontSize: 8, color: SLATE_700, lineHeight: 1.7, fontFamily: "Courier" },
  // ── Footer ──────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: SLATE_200,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: SLATE_500 },
});

export interface SummaryStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  "25%": number;
  "50%": number;
  "75%": number;
}

export interface ReportData {
  quality: {
    total_records: number;
    total_columns: number;
    missing_values: number;
    duplicate_rows: number;
    column_types: Record<string, string>;
  };
  eda: {
    numeric_columns: string[];
    categorical_columns: string[];
    summary_statistics: Record<string, SummaryStats>;
  };
  insights: string[];
  report: string;
  charts: string[];
}

interface Props {
  fileName: string;
  result: ReportData;
  chartImages: string[];
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export function ReportPDF({ fileName, result, chartImages }: Props) {
  const q = result.quality;
  const totalCells = q.total_records * q.total_columns;
  const qualityScore = Math.round(((totalCells - q.missing_values) / totalCells) * 100);
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`InsightForge Report — ${fileName}`} author="InsightForge">
      {/* ── Page 1: Summary ── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>InsightForge</Text>
            <Text style={styles.brandSub}>AI-Powered Analytics Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>{date}</Text>
            <Text style={styles.headerDataset}>{fileName}</Text>
          </View>
        </View>

        {/* Data Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Records</Text>
              <Text style={styles.statValue}>{q.total_records}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Columns</Text>
              <Text style={styles.statValue}>{q.total_columns}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Missing Values</Text>
              <Text style={[styles.statValue, { color: q.missing_values > 0 ? AMBER : GREEN }]}>
                {q.missing_values}
              </Text>
            </View>
            <View style={styles.statCardLast}>
              <Text style={styles.statLabel}>Quality Score</Text>
              <Text style={[styles.statValue, { color: qualityScore >= 90 ? GREEN : AMBER }]}>
                {qualityScore}%
              </Text>
            </View>
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {result.insights.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Column Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Column Types</Text>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Column</Text>
            <Text style={styles.tableHeader}>Type</Text>
            <Text style={styles.tableHeader}>Category</Text>
          </View>
          {Object.entries(q.column_types).map(([col, type]) => (
            <View key={col} style={styles.tableRow}>
              <Text style={styles.tableCell}>{col}</Text>
              <Text style={styles.tableCell}>{type}</Text>
              <Text style={styles.tableCell}>
                {result.eda.numeric_columns.includes(col) ? "Numeric" : "Categorical"}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Statistics */}
        {result.eda.numeric_columns.length > 0 &&
          Object.keys(result.eda.summary_statistics ?? {}).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary Statistics</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeader}>Column</Text>
                <Text style={styles.tableHeader}>Mean</Text>
                <Text style={styles.tableHeader}>Std Dev</Text>
                <Text style={styles.tableHeader}>Min</Text>
                <Text style={styles.tableHeader}>Median</Text>
                <Text style={styles.tableHeader}>Max</Text>
              </View>
              {result.eda.numeric_columns.map((col) => {
                const s = result.eda.summary_statistics[col];
                if (!s) return null;
                return (
                  <View key={col} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{col}</Text>
                    <Text style={styles.tableCell}>{fmt(s.mean)}</Text>
                    <Text style={styles.tableCell}>{fmt(s.std)}</Text>
                    <Text style={styles.tableCell}>{fmt(s.min)}</Text>
                    <Text style={styles.tableCell}>{fmt(s["50%"])}</Text>
                    <Text style={styles.tableCell}>{fmt(s.max)}</Text>
                  </View>
                );
              })}
            </View>
          )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>InsightForge — AI-Powered Analytics</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ── Page 2+: Visualizations ── */}
      {chartImages.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.brand}>InsightForge</Text>
            <Text style={styles.headerDataset}>{fileName} — Visualizations</Text>
          </View>

          {chartImages.map((src, i) => {
            const name = result.charts[i]?.split("/").pop()?.replace("_histogram.png", "") ?? `chart_${i}`;
            return (
              <View key={i} style={[styles.section, { marginBottom: 16 }]}>
                <Text style={styles.sectionTitle}>{name} — Distribution</Text>
                <Image src={src} style={styles.chartImage} />
              </View>
            );
          })}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>InsightForge — AI-Powered Analytics</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* ── Last Page: Full Report ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>InsightForge</Text>
          <Text style={styles.headerDataset}>{fileName} — Full Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Report</Text>
          <Text style={styles.reportText}>{result.report}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>InsightForge — AI-Powered Analytics</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
