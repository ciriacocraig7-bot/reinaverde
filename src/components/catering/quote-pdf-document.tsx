/* eslint-disable jsx-a11y/alt-text */
/**
 * QuotePDFDocument — render del PDF de cotización con desglose tributario.
 *
 * Diseñado para que la empresa cliente pueda llevar el documento a su
 * contador (muestra IVA discriminado o tarifa SIMPLE según régimen,
 * retenciones estimadas y neto a recibir).
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 9.5,
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
  h2: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7a3a18",
    marginBottom: 8,
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbc4b3",
  },
  rowMuted: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  label: { color: "#403c34" },
  amount: { fontFamily: "Helvetica-Bold" },
  totalBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#1f1d1a",
    color: "#faf7f1",
  },
  totalLabel: { fontSize: 9, color: "#cbc4b3" },
  totalValue: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#faf7f1" },
  small: { fontSize: 8, color: "#5a564f", marginTop: 6, lineHeight: 1.4 },
  itemHead: {
    flexDirection: "row",
    fontSize: 8.5,
    color: "#7a3a18",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#7a3a18",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5dfd1",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1.5, textAlign: "right" },
});

export interface QuotePDFProps {
  quoteNumber: string;
  createdAt: string;
  expiresAt: string;
  status: string;
  client: { firstName: string; lastName: string; email: string };
  event: {
    date: string;
    time: string;
    city: string;
    address: string;
    guestCount: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  breakdown: {
    cmpTotal: number;
    cmoTotal: number;
    cifTotal: number;
    packagingTotal: number;
    transportTotal: number;
    costTotal: number;
    marginAmount: number;
    subtotal: number;
    volumeDiscountAmount: number;
    seasonalAdjustment: number;
    taxableBase: number;
    vatAmount: number;
    icaAmount: number;
    simpleAmount: number;
    total: number;
    reteFuenteAmount: number;
    reteIvaAmount: number;
    reteIcaAmount: number;
    netReceivable: number;
    regime: "COMMON" | "SIMPLE";
  };
}

export function QuotePDFDocument(props: QuotePDFProps) {
  const { breakdown: b } = props;
  const isCommon = b.regime === "COMMON";
  const hasAnyTax =
    b.vatAmount > 0 || b.icaAmount > 0 || b.simpleAmount > 0;
  const hasAnyRetention =
    b.reteFuenteAmount > 0 || b.reteIvaAmount > 0 || b.reteIcaAmount > 0;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Reina · Verde</Text>
            <Text style={{ fontSize: 8.5, color: "#5a564f", marginTop: 4 }}>
              Catering corporativo · Cotización
            </Text>
          </View>
          <View style={styles.meta}>
            <Text>{props.quoteNumber}</Text>
            <Text>Emitida: {props.createdAt}</Text>
            <Text>Vence: {props.expiresAt}</Text>
          </View>
        </View>

        {/* Cliente */}
        <Text style={styles.h2}>§ 01 · Cliente</Text>
        <Text>{props.client.firstName} {props.client.lastName}</Text>
        <Text style={{ color: "#5a564f", fontSize: 8.5 }}>{props.client.email}</Text>

        {/* Evento */}
        <Text style={styles.h2}>§ 02 · Evento</Text>
        <View style={styles.rowMuted}>
          <Text style={styles.label}>Fecha</Text>
          <Text>{props.event.date} · {props.event.time}</Text>
        </View>
        <View style={styles.rowMuted}>
          <Text style={styles.label}>Ciudad</Text>
          <Text>{props.event.city}</Text>
        </View>
        <View style={styles.rowMuted}>
          <Text style={styles.label}>Dirección</Text>
          <Text>{props.event.address}</Text>
        </View>
        <View style={styles.rowMuted}>
          <Text style={styles.label}>Comensales</Text>
          <Text>{props.event.guestCount}</Text>
        </View>

        {/* Items */}
        <Text style={styles.h2}>§ 03 · Composición del menú</Text>
        <View style={styles.itemHead}>
          <Text style={styles.col1}>Plato</Text>
          <Text style={styles.col2}>Cantidad</Text>
          <Text style={styles.col3}>Precio unit.</Text>
        </View>
        {props.items.map((it, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.col1}>{it.name}</Text>
            <Text style={styles.col2}>{it.quantity}</Text>
            <Text style={styles.col3}>{COP(it.unitPrice)}</Text>
          </View>
        ))}

        {/* Desglose */}
        <Text style={styles.h2}>§ 04 · Desglose de costos y margen</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Costo materia prima (CMP)</Text>
          <Text style={styles.amount}>{COP(b.cmpTotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mano de obra (CMO, factor prestacional)</Text>
          <Text style={styles.amount}>{COP(b.cmoTotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Costos indirectos (CIF)</Text>
          <Text style={styles.amount}>{COP(b.cifTotal)}</Text>
        </View>
        {b.packagingTotal > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Empaque (cajas / bandejas / biodegradables)</Text>
            <Text style={styles.amount}>{COP(b.packagingTotal)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Logística y transporte</Text>
          <Text style={styles.amount}>{COP(b.transportTotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Margen operativo</Text>
          <Text style={styles.amount}>{COP(b.marginAmount)}</Text>
        </View>
        {b.volumeDiscountAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Descuento por volumen</Text>
            <Text style={styles.amount}>− {COP(b.volumeDiscountAmount)}</Text>
          </View>
        )}
        {b.seasonalAdjustment !== 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Ajuste estacional</Text>
            <Text style={styles.amount}>
              {b.seasonalAdjustment > 0 ? "+ " : "− "}
              {COP(Math.abs(b.seasonalAdjustment))}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: "Helvetica-Bold" }]}>Base gravable</Text>
          <Text style={styles.amount}>{COP(b.taxableBase)}</Text>
        </View>

        {/* Impuestos */}
        {hasAnyTax ? (
          <>
            <Text style={styles.h2}>
              § 05 · Impuestos · Régimen {isCommon ? "Común" : "Simple (RST)"}
            </Text>
            {isCommon ? (
              <>
                {b.vatAmount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>IVA 19%</Text>
                    <Text style={styles.amount}>{COP(b.vatAmount)}</Text>
                  </View>
                )}
                {b.icaAmount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>ICA municipal</Text>
                    <Text style={styles.amount}>{COP(b.icaAmount)}</Text>
                  </View>
                )}
              </>
            ) : (
              b.simpleAmount > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Tarifa única RST</Text>
                  <Text style={styles.amount}>{COP(b.simpleAmount)}</Text>
                </View>
              )
            )}
          </>
        ) : (
          <>
            <Text style={styles.h2}>§ 05 · Régimen tributario</Text>
            <Text style={{ ...styles.label, lineHeight: 1.5 }}>
              Reina Verde no es responsable de IVA. La factura no discrimina
              impuestos y por lo tanto no hay retenciones aplicables.
            </Text>
          </>
        )}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>{COP(b.total)}</Text>
        </View>

        {/* Retenciones — solo si hay impuestos retenibles */}
        {hasAnyRetention && (
          <>
            <Text style={styles.h2}>§ 06 · Retenciones estimadas</Text>
            <Text style={styles.small}>
              Si tu empresa es agente retenedor declarante, podrá practicar las
              siguientes retenciones al momento del pago. Verificar con tu contador
              la aplicabilidad según tu condición tributaria.
            </Text>
            {isCommon && b.reteFuenteAmount > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>ReteFuente servicios (4%)</Text>
                <Text style={styles.amount}>− {COP(b.reteFuenteAmount)}</Text>
              </View>
            )}
            {isCommon && b.reteIvaAmount > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>ReteIVA (15% del IVA)</Text>
                <Text style={styles.amount}>− {COP(b.reteIvaAmount)}</Text>
              </View>
            )}
            {b.reteIcaAmount > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>ReteICA municipal</Text>
                <Text style={styles.amount}>− {COP(b.reteIcaAmount)}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={[styles.label, { fontFamily: "Helvetica-Bold" }]}>
                Neto a transferir a Reina Verde
              </Text>
              <Text style={styles.amount}>{COP(b.netReceivable)}</Text>
            </View>
          </>
        )}

        <Text style={{ ...styles.small, marginTop: 20 }}>
          Pago 100% adelantado vía Bold. Esta cotización es válida hasta {props.expiresAt}.
          Estado actual: {props.status}.
        </Text>
      </Page>
    </Document>
  );
}
