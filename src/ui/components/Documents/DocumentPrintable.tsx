//doc printable


import React from "react";

interface DocumentPrintableProps {
    first_name: string;
    last_name: string;
    patientAge: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prescriptionModel: any;
    image: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentContent: any;
    documentType: "blood" | "certificate" | "report" | "template";
    documentName?: string;
    documentDate?: string | null;
}

const DocumentPrintable: React.FC<DocumentPrintableProps> = ({
    first_name,
    last_name,
    patientAge,
    prescriptionModel,
    image,
    documentContent,
    documentType,
    documentName,
    documentDate,
}) => {
    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const labels: Record<string, string> = {
        blood: "Demande Bilan",
        certificate: "Certificat de travail",
        report: "Rapport médical",
        template: "Lettre / Certificat",
    };

    const servicesFr = JSON.parse(prescriptionModel.servicesFr || "[]");
    const servicesAr = JSON.parse(prescriptionModel.servicesAr || "[]");

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const accentColor = prescriptionModel.accentColor || "#000000";
    const fontFamily = prescriptionModel.fontFamily === "sans-serif" ? "sans-serif" : "'Amiri', serif";
    const doctorNameFontSize = prescriptionModel.doctorNameFontSize ?? 14;
    const specialtyFontSize = prescriptionModel.specialtyFontSize ?? 10;
    const titleFontSize = prescriptionModel.titleFontSize ?? 16;
    const bodyFontSize = prescriptionModel.bodyFontSize ?? 11;
    const logoSize = prescriptionModel.logoSize ?? 60;
    const watermarkOpacity = (prescriptionModel.watermarkOpacity ?? 10) / 100;
    const dividerStyle = prescriptionModel.dividerStyle || "solid";
    const showInscriptionNumber = prescriptionModel.showInscriptionNumber ?? true;
    const templateLayout: string = prescriptionModel.templateLayout || "bilingual";

    const styles = `
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
    /* Bilingual (default) */
    .header { margin-bottom: ${Math.max(20, logoSize * 0.35)}px; position: relative; min-height: ${Math.max(80, logoSize + 20)}px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { text-align: left; width: 40%; }
    .header-right { text-align: right; width: 40%; direction: rtl; }
    .header-center { text-align: center; width: 20%; position: absolute; left: 40%; top: 0; }
    /* Single-lang side-by-side */
    .header-single { margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(80, logoSize + 20)}px; display: flex; justify-content: space-between; align-items: flex-start; }
    .col-fr { text-align: left; flex: 1; }
    .col-ar { text-align: right; direction: rtl; flex: 1; }
    .col-logo-side { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; flex-shrink: 0; width: ${logoSize + 20}px; }
    /* Letterhead panel (fr-logo-left / ar-logo-right) */
    .header-panel { display: flex; align-items: stretch; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(80, logoSize + 20)}px; }
    .panel-logo-left { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-right: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-logo-right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-left: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-text-fr { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: left; }
    .panel-text-ar { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: right; direction: rtl; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #444; }
    .service { font-size: ${specialtyFontSize}px; color: #666; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 3px double #666;` : `border-bottom: 1px ${dividerStyle} #666;`} margin: 10px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; display: flex; flex-direction: column; gap: 5px; }
    .document-info { text-align: right; display: flex; flex-direction: column; gap: 5px; }
    .title { text-align: center; font-size: ${titleFontSize}px; font-weight: bold; text-decoration: underline; margin: 10px 0 20px 0; color: ${accentColor}; }
    .content { margin-top: 15px; font-size: ${bodyFontSize}px; line-height: 1.6; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 9px; }
    .bold { font-weight: bold; }
    .underline { text-decoration: underline; }
  `;

    // Sub-content reused across templates
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
                    N° Inscription : {prescriptionModel.inscriptionNumber}
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
                        <div>
                            <strong>Nom :</strong> {first_name} {last_name}
                        </div>
                        <div>
                            <strong>Âge :</strong> {patientAge} Ans
                        </div>
                    </div>
                    <div className="document-info">
                        <div>
                            {prescriptionModel.city}, le : {formatDate(documentDate ? new Date(documentDate) : new Date())}
                        </div>
                    </div>
                </div>

                <div className="title">{documentName || labels[documentType]}</div>

                <div className="content">
                    {documentType === "blood" ? (
                        <div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any)?.results?.map(
                                (item: string, index: number) => (
                                    <div key={index} style={{ marginBottom: 5 }}>
                                        - {item}
                                    </div>
                                )
                            )}
                        </div>
                    ) : documentType === "certificate" ? (
                        <div>
                            <div>
                                Je soussigné(e), Dr {prescriptionModel.nameFr}, certifie avoir
                                examiné ce jour le patient
                                <span className="bold">
                                    {" "}
                                    {first_name} {last_name}{" "}
                                </span>
                                âgé de {patientAge} ans.
                            </div>
                            <div style={{ marginTop: 10 }}>
                                Son état de santé nécessite un repos de maladie à partir du :{" "}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(documentContent as any).restStartDate} au{" "}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(documentContent as any).restEndDate} inclus.
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any).diagnosis && (
                                <div style={{ marginTop: 10 }}>
                                    <span className="bold underline">Diagnostic :</span>{" "}
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(documentContent as any).diagnosis}
                                </div>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any).remarks && (
                                <div style={{ marginTop: 5 }}>
                                    <span className="bold underline">Remarques :</span>{" "}
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(documentContent as any).remarks}
                                </div>
                            )}
                        </div>
                    ) : documentType === "template" ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: String(documentContent),
                            }}
                        />
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any).examenClinique && (
                                <div>
                                    <div className="bold underline" style={{ marginBottom: 2 }}>
                                        Examen clinique :
                                    </div>
                                    <div>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(documentContent as any).examenClinique}
                                    </div>
                                </div>
                            )}

                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any).diagnostic && (
                                <div>
                                    <div className="bold underline" style={{ marginBottom: 2 }}>
                                        Diagnostic :
                                    </div>
                                    <div>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(documentContent as any).diagnostic}
                                    </div>
                                </div>
                            )}

                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(documentContent as any).traitement && (
                                <div>
                                    <div className="bold underline" style={{ marginBottom: 2 }}>
                                        Traitement :
                                    </div>
                                    <div>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(documentContent as any).traitement}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="footer">
                    <div>{prescriptionModel.address}</div>
                    <div>
                        Tél. : {prescriptionModel.phoneNumber1} Mob. :{" "}
                        {prescriptionModel.phoneNumber2 || ""}
                    </div>
                </div>
            </body>
        </html>
    );
};

export default DocumentPrintable;
