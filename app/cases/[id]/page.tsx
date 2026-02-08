'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Case, CaseStatus } from '@/types';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Image as ImageIcon,
  Download,
  Share2,
  Edit
} from 'lucide-react';
import Link from 'next/link';

const statusFlow: CaseStatus[] = ['new', 'waiting', 'scheduled', 'ready', 'submitted', 'done'];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof params.id === 'string') {
      loadCase(params.id);
    }
  }, [params.id]);

  const loadCase = async (id: string) => {
    try {
      const response = await fetch(`/api/cases/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCaseData(data);
      }
    } catch (error) {
      console.error('Error loading case:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: CaseStatus) => {
    if (!caseData) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/cases/${caseData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCaseData(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Case not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(caseData.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {caseData.propertyInput.address || 'Property Case'}
              </h1>
              <p className="text-gray-600">
                {caseData.propertyInput.municipality}, {caseData.propertyInput.region}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/results/${caseData.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Results
              </Link>
              <a
                href={`/api/pdf/${caseData.id}`}
                download
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Status</h2>
            <div className="flex items-center justify-between">
              {statusFlow.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const canAdvance = index === currentStatusIndex + 1;

                return (
                  <div key={status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => canAdvance && !updating && updateStatus(status)}
                        disabled={!canAdvance || updating}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                            : isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        } ${canAdvance && !updating ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                        title={status.charAt(0).toUpperCase() + status.slice(1)}
                      >
                        {index + 1}
                      </button>
                      <span className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        isActive ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Property Type</h3>
              <p className="text-gray-900">{caseData.propertyInput.propertyType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Use Case</h3>
              <p className="text-gray-900">{caseData.propertyInput.useCase}</p>
            </div>
            {caseData.propertyInput.usefulArea && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Useful Area</h3>
                <p className="text-gray-900">{caseData.propertyInput.usefulArea} m²</p>
              </div>
            )}
            {caseData.propertyInput.intendedOccupancy && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Intended Occupancy</h3>
                <p className="text-gray-900">{caseData.propertyInput.intendedOccupancy} people</p>
              </div>
            )}
          </div>

          {/* Evaluation Result */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Result</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                caseData.evaluationResult.overallStatus === 'pass'
                  ? 'bg-green-100 text-green-800'
                  : caseData.evaluationResult.overallStatus === 'fail'
                  ? 'bg-red-100 text-red-800'
                  : caseData.evaluationResult.overallStatus === 'risk'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {caseData.evaluationResult.overallStatus.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                Confidence: {caseData.evaluationResult.confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
