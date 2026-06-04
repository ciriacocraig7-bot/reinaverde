/* eslint-disable jsx-a11y/alt-text */
/**
 * Shopping list PDF para el cliente.
 *
 * Versión imprimible de "estos son los insumos que usaremos en tu evento".
 * SIN costos ni proveedor — eso queda en la versión interna de /chef/compras.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f1d1a",
    backgroundColor: "#faf7f1",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1d1a",
    paddingBottom: 12,
    marginBottom: 24,
  },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 8.5, textAlign: "right", color: "#5a564f" },
  hero: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    lineHeight: 1.05,
  },
  kicker: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#5a564f",
    marginBottom: 24,
    lineHeight: 1.4,
  },
  catTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7a3a18",
    marginTop: 18,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#7a3a18",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5dfd1",
  },
  name: { flex: 2, color: "#1f1d1a" },
  qty: { flex: 1, textAlign: "right", fontFamily: "Helvetica-Bold" },
  unit: {
    width: 60,
    textAlign: "right",
    fontSize: 9,
    color: "#5a564f",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  totalsRow: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#1f1d1a",
    color: "#faf7f1",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalsLabel: { fontSize: 9, color: "#cbc4b3", textTransform: "uppercase" },
  totalsValue: { fontSize: 14, color: "#faf7f1", fontFamily: "Helvetica-Bold" },
  footer: {
    marginTop: 32,
    fontSize: 8.5,
    color: "#5a564f",
    lineHeight: 1.5,
    textAlign: "center",
  },
});

export interface ShoppingListPDFProps {
  quoteNumber: string;
  eventDate: string;
  eventCity: string;
  guestCount: number;
  groupedByCategory: Record<
    string,
    { name: string; unit: string; totalQuantity: number }[]
  >;
  totalItems: number;
}

export function ShoppingListPDFDocument(props: ShoppingListPDFProps) {
  const categories = Object.keys(props.groupedByCategory);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Reina · Verde</Text>
            <Text style={{ fontSize: 8.5, color: "#5a564f", marginTop: 4 }}>
              Catering corporativo · Lista de compras del evento
            </Text>
          </View>
          <View style={styles.meta}>
            <Text>{props.quoteNumber}</Text>
            <Text>{props.eventDate} · {props.eventCity}</Text>
            <Text>{props.guestCount} comensales</Text>
          </View>
        </View>

        <Text style={styles.hero}>Insumos del evento</Text>
        <Text style={styles.kicker}>
          La cocina compra cada uno de estos ingredientes específicamente para
          su evento. Cantidades calculadas con merma usable real. Sin variaciones
          de último minuto.
        </Text>

        {categories.map((cat) => (
          <View key={cat} wrap={false}>
            <Text style={styles.catTitle}>§ {cat}</Text>
            {props.groupedByCategory[cat].map((it, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.name}>{it.name}</Text>
                <Text style={styles.qty}>{it.totalQuantity}</Text>
                <Text style={styles.unit}>{it.unit}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Total de insumos distintos</Text>
          <Text style={styles.totalsValue}>{props.totalItems}</Text>
        </View>

        <Text style={styles.footer}>
          Cada insumo se compra fresco para su evento.{"\n"}
          Reina Verde · Catering corporativo · reinaverdecatering@gmail.com
        </Text>
      </Page>
    </Document>
  );
}
