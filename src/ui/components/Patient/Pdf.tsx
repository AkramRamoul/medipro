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
import { Patient } from "../../type";

// Register Amiri font
Font.register({
  family: "Amiri",
  fonts: [{ src: AmiriRegular }, { src: AmiriBold, fontWeight: "bold" }],
});

// Date helper
const formatDate = (date: string | number | Date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Amiri",
    direction: "rtl",
  },
  headerfr: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
  },
  headerar: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 5,
  },
  subheader: {
    fontSize: 10,
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
    textDecoration: "underline",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 10,
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
    fontSize: 8,
  },
  colRight: {
    textAlign: "right",
    fontSize: 8,
  },
  colCenter: {
    textAlign: "center",
    fontSize: 8,
  },
  infoPatient: {
    fontSize: 10,
    marginVertical: 2,
    textAlign: "left",
  },
});

const PrescriptionPDF = ({ patient }: { patient: Patient }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.row}>
        <Text style={styles.headerfr}>Dr. LAROUN CH ep. CHEHAD</Text>
        <Text style={styles.headerar}>الدكتورة لارون ش. شحاد</Text>
      </View>

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

      {/* Patient Information */}
      <View style={styles.row}>
        <Text style={styles.infoPatient}>Nom : {patient?.last_name}</Text>
        <Text style={styles.infoPatient}>Prénom : {patient?.first_name}</Text>
        <Text style={styles.infoPatient}>Âge : {patient?.age}</Text>
        <Text style={styles.infoPatient}>le : {formatDate(new Date())}</Text>
      </View>

      <Text style={styles.title}>ORDONNANCE</Text>
    </Page>
  </Document>
);

export default PrescriptionPDF;
