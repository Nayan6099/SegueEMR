"use client";
import React, { useEffect, useState } from 'react';
import api from '../../../../../services/api';
import { useRouter, useParams } from 'next/navigation';

type LabReport = {
  id: string;
  testName: string;
  resultSummary?: string;
  patientName: string;
  doctorName: string;
  createdAt: string;
  updatedAt: string;
};

export default function PrintLabReport() {
  const router = useRouter();
  const { id } = useParams();
  const reportId = Array.isArray(id) ? id[0] : id;
  const [report, setReport] = useState<LabReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;
    const fetchData = async () => {
      try {
        const res = await api.fetchPrintReport(reportId);
        if (res.success && res.data) {
          setReport(res.data as LabReport);
        }
      } catch (e) {
        console.error('Failed to fetch printable report', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <p className="text-red-600">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Lab Report</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div><strong>Report ID:</strong> {report.id}</div>
          <div><strong>Test Name:</strong> {report.testName}</div>
          <div><strong>Patient:</strong> {report.patientName}</div>
          <div><strong>Doctor:</strong> {report.doctorName}</div>
        </div>
        {report.resultSummary && (
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-700 mb-2">Result Summary</h2>
            <p className="text-gray-600 whitespace-pre-line">{report.resultSummary}</p>
          </div>
        )}
        <div className="text-sm text-gray-500">
          <p>Created: {new Date(report.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(report.updatedAt).toLocaleString()}</p>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Print</button>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">Back</button>
        </div>
      </div>
    </div>
  );
}
