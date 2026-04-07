"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";

interface CSVRow {
  studentName: string;
  studentId: string;
  degree: string;
  issueDate: string;
}

interface CSVUploaderProps {
  onDataParsed: (data: CSVRow[]) => void;
}

export default function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);

  const processFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        
        // Validate required columns
        const requiredCols = ["studentName", "studentId", "degree", "issueDate"];
        const headers = Object.keys(rows[0] || {});
        const missing = requiredCols.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          setError(`Missing columns: ${missing.join(", ")}. Required: studentName, studentId, degree, issueDate`);
          return;
        }

        const validRows: CSVRow[] = rows
          .filter((row) => row.studentName && row.studentId && row.degree && row.issueDate)
          .map((row) => ({
            studentName: row.studentName.trim(),
            studentId: row.studentId.trim(),
            degree: row.degree.trim(),
            issueDate: row.issueDate.trim(),
          }));

        setRowCount(validRows.length);
        onDataParsed(validRows);
      },
      error: (err) => {
        setError(`Parse error: ${err.message}`);
      },
    });
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      processFile(file);
    } else {
      setError("Please upload a .csv file");
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div>
      <motion.div
        className={`drop-zone relative ${isDragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          id="csv-upload"
        />
        <div className="flex flex-col items-center gap-3">
          {fileName ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-accent" />
              <p className="text-white font-medium">{fileName}</p>
              <p className="text-text-secondary text-sm">
                {rowCount} valid records found
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-text-muted" />
              <p className="text-white font-medium">
                Drop CSV file here or click to browse
              </p>
              <p className="text-text-muted text-sm">
                Columns: studentName, studentId, degree, issueDate
              </p>
            </>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {fileName && !error && rowCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-accent text-sm bg-accent/10 p-3 rounded-xl"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          CSV parsed successfully — {rowCount} certificates ready to issue
        </motion.div>
      )}
    </div>
  );
}
