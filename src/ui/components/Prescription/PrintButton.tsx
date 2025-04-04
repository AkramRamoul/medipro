import { pdf } from "@react-pdf/renderer";
import PrescriptionPDF from "../Patient/Pdf"; // Make sure this path is correct

const PrintButton = ({ patient }) => {
  const handlePrint = async () => {
    try {
      const blob = await pdf(<PrescriptionPDF patient={patient} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);

      const newTab = window.open(blobUrl, "_blank");

      if (newTab) {
        // Use a short delay to ensure print works on slow-loading tabs
        newTab.onload = () => {
          setTimeout(() => {
            newTab.print();
            newTab.onafterprint = () => newTab.close();
          }, 500); // Adjust delay if needed
        };
      } else {
        alert("Popup blocked. Please allow popups for this site.");
      }
    } catch (error) {
      console.error("Failed to generate or print PDF:", error);
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Print Prescription
    </button>
  );
};

export default PrintButton;
