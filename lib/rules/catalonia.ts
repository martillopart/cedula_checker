import { PropertyInput, RuleResult, RuleSeverity, EvaluationResult } from '@/types';

const RULESET_VERSION = '1.0.0-catalonia-mvp';

interface Rule {
  id: string;
  name: string;
  description: string;
  evaluate: (input: PropertyInput) => {
    severity: RuleSeverity;
    message: string;
    explanation: string;
    fixGuidance?: string;
    confidence: number;
  };
  evidenceNeeded: string[];
}

const rules: Rule[] = [
  {
    id: 'min-useful-area',
    name: 'Superfície útil mínima',
    description: 'La superfície útil mínima varia segons el tipus d\'ocupació',
    evidenceNeeded: ['usefulArea', 'useCase'],
    evaluate: (input) => {
      if (!input.usefulArea || input.usefulArea <= 0) {
        return {
          severity: 'unknown',
          message: 'Superfície útil no proporcionada',
          explanation: 'Es necessita mesurar la superfície útil de l\'habitatge per validar aquest requisit.',
          fixGuidance: 'Mesura la superfície útil (sense comptar parets, passadissos, etc.)',
          confidence: 0,
        };
      }
      
      // Determine minimum area based on use case (Decret 141/2012)
      let minimumArea: number;
      let useCaseName: string;
      
      if (input.useCase === 'primera-ocupacion') {
        minimumArea = 30;
        useCaseName = 'primera ocupació';
      } else if (input.useCase === 'segunda-ocupacion') {
        minimumArea = 36;
        useCaseName = 'segona ocupació';
      } else if (input.useCase === 'renovation') {
        // For renovation, use the stricter standard (36 m²)
        minimumArea = 36;
        useCaseName = 'renovació';
      } else {
        // Default to segunda ocupación standard
        minimumArea = 36;
        useCaseName = 'segona ocupació';
      }
      
      if (input.usefulArea >= minimumArea) {
        return {
          severity: 'pass',
          message: `Superfície útil adequada: ${input.usefulArea} m²`,
          explanation: `La superfície útil de ${input.usefulArea} m² compleix el mínim de ${minimumArea} m² requerit per a ${useCaseName}.`,
          confidence: 100,
        };
      }
      
      return {
        severity: 'fail',
        message: `Superfície útil insuficient: ${input.usefulArea} m² (mínim: ${minimumArea} m² per a ${useCaseName})`,
        explanation: `La superfície útil de ${input.usefulArea} m² és inferior al mínim de ${minimumArea} m² requerit per a ${useCaseName}.`,
        fixGuidance: `No es pot solucionar sense modificar l'habitatge. Es requereix una superfície mínima de ${minimumArea} m² per a ${useCaseName}.`,
        confidence: 100,
      };
    },
  },
  {
    id: 'min-ceiling-height',
    name: 'Alçada mínima del sostre',
    description: 'L\'alçada mínima del sostre ha de ser de 2,5 metres',
    evidenceNeeded: ['ceilingHeight'],
    evaluate: (input) => {
      if (!input.ceilingHeight || input.ceilingHeight <= 0) {
        return {
          severity: 'unknown',
          message: 'Alçada del sostre no proporcionada',
          explanation: 'Es necessita mesurar l\'alçada del sostre per validar aquest requisit.',
          fixGuidance: 'Mesura l\'alçada del sostre en el punt més baix de cada habitació.',
          confidence: 0,
        };
      }
      
      if (input.ceilingHeight >= 2.5) {
        return {
          severity: 'pass',
          message: `Alçada adequada: ${input.ceilingHeight} m`,
          explanation: `L\'alçada de ${input.ceilingHeight} m compleix el mínim de 2,5 m requerit.`,
          confidence: 100,
        };
      }
      
      return {
        severity: 'fail',
        message: `Alçada insuficient: ${input.ceilingHeight} m (mínim: 2,5 m)`,
        explanation: `L\'alçada de ${input.ceilingHeight} m és inferior al mínim de 2,5 m requerit.`,
        fixGuidance: 'Pot ser necessari modificar el sostre o reduir l\'alçada del terra si és possible.',
        confidence: 100,
      };
    },
  },
  {
    id: 'kitchen-required',
    name: 'Culina obligatòria',
    description: 'L\'habitatge ha de tenir una cuina',
    evidenceNeeded: ['hasKitchen'],
    evaluate: (input) => {
      if (input.hasKitchen) {
        return {
          severity: 'pass',
          message: 'Culina present',
          explanation: 'L\'habitatge té una cuina, complint el requisit.',
          confidence: 100,
        };
      }
      
      return {
        severity: 'fail',
        message: 'Culina no present',
        explanation: 'L\'habitatge no té cuina, requisit obligatori per a la cédula de habitabilitat.',
        fixGuidance: 'S\'ha d\'instal·lar una cuina amb aigua corrent, llar de foc o fogó, i desguàs.',
        confidence: 100,
      };
    },
  },
  {
    id: 'bathroom-required',
    name: 'Bany obligatori',
    description: 'L\'habitatge ha de tenir un bany',
    evidenceNeeded: ['hasBathroom'],
    evaluate: (input) => {
      if (input.hasBathroom) {
        return {
          severity: 'pass',
          message: 'Bany present',
          explanation: 'L\'habitatge té un bany, complint el requisit.',
          confidence: 100,
        };
      }
      
      return {
        severity: 'fail',
        message: 'Bany no present',
        explanation: 'L\'habitatge no té bany, requisit obligatori per a la cédula de habitabilitat.',
        fixGuidance: 'S\'ha d\'instal·lar un bany amb dutxa o banyera, vàter, i aigua corrent.',
        confidence: 100,
      };
    },
  },
  {
    id: 'natural-light',
    name: 'Il·luminació natural',
    description: 'L\'habitatge ha de tenir il·luminació natural en les habitacions principals',
    evidenceNeeded: ['hasNaturalLight'],
    evaluate: (input) => {
      if (input.hasNaturalLight) {
        return {
          severity: 'pass',
          message: 'Il·luminació natural present',
          explanation: 'L\'habitatge té il·luminació natural, complint el requisit.',
          confidence: 80,
        };
      }
      
      return {
        severity: 'risk',
        message: 'Il·luminació natural no confirmada',
        explanation: 'No s\'ha confirmat la presència d\'il·luminació natural. Això pot ser un problema per a les habitacions principals.',
        fixGuidance: 'Verifica que les habitacions principals (dormitori, sala d\'estar) tinguin finestres amb accés a llum natural.',
        confidence: 50,
      };
    },
  },
  {
    id: 'ventilation',
    name: 'Ventilació',
    description: 'L\'habitatge ha de tenir ventilació adequada',
    evidenceNeeded: ['hasVentilation'],
    evaluate: (input) => {
      if (input.hasVentilation) {
        return {
          severity: 'pass',
          message: 'Ventilació adequada',
          explanation: 'L\'habitatge té ventilació adequada, complint el requisit.',
          confidence: 80,
        };
      }
      
      return {
        severity: 'risk',
        message: 'Ventilació no confirmada',
        explanation: 'No s\'ha confirmat la presència de ventilació adequada. Això pot ser un problema per a la qualitat de l\'aire.',
        fixGuidance: 'Verifica que hi hagi ventilació natural (finestres) o mecànica (extractors) en cuina i bany.',
        confidence: 50,
      };
    },
  },
  {
    id: 'occupancy-density',
    name: 'Densitat d\'ocupació',
    description: 'La superfície útil per persona ha de ser adequada',
    evidenceNeeded: ['usefulArea', 'intendedOccupancy'],
    evaluate: (input) => {
      if (!input.usefulArea || !input.intendedOccupancy || input.usefulArea <= 0 || input.intendedOccupancy <= 0) {
        return {
          severity: 'unknown',
          message: 'Dades d\'ocupació incompletes',
          explanation: 'Es necessita la superfície útil i el nombre d\'ocupants per validar aquest requisit.',
          fixGuidance: 'Proporciona la superfície útil i el nombre d\'ocupants previstos.',
          confidence: 0,
        };
      }
      
      const areaPerPerson = input.usefulArea / input.intendedOccupancy;
      const minimumAreaPerPerson = 9; // m² per person (conservative estimate)
      
      if (areaPerPerson >= minimumAreaPerPerson) {
        return {
          severity: 'pass',
          message: `Densitat adequada: ${areaPerPerson.toFixed(1)} m²/persona`,
          explanation: `Amb ${input.usefulArea} m² per a ${input.intendedOccupancy} persones, la densitat és adequada.`,
          confidence: 90,
        };
      }
      
      return {
        severity: 'risk',
        message: `Densitat alta: ${areaPerPerson.toFixed(1)} m²/persona`,
        explanation: `Amb ${input.usefulArea} m² per a ${input.intendedOccupancy} persones, la densitat pot ser massa alta.`,
        fixGuidance: `Considera reduir el nombre d\'ocupants o augmentar la superfície útil. Recomanació: mínim ${(minimumAreaPerPerson * input.intendedOccupancy).toFixed(0)} m².`,
        confidence: 80,
      };
    },
  },
  {
    id: 'minimum-rooms',
    name: 'Nombre mínim d\'habitacions',
    description: 'L\'habitatge ha de tenir un nombre adequat d\'habitacions',
    evidenceNeeded: ['numRooms', 'intendedOccupancy'],
    evaluate: (input) => {
      if (!input.numRooms || !input.intendedOccupancy || input.numRooms <= 0 || input.intendedOccupancy <= 0) {
        return {
          severity: 'unknown',
          message: 'Dades d\'habitacions incompletes',
          explanation: 'Es necessita el nombre d\'habitacions i ocupants per validar aquest requisit.',
          confidence: 0,
        };
      }
      
      // Basic rule: at least one room per person for bedrooms, plus common areas
      const minRooms = Math.max(2, input.intendedOccupancy); // At least bedroom + living area
      
      if (input.numRooms >= minRooms) {
        return {
          severity: 'pass',
          message: `Nombre d\'habitacions adequat: ${input.numRooms}`,
          explanation: `Amb ${input.numRooms} habitacions per a ${input.intendedOccupancy} persones, el nombre és adequat.`,
          confidence: 85,
        };
      }
      
      return {
        severity: 'risk',
        message: `Potser insuficient habitacions: ${input.numRooms} (recomanat: ${minRooms}+)`,
        explanation: `Amb ${input.numRooms} habitacions per a ${input.intendedOccupancy} persones, pot ser insuficient.`,
        fixGuidance: 'Considera si l\'habitatge té espai suficient per a tots els ocupants.',
        confidence: 70,
      };
    },
  },
  {
    id: 'heating',
    name: 'Calefacció',
    description: 'L\'habitatge ha de tenir un sistema de calefacció adequat',
    evidenceNeeded: ['hasHeating'],
    evaluate: (input) => {
      if (input.hasHeating) {
        return {
          severity: 'pass',
          message: 'Calefacció present',
          explanation: 'L\'habitatge té calefacció, complint el requisit.',
          confidence: 90,
        };
      }
      
      return {
        severity: 'risk',
        message: 'Calefacció no confirmada',
        explanation: 'No s\'ha confirmat la presència de calefacció. Això pot ser un problema per al confort.',
        fixGuidance: 'Instal·la un sistema de calefacció adequat (elèctric, gas, o altres sistemes aprovats).',
        confidence: 60,
      };
    },
  },
];

export function evaluateProperty(input: PropertyInput): EvaluationResult {
  const ruleResults: RuleResult[] = rules.map((rule) => {
    const evaluation = rule.evaluate(input);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: evaluation.severity,
      message: evaluation.message,
      explanation: evaluation.explanation,
      fixGuidance: evaluation.fixGuidance,
      evidenceUsed: rule.evidenceNeeded.filter((evidence) => {
        const key = evidence as keyof PropertyInput;
        return input[key] !== undefined && input[key] !== null;
      }),
      confidence: evaluation.confidence,
    };
  });

  // Determine overall status
  const hasFail = ruleResults.some((r) => r.severity === 'fail');
  const hasRisk = ruleResults.some((r) => r.severity === 'risk');
  const hasUnknown = ruleResults.some((r) => r.severity === 'unknown');
  
  let overallStatus: RuleSeverity;
  if (hasFail) {
    overallStatus = 'fail';
  } else if (hasRisk) {
    overallStatus = 'risk';
  } else if (hasUnknown) {
    overallStatus = 'unknown';
  } else {
    overallStatus = 'pass';
  }

  // Calculate overall confidence
  const avgConfidence = ruleResults.length > 0
    ? ruleResults.reduce((sum, r) => sum + r.confidence, 0) / ruleResults.length
    : 0;

  // Collect missing evidence
  const missingEvidence: string[] = [];
  rules.forEach((rule) => {
    rule.evidenceNeeded.forEach((evidence) => {
      const key = evidence as keyof PropertyInput;
      if (input[key] === undefined || input[key] === null) {
        if (!missingEvidence.includes(evidence)) {
          missingEvidence.push(evidence);
        }
      }
    });
  });

  // Build fix plan
  const fixPlan: string[] = ruleResults
    .filter((r) => r.severity === 'fail' || r.severity === 'risk')
    .map((r) => r.fixGuidance || r.message)
    .filter((guidance): guidance is string => !!guidance);

  // Ensure confidence is a valid number
  const finalConfidence = isNaN(avgConfidence) ? 0 : Math.round(Math.max(0, Math.min(100, avgConfidence)));

  return {
    overallStatus,
    confidence: finalConfidence,
    rules: ruleResults,
    missingEvidence,
    fixPlan,
    timestamp: new Date().toISOString(),
    rulesetVersion: RULESET_VERSION,
  };
}

export { RULESET_VERSION };
