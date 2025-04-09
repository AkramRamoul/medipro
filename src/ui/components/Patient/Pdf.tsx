import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

import AmiriRegular from "/fonts/Amiri-Regular.ttf";
import AmiriBold from "/fonts/Amiri-Bold.ttf";
import { Patient } from "../../type";

// Register Amiri font
Font.register({
  family: "Amiri",
  fonts: [{ src: AmiriRegular }, { src: AmiriBold, fontWeight: "bold" }],
});

// Date formatting helper
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
});

const PrescriptionPDF = ({
  patient,
  prescriptionModel,
  image,
}: {
  patient: Patient;
  prescriptionModel: {
    nameFr: string;
    nameAr: string;
    specialtyFr: string;
    specialtyAr: string;
    servicesFr: string;
    servicesAr: string;
    inscriptionNumber: string;
  };
  image: string | null;
}) => {
  const servicesFr = JSON.parse(prescriptionModel.servicesFr);
  const servicesAr = JSON.parse(prescriptionModel.servicesAr);

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.headerfr}>{prescriptionModel.nameFr}</Text>
          <Text style={styles.headerar}>{prescriptionModel.nameAr}</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.colLeft}>{prescriptionModel.specialtyFr}</Text>
          <Text style={styles.colRight}>{prescriptionModel.specialtyAr}</Text>
        </View>

        {servicesFr.map((service: string, idx: number) => (
          <View
            key={idx}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.colLeft}>{service}</Text>
            <Text style={styles.colRight}>{servicesAr[idx]}</Text>
          </View>
        ))}

        <Text style={styles.colCenter}>
          N° Inscription : {prescriptionModel.inscriptionNumber}
        </Text>
        {image && (
          <View style={{ marginVertical: 10, alignItems: "center" }}>
            <Image
              src={image}
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
          </View>
        )}

        <View style={styles.line} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <Text style={styles.infoPatient}>Nom : {patient?.last_name}</Text>
          <Text style={styles.infoPatient}>Prénom : {patient?.first_name}</Text>
          <Text style={styles.infoPatient}>Âge : {patient?.age}</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Text style={styles.infoPatient}>le : {formatDate(new Date())}</Text>
        </View>

        <Text style={styles.title}>ORDONNANCE</Text>
      </Page>
    </Document>
  );
};

export default PrescriptionPDF;
