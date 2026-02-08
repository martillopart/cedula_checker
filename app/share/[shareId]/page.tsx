'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Case, RuleSeverity } from '@/types';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function SharePage() {
  const params = useParams();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.shareId && typeof params.shareId === 'string') {
      fetch(`/api/share/${params.shareId}`)
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
  }, [params.shareId]);

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
          <p className="text-red-600">No s'ha trobat el cas</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Informe de Pre-validació
          </h1>

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
                      <p className="text-sm text-gray-700">{rule.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
            })()}
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Aquest és un informe de pre-validació. No substitueix la certificació oficial d'un tècnic qualificat.
          </p>
        </div>
      </div>
    </div>
  );
}
