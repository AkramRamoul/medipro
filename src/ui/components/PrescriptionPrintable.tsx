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

  // New customization fields with defaults
  const doctorNameFontSize = prescriptionModel.doctorNameFontSize ?? 14;
  const specialtyFontSize = prescriptionModel.specialtyFontSize ?? 10;
  const titleFontSize = prescriptionModel.titleFontSize ?? 18;
  const bodyFontSize = prescriptionModel.bodyFontSize ?? 12;
  const logoSize = prescriptionModel.logoSize ?? 60;
  const watermarkOpacity = (prescriptionModel.watermarkOpacity ?? 10) / 100;
  const dividerStyle = prescriptionModel.dividerStyle || "solid";
  const titleText = prescriptionModel.titleText || "ORDONNANCE";
  const showInscriptionNumber = prescriptionModel.showInscriptionNumber ?? true;
  const layout = prescriptionModel.layoutTemplate || "standard";
  const langMode = prescriptionModel.languageMode || "bilingual";

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
    body { font-family: ${fontFamily}; font-size: ${bodyFontSize}px; margin: 0; padding: 0; color: black; }
    .prescription-page { padding: 10px 20px; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
    .prescription-page + .prescription-page { page-break-before: always; }
    .header { margin-bottom: 10px; position: relative; min-height: ${Math.max(80, logoSize + 20)}px; width: 100%; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; }
    .header-left { text-align: left; width: ${langMode === "fr" ? "100%" : "40%"}; }
    .header-right { text-align: right; width: ${langMode === "ar" ? "100%" : "40%"}; direction: rtl; }
    .header-center { text-align: center; width: 20%; flex-shrink: 0; }
    .logo-container { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #333; }
    .service { font-size: ${specialtyFontSize * 0.9}px; color: #555; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 3px double #999;` : `border-bottom: 1px ${dividerStyle} #999;`} margin: 8px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 15px; margin-bottom: 15px; font-size: ${bodyFontSize}px; }
    .patient-info.rtl { flex-direction: row-reverse; }
    .title { text-align: center; font-size: ${titleFontSize}px; font-weight: bold; text-decoration: underline; margin: 15px 0; color: ${accentColor}; }
    .page-indicator { text-align: center; font-size: 10px; color: #888; margin-top: -10px; margin-bottom: 10px; }
    .medications { flex-grow: 1; margin-top: 10px; font-size: ${bodyFontSize}px; }
    .medication-item { margin-bottom: 12px; display: flex; flex-direction: column; }
    .med-header { display: flex; justify-content: space-between; font-weight: bold; }
    .med-note { margin-top: 2px; font-style: italic; color: #555; margin-left: 10px; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #ccc; padding-top: 5px; font-size: 10px; color: #666; }
    .inscription { font-size: 8px; margin-top: 2px; }
    .absolute-center-logo { position: absolute; left: 50%; transform: translateX(-50%); top: 0; }
  `;

  const renderFrench = () => (
    <div className="header-left">
      <div className="doctor-name">{prescriptionModel.nameFr}</div>
      <div className="specialty">{prescriptionModel.specialtyFr}</div>
      {servicesFr.map((srv: string, idx: number) => (
        srv && <div key={idx} className="service">{srv}</div>
      ))}
    </div>
  );

  const renderArabic = () => (
    <div className="header-right">
      <div className="doctor-name">{prescriptionModel.nameAr}</div>
      <div className="specialty">{prescriptionModel.specialtyAr}</div>
      {servicesAr.map((srv: string, idx: number) => (
        srv && <div key={idx} className="service">{srv}</div>
      ))}
    </div>
  );

  const renderLogo = (isCentered = false) => (
    <div className={isCentered ? "logo-container" : "header-center"}>
      <div className="logo-container">
        {image ? <img src={image} className="logo" alt="Logo" /> : <div style={{ width: logoSize, height: logoSize }} />}
        {showInscriptionNumber && (
          <div className="inscription">N° Ordre : {prescriptionModel.inscriptionNumber}</div>
        )}
      </div>
    </div>
  );

  const renderHeader = () => (
    <>
      <div className="header">
        {layout === "standard" && (
          <div className="header-content">
            {(langMode === "fr" || langMode === "bilingual") && renderFrench()}
            {langMode === "bilingual" && renderLogo()}
            {(langMode === "ar" || langMode === "bilingual") && renderArabic()}
            {langMode !== "bilingual" && (
              <div className="absolute-center-logo">
                {renderLogo(true)}
              </div>
            )}
          </div>
        )}

        {layout === "logo-left" && (
          <div className="header-content">
            {renderLogo()}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', paddingLeft: 20 }}>
              {(langMode === "fr" || langMode === "bilingual") && renderFrench()}
              {(langMode === "ar" || langMode === "bilingual") && renderArabic()}
            </div>
          </div>
        )}

        {layout === "logo-right" && (
          <div className="header-content">
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', paddingRight: 20 }}>
              {(langMode === "fr" || langMode === "bilingual") && renderFrench()}
              {(langMode === "ar" || langMode === "bilingual") && renderArabic()}
            </div>
            {renderLogo()}
          </div>
        )}
      </div>

      <div className="divider" />

      <div className={`patient-info ${langMode === "ar" ? "rtl" : ""}`}>
        <div className="patient-details">
          <div>
            <strong>{langMode === "ar" ? "الاسم :" : "Nom :"}</strong> {patient.first_name} {patient.last_name}
          </div>
          <div>
            <strong>{langMode === "ar" ? "السن :" : "Âge :"}</strong> {patient.age} Ans
          </div>
          {isPsychotropic && patientAddress && (
            <div>
              <strong>{langMode === "ar" ? "العنوان :" : "Adresse :"}</strong> {patientAddress}
            </div>
          )}
        </div>
        <div className="document-info">
          <div>
            {prescriptionModel.city}, {langMode === "ar" ? "في :" : "le :"} {formatDate(prescriptionDate ? new Date(prescriptionDate) : new Date())}
          </div>
          {isPsychotropic && psychotropicNumber && (
            <div>
              <strong>{langMode === "ar" ? "الرقم التسلسلي :" : "Numero de serie :"}</strong> {psychotropicNumber}
            </div>
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
          {prescriptionModel.phoneNumber1 && prescriptionModel.phoneNumber2 && " | "}
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
