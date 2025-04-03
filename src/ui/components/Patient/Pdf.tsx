import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

const PDF = ({ patient }) => {
  const generatePrescription = () => {
    const docDefinition = {
      content: [
        { text: "Dr. LAROUN CH ep. CHEHAD", style: "header" },
        {
          text: "Maitre Assistante Spécialiste en Dermatologie",
          style: "subheader",
        },
        {
          text: "Maladie de Peau, des Ongles et des Cheveux",
          fontSize: 10,
          margin: [0, 5],
        },
        { text: "Cryothérapie - Peeling - Epilation Laser", fontSize: 10 },
        { text: "N° Inscription : 25 / 8033", fontSize: 10, margin: [0, 10] },
        {
          text: "___________________________________________",
          margin: [0, 20],
          alignment: "center",
        },
        {
          columns: [
            { text: `Nom: ${patient.last_name}`, bold: true },
            { text: `Prénom: ${patient.first_name}`, bold: true },
            { text: `Âge: ${patient.age} Ans`, bold: true },
          ],
        },
        { text: "ORDONNANCE", style: "title", margin: [0, 10] },

        { text: "Médicaments:", style: "sectionHeader", margin: [0, 10] },

        { text: "Signature", alignment: "right", margin: [0, 20] },
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: "center" },
        subheader: { fontSize: 12, alignment: "center", margin: [0, 5] },
        title: { fontSize: 14, bold: true, alignment: "center" },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 5] },
      },
    };

    pdfMake.createPdf(docDefinition).open(); // Opens the PDF in a new tab
  };

  return (
    <div className="p-5 border rounded bg-white shadow-md w-96">
      <h2 className="text-xl font-bold">Prescription</h2>
      <p>
        <strong>Patient:</strong> {patient.first_name} {patient.last_name}
      </p>
      <p>
        <strong>Age:</strong> {patient.age}
      </p>
      <p>
        <strong>Medications:</strong>
      </p>

      <button
        onClick={generatePrescription}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Print Prescription
      </button>
    </div>
  );
};

export default PDF;
