//p printable

import React from "react";
import { PrescriptionMed } from "../../electron/schema";
import { smallPatient } from "../type";

interface PrescriptionPrintableProps {
  patient: smallPatient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prescriptionModel: any;
  image: string | null;
  medications: PrescriptionMed[];
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  prescriptionDate?: string | null;
}

const MEDS_PER_PAGE = 10;

const PrescriptionPrintable: React.FC<PrescriptionPrintableProps> = ({
  patient,
  prescriptionModel,
  image,
  medications,
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
  prescriptionDate,
}) => {
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const servicesFr = JSON.parse(prescriptionModel.servicesFr || "[]");
  const servicesAr = JSON.parse(prescriptionModel.servicesAr || "[]");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const accentColor = prescriptionModel.accentColor || "#000000";
  const fontFamily = prescriptionModel.fontFamily === "sans-serif" ? "sans-serif" : "'Amiri', serif";

  const doctorNameFontSize = prescriptionModel.doctorNameFontSize ?? 14;
  const specialtyFontSize = prescriptionModel.specialtyFontSize ?? 10;
  const titleFontSize = prescriptionModel.titleFontSize ?? 18;
  const bodyFontSize = prescriptionModel.bodyFontSize ?? 12;
  const logoSize = prescriptionModel.logoSize ?? 60;
  const watermarkOpacity = (prescriptionModel.watermarkOpacity ?? 10) / 100;
  const dividerStyle = prescriptionModel.dividerStyle || "solid";
  const titleText = prescriptionModel.titleText || "ORDONNANCE";
  const showInscriptionNumber = prescriptionModel.showInscriptionNumber ?? true;
  const templateLayout: string = prescriptionModel.templateLayout || "bilingual";

  // Split medications into chunks of MEDS_PER_PAGE
  const medicationChunks: PrescriptionMed[][] = [];
  for (let i = 0; i < medications.length; i += MEDS_PER_PAGE) {
    medicationChunks.push(medications.slice(i, i + MEDS_PER_PAGE));
  }
  const totalPages = medicationChunks.length;

  const styles = `
    @page { size: A5; margin: 0; }
    @font-face {
      font-family: 'Amiri';
      src: url('${origin}/fonts/Amiri-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'Amiri';
      src: url('${origin}/fonts/Amiri-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
    body { font-family: ${fontFamily}; font-size: ${bodyFontSize}px; margin: 0; padding: 0; }
    .prescription-page { padding: 10px 20px; position: relative; }
    .prescription-page + .prescription-page { page-break-before: always; }
    /* Bilingual (default) */
    .header { margin-bottom: ${Math.max(20, logoSize * 0.35)}px; position: relative; min-height: ${Math.max(100, logoSize + 30)}px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { text-align: left; width: 40%; }
    .header-right { text-align: right; width: 40%; direction: rtl; }
    .header-center { text-align: center; width: 20%; position: absolute; left: 40%; top: 0; }
    /* Single-lang side-by-side */
    .header-single { margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; display: flex; justify-content: space-between; align-items: flex-start; }
    .col-fr { text-align: left; flex: 1; }
    .col-ar { text-align: right; direction: rtl; flex: 1; }
    .col-logo-side { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; flex-shrink: 0; width: ${logoSize + 20}px; }
    /* Letterhead panel (fr-logo-left / ar-logo-right) */
    .header-panel { display: flex; align-items: stretch; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; }
    .panel-logo-left { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-right: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-logo-right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-left: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-text-fr { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: left; }
    .panel-text-ar { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: right; direction: rtl; }
    .panel-inscription { margin-top: 4px; font-size: 9px; text-align: center; color: ${accentColor}; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #444; }
    .service { font-size: ${specialtyFontSize}px; color: #666; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 3px double #666;` : `border-bottom: 1px ${dividerStyle} #666;`} margin: 10px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; }
    .document-info { text-align: right; }
    .title { text-align: center; font-size: ${titleFontSize}px; font-weight: bold; text-decoration: underline; margin: 10px 0 20px 0; color: ${accentColor}; }
    .page-indicator { text-align: center; font-size: 10px; color: #888; margin-top: -15px; margin-bottom: 10px; }
    .medications { margin-top: 20px; font-size: ${bodyFontSize}px; }
    .medication-item { margin-bottom: 12px; display: flex; flex-direction: column; }
    .med-header { display: flex; justify-content: space-between; font-weight: bold; }
    .med-note { margin-top: 2px; font-style: italic; color: #555; margin-left: 10px; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 11px; }
  `;

  // Sub-content blocks reused across templates
  const frContent = (
    <>
      <div className="doctor-name">{prescriptionModel.nameFr}</div>
      <div className="specialty">{prescriptionModel.specialtyFr}</div>
      {servicesFr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
    </>
  );
  const arContent = (
    <>
      <div className="doctor-name">{prescriptionModel.nameAr}</div>
      <div className="specialty">{prescriptionModel.specialtyAr}</div>
      {servicesAr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
    </>
  );
  const logoContent = (
    <>
      {image && <img src={image} className="logo" alt="Logo" />}
      {showInscriptionNumber && (
        <div style={{ marginTop: 5, fontSize: 9, textAlign: "center", color: accentColor }}>
          N° Order : {prescriptionModel.inscriptionNumber}
        </div>
      )}
    </>
  );

  const renderHeader = () => {
    switch (templateLayout) {
      case "fr-only":
        return (
          <div className="header-single">
            <div className="col-fr">{frContent}</div>
            <div className="col-logo-side">{logoContent}</div>
          </div>
        );
      case "ar-only":
        return (
          <div className="header-single">
            <div className="col-logo-side">{logoContent}</div>
            <div className="col-ar">{arContent}</div>
          </div>
        );
      case "fr-logo-left":
        return (
          <div className="header-panel">
            <div className="panel-logo-left">{logoContent}</div>
            <div className="panel-text-fr">{frContent}</div>
          </div>
        );
      case "ar-logo-right":
        return (
          <div className="header-panel">
            <div className="panel-text-ar">{arContent}</div>
            <div className="panel-logo-right">{logoContent}</div>
          </div>
        );
      case "bilingual":
      default:
        return (
          <div className="header">
            <div className="header-left">{frContent}</div>
            <div className="header-center">{logoContent}</div>
            <div className="header-right">{arContent}</div>
          </div>
        );
    }
  };

  const renderPatientAndDivider = () => (
    <>
      <div className="divider" />
      <div className="patient-info">
        <div className="patient-details">
          <div><strong>Nom :</strong> {patient.first_name} {patient.last_name}</div>
          <div><strong>Âge :</strong> {patient.age} Ans</div>
          {isPsychotropic && patientAddress && (
            <div><strong>Adresse :</strong> {patientAddress}</div>
          )}
        </div>
        <div className="document-info">
          <div>{prescriptionModel.city}, le : {formatDate(prescriptionDate ? new Date(prescriptionDate) : new Date())}</div>
          {isPsychotropic && psychotropicNumber && (
            <div><strong>Numero de serie :</strong> {psychotropicNumber}</div>
          )}
        </div>
      </div>
    </>
  );

  const renderFooter = () => (
    <div className="footer">
      <div>{prescriptionModel.address}</div>
      {(prescriptionModel.phoneNumber1 || prescriptionModel.phoneNumber2) && (
        <div>
          {prescriptionModel.phoneNumber1 && `Tél. : ${prescriptionModel.phoneNumber1}`}
          {prescriptionModel.phoneNumber1 && prescriptionModel.phoneNumber2 && " "}
          {prescriptionModel.phoneNumber2 && `Mob. : ${prescriptionModel.phoneNumber2}`}
        </div>
      )}
    </div>
  );

  return (
    <html>
      <head>
        <style>{styles}</style>
      </head>
      <body>
        {image && <img src={image} className="watermark" alt="" />}

        {medicationChunks.map((chunk, pageIndex) => (
          <div key={pageIndex} className="prescription-page">
            {renderHeader()}
            {renderPatientAndDivider()}

            <div className="title">{titleText}</div>
            {totalPages > 1 && (
              <div className="page-indicator">
                Page {pageIndex + 1} / {totalPages}
              </div>
            )}

            <div className="medications">
              {chunk.map((med, index) => (
                <div key={index} className="medication-item">
                  <div className="med-header">
                    <span>
                      {med.medicineName}
                      {med.form ? ` ${med.form}` : ""}
                      {med.dosage ? ` ${med.dosage}` : ""}
                    </span>
                    <span>
                      {med.quantity ? `(${med.quantity})` : ""}
                      {med.duration ? ` (${med.duration})` : ""}
                    </span>
                  </div>
                  {med.note && <div className="med-note">{med.note}</div>}
                </div>
              ))}
            </div>

            {renderFooter()}
          </div>
        ))}
      </body>
    </html>
  );
};

export default PrescriptionPrintable;
