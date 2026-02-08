import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Case, RuleSeverity } from '@/types';

export function generatePDF(caseData: Case): Uint8Array {
  const doc = new jsPDF();
  const { propertyInput, evaluationResult } = caseData;

  // Title
  doc.setFontSize(20);
  doc.text('Informe de Pre-validació', 20, 20);
  doc.setFontSize(12);
  doc.text('Cédula de Habitabilitat - Catalunya', 20, 30);

  // Property Information
  let yPos = 45;
  doc.setFontSize(14);
  doc.text('Informació de la Propietat', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  if (propertyInput.address) {
    doc.text(`Adreça: ${propertyInput.address}`, 20, yPos);
    yPos += 7;
  }
  doc.text(`Municipi: ${propertyInput.municipality || 'N/A'}`, 20, yPos);
  yPos += 7;
  doc.text(`Tipus: ${propertyInput.propertyType || 'N/A'}`, 20, yPos);
  yPos += 7;
  doc.text(`Ús: ${propertyInput.useCase || 'N/A'}`, 20, yPos);
  yPos += 7;

  if (propertyInput.usefulArea !== undefined && propertyInput.usefulArea !== null) {
    doc.text(`Superfície útil: ${propertyInput.usefulArea} m²`, 20, yPos);
    yPos += 7;
  }

  // Overall Status
  yPos += 5;
  doc.setFontSize(14);
  doc.text('Resultat General', 20, yPos);
  yPos += 10;

  const statusColors: Record<RuleSeverity, [number, number, number]> = {
    pass: [34, 197, 94],
    risk: [251, 191, 36],
    fail: [239, 68, 68],
    unknown: [156, 163, 175],
  };

  const statusLabels: Record<RuleSeverity, string> = {
    pass: 'APROVAT',
    risk: 'RISC',
    fail: 'NO APROVAT',
    unknown: 'PENDENT',
  };

  const overallStatus = evaluationResult.overallStatus || 'unknown';
  const statusColor = statusColors[overallStatus] || statusColors.unknown;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(20, yPos - 5, 50, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(statusLabels[overallStatus] || 'PENDENT', 25, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  doc.setFontSize(10);
  const confidence = evaluationResult.confidence ?? 0;
  doc.text(`Confiança: ${confidence}%`, 20, yPos);
  yPos += 10;

  // Rules Table
  doc.setFontSize(14);
  doc.text('Detall de Requisits', 20, yPos);
  yPos += 10;

  // Ensure we have rules to display
  if (evaluationResult.rules && evaluationResult.rules.length > 0) {
    const tableData = evaluationResult.rules.map((rule) => [
      rule.ruleName || 'N/A',
      rule.severity?.toUpperCase() || 'UNKNOWN',
      rule.message ? (rule.message.length > 60 ? rule.message.substring(0, 60) + '...' : rule.message) : 'N/A',
    ]);

    autoTable(doc, {
      head: [['Requisit', 'Estat', 'Missatge']],
      body: tableData,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 100 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) return; // Skip header row
        const ruleIndex = data.row.index - 1;
        if (ruleIndex >= 0 && ruleIndex < evaluationResult.rules.length) {
          const rule = evaluationResult.rules[ruleIndex];
          const severity = rule?.severity || 'unknown';
          const colors = statusColors[severity] || statusColors.unknown;
          if (data.column.index === 1) {
            data.cell.styles.fillColor = colors;
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable?.finalY || yPos + 50;
  } else {
    doc.setFontSize(10);
    doc.text('No hi ha regles per mostrar.', 20, yPos);
    yPos += 20;
  }

  const finalY = yPos;

  // Fix Plan
  let currentY = finalY;
  if (evaluationResult.fixPlan && evaluationResult.fixPlan.length > 0) {
    currentY += 15;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(14);
    doc.text('Pla de Correcció', 20, currentY);
    
    doc.setFontSize(10);
    currentY += 10;
    evaluationResult.fixPlan.forEach((fix, index) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
      const fixText = fix && fix.length > 80 
        ? `${index + 1}. ${fix.substring(0, 80)}...` 
        : `${index + 1}. ${fix || 'N/A'}`;
      doc.text(fixText, 20, currentY, { maxWidth: 170 });
      currentY += 7;
    });
  }

  // Missing Evidence
  if (evaluationResult.missingEvidence && evaluationResult.missingEvidence.length > 0) {
    currentY += 15;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(14);
    doc.text('Evidència Faltant', 20, currentY);
    
    doc.setFontSize(10);
    currentY += 10;
    evaluationResult.missingEvidence.forEach((evidence) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(`• ${evidence || 'N/A'}`, 20, currentY);
      currentY += 7;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    let timestamp = 'Data desconeguda';
    if (evaluationResult.timestamp) {
      try {
        const date = new Date(evaluationResult.timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toLocaleString('ca-ES');
        }
      } catch (error) {
        // Keep default 'Data desconeguda'
      }
    }
    const version = evaluationResult.rulesetVersion || 'Desconeguda';
    doc.text(
      `Generat el ${timestamp} | Versió: ${version}`,
      20,
      pageHeight - 20
    );
    doc.text(
      'Aquest és un informe de pre-validació. No substitueix la certificació oficial d\'un tècnic qualificat.',
      20,
      pageHeight - 15
    );
  }

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}
