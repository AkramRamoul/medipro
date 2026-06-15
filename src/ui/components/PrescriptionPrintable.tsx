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

  if (!prescriptionModel) return null;

  const servicesFr = JSON.parse(prescriptionModel.servicesFr || "[]");
  const servicesAr = JSON.parse(prescriptionModel.servicesAr || "[]");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const accentColor = prescriptionModel.accentColor || "#000000";

  const hexToRgba = (hex: string, alpha: number): string => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const fontFamily = prescriptionModel.fontFamily === "sans-serif" ? "sans-serif" : "'Amiri', serif";
  const doctorNameFontSize = prescriptionModel.doctorNameFontSize ?? 14;
  const specialtyFontSize = prescriptionModel.specialtyFontSize ?? 10;
  const titleFontSize = prescriptionModel.titleFontSize ?? 16;
  const bodyFontSize = prescriptionModel.bodyFontSize ?? 11;
  const logoSize = prescriptionModel.logoSize ?? 60;
  const watermarkOpacity = (prescriptionModel.watermarkOpacity ?? 10) / 100;
  const dividerStyle = prescriptionModel.dividerStyle || "solid";
  const titleText = prescriptionModel.titleText || "ORDONNANCE";
  const showInscriptionNumber = prescriptionModel.showInscriptionNumber ?? true;
  const templateLayout: string = prescriptionModel.templateLayout || "bilingual";

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
    body { font-family: ${fontFamily}; font-size: ${bodyFontSize}px; margin: 0; padding: 10px 20px; }
    .header {
      margin-bottom: ${Math.max(20, logoSize * 0.35)}px;
      min-height: ${Math.max(100, logoSize + 30)}px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
    }
    .col-fr { text-align: left; flex: 1; }
    .col-ar { text-align: right; direction: rtl; flex: 1; }
    .col-logo { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; flex-shrink: 0; width: ${logoSize + 20}px; }
    .col-logo-center { width: 20%; text-align: center; position: absolute; left: 40%; top: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
    .col-fr-full { text-align: left; flex: 1; }
    .col-ar-full { text-align: right; direction: rtl; flex: 1; }
    .col-logo-side { width: 20%; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
    .header-centered { display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; position: relative; }
    .col-stacked-container { display: flex; width: 100%; justify-content: space-between; margin-top: 15px; }
    .col-fr-center { text-align: center; width: 45%; display: flex; flex-direction: column; align-items: center; }
    .col-ar-center { text-align: center; width: 45%; direction: rtl; display: flex; flex-direction: column; align-items: center; }
    /* Bilingual Stacked */
    .header-bilingual-stacked { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; }
    .header-bilingual-stacked .col-left { width: 55%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; padding-top: 5px; }
    .header-bilingual-stacked .col-right { width: 45%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; }
    .header-bilingual-stacked .fr-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .header-bilingual-stacked .ar-block { display: flex; flex-direction: column; align-items: center; direction: rtl; gap: 2px; }
    .header-bilingual-stacked .divider-container { display: flex; align-items: center; justify-content: center; width: 100px; margin: 14px 0; opacity: 0.8; }
    .header-bilingual-stacked .divider-line { height: 1px; flex: 1; background-color: ${accentColor}; }
    .header-bilingual-stacked .divider-dots { display: flex; gap: 3px; margin: 0 8px; align-items: center; }
    .header-bilingual-stacked .divider-dot-s { width: 3px; height: 3px; border-radius: 50%; background-color: ${accentColor}; }
    .header-bilingual-stacked .divider-dot-m { width: 4.5px; height: 4.5px; border-radius: 50%; background-color: ${accentColor}; }
    .header-bilingual-stacked .clinic-name-ar { font-weight: bold; font-size: ${specialtyFontSize + 2}px; color: ${accentColor}; margin-bottom: 2px; letter-spacing: 0.5px; }
    .header-bilingual-stacked .clinic-name-fr { font-weight: 500; font-size: ${specialtyFontSize}px; color: ${accentColor}; margin-bottom: 6px; letter-spacing: 0.3px; }
    .header-bilingual-stacked .doctor-name { margin-bottom: 0; font-size: ${doctorNameFontSize * 1.15}px; font-weight: bold; text-transform: uppercase; color: ${accentColor}; letter-spacing: 0.5px; }
    .header-bilingual-stacked .specialty { margin-bottom: 0; color: ${accentColor}; font-weight: 500; font-size: ${specialtyFontSize * 0.95}px; }
    .header-bilingual-stacked .logo { width: ${logoSize}px; height: ${logoSize}px; margin-bottom: 8px; object-fit: contain; }
    .header-bilingual-stacked .inscription-text { font-size: 9px; font-weight: 400; color: ${accentColor}; opacity: 0.85; margin-top: 4px; letter-spacing: 1px; }
    /* Letterhead panel (fr-logo-left / ar-logo-right) */
    .header-panel { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; }
    .panel-logo-left { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 8px; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-logo-right { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 8px; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-text-fr { display: flex; flex-direction: column; justify-content: flex-start; padding: 8px 12px; text-align: left; }
    .panel-text-ar { display: flex; flex-direction: column; justify-content: flex-start; padding: 8px 12px; text-align: right; direction: rtl; }
    .panel-inscription { margin-top: 4px; font-size: 9px; text-align: center; color: ${accentColor}; white-space: nowrap; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #444; }
    .service { font-size: ${specialtyFontSize}px; color: #666; }
    .services-fr { border-left: 1.5px solid ${hexToRgba(accentColor, 0.38)}; padding-left: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .services-ar { border-right: 1.5px solid ${hexToRgba(accentColor, 0.38)}; padding-right: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .inscription-badge { display: inline-block; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; color: ${accentColor}; background-color: ${hexToRgba(accentColor, 0.03)}; margin-top: 8px; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; white-space: nowrap; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 2px double #aaa;` : `border-bottom: 0.5px ${dividerStyle} #aaa;`} margin: 8px 0; width: 100%; opacity: 0.7; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; }
    .document-info { text-align: right; }
    .title { display: block; text-align: center; font-size: ${titleFontSize}px; font-weight: bold; letter-spacing: 0.2em; text-decoration: none; border-bottom: 1px solid ${hexToRgba(accentColor, 0.25)}; padding-bottom: 6px; margin: 10px auto 20px auto; width: fit-content; color: ${accentColor}; }
    .page-indicator { text-align: center; font-size: 10px; color: #888; margin-bottom: 10px; }
    .medications { margin-top: 20px; font-size: ${bodyFontSize}px; }
    .medication-item { margin-bottom: 14px; }
    .med-row { display: flex; align-items: baseline; width: 100%; }
    .med-number-dash { font-weight: 400; color: ${accentColor}; white-space: nowrap; flex-shrink: 0; min-width: 28px; }
    .med-name-dots { flex: 1; overflow: hidden; white-space: nowrap; font-weight: 500; color: #222; }
    .med-name-dots::after { content: " . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."; font-weight: 300; color: #aaa; letter-spacing: 2px; }
    .med-qty { white-space: nowrap; margin-left: 6px; font-weight: 400; color: #222; flex-shrink: 0; }
    .med-note { margin-top: 2px; margin-left: 28px; color: #555; font-weight: 300; font-size: 0.95em; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 0.5px solid #ccc; padding-top: 5px; font-size: 11px; }
  `;

  // Sub-content reused across templates
  const frContent = (
    <>
      <div className="doctor-name">{prescriptionModel.nameFr}</div>
      <div className="specialty">{prescriptionModel.specialtyFr}</div>
      {servicesFr.length > 0 && (
        <div className="services-fr">
          {servicesFr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
        </div>
      )}
    </>
  );
  const arContent = (
    <>
      <div className="doctor-name">{prescriptionModel.nameAr}</div>
      <div className="specialty">{prescriptionModel.specialtyAr}</div>
      {servicesAr.length > 0 && (
        <div className="services-ar">
          {servicesAr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
        </div>
      )}
    </>
  );
  const logoContent = (
    <>
      {image && <img src={image} className="logo" alt="Logo" />}
      {showInscriptionNumber && (
        <div className="inscription-badge">
          N° Ordre : {prescriptionModel.inscriptionNumber}
        </div>
      )}
    </>
  );

  const renderHeader = () => {
    switch (templateLayout) {
      case "fr-only":
        return (
          <div className="header">
            <div className="col-fr-full">{frContent}</div>
            <div className="col-logo" style={{ paddingRight: "10px" }}>{logoContent}</div>
          </div>
        );
      case "ar-only":
        return (
          <div className="header">
            <div className="col-logo" style={{ paddingLeft: "10px" }}>{logoContent}</div>
            <div className="col-ar-full">{arContent}</div>
          </div>
        );
      case "fr-logo-left":
        return (
          <div className="header-panel">
            <div className="panel-logo-left" style={{ paddingLeft: "15px", paddingTop: "8px" }}>
              {logoContent}
            </div>
            <div className="panel-text-fr" style={{ paddingTop: "8px" }}>{frContent}</div>
          </div>
        );
      case "ar-logo-right":
        return (
          <div className="header-panel">
            <div className="panel-text-ar" style={{ paddingRight: "15px", paddingTop: "8px" }}>{arContent}</div>
            <div className="panel-logo-right" style={{ paddingRight: "15px", paddingTop: "8px", width: logoSize + 20 }}>
              {logoContent}
            </div>
          </div>
        );
      case "bilingual-logo-left":
        return (
          <div className="header">
            <div className="col-logo-side" style={{ paddingRight: "10px" }}>{logoContent}</div>
            <div className="col-fr" style={{ paddingLeft: "10px" }}>{frContent}</div>
            <div className="col-ar">{arContent}</div>
          </div>
        );
      case "bilingual-logo-right":
        return (
          <div className="header">
            <div className="col-fr">{frContent}</div>
            <div className="col-ar" style={{ paddingRight: "10px" }}>{arContent}</div>
            <div className="col-logo-side" style={{ paddingLeft: "10px" }}>{logoContent}</div>
          </div>
        );
      case "centered":
        return (
          <div className="header-centered">
            <div className="col-logo">{logoContent}</div>
            <div className="col-stacked-container">
              <div className="col-fr-center">{frContent}</div>
              <div className="col-ar-center">{arContent}</div>
            </div>
          </div>
        );
      case "bilingual-stacked":
        return (
          <div className="header-bilingual-stacked">
            <div className="col-left">
              <div className="fr-block">
                <div className="doctor-name">{prescriptionModel.nameFr}</div>
                <div className="specialty">{prescriptionModel.specialtyFr}</div>
              </div>
              <div className="divider-container">
                <div className="divider-line"></div>
                <div className="divider-dots">
                  <div className="divider-dot-s"></div>
                  <div className="divider-dot-m"></div>
                  <div className="divider-dot-s"></div>
                </div>
                <div className="divider-line"></div>
              </div>
              <div className="ar-block">
                <div className="doctor-name">{prescriptionModel.nameAr}</div>
                <div className="specialty">{prescriptionModel.specialtyAr}</div>
              </div>
            </div>
            <div className="col-right">
              {image && <img src={image} className="logo" alt="Logo" />}
              <div className="clinic-name-ar">العيادة الطبية المختصة</div>
              <div className="clinic-name-fr">Clinique Privée Spécialisée</div>
              {showInscriptionNumber && (
                <div className="inscription-text">
                  N° d'ordre: {prescriptionModel.inscriptionNumber}
                </div>
              )}
            </div>
          </div>
        );
      case "bilingual":
      default:
        return (
          <div className="header">
            <div className="col-fr">{frContent}</div>
            <div className="col-logo-center">{logoContent}</div>
            <div className="col-ar">{arContent}</div>
          </div>
        );
    }
  };

  return (
    <html>
      <head>
        <style>{styles}</style>
      </head>
      <body>
        {image && <img src={image} className="watermark" alt="" />}

        {renderHeader()}

        <div className="divider" />

        <div className="patient-info">
          <div className="patient-details">
            <div><strong>Nom :</strong> {patient.first_name} {patient.last_name}</div>
            <div><strong>Âge :</strong> {(() => {
              const dob = patient.dateOfBirth;
              if (!dob) return 'N/A';
              const birth = new Date(dob);
              const today = new Date();
              let age = today.getFullYear() - birth.getFullYear();
              const m = today.getMonth() - birth.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
              return `${age} Ans`;
            })()}</div>
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

        <div className="title">{titleText}</div>

        <div className="medications">
          {totalPages > 1 && <div className="page-indicator">Page 1 / {totalPages}</div>}
          {(medicationChunks[0] || []).map((med, index) => {
            const qtyLabel = [med.quantity, med.duration].filter(Boolean).join("  ");
            return (
              <div key={index} className="medication-item">
                <div className="med-row">
                  <span className="med-number-dash">{index + 1} - </span>
                  <span className="med-name-dots">
                    {med.medicineName}
                    {med.form ? ` ${med.form}` : ""}
                    {med.dosage ? ` ${med.dosage}` : ""}
                  </span>
                  {qtyLabel && <span className="med-qty">{qtyLabel}</span>}
                </div>
                {med.note && <div className="med-note">{med.note}</div>}
              </div>
            );
          })}
        </div>

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
      </body>
    </html>
  );
};

export default PrescriptionPrintable;
