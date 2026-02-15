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

Font.register({
  family: "Amiri",
  fonts: [{ src: AmiriRegular }, { src: AmiriBold, fontWeight: "bold" }],
});

// We'll use standard fonts for Sans-Serif as react-pdf doesn't have Inter by default unless registered.
// For now, we'll stick to the registered Amiri or fallback to Helvetica for Sans.

const styles = StyleSheet.create({
  page: {
    fontFamily: "Amiri",
    direction: "rtl",
    paddingVertical: 10,
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

const EmptyPrescriptionPDF = ({
  prescriptionModel,
  image,
}: {
  prescriptionModel: {
    nameFr: string;
    nameAr: string;
    specialtyFr: string;
    specialtyAr: string;
    servicesFr: string;
    servicesAr: string;
    inscriptionNumber: string;
    address: string;
    phoneNumber1?: string;
    phoneNumber2?: string;
    city: string;
    accentColor?: string;
    fontFamily?: "serif" | "sans-serif";
  };
  image: string | null;
}) => {
  return (
    <Document>
      <Page size={{ width: 419.53, height: 595.28 }} style={[
        styles.page,
        { fontFamily: prescriptionModel.fontFamily === "sans-serif" ? "Helvetica" : "Amiri" }
      ]}>
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

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            marginBottom: 10,
            minHeight: 80,
          }}
        >
          <View style={{ flex: 1.2, gap: 1 }}>
            <Text style={[styles.headerfr, { color: prescriptionModel.accentColor || "#000000" }]}>{prescriptionModel.nameFr}</Text>
            <Text style={styles.colLeft}>{prescriptionModel.specialtyFr}</Text>
            {(JSON.parse(prescriptionModel.servicesFr) as string[]).map(
              (srv, idx) => (
                <Text key={idx} style={styles.colLeft}>
                  {srv}
                </Text>
              )
            )}
          </View>

          {image && (
            <View
              style={{
                width: 55,
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Image
                src={image}
                style={{ width: 50, height: 50, objectFit: "contain" }}
              />
            </View>
          )}

          <View style={{ flex: 1.2, gap: 2 }}>
            <Text style={[styles.headerar, { color: prescriptionModel.accentColor || "#000000" }]}>{prescriptionModel.nameAr}</Text>
            <Text style={styles.colRight}>{prescriptionModel.specialtyAr}</Text>
            {(JSON.parse(prescriptionModel.servicesAr) as string[]).map(
              (srv, idx) => (
                <Text key={idx} style={styles.colRight}>
                  {srv}
                </Text>
              )
            )}
          </View>
        </View>

        <Text style={styles.colCenter}>
          N° Inscription : {prescriptionModel.inscriptionNumber}
        </Text>

        <View style={styles.line} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          {/* LEFT SIDE */}
          <View style={{ width: "60%", gap: 2 }}>
            <Text style={styles.infoPatient}>
              Nom : ........................................
            </Text>
            <Text style={styles.infoPatient}>Âge : ...........</Text>
          </View>

          {/* RIGHT SIDE */}
          <View style={{ width: "40%", alignItems: "flex-end", gap: 2 }}>
            <Text style={styles.infoPatient}>
              {prescriptionModel.city}, le : ....................
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: prescriptionModel.accentColor || "#000000" }]}>ORDONNANCE</Text>

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
            Tél. : {prescriptionModel.phoneNumber1 || ""} Mob. :{" "}
            {prescriptionModel.phoneNumber2 || ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default EmptyPrescriptionPDF;
