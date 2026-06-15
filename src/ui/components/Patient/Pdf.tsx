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
import { formatAge } from "../../lib/ageUtils";

Font.register({
  family: "Amiri",
  fonts: [{ src: AmiriRegular }, { src: AmiriBold, fontWeight: "bold" }],
});

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
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerfr: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 4,
  },
  headerar: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 4,
  },
  colLeft: {
    textAlign: "left",
    fontSize: 7.5,
    lineHeight: 1.2,
  },
  colRight: {
    textAlign: "right",
    fontSize: 7.5,
    lineHeight: 1.2,
  },
  colCenter: {
    textAlign: "center",
    fontSize: 8,
  },
  infoPatient: {
    fontSize: 9,
    marginVertical: 1,
    textAlign: "left",
  },
  line: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    marginVertical: 8,
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
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
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
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
}) => {
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const medicationChunks = chunkArray(medications, 6);

  return (
    <Document>
      {medicationChunks.map((chunk, pageIndex) => (
        <Page size="A5" style={styles.page} key={pageIndex}>
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
              alignItems: "stretch", // Changed from flex-start to stretch for better alignment
              marginBottom: 10,
              minHeight: 80,
            }}
          >
            {/* Left side: French */}
            <View style={{ flex: 1.2, gap: 1 }}>
              {" "}
              {/* Increased flex to give more room */}
              <Text style={styles.headerfr}>{prescriptionModel.nameFr}</Text>
              <Text style={styles.colLeft}>
                {prescriptionModel.specialtyFr}
              </Text>
              {(JSON.parse(prescriptionModel.servicesFr) as string[]).map(
                (srv: string, idx: number) => (
                  <Text key={idx} style={styles.colLeft}>
                    {srv}
                  </Text>
                ),
              )}
            </View>

            {/* Center image - Optimized width */}
            {image && (
              <View
                style={{
                  width: 55, // Reduced from 70
                  marginHorizontal: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0, // Ensure it doesn't shrink
                }}
              >
                <Image
                  src={image}
                  style={{ width: 50, height: 50, objectFit: "contain" }}
                />
              </View>
            )}

            {/* Right side: Arabic */}
            <View style={{ flex: 1.2, gap: 2 }}>
              {" "}
              {/* Increased flex to give more room */}
              <Text style={styles.headerar}>{prescriptionModel.nameAr}</Text>
              <Text style={styles.colRight}>
                {prescriptionModel.specialtyAr}
              </Text>
              {(JSON.parse(prescriptionModel.servicesAr) as string[]).map(
                (srv: string, idx: number) => (
                  <Text key={idx} style={styles.colRight}>
                    {srv}
                  </Text>
                ),
              )}
            </View>
          </View>
          {/* Inscription number */}
          <Text style={styles.colCenter}>
            N° Order : {prescriptionModel.inscriptionNumber}
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
                Nom : {patient?.first_name} {patient?.last_name}
              </Text>
              <Text style={styles.infoPatient}>
                Âge : {formatAge(patient?.dateOfBirth, patient?.age)}
              </Text>
              {isPsychotropic && patientAddress && (
                <Text style={styles.infoPatient}>
                  Adresse : {patientAddress}
                </Text>
              )}
            </View>

            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <Text style={styles.infoPatient}>
                {prescriptionModel.city}, le : {formatDate(new Date())}
              </Text>
              {isPsychotropic && psychotropicNumber && (
                <Text style={styles.infoPatient}>
                  Numero de serie : {psychotropicNumber}
                </Text>
              )}
            </View>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>ORDONNANCE</Text>

          {/* PRESCRIPTION CONTENT */}
          <View style={{ marginTop: 8, gap: 6 }}>
            {chunk.map((med, index) => (
              <View key={index} style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10 }}>
                      {med.medicineName}
                      {med.form ? ` ${med.form} ` : ""}
                      {med.dosage ? ` ${med.dosage} ` : ""}
                    </Text>
                  </View>
                  <View style={{ flexShrink: 0 }}>
                    <Text style={{ fontSize: 10 }}>
                      {med.quantity ? `( ${med.quantity} )` : ""}
                      {med.duration ? ` ( ${med.duration} )` : ""}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, marginLeft: 12 }}>{med.note}</Text>
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
      ))}
    </Document>
  );
};

export default PrescriptionPDF;
