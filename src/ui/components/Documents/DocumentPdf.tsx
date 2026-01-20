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
import { document } from "../../../electron/schema";

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

const DocumentPdf = ({
  first_name,
  last_name,
  patientAge,
  prescriptionModel,
  image,
  documentContent,
  documentType,
}: {
  first_name: string;
  last_name: string;
  patientAge: number;
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
  documentContent: document["content"];
  documentType: document["type"];
}) => {
  const labels = {
    blood: "Demande Bilan",
    certificate: "Certificat de travail",
    report: "Rapport médical",
  } as const;

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
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={styles.headerfr}>{prescriptionModel.nameFr}</Text>
            <Text style={styles.colLeft}>{prescriptionModel.specialtyFr}</Text>
            {(JSON.parse(prescriptionModel.servicesFr) as string[]).map(
              (srv: string, idx: number) => (
                <Text key={idx} style={styles.colLeft}>
                  {srv}
                </Text>
              ),
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
              ),
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
              Nom : {first_name} {last_name}
            </Text>
            <Text style={styles.infoPatient}>Âge : {patientAge} Ans</Text>
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
          </View>
        </View>

        <Text style={styles.title}>{labels[documentType]}</Text>

        <View style={{ marginTop: 8, gap: 6 }}>
          {documentType === "blood" ? (
            <View style={{ gap: 4 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any)?.results?.map(
                (item: string, index: number) => (
                  <Text key={index} style={{ fontSize: 14 }}>
                    - {item}
                  </Text>
                ),
              )}
            </View>
          ) : documentType === "certificate" ? (
            <View style={{ marginTop: 20, gap: 10 }}>
              <Text style={{ fontSize: 12, lineHeight: 1.5 }}>
                Je soussigné(e), Dr {prescriptionModel.nameFr}, certifie avoir
                examiné ce jour le patient
                <Text style={{ fontWeight: "bold" }}>
                  {" "}
                  {first_name} {last_name}{" "}
                </Text>
                âgé de {patientAge} ans.
              </Text>

              <Text style={{ fontSize: 12, lineHeight: 1.5 }}>
                Son état de santé nécessite un repos de maladie à partir du :{" "}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(documentContent as any).restStartDate} au{" "}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(documentContent as any).restEndDate} inclus.
              </Text>

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any).diagnosis && (
                <Text style={{ fontSize: 12, marginTop: 10 }}>
                  <Text
                    style={{ fontWeight: "bold", textDecoration: "underline" }}
                  >
                    Diagnostic :
                  </Text>{" "}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(documentContent as any).diagnosis}
                </Text>
              )}

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any).remarks && (
                <Text style={{ fontSize: 12, marginTop: 5 }}>
                  <Text
                    style={{ fontWeight: "bold", textDecoration: "underline" }}
                  >
                    Remarques :
                  </Text>{" "}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(documentContent as any).remarks}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 15, gap: 8 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any).examenClinique && (
                <View style={{ marginTop: 6 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      marginBottom: 2,
                      textDecoration: "underline",
                    }}
                  >
                    Examen clinique :
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 1.4 }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(documentContent as any).examenClinique}
                  </Text>
                </View>
              )}

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any).diagnostic && (
                <View style={{ marginTop: 6 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      marginBottom: 2,
                      textDecoration: "underline",
                    }}
                  >
                    Diagnostic :
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 1.4 }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(documentContent as any).diagnostic}
                  </Text>
                </View>
              )}

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(documentContent as any).traitement && (
                <View style={{ marginTop: 6 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      marginBottom: 2,
                      textDecoration: "underline",
                    }}
                  >
                    Traitement :
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 1.4 }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(documentContent as any).traitement}
                  </Text>
                </View>
              )}
            </View>
          )}
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

export default DocumentPdf;
