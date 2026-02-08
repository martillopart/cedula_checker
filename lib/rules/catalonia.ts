import { PropertyInput, RuleResult, RuleSeverity, EvaluationResult } from '@/types';

const RULESET_VERSION = '1.4.0-catalonia-complete';

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
    id: 'minimum-room-size',
    name: 'Superfície mínima per habitació',
    description: 'Cada habitació ha de tenir una superfície mínima de 6 m² (Decret 141/2012)',
    evidenceNeeded: ['usefulArea', 'numRooms'],
    evaluate: (input) => {
      if (!input.usefulArea || !input.numRooms || input.usefulArea <= 0 || input.numRooms <= 0) {
        return {
          severity: 'unknown',
          message: 'Dades incompletes per validar la superfície per habitació',
          explanation: 'Es necessita la superfície útil i el nombre d\'habitacions per validar aquest requisit.',
          confidence: 0,
        };
      }
      
      // Decret 141/2012: Minimum room size of 6 m² for separate rooms
      // If single space, must allow compartmentation of 8 m² room
      const averageRoomArea = input.usefulArea / input.numRooms;
      const minimumRoomSize = 6; // m² for separate rooms
      const minimumSingleSpaceSize = 8; // m² if single space
      
      // If it's a single room (studio), check against 8 m² requirement
      if (input.numRooms === 1) {
        if (input.usefulArea >= minimumSingleSpaceSize) {
          return {
            severity: 'pass',
            message: `Superfície adequada per a espai únic: ${input.usefulArea} m²`,
            explanation: `L'habitatge d'un sol espai té ${input.usefulArea} m², complint el mínim de ${minimumSingleSpaceSize} m² per permetre compartimentació d'habitació.`,
            confidence: 90,
          };
        } else {
          return {
            severity: 'fail',
            message: `Superfície insuficient per a espai únic: ${input.usefulArea} m² (mínim: ${minimumSingleSpaceSize} m²)`,
            explanation: `L'habitatge d'un sol espai ha de tenir almenys ${minimumSingleSpaceSize} m² per permetre compartimentació d'habitació segons el Decret 141/2012.`,
            fixGuidance: `L'habitatge necessita almenys ${minimumSingleSpaceSize} m² per complir els requisits de compartimentació.`,
            confidence: 100,
          };
        }
      }
      
      // For multiple rooms, check average room size (conservative estimate)
      if (averageRoomArea >= minimumRoomSize) {
        return {
          severity: 'pass',
          message: `Superfície mitjana per habitació adequada: ${averageRoomArea.toFixed(1)} m²`,
          explanation: `Amb ${input.usefulArea} m² distribuïts en ${input.numRooms} habitacions, la superfície mitjana de ${averageRoomArea.toFixed(1)} m² compleix el mínim de ${minimumRoomSize} m² per habitació.`,
          confidence: 85,
        };
      }
      
      return {
        severity: 'risk',
        message: `Superfície mitjana per habitació potser insuficient: ${averageRoomArea.toFixed(1)} m² (mínim: ${minimumRoomSize} m²)`,
        explanation: `Amb ${input.usefulArea} m² distribuïts en ${input.numRooms} habitacions, la superfície mitjana de ${averageRoomArea.toFixed(1)} m² és inferior al mínim de ${minimumRoomSize} m² per habitació requerit pel Decret 141/2012.`,
        fixGuidance: `Assegura't que cada habitació tingui almenys ${minimumRoomSize} m². La superfície total potser ha de ser major o el nombre d'habitacions menor.`,
        confidence: 80,
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
  {
    id: 'kitchen-details',
    name: 'Detalls de la cuina',
    description: 'La cuina ha de disposar d\'aigua corrent, desguàs i un aparell de cocció',
    evidenceNeeded: ['hasKitchen', 'hasRunningWater', 'hasDrainage', 'hasCookingAppliance'],
    evaluate: (input) => {
      if (!input.hasKitchen) {
        return {
          severity: 'pass', // Rule doesn't apply if no kitchen
          message: 'No aplica: cuina no present',
          explanation: 'Aquesta regla només s\'aplica si l\'habitatge té cuina.',
          confidence: 100,
        };
      }
      
      if (!input.hasRunningWater || !input.hasDrainage || !input.hasCookingAppliance) {
        const missing = [];
        if (!input.hasRunningWater) missing.push('aigua corrent');
        if (!input.hasDrainage) missing.push('desguàs');
        if (!input.hasCookingAppliance) missing.push('aparell de cocció');
        return {
          severity: 'fail',
          message: `Falten elements a la cuina: ${missing.join(', ')}`,
          explanation: `La cuina ha de tenir ${missing.join(', ')} per complir els requisits de la cédula.`,
          fixGuidance: `Assegura't que la cuina tingui ${missing.join(', ')}.`,
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Cuina amb tots els elements necessaris',
        explanation: 'La cuina disposa d\'aigua corrent, desguàs i aparell de cocció.',
        confidence: 100,
      };
    },
  },
  {
    id: 'bathroom-details',
    name: 'Detalls del bany',
    description: 'El bany ha de disposar de vàter, dutxa o banyera, aigua corrent i desguàs',
    evidenceNeeded: ['hasBathroom', 'hasWC', 'hasShowerOrBath', 'hasRunningWater', 'hasDrainage'],
    evaluate: (input) => {
      if (!input.hasBathroom) {
        return {
          severity: 'pass', // Rule doesn't apply if no bathroom
          message: 'No aplica: bany no present',
          explanation: 'Aquesta regla només s\'aplica si l\'habitatge té bany.',
          confidence: 100,
        };
      }
      
      const missing = [];
      if (!input.hasWC) missing.push('vàter');
      if (!input.hasShowerOrBath) missing.push('dutxa o banyera');
      if (!input.hasRunningWater) missing.push('aigua corrent');
      if (!input.hasDrainage) missing.push('desguàs');
      
      if (missing.length > 0) {
        return {
          severity: 'fail',
          message: `Falten elements al bany: ${missing.join(', ')}`,
          explanation: `El bany ha de tenir ${missing.join(', ')} per complir els requisits de la cédula.`,
          fixGuidance: `Assegura't que el bany tingui ${missing.join(', ')}.`,
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Bany amb tots els elements necessaris',
        explanation: 'El bany disposa de vàter, dutxa o banyera, aigua corrent i desguàs.',
        confidence: 100,
      };
    },
  },
  {
    id: 'water-supply',
    name: 'Suministrament d\'aigua',
    description: 'L\'habitatge ha de disposar de subministrament d\'aigua corrent i aigua calenta',
    evidenceNeeded: ['hasRunningWater', 'hasHotWater'],
    evaluate: (input) => {
      if (!input.hasRunningWater || !input.hasHotWater) {
        const missing = [];
        if (!input.hasRunningWater) missing.push('aigua corrent');
        if (!input.hasHotWater) missing.push('aigua calenta');
        return {
          severity: 'fail',
          message: `Falta subministrament de: ${missing.join(', ')}`,
          explanation: `L'habitatge ha de tenir subministrament de ${missing.join(', ')} per a la cédula.`,
          fixGuidance: `Assegura't que l'habitatge tingui connexió a la xarxa d'aigua i sistema d'aigua calenta.`,
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Subministrament d\'aigua adequat',
        explanation: 'L\'habitatge disposa d\'aigua corrent i aigua calenta.',
        confidence: 100,
      };
    },
  },
  {
    id: 'drainage-system',
    name: 'Sistema de desguàs',
    description: 'L\'habitatge ha de disposar d\'un sistema de desguàs adequat',
    evidenceNeeded: ['hasDrainage'],
    evaluate: (input) => {
      if (!input.hasDrainage) {
        return {
          severity: 'fail',
          message: 'Sistema de desguàs no present',
          explanation: 'L\'habitatge ha de tenir un sistema de desguàs connectat a la xarxa general o a un sistema autònom aprovat.',
          fixGuidance: 'Instal·la o verifica la connexió a un sistema de desguàs adequat.',
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Sistema de desguàs present',
        explanation: 'L\'habitatge disposa d\'un sistema de desguàs adequat.',
        confidence: 100,
      };
    },
  },
  {
    id: 'electrical-installation',
    name: 'Instal·lació elèctrica',
    description: 'L\'habitatge ha de disposar d\'una instal·lació elèctrica adequada i segura',
    evidenceNeeded: ['hasElectricalInstallation'],
    evaluate: (input) => {
      if (!input.hasElectricalInstallation) {
        return {
          severity: 'fail',
          message: 'Instal·lació elèctrica no confirmada',
          explanation: 'L\'habitatge ha de tenir una instal·lació elèctrica que compleixi la normativa vigent.',
          fixGuidance: 'Verifica la instal·lació elèctrica i, si cal, realitza les adequacions necessàries i obtén el butlletí elèctric.',
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Instal·lació elèctrica present i adequada',
        explanation: 'L\'habitatge disposa d\'una instal·lació elèctrica que compleix els requisits.',
        confidence: 100,
      };
    },
  },
  {
    id: 'energy-certificate',
    name: 'Certificat energètic',
    description: 'Certificat d\'eficiència energètica (CTE) - recomanat però no bloquejant per a la cédula',
    evidenceNeeded: ['hasEnergyCertificate'],
    evaluate: (input) => {
      if (input.hasEnergyCertificate) {
        return {
          severity: 'pass',
          message: 'Certificat energètic present',
          explanation: 'L\'habitatge disposa de certificat d\'eficiència energètic, complint amb el CTE (Código Técnico de la Edificación).',
          confidence: 100,
        };
      }
      
      return {
        severity: 'risk',
        message: 'Certificat energètic no confirmat',
        explanation: 'El certificat d\'eficiència energètic és recomanat i pot ser necessari per a la venda o lloguer de l\'habitatge segons la normativa vigent.',
        fixGuidance: 'Considera obtenir un certificat d\'eficiència energètic d\'un tècnic certificador. Això pot ser obligatori per a transaccions immobiliàries.',
        confidence: 80,
      };
    },
  },
  {
    id: 'access-circulation',
    name: 'Accés i circulació',
    description: 'L\'habitatge ha de tenir accés segur i adequat, especialment si té diversos pisos',
    evidenceNeeded: ['numFloors'],
    evaluate: (input) => {
      // If single floor or ground floor only, access is typically not an issue
      if (!input.numFloors || input.numFloors <= 1) {
        return {
          severity: 'pass',
          message: 'Accés adequat (habitatge d\'un sol pis)',
          explanation: 'Per a habitatges d\'un sol pis, l\'accés i la circulació no solen ser problemàtics.',
          confidence: 90,
        };
      }
      
      // For multi-story buildings, safe access is required
      // Note: We can't fully validate stairs safety without inspection,
      // but we can flag that it needs verification
      if (input.numFloors > 1) {
        return {
          severity: 'risk',
          message: 'Verificació d\'accés necessària (habitatge de diversos pisos)',
          explanation: `L'habitatge té ${input.numFloors} pisos. Es requereix verificar que hi hagi escales segures, portes amb amplada adequada (mínim 0,8 m) i passadissos amb amplada suficient (mínim 1,2 m).`,
          fixGuidance: 'Verifica que les escales siguin segures amb baranes, que les portes tinguin una amplada mínima de 0,8 m i que els passadissos tinguin una amplada mínima de 1,2 m per complir els requisits de seguretat.',
          confidence: 70,
        };
      }
      
      return {
        severity: 'unknown',
        message: 'Informació d\'accés incompleta',
        explanation: 'No s\'ha proporcionat informació sobre el nombre de pisos per validar els requisits d\'accés.',
        confidence: 0,
      };
    },
  },
  {
    id: 'gas-installation',
    name: 'Instal·lació de gas',
    description: 'Si l\'habitatge té gas, ha de disposar d\'una instal·lació segura i conforme',
    evidenceNeeded: ['hasGas', 'hasGasInstallation'],
    evaluate: (input) => {
      // If no gas, this rule doesn't apply
      if (!input.hasGas) {
        return {
          severity: 'pass',
          message: 'No aplica: habitatge sense gas',
          explanation: 'Aquesta regla només s\'aplica si l\'habitatge té instal·lació de gas.',
          confidence: 100,
        };
      }
      
      // If gas is present, installation must be compliant
      if (!input.hasGasInstallation) {
        return {
          severity: 'fail',
          message: 'Instal·lació de gas no confirmada o no conforme',
          explanation: 'Si l\'habitatge té gas, ha de disposar d\'una instal·lació segura i conforme amb la normativa vigent, incloent ventilació adequada per a aparells de gas.',
          fixGuidance: 'Verifica que la instal·lació de gas compleixi la normativa, que hi hagi ventilació adequada per als aparells de gas (especialment en cuina i calefacció), i obtén el butlletí de gas si és necessari.',
          confidence: 100,
        };
      }
      
      return {
        severity: 'pass',
        message: 'Instal·lació de gas present i conforme',
        explanation: 'L\'habitatge disposa d\'una instal·lació de gas segura i conforme amb la normativa.',
        confidence: 100,
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
