"use client";

import React, { useState } from 'react';
import { DataService } from '../../lib/services/dataService';
import { Download, Upload, RefreshCw, X, Check, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DataManagementModal = ({
  onClose,
  onDataChanged,
}) => {
  const [importJson, setImportJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleExport = () => {
    const jsonStr = DataService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buku-saku-akar-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'File backup JSON berhasil diunduh!' });
  };

  const handleCopyJSON = () => {
    const jsonStr = DataService.exportAllDataJSON();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setStatusMsg({ type: 'success', text: 'Data JSON berhasil disalin ke clipboard!' });
  };

  const handleImport = (e) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const success = DataService.importDataJSON(importJson.trim());
    if (success) {
      setStatusMsg({ type: 'success', text: 'Data berhasil diimpor & diperbarui!' });
      onDataChanged();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: 'Format JSON tidak valid. Pastikan data benar.' });
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Yakin ingin mereset perubahan data akar ke default awal pabrik? Jurnal Anda tetap aman.')) {
      DataService.resetRootsToDefault();
      setStatusMsg({ type: 'success', text: 'Data akar berhasil dikembalikan ke standar awal.' });
      onDataChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Sinkronisasi & Backup Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ekspor & Impor data untuk dibagikan ke teman tim NPT.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            {statusMsg.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Ekspor Data Anda
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simpan seluruh catatan jurnal, bookmark, dan temuan materi baru ke dalam file format JSON.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File .JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin JSON ke Clipboard'}</span>
            </button>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        <form onSubmit={handleImport} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. Impor Data dari Rekan NPT
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tempelkan (paste) teks JSON yang didapat dari teman untuk menggabungkan materi baru.
          </p>

          <textarea
            rows={4}
            placeholder='Tempel format JSON di sini, contoh: { "version": "1.0", ... }'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!importJson.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Impor & Terapkan Data</span>
          </button>
        </form>

        <hr className="border-slate-100 dark:border-slate-800" />

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Reset Data Akar</p>
            <p className="text-[11px] text-slate-400">Kembalikan 14 akar ke teks default awal</p>
          </div>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
