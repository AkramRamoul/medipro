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
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  colDate: {
    width: "15%",
    paddingRight: 4,
  },
  colType: {
    width: "20%",
    paddingRight: 4,
  },
  colContent: {
    flex: 1,
  },
  cellText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
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
            <View style={styles.colDate}>
              <Text>Date</Text>
            </View>
            <View style={styles.colType}>
              <Text>Motif</Text>
            </View>
            <View style={styles.colContent}>
              <Text>Diagnostic & Notes</Text>
            </View>
          </View>
          {consultations.map((c, i) => {
            const vitals = [];
            if (c.bloodPressure) vitals.push(`TA: ${c.bloodPressure}`);
            if (c.glucose) vitals.push(`Glycémie: ${c.glucose} g/L`);
            if (c.weight) vitals.push(`Poids: ${c.weight} kg`);

            // Format custom fields if they exist
            let customFieldsText = "";
            if (c.customFields && typeof c.customFields === 'object') {
              const entries = Object.entries(c.customFields);
              if (entries.length > 0) {
                customFieldsText = entries.map(([key, value]) => `${key}: ${value}`).join(", ");
              }
            }

            return (
              <View key={i} style={styles.tableRow}>
                <View style={styles.colDate}>
                  <Text>
                    {new Date(c.date).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
                <View style={styles.colType}>
                  <Text style={{ fontWeight: 'bold' }}>{c.reason}</Text>
                  {c.symptoms && (
                    <Text style={{ fontSize: 8, color: '#444', marginTop: 2 }}>
                      Symptômes: {c.symptoms}
                    </Text>
                  )}
                </View>
                <View style={styles.colContent}>
                  <Text style={{ fontWeight: 'bold' }}>Diagnostic: {c.diagnosis}</Text>
                  {c.notes ? <Text>Note: {c.notes}</Text> : null}

                  {vitals.length > 0 && (
                    <Text style={{ marginTop: 4, fontSize: 9, color: '#333' }}>
                      Constantes: {vitals.join(" | ")}
                    </Text>
                  )}

                  {customFieldsText ? (
                    <Text style={{ marginTop: 2, fontSize: 9, color: '#333' }}>
                      Autres: {customFieldsText}
                    </Text>
                  ) : null}
                </View>
              </View>
            )
          })}
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
            <View style={styles.colDate}>
              <Text>Date</Text>
            </View>
            <View style={styles.colContent}>
              <Text>Médicaments</Text>
            </View>
          </View>
          {prescriptions.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colDate}>
                <Text>
                  {new Date(p.date).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <View style={styles.colContent}>
                <Text>
                  {p.medications
                    ?.map(
                      (m: any) =>
                        `- ${m.medicineName} ${m.dosage} (${m.duration || ""})`,
                    )
                    .join("\n")}
                </Text>
              </View>
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
        {(() => {
          // Filter to only include certificates and bilans (blood tests)
          const filteredDocuments = documents.filter(
            (d) => d.type === "certificate" || d.type === "blood"
          );

          return (
            <>
              <Text style={styles.sectionTitle}>Documents ({filteredDocuments.length})</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.colDate}>
                    <Text>Date</Text>
                  </View>
                  <View style={styles.colType}>
                    <Text>Type</Text>
                  </View>
                  <View style={styles.colContent}>
                    <Text>Détails</Text>
                  </View>
                </View>
                {filteredDocuments.map((d, i) => {
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
                  }

                  return (
                    <View key={i} style={styles.tableRow}>
                      <View style={styles.colDate}>
                        <Text>
                          {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </Text>
                      </View>
                      <View style={styles.colType}>
                        <Text>{typeLabel}</Text>
                      </View>
                      <View style={styles.colContent}>
                        <Text>{details}</Text>
                      </View>
                    </View>
                  );
                })}
                {filteredDocuments.length === 0 && (
                  <View style={styles.tableRow}>
                    <Text style={{ textAlign: "center", flex: 1, padding: 10 }}>
                      Aucun document enregistré
                    </Text>
                  </View>
                )}
              </View>
            </>
          );
        })()}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Chronologie Complète</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colDate}>
              <Text>Date</Text>
            </View>
            <View style={styles.colType}>
              <Text>Type</Text>
            </View>
            <View style={styles.colContent}>
              <Text>Détails</Text>
            </View>
          </View>
          {timeline.map((e, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colDate}>
                <Text>
                  {new Date(e.date).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <View style={styles.colType}>
                <Text>{e.type}</Text>
              </View>
              <View style={styles.colContent}>
                <Text>
                  {e.summary}
                  {e.details ? `\n${e.details}` : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PatientRecordPdf;
