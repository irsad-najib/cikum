"use client";

import { useState, useEffect } from "react";

const SHEET_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSn_Axyrj2IxuFsO3ucQAlzl30DgKCw7lDMf2aWT3syhOLem-4r8CZFpnxhgcY1fvSAvLJ1AXBnjlJt/pub?output=csv";

// Configure your sheets here - add the correct gid for each sheet
// To find the gid: open the sheet in browser, the URL will show gid=XXXXXXX for each tab
const SHEETS = [
  { name: "Sheet 1", gid: null }, // null means default/first sheet
  { name: "Sheet 2", gid: "1930446062" }, // replace with actual gid
  { name: "Sheet 3", gid: "826689546" }, // replace with actual gid
  { name: "Sheet 4", gid: "697864567" }, // replace with actual gid
  { name: "Sheet 5", gid: "397232107" }, // replace with actual gid
];

// Minimal CSV parser that supports quoted fields and escaped quotes
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const row = [];
    let field = "";
    let inQuotes = false;

    while (i < len) {
      const ch = text[i];

      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < len && text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }

      if (ch === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }

      if (ch === "\r") {
        i++;
        continue;
      }

      if (ch === "\n") {
        row.push(field);
        field = "";
        i++;
        break;
      }

      field += ch;
      i++;
    }

    if (i >= len) {
      if (field !== "" || row.length > 0) row.push(field);
    }

    if (row.length > 0) rows.push(row);
  }

  return rows;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);
  const [sheetsData, setSheetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllSheets() {
      try {
        setLoading(true);
        const promises = SHEETS.map(async (sheet) => {
          const url = sheet.gid
            ? `${SHEET_BASE_URL}&gid=${sheet.gid}`
            : SHEET_BASE_URL;

          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(
              `Failed to fetch ${sheet.name}: ${res.status} ${res.statusText}`
            );
          }

          const csvText = await res.text();
          const rows = parseCSV(csvText);

          return {
            name: sheet.name,
            rows: rows,
            headers: rows.length > 0 ? rows[0] : [],
            dataRows: rows.length > 1 ? rows.slice(1) : [],
          };
        });

        const results = await Promise.all(promises);
        setSheetsData(results);
        setError(null);
      } catch (err) {
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchAllSheets();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Data Program Kerja
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Memuat data...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Data Program Kerja
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                    Error memuat data
                  </h3>
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentSheet = sheetsData[activeTab];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Data Program Kerja
            </h1>
            <p className="text-blue-100">Desa Cikum - KKN Universitas</p>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 px-4">
            <div className="flex overflow-x-auto gap-2 py-4">
              {SHEETS.map((sheet, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      activeTab === idx
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                    }
                  `}>
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentSheet && currentSheet.rows.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
                  Tidak ada data di sheet (kosong)
                </p>
              </div>
            ) : currentSheet ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {currentSheet.headers.map((h, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentSheet.dataRows.map((r, ri) => (
                      <tr
                        key={ri}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {currentSheet.headers.map((_, ci) => (
                          <td
                            key={ci}
                            className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {r[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Menampilkan {currentSheet?.dataRows.length || 0} baris data •{" "}
              {SHEETS[activeTab].name}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
