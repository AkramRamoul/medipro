import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import AmiriRegular from "/fonts/Amiri-Regular.ttf";
import AmiriBold from "/fonts/Amiri-Bold.ttf";

Font.register({
  family: "Amiri",
  fonts: [{ src: AmiriRegular }, { src: AmiriBold, fontWeight: "bold" }],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Amiri",
    direction: "rtl",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subheader: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 5,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  colLeft: {
    textAlign: "left",
    fontSize: 10,
  },
  colRight: {
    textAlign: "right",
    fontSize: 10,
  },
  colCenter: {
    textAlign: "center",
    fontSize: 10,
  },
});

const PrescriptionPDF = ({ patient }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      {" "}
      {/* Changed to A5 size */}
      <Text style={styles.header}>Dr. LAROUN CH ep. CHEHAD</Text>
      <Text style={styles.header}>الدكتورة لارون ش. شحاد</Text>
      <View style={styles.row}>
        <Text style={styles.colLeft}>
          Maitre Assistante Spécialiste en Dermatologie
        </Text>
        <Text style={styles.colRight}>
          أستاذة مساعدة متخصصة في الأمراض الجلدية
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLeft}>
          Maladie de Peau, des Ongles et des Cheveux
        </Text>
        <Text style={styles.colRight}>أمراض الجلد والأظافر والشعر</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLeft}>
          Cryothérapie - Peeling - Epilation Laser
        </Text>
        <Text style={styles.colRight}>
          العلاج بالتبريد - التقشير - إزالة الشعر بالليزر
        </Text>
      </View>
      <Text style={styles.colCenter}>N° Inscription : 25 / 8033</Text>
      <View style={styles.line} />
      <Text style={styles.title}>ORDONNANCE</Text>
    </Page>
  </Document>
);

export default PrescriptionPDF;
