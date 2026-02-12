import React from "react";

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
    body { font-family: 'Amiri', serif; font-size: 10px; margin: 0; padding: 10px 20px; }
    .header { position: relative; min-height: 80px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { text-align: left; width: 40%; }
    .header-right { text-align: right; width: 40%; direction: rtl; }
    .header-center { text-align: center; width: 20%; position: absolute; left: 40%; top: 0; }
    .logo { width: 60px; height: 60px; object-fit: contain; }
    .watermark { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; opacity: 0.1; z-index: -1; pointer-events: none; }
    .doctor-name { font-weight: bold; font-size: 14px; }
    .specialty { font-size: 10px; }
    .service { font-size: 10px; }
    .divider { border-bottom: 1px solid #666; width: 100%; }
    .patient-info { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px; font-size: 12px; }
    .patient-details { text-align: left; display: flex; flex-direction: column; gap: 5px; }
    .document-info { text-align: right; width: 40%; }
    .title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; }
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; border-top: 1px solid #aaa; padding-top: 5px; font-size: 11px; }
    .dots { letter-spacing: 2px; }
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
                            <strong>Nom :</strong> <span className="dots">.....................</span>
                        </div>
                        <div>
                            <strong>Âge :</strong> <span className="dots">...........</span>
                        </div>
                    </div>
                    <div className="document-info">
                        <div>
                            {prescriptionModel.city}, le : <span className="dots">...........</span>
                        </div>
                    </div>
                </div>

                <div className="title">ORDONNANCE</div>

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

export default EmptyPrescriptionPrintable;
