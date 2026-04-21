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
    const showInscriptionNumber = prescriptionModel.showInscriptionNumber ?? true;
    const templateLayout: string = prescriptionModel.templateLayout || "bilingual";

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
    .services-fr { border-left: 1.5px solid ${hexToRgba(accentColor, 0.38)}; padding-left: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .services-ar { border-right: 1.5px solid ${hexToRgba(accentColor, 0.38)}; padding-right: 8px; padding-top: 2px; padding-bottom: 2px; margin-top: 2px; }
    .inscription-badge { display: inline-block; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; color: ${accentColor}; background-color: ${hexToRgba(accentColor, 0.03)}; margin-top: 4px; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .divider { ${dividerStyle === "none" ? "border: none;" : dividerStyle === "double" ? `border-bottom: 3px double #666;` : `border-bottom: 1px ${dividerStyle} #666;`} margin: 10px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; }
    .document-info { text-align: right; }
    .title { display: block; text-align: center; font-size: ${titleFontSize}px; font-weight: bold; letter-spacing: 0.2em; text-decoration: none; border-bottom: 2.5px solid ${hexToRgba(accentColor, 0.25)}; padding-bottom: 6px; margin: 10px auto 20px auto; width: fit-content; color: ${accentColor}; }
    .content { margin-top: 15px; font-size: ${bodyFontSize}px; line-height: 1.6; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 11px; }
    .bold { font-weight: bold; }
    .underline { text-decoration: underline; }
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
                        <div className="col-logo">{logoContent}</div>
                    </div>
                );
            case "ar-only":
                return (
                    <div className="header">
                        <div className="col-logo">{logoContent}</div>
                        <div className="col-ar-full">{arContent}</div>
                    </div>
                );
            case "fr-logo-left":
                return (
                    <div className="header-panel">
                        <div className="panel-logo-left">
                            {image && <img src={image} className="logo" alt="Logo" />}
                            {showInscriptionNumber && (
                                <div className="panel-inscription" style={{ marginTop: "4px", fontWeight: "bold" }}>N° Ordre : {prescriptionModel.inscriptionNumber}</div>
                            )}
                        </div>
                        <div className="panel-text-fr">{frContent}</div>
                    </div>
                );
            case "ar-logo-right":
                return (
                    <div className="header-panel">
                        <div className="panel-text-ar">{arContent}</div>
                        <div className="panel-logo-right">
                            {image && <img src={image} className="logo" alt="Logo" />}
                            {showInscriptionNumber && (
                                <div className="panel-inscription" style={{ marginTop: "4px", fontWeight: "bold" }}>N° Ordre : {prescriptionModel.inscriptionNumber}</div>
                            )}
                        </div>
                    </div>
                );
            case "bilingual-logo-left":
                return (
                    <div className="header">
                        <div className="col-logo-side">{logoContent}</div>
                        <div className="col-fr" style={{ paddingLeft: "10px" }}>{frContent}</div>
                        <div className="col-ar">{arContent}</div>
                    </div>
                );
            case "bilingual-logo-right":
                return (
                    <div className="header">
                        <div className="col-fr">{frContent}</div>
                        <div className="col-ar" style={{ paddingRight: "10px" }}>{arContent}</div>
                        <div className="col-logo-side">{logoContent}</div>
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

                {documentType !== "template" && (
                    <div className="title">{documentName || labels[documentType]}</div>
                )}

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

export default DocumentPrintable;
