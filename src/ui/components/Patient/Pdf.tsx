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
import { smallPatient } from "../../type";
import { PrescriptionMed } from "../../../electron/schema";

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
    fontFamily: "Amiri",
    direction: "rtl",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerfr: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
  },
  headerar: {
    fontSize: 12,
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
    marginVertical: 5,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    textDecoration: "underline",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
  },
});

const PrescriptionPDF = ({
  patient,
  prescriptionModel,
  image,
  medications,
}: {
  patient: smallPatient;
  prescriptionModel: {
    nameFr: string;
    nameAr: string;
    specialtyFr: string;
    specialtyAr: string;
    servicesFr: string;
    servicesAr: string;
    inscriptionNumber: string;
    address: string;
    phoneNumber1: string | undefined;
    phoneNumber2: string | undefined;
    city: string;
  };
  image: string | null;
  medications: PrescriptionMed[];
}) => {
  console.log(prescriptionModel);
  console.log("medications", medications);
  return (
    <Document>
      <Page size={{ width: 419.53, height: 595.28 }} style={styles.page}>
        {image && (
          <Image
            src={image}
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              width: "50%",
              height: "50%",
              opacity: 0.1,
              objectFit: "contain",
            }}
          />
        )}

        {/* HEADER SECTION */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 5,
          }}
        >
          {/* Left side: French */}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.headerfr}>{prescriptionModel.nameFr}</Text>
            <Text style={styles.colLeft}>{prescriptionModel.specialtyFr}</Text>
            {(JSON.parse(prescriptionModel.servicesFr) as string[]).map(
              (srv: string, idx: number) => (
                <Text key={idx} style={styles.colLeft}>
                  {srv}
                </Text>
              )
            )}
          </View>

          {/* Center image */}
          {image && (
            <View
              style={{
                width: 70,
                height: 70,
                marginHorizontal: 6,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src={image}
                style={{ width: 60, height: 60, objectFit: "contain" }}
              />
            </View>
          )}

          {/* Right side: Arabic */}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.headerar}>{prescriptionModel.nameAr}</Text>
            <Text style={styles.colRight}>{prescriptionModel.specialtyAr}</Text>
            {(JSON.parse(prescriptionModel.servicesAr) as string[]).map(
              (srv: string, idx: number) => (
                <Text key={idx} style={styles.colRight}>
                  {srv}
                </Text>
              )
            )}
          </View>
        </View>

        {/* Inscription number */}
        <Text style={styles.colCenter}>
          N° Inscription : {prescriptionModel.inscriptionNumber}
        </Text>

        {/* Divider */}
        <View style={styles.line} />

        {/* PATIENT INFO */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <View style={{ flexDirection: "column", gap: 2 }}>
            <Text style={styles.infoPatient}>
              Nom : {patient.first_name} {patient.last_name}
            </Text>
            <Text style={styles.infoPatient}>Âge : {patient.age} Ans</Text>
          </View>

          <View
            style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}
          >
            <Text style={styles.infoPatient}>
              {prescriptionModel.city}, le : {formatDate(new Date())}
            </Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>ORDONNANCE</Text>

        {/* PRESCRIPTION CONTENT */}
        <View style={{ marginTop: 8, gap: 6 }}>
          {medications.map((med, index) => (
            <View key={index}>
              <Text style={{ fontSize: 10 }}>
                - {med.medicineName} {med.form ? `${med.form}` : ""}{" "}
                {med.dosage} {med.quantity ? `${med.quantity}` : ""}{" "}
                {med.duration ? `${med.duration}` : ""}
                {med.note}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 30,
            right: 30,
            borderTopWidth: 1,
            borderColor: "#aaa",
            paddingTop: 4,
            fontSize: 8,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          <Text>{prescriptionModel.address}</Text>
          <Text>
            Tél. : {prescriptionModel.phoneNumber1} Mob. :{" "}
            {prescriptionModel.phoneNumber2}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionPDF;
