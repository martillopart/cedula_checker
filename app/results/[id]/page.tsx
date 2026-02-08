'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Case, RuleSeverity } from '@/types';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, Download, Share2 } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      fetch(`/api/cases/${params.id}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Case not found');
          }
          let data;
          try {
            data = await res.json();
          } catch (error) {
            throw new Error('Invalid JSON response from server');
          }
          return data;
        })
        .then((data) => {
          setCaseData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!caseData) return;
    
    try {
      const response = await fetch(`/api/pdf/${caseData.id}`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cedula-report-${caseData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Si us plau, torna-ho a intentar.');
    }
  };

  const handleShare = () => {
    if (caseData?.shareId) {
      const shareUrl = `${window.location.origin}/share/${caseData.shareId}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Enllaç copiat al porta-retalls!');
        }).catch((error) => {
          console.error('Error copying to clipboard:', error);
          // Fallback: select text
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            alert('Enllaç copiat al porta-retalls!');
          } catch (err) {
            alert(`Enllaç: ${shareUrl}`);
          }
          document.body.removeChild(textArea);
        });
      } else {
        // Fallback for browsers without clipboard API
        alert(`Enllaç: ${shareUrl}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant resultats...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No s'ha trobat el cas</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            Tornar a l'inici
          </button>
        </div>
      </div>
    );
  }

  const { propertyInput, evaluationResult } = caseData;

  const statusConfig: Record<RuleSeverity, { icon: any; color: string; bgColor: string; label: string }> = {
    pass: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'APROVAT',
    },
    risk: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'RISC',
    },
    fail: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'NO APROVAT',
    },
    unknown: {
      icon: HelpCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'PENDENT',
    },
  };

  const status = statusConfig[evaluationResult.overallStatus];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Resultats de la Validació
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descarregar PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`${status.bgColor} rounded-lg p-6 mb-6`}>
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-12 h-12 ${status.color}`} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{status.label}</h2>
                <p className="text-gray-600">
                  Confiança: {evaluationResult.confidence}%
                </p>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informació de la Propietat
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {propertyInput.address && (
                <div>
                  <span className="font-medium text-gray-700">Adreça:</span>{' '}
                  <span className="text-gray-600">{propertyInput.address}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Municipi:</span>{' '}
                <span className="text-gray-600">{propertyInput.municipality}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tipus:</span>{' '}
                <span className="text-gray-600">{propertyInput.propertyType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ús:</span>{' '}
                <span className="text-gray-600">{propertyInput.useCase}</span>
              </div>
              {propertyInput.usefulArea && (
                <div>
                  <span className="font-medium text-gray-700">Superfície útil:</span>{' '}
                  <span className="text-gray-600">{propertyInput.usefulArea} m²</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rules Results */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Detall de Requisits
          </h2>
          <div className="space-y-4">
            {evaluationResult.rules.map((rule) => {
              const ruleStatus = statusConfig[rule.severity];
              const RuleIcon = ruleStatus.icon;
              return (
                <div
                  key={rule.ruleId}
                  className={`${ruleStatus.bgColor} rounded-lg p-4 border-l-4 ${
                    rule.severity === 'pass'
                      ? 'border-green-500'
                      : rule.severity === 'risk'
                      ? 'border-yellow-500'
                      : rule.severity === 'fail'
                      ? 'border-red-500'
                      : 'border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RuleIcon className={`w-5 h-5 ${ruleStatus.color} mt-0.5`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {rule.ruleName}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">{rule.message}</p>
                      <p className="text-xs text-gray-600 mb-2">{rule.explanation}</p>
                      {rule.fixGuidance && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Recomanació:
                          </p>
                          <p className="text-xs text-gray-600">{rule.fixGuidance}</p>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Confiança: {rule.confidence}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fix Plan */}
        {evaluationResult.fixPlan.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pla de Correcció
            </h2>
            <ul className="space-y-2">
              {evaluationResult.fixPlan.map((fix, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span className="text-gray-700">{fix}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Evidence */}
        {evaluationResult.missingEvidence.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Evidència Faltant
            </h2>
            <ul className="space-y-2">
              {evaluationResult.missingEvidence.map((evidence, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700">{evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p className="text-xs text-gray-500 text-center">
            Generat el {(() => {
              try {
                if (evaluationResult.timestamp) {
                  const date = new Date(evaluationResult.timestamp);
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleString('ca-ES');
                  }
                }
              } catch (error) {
                // Fall through to default
              }
              return 'Data desconeguda';
            })()} | Versió de regles: {evaluationResult.rulesetVersion || 'Desconeguda'}
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Aquest és un informe de pre-validació. No substitueix la certificació oficial d'un tècnic qualificat.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            ← Tornar a l'inici
          </button>
        </div>
      </div>
    </div>
  );
}
