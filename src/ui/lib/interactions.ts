export interface InteractionWarning {
  severity: "low" | "medium" | "high";
  message: string;
  drugs: string[];
}

const KNOWN_INTERACTIONS = [
  {
    required: ["amoxicilline", "méthotrexate"],
    message: "L'association Amoxicilline et Méthotrexate peut augmenter la toxicité du méthotrexate.",
    severity: "high"
  },
  {
    required: ["amoxicilline", "methotrexate"],
    message: "L'association Amoxicilline et Méthotrexate peut augmenter la toxicité du méthotrexate.",
    severity: "high"
  },
  {
    required: ["aspirin", "ibuprof"],
    message: "Risque accru d'ulcère gastro-intestinal et de saignements avec l'Aspirine et l'Ibuprofène.",
    severity: "medium"
  },
  {
    required: ["parac", "alcool"],
    message: "Risque de toxicité hépatique accrue.",
    severity: "high"
  },
  {
    required: ["sildenafil", "nitrate"],
    message: "Contre-indication absolue : risque d'hypotension sévère.",
    severity: "high"
  },
  {
    required: ["warfarine", "miconazole"],
    message: "Risque hémorragique très important.",
    severity: "high"
  },
  {
    required: ["ciprofloxacin", "theophylline"],
    message: "Augmentation des concentrations de théophylline, risque de surdosage.",
    severity: "medium"
  },
  {
    required: ["fluoxetine", "tramadol"],
    message: "Risque de syndrome sérotoninergique.",
    severity: "high"
  },
  {
    required: ["clarithromycin", "simvastatin"],
    message: "Risque accru de myopathie ou rhabdomyolyse.",
    severity: "high"
  }
] as const;

export function checkInteractions(medications: { medicineName: string }[]): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];
  const medNames = medications.map(m => m.medicineName.toLowerCase());

  for (const interaction of KNOWN_INTERACTIONS) {
    // check if all "required" keywords are present in the prescribed medications
    const matchingMeds = interaction.required.map(req => {
      return medNames.find(name => name.includes(req.toLowerCase()));
    });

    // If every required keyword matched with at least one medication
    if (matchingMeds.every(match => match !== undefined)) {
      // prevent duplicate warnings from the amoxicilline/methotrexate fallback
      if (!warnings.find(w => w.message === interaction.message)) {
        warnings.push({
          severity: interaction.severity,
          message: interaction.message,
          // filter out duplicates and undefined
          drugs: [...new Set(matchingMeds.filter(Boolean) as string[])].map(d => 
            // Capitalize first letter
            d.charAt(0).toUpperCase() + d.slice(1)
          )
        });
      }
    }
  }

  return warnings;
}
