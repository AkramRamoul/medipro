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

  const servicesFr = JSON.parse(prescriptionModel?.servicesFr || "[]");
  const servicesAr = JSON.parse(prescriptionModel?.servicesAr || "[]");

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
    /* Letterhead panel (fr-logo-left / ar-logo-right) */
    .header-panel { display: flex; align-items: stretch; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; }
    .panel-logo-left { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-logo-right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-text-fr { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: left; }
    .panel-text-ar { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: right; direction: rtl; }
    .panel-inscription { margin-top: 4px; font-size: 9px; text-align: center; color: ${accentColor}; white-space: nowrap; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #444; }
    .service { font-size: ${specialtyFontSize}px; color: #666; }
    .services-fr { border-left: 1.5px solid ${accentColor}60; padding-left: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .services-ar { border-right: 1.5px solid ${accentColor}60; padding-right: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .inscription-badge { display: inline-block; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; color: ${accentColor}; background-color: ${accentColor}14; margin-top: 4px; text-align: center; white-space: nowrap; }
    .inscription { font-size: 10px; margin-top: 5px; text-align: center; white-space: nowrap; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 2px double #666;` : `border-bottom: 0.5px ${dividerStyle} #666;`} margin: 8px 0; width: 100%; border-color: ${accentColor}; opacity: 0.7; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; }
    .document-info { text-align: right; }
    .title { display: block; text-align: center; font-size: ${titleFontSize}px; font-weight: bold; letter-spacing: 0.2em; text-decoration: none; border-bottom: 1px solid ${accentColor}40; padding-bottom: 6px; margin: 10px auto 20px auto; width: fit-content; color: ${accentColor}; }
    .page-indicator { text-align: center; font-size: 10px; color: #888; margin-top: -15px; margin-bottom: 10px; }
    .medications { margin-top: 25px; font-size: ${bodyFontSize}px; }
    .medication-item { margin-bottom: 16px; display: flex; flex-direction: column; }
    .med-header { display: flex; justify-content: space-between; align-items: baseline; width: 100%; }
    .med-name-container { display: flex; align-items: baseline; gap: 10px; flex: 1; }
    .med-number { font-weight: 300; color: ${accentColor}; font-size: 0.85em; min-width: 22px; text-align: left; opacity: 0.8; }
    .med-name { font-weight: 500; color: #333; }
    .med-meta { font-weight: 300; color: #666; font-size: 0.9em; white-space: nowrap; margin-left: 10px; }
    .med-note { margin-top: 4px; font-style: italic; color: #666; margin-left: 32px; font-weight: 300; border-left: 1.5px solid ${accentColor}20; padding-left: 10px; font-size: 0.95em; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 11px; }
  `;

  // Sub-content blocks reused across templates
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
            <div className="panel-logo-left" style={{ paddingLeft: "10px" }}>
              {logoContent}
            </div>
            <div className="panel-text-fr">{frContent}</div>
          </div>
        );
      case "ar-logo-right":
        return (
          <div className="header-panel">
            <div className="panel-text-ar" style={{ paddingRight: "20px" }}>{arContent}</div>
            <div className="panel-logo-right" style={{ paddingRight: "10px", paddingLeft: "30px", width: logoSize + 40 }}>
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
          {prescriptionModel.phoneNumber1 && prescriptionModel.phoneNumber2 && " | "}
          {prescriptionModel.phoneNumber2 && `Mob. : ${prescriptionModel.phoneNumber2}`}
        </div>
      )}
    </div>
  );

  const customPositionsObj = typeof prescriptionModel.customPositions === 'string'
    ? JSON.parse(prescriptionModel.customPositions || '{}')
    : (prescriptionModel.customPositions || {});
  const useCustomLayout = Object.keys(customPositionsObj).length > 0;

  const renderCustomLayoutBlocks = (chunk: PrescriptionMed[], pageIndex: number) => {
    let hiddenElements = prescriptionModel.hiddenElements || [];
    if (typeof hiddenElements === 'string') {
      try { hiddenElements = JSON.parse(hiddenElements); } catch (e) { hiddenElements = []; }
    }
    if (!Array.isArray(hiddenElements)) hiddenElements = [];
    const isHidden = (id: string) => hiddenElements.includes(id);

    const getStyle = (id: string, fullWidth?: boolean): React.CSSProperties => {
      const pos = customPositionsObj[id];
      if (!pos || isHidden(id)) return { display: "none" };
      return {
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: fullWidth ? "100%" : undefined,
        maxWidth: fullWidth ? "100%" : "45%",
      };
    };

    let maxTop = 0;
    ["logo", "nameFr", "nameAr", "specialtyFr", "specialtyAr", "inscription", "divider", "title", "patientInfo", "dateCity"].forEach(id => {
      if (!isHidden(id) && customPositionsObj[id] && customPositionsObj[id].y > maxTop) {
        maxTop = customPositionsObj[id].y;
      }
    });
    const medsTop = maxTop + 8;

    return (
      <div style={{ position: "relative", width: "100%", height: "209mm" }}>
        {!isHidden("logo") && (
          <div style={getStyle("logo")}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{logoContent}</div>
          </div>
        )}
        {!isHidden("nameFr") && (
          <div style={getStyle("nameFr")}>
            <div className="doctor-name">{prescriptionModel.nameFr}</div>
          </div>
        )}
        {!isHidden("nameAr") && (
          <div style={{ ...getStyle("nameAr"), textAlign: "right", direction: "rtl" }}>
            <div className="doctor-name">{prescriptionModel.nameAr}</div>
          </div>
        )}
        {!isHidden("specialtyFr") && (
          <div style={getStyle("specialtyFr")}>
            <div className="specialty">{prescriptionModel.specialtyFr}</div>
            {servicesFr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
          </div>
        )}
        {!isHidden("specialtyAr") && (
          <div style={{ ...getStyle("specialtyAr"), textAlign: "right", direction: "rtl" }}>
            <div className="specialty">{prescriptionModel.specialtyAr}</div>
            {servicesAr.map((srv: string, idx: number) => <div key={idx} className="service">{srv}</div>)}
          </div>
        )}
        {!isHidden("inscription") && (
          <div style={getStyle("inscription")}>
            <div className="inscription" style={{ color: accentColor }}>N° {prescriptionModel.inscriptionNumber}</div>
          </div>
        )}
        {!isHidden("divider") && (
          <div style={{ ...getStyle("divider", true) }}>
            <div className="divider" style={{ margin: 0, borderBottom: dividerStyle === "double" ? "2px double #666" : `0.75px ${dividerStyle} #666`, borderColor: accentColor, opacity: 0.6 }} />
          </div>
        )}
        {!isHidden("title") && (
          <div style={getStyle("title", true)}>
            <div className="title" style={{ margin: 0, borderBottom: `1.2px solid ${accentColor}40` }}>{titleText}</div>
          </div>
        )}
        {!isHidden("patientInfo") && (
          <div style={getStyle("patientInfo")}>
            <div className="patient-details" style={{ marginTop: 0, marginBottom: 0 }}>
              <div><strong>Nom :</strong> {patient.first_name} {patient.last_name}</div>
              <div><strong>Âge :</strong> {patient.age} Ans</div>
              {isPsychotropic && patientAddress && <div><strong>Adresse :</strong> {patientAddress}</div>}
            </div>
          </div>
        )}
        {!isHidden("dateCity") && (
          <div style={getStyle("dateCity")}>
            <div className="document-info" style={{ marginTop: 0, marginBottom: 0 }}>
              <div>{prescriptionModel.city}, le : {formatDate(prescriptionDate ? new Date(prescriptionDate) : new Date())}</div>
              {isPsychotropic && psychotropicNumber && <div><strong>Numero de serie :</strong> {psychotropicNumber}</div>}
            </div>
          </div>
        )}
        {!isHidden("footer") && (
          <div style={{ ...getStyle("footer", true) }}>
            <div className="footer" style={{ position: "static", borderTop: "1px solid #aaa", paddingTop: "5px", fontSize: "11px", textAlign: "center" }}>
              <div>{prescriptionModel.address}</div>
              {(prescriptionModel.phoneNumber1 || prescriptionModel.phoneNumber2) && (
                <div>
                  {prescriptionModel.phoneNumber1 && `Tél. : ${prescriptionModel.phoneNumber1}`}
                  {prescriptionModel.phoneNumber1 && prescriptionModel.phoneNumber2 && " | "}
                  {prescriptionModel.phoneNumber2 && `Mob. : ${prescriptionModel.phoneNumber2}`}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="medications" style={{ position: "absolute", top: `${medsTop}%`, left: 0, right: 0 }}>
          {totalPages > 1 && (
            <div className="page-indicator">
              Page {pageIndex + 1} / {totalPages}
            </div>
          )}
          {chunk.map((med, index) => {
            const medIndex = pageIndex * MEDS_PER_PAGE + index + 1;
            return (
              <div key={index} className="medication-item">
                <div className="med-header">
                  <div className="med-name-container">
                    <span className="med-number">{medIndex}.</span>
                    <span className="med-name">
                      {med.medicineName}
                      {med.form ? ` ${med.form}` : ""}
                      {med.dosage ? ` ${med.dosage}` : ""}
                    </span>
                  </div>
                  <div className="med-meta">
                    {med.quantity ? `(${med.quantity})` : ""}
                    {med.duration ? ` (${med.duration})` : ""}
                  </div>
                </div>
                {med.note && <div className="med-note">{med.note}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <html>
      <head>
        <style>{styles}</style>
      </head>
      <body>
        {image && <img src={image} className="watermark" alt="" />}

        {medicationChunks.map((chunk, pageIndex) => (
          <div key={pageIndex} className="prescription-page">
            {useCustomLayout ? renderCustomLayoutBlocks(chunk, pageIndex) : (
              <>
                {renderHeader()}
                {renderPatientAndDivider()}

                <div className="title">{titleText}</div>
                {totalPages > 1 && (
                  <div className="page-indicator">
                    Page {pageIndex + 1} / {totalPages}
                  </div>
                )}

                <div className="medications">
                  {chunk.map((med, index) => {
                    const medIndex = pageIndex * MEDS_PER_PAGE + index + 1;
                    return (
                      <div key={index} className="medication-item">
                        <div className="med-header">
                          <div className="med-name-container">
                            <span className="med-number">{medIndex}.</span>
                            <span className="med-name">
                              {med.medicineName}
                              {med.form ? ` ${med.form}` : ""}
                              {med.dosage ? ` ${med.dosage}` : ""}
                            </span>
                          </div>
                          <div className="med-meta">
                            {med.quantity ? `(${med.quantity})` : ""}
                            {med.duration ? ` (${med.duration})` : ""}
                          </div>
                        </div>
                        {med.note && <div className="med-note">{med.note}</div>}
                      </div>
                    );
                  })}
                </div>

                {renderFooter()}
              </>
            )}
          </div>
        ))}
      </body>
    </html>
  );
};

export default PrescriptionPrintable;
