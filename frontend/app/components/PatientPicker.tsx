import React, { useState, useEffect } from 'react';
import api, { PatientRecord } from '../../services/api';

export interface PatientPickerValue {
  isNew: boolean;
  patientId: string;
  patientName: string;
  dateOfBirth?: string;
  gender?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface PatientPickerProps {
  value: PatientPickerValue;
  onChange: (val: PatientPickerValue) => void;
  showDetailsFields?: boolean;
  existingOnly?: boolean;
}

export function PatientPicker({ value, onChange, showDetailsFields = false, existingOnly = false }: PatientPickerProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(existingOnly ? 'existing' : (value.isNew ? 'new' : 'existing'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (existingOnly && activeTab !== 'existing') {
      setActiveTab('existing');
    }
  }, [existingOnly, activeTab]);

  useEffect(() => {
    if (activeTab !== 'existing' || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await api.searchPatients(searchQuery);
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  const handleTabChange = (tab: 'existing' | 'new') => {
    setActiveTab(tab);
    onChange({
      isNew: tab === 'new',
      patientId: '',
      patientName: '',
      dateOfBirth: '',
      gender: 'Male',
      contactPhone: '',
      contactEmail: ''
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectExisting = (patient: PatientRecord) => {
    onChange({
      isNew: false,
      patientId: patient.id,
      patientName: patient.name
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      {!existingOnly && (
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => handleTabChange('existing')}
            className={`flex-1 py-1 text-xs font-semibold rounded ${activeTab === 'existing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-200'}`}
          >
            Existing Patient
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('new')}
            className={`flex-1 py-1 text-xs font-semibold rounded ${activeTab === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-200'}`}
          >
            New Patient
          </button>
        </div>
      )}

      {existingOnly || activeTab === 'existing' ? (
        <div className="space-y-2">
          {value.patientId ? (
            <div className="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded">
              <div>
                <span className="block text-xs font-semibold text-indigo-900">{value.patientName}</span>
                <span className="block text-[10px] text-indigo-700 font-mono select-all">ID: {value.patientId}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange({ isNew: false, patientId: '', patientName: '' })}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600">Search Patient Name</label>
              <div className="flex items-center mt-1 relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900 pr-8"
                />
                {loadingSearch && (
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">...</span>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectExisting(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 border-b border-slate-100 last:border-0 block"
                    >
                      <span className="font-semibold block text-slate-800">{p.name}</span>
                      <span className="text-[10px] block text-slate-500 font-mono">{p.id}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && !loadingSearch && searchResults.length === 0 && (
                <p className="text-[10px] text-slate-500 mt-1 italic">No matches found.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Full Name</label>
            <input
              type="text"
              required
              value={value.patientName}
              onChange={(e) => onChange({ ...value, patientName: e.target.value })}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
            />
          </div>
          {showDetailsFields && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={value.dateOfBirth || ''}
                    onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Gender</label>
                  <select
                    value={value.gender || 'Male'}
                    onChange={(e) => onChange({ ...value, gender: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs bg-white text-slate-900 font-medium"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Phone</label>
                  <input
                    type="text"
                    value={value.contactPhone || ''}
                    onChange={(e) => onChange({ ...value, contactPhone: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    value={value.contactEmail || ''}
                    onChange={(e) => onChange({ ...value, contactEmail: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-500 font-semibold italic bg-amber-50 border border-amber-100 p-1.5 rounded">
            ID will be automatically generated by the server on submission.
          </div>
        </div>
      )}
    </div>
  );
}
