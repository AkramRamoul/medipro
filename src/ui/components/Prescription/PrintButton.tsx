import { pdf } from "@react-pdf/renderer";
import PrescriptionPDF from "../Patient/Pdf"; // Import your PDF component

const PrintButton = ({ patient, window }) => {
  const handlePrint = async () => {
    const blob = await pdf(<PrescriptionPDF patient={patient} />).toBlob();
    const url = URL.createObjectURL(blob);

    // Create an object URL for the generated PDF
    const newTab = window.open(url);

    // Automatically print when the PDF has loaded
    if (newTab) {
      newTab.onload = () => {
        // This method is where we set the print options, such as paper size
        newTab.print();

        // Customizing print settings
        const printOptions = {
          pageSize: "A5", // Set the paper size to A5
          landscape: false, // Set to false for portrait orientation
          marginsType: 0, // Default margin
        };

        // Triggering printing automatically with custom options
        newTab.webContents.print(printOptions);

        newTab.onafterprint = () => {
          newTab.close(); // Close the window after printing
        };
      };
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Print Prescription
    </button>
  );
};

export default PrintButton;
