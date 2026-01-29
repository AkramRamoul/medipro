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
    fontFamily: "Amiri",
    padding: 30,
    fontSize: 10,
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    width: 100,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 4,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  colDate: { width: "15%" },
  colType: { width: "20%" },
  colContent: { flex: 1 },
});

interface PatientRecordProps {
  patient: any;
  consultations: any[];
  prescriptions: any[];
  timeline: any[];
  documents?: any[];
}

const PatientRecordPdf = ({
  patient,
  consultations,
  prescriptions,
  timeline,
  documents = [],
}: PatientRecordProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Dossier Médical</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Patient:</Text>
            <Text style={styles.value}>
              {(patient.first_name || "").toUpperCase()}{" "}
              {patient.last_name || ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Âge:</Text>
            <Text style={styles.value}>
              {patient.age ? `${patient.age} ans` : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{patient.contact || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dernière visite:</Text>
            <Text style={styles.value}>
              {patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString("fr-FR")
                : "Jamais"}
            </Text>
          </View>
        </View>

        {/* Consultations */}
        <Text style={styles.sectionTitle}>
          Consultations ({consultations.length})
        </Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colType}>Motif</Text>
            <Text style={styles.colContent}>Diagnostic & Notes</Text>
          </View>
          {consultations.map((c, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDate}>
                {new Date(c.date).toLocaleDateString("fr-FR")}
              </Text>
              <Text style={styles.colType}>{c.reason}</Text>
              <Text style={styles.colContent}>
                {c.diagnosis} {c.notes ? `\nNote: ${c.notes}` : ""}
              </Text>
            </View>
          ))}
          {consultations.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ textAlign: "center", flex: 1, padding: 10 }}>
                Aucune consultation enregistrée
              </Text>
            </View>
          )}
        </View>

        {/* Prescriptions */}
        <Text style={styles.sectionTitle}>
          Ordonnances ({prescriptions.length})
        </Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colContent}>Médicaments</Text>
          </View>
          {prescriptions.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDate}>
                {new Date(p.date).toLocaleDateString("fr-FR")}
              </Text>
              <Text style={styles.colContent}>
                {p.medications
                  ?.map(
                    (m: any) =>
                      `- ${m.medicineName} ${m.dosage} (${m.duration || ""})`,
                  )
                  .join("\n")}
              </Text>
            </View>
          ))}
          {prescriptions.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ textAlign: "center", flex: 1, padding: 10 }}>
                Aucune ordonnance enregistrée
              </Text>
            </View>
          )}
        </View>

        {/* Documents */}
        <Text style={styles.sectionTitle}>Documents ({documents.length})</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colType}>Type</Text>
            <Text style={styles.colContent}>Détails</Text>
          </View>
          {documents.map((d, i) => {
            let typeLabel = "Document";
            let details = "Détails non disponibles";

            if (d.type === "blood") {
              typeLabel = "Analyse de sang";
              if (d.content?.results && Array.isArray(d.content.results)) {
                details = d.content.results.join(", ");
              }
            } else if (d.type === "certificate") {
              typeLabel = "Certificat médical";
              if (d.content?.diagnosis) {
                details = `Diagnostic: ${d.content.diagnosis}`;
                if (d.content.restStartDate && d.content.restEndDate) {
                  details += `\nRepos: ${new Date(d.content.restStartDate).toLocaleDateString("fr-FR")} - ${new Date(d.content.restEndDate).toLocaleDateString("fr-FR")}`;
                }
              }
            } else if (d.type === "report") {
              typeLabel = "Compte rendu";
              if (d.content?.diagnostic) {
                details = `Diagnostic: ${d.content.diagnostic}`;
                if (d.content.traitement) {
                  details += `\nTraitement: ${d.content.traitement}`;
                }
              }
            }

            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDate}>
                  {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                </Text>
                <Text style={styles.colType}>{typeLabel}</Text>
                <Text style={styles.colContent}>{details}</Text>
              </View>
            );
          })}
          {documents.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ textAlign: "center", flex: 1, padding: 10 }}>
                Aucun document enregistré
              </Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Chronologie Complète</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colType}>Type</Text>
            <Text style={styles.colContent}>Détails</Text>
          </View>
          {timeline.map((e, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDate}>
                {new Date(e.date).toLocaleDateString("fr-FR")}
              </Text>
              <Text style={styles.colType}>{e.type}</Text>
              <Text style={styles.colContent}>
                {e.summary}
                {e.details ? `\n${e.details}` : ""}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PatientRecordPdf;
