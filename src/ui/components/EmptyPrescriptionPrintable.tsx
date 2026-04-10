//empty

import React from "react";

type TemplateLayout = "bilingual" | "fr-only" | "ar-only" | "fr-logo-left" | "ar-logo-right" | "bilingual-logo-left" | "bilingual-logo-right" | "centered";

interface EmptyPrescriptionPrintableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prescriptionModel: any;
    image: string | null;
}

const EmptyPrescriptionPrintable: React.FC<EmptyPrescriptionPrintableProps> = ({
    prescriptionModel,
    image,
}) => {
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
    const templateLayout: TemplateLayout = prescriptionModel.templateLayout || "bilingual";

    const dividerCSS =
        dividerStyle === "none"
            ? "border: none;"
            : dividerStyle === "double"
                ? "border-bottom: 3px double #666;"
                : `border-bottom: 1px ${dividerStyle} #666;`;

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
    * { box-sizing: border-box; }
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
    /* Letterhead panels (fr-logo-left / ar-logo-right) */
    .header-panel { display: flex; align-items: stretch; margin-bottom: ${Math.max(20, logoSize * 0.35)}px; min-height: ${Math.max(100, logoSize + 30)}px; }
    .panel-logo-left { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-right: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-logo-right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border-left: 2px solid ${accentColor}; flex-shrink: 0; width: ${logoSize + 20}px; }
    .panel-text-fr { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: left; }
    .panel-text-ar { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 12px; text-align: right; direction: rtl; }
    .panel-inscription { margin-top: 4px; font-size: 9px; text-align: center; color: ${accentColor}; }
    .logo { width: ${logoSize}px; height: ${logoSize}px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: ${watermarkOpacity}; z-index: -1; pointer-events: none; object-fit: contain; }
    .doctor-name { font-weight: bold; font-size: ${doctorNameFontSize}px; margin-bottom: 4px; color: ${accentColor}; }
    .specialty { font-size: ${specialtyFontSize}px; margin-bottom: 2px; color: #444; }
    .service { font-size: ${specialtyFontSize}px; color: #666; }
    .inscription { font-size: 10px; margin-top: 5px; text-align: center; }
    .divider { ${dividerCSS} margin: 10px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: ${bodyFontSize}px; }
    .patient-details { text-align: left; }
    .document-info { text-align: right; }
    .title { text-align: center; font-size: ${titleFontSize}px; font-weight: bold; text-decoration: underline; margin: 10px 0 20px 0; color: ${accentColor}; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 11px; }
  `;

    // ---- Sub-blocks ----
    const frContent = (
        <>
            <div className="doctor-name">{prescriptionModel.nameFr}</div>
            <div className="specialty">{prescriptionModel.specialtyFr}</div>
            {servicesFr.map((srv: string, idx: number) => (
                <div key={idx} className="service">{srv}</div>
            ))}
        </>
    );

    const arContent = (
        <>
            <div className="doctor-name">{prescriptionModel.nameAr}</div>
            <div className="specialty">{prescriptionModel.specialtyAr}</div>
            {servicesAr.map((srv: string, idx: number) => (
                <div key={idx} className="service">{srv}</div>
            ))}
        </>
    );

    const logoContent = (
        <>
            {image && <img src={image} className="logo" alt="Logo" />}
            {showInscriptionNumber && (
                <div className="inscription" style={{ marginTop: "4px", fontWeight: "bold", color: accentColor }}>N° Ordre : {prescriptionModel.inscriptionNumber}</div>
            )}
        </>
    );

    // ---- Header layout switch ----
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
                        {/* Accent logo panel on left */}
                        <div className="panel-logo-left">
                            {image && <img src={image} className="logo" alt="Logo" />}
                            {showInscriptionNumber && (
                                <div className="panel-inscription" style={{ marginTop: "4px", fontWeight: "bold" }}>N° Ordre : {prescriptionModel.inscriptionNumber}</div>
                            )}
                        </div>
                        {/* French info on right */}
                        <div className="panel-text-fr">
                            {frContent}
                        </div>
                    </div>
                );
            case "ar-logo-right":
                return (
                    <div className="header-panel">
                        {/* Arabic info on left */}
                        <div className="panel-text-ar">
                            {arContent}
                        </div>
                        {/* Accent logo panel on right */}
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
                            <strong>Nom :</strong> <span>..........................................</span>
                        </div>
                        <div>
                            <strong>Âge :</strong> <span>...........</span>
                        </div>
                    </div>
                    <div className="document-info">
                        <div>
                            {prescriptionModel.city}, le : <span>...........</span>
                        </div>
                    </div>
                </div>

                <div className="title">{titleText}</div>

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
            </body>
        </html>
    );
};

export default EmptyPrescriptionPrintable;
