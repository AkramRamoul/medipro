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
    body { font-family: 'Amiri', serif; font-size: 11px; margin: 0; padding: 10px 20px; }
    .header { margin-bottom: 20px; position: relative; min-height: 80px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { text-align: left; width: 40%; }
    .header-right { text-align: right; width: 40%; direction: rtl; }
    .header-center { text-align: center; width: 20%; position: absolute; left: 40%; top: 0; }
    .logo { width: 60px; height: 60px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: 0.1; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
    .specialty { font-size: 10px; margin-bottom: 2px; }
    .service { font-size: 10px; }
    .divider { border-bottom: 1px solid #666; margin: 10px 0; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
    .patient-details { text-align: left; display: flex; flex-direction: column; gap: 5px; }
    .document-info { text-align: right; display: flex; flex-direction: column; gap: 5px; }
    .title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin: 10px 0 20px 0; }
    .content { margin-top: 15px; font-size: 12px; line-height: 1.6; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 9px; }
    .bold { font-weight: bold; }
    .underline { text-decoration: underline; }
  `;

    return (
        <html>
            <head>
                <style>{styles}</style>
            </head>
            <body>
                {image && <img src={image} className="watermark" alt="" />}

                <div className="header">
                    {/* Left Side (French) */}
                    <div className="header-left">
                        <div className="doctor-name">{prescriptionModel.nameFr}</div>
                        <div className="specialty">{prescriptionModel.specialtyFr}</div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {servicesFr.map((srv: string, idx: number) => (
                            <div key={idx} className="service">
                                {srv}
                            </div>
                        ))}
                    </div>

                    {/* Center Logo */}
                    <div className="header-center">
                        {image && <img src={image} className="logo" alt="Logo" />}
                        <div style={{ marginTop: 5, fontSize: 10 }}>
                            N° Inscription : {prescriptionModel.inscriptionNumber}
                        </div>
                    </div>

                    {/* Right Side (Arabic) */}
                    <div className="header-right">
                        <div className="doctor-name">{prescriptionModel.nameAr}</div>
                        <div className="specialty">{prescriptionModel.specialtyAr}</div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {servicesAr.map((srv: string, idx: number) => (
                            <div key={idx} className="service">
                                {srv}
                            </div>
                        ))}
                    </div>
                </div>

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
                            {prescriptionModel.city}, le : {formatDate(new Date())}
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
