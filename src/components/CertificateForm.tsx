"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Hash, GraduationCap, Calendar, Send, Loader2, Wallet } from "lucide-react";

interface CertificateFormProps {
  onSubmit: (data: {
    studentName: string;
    studentId: string;
    studentAddress: string;
    degree: string;
    issueDate: string;
    file: File | null;
  }) => Promise<void>;
  loading?: boolean;
}

export default function CertificateForm({ onSubmit, loading }: CertificateFormProps) {
  const [form, setForm] = useState<{
    studentName: string;
    studentId: string;
    studentAddress: string;
    degree: string;
    issueDate: string;
    file: File | null;
  }>({
    studentName: "",
    studentId: "",
    studentAddress: "",
    degree: "",
    issueDate: "",
    file: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.file) {
      alert("Please select a certificate PDF file first.");
      return;
    }

    console.log("Submitting form with file:", form.file.name);
    await onSubmit(form);
    setForm({ studentName: "", studentId: "", studentAddress: "", degree: "", issueDate: "", file: null });
    
    // Reset file input manually since it's an uncontrolled field in terms of value
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const fields = [
    { key: "studentName" as const, label: "Student Name", icon: User, placeholder: "e.g. John Doe", type: "text" },
    { key: "studentId" as const, label: "Student ID", icon: Hash, placeholder: "e.g. STU-2024-001", type: "text" },
    { key: "studentAddress" as const, label: "Student Wallet Address", icon: Wallet, placeholder: "0x...", type: "text" },
    { key: "degree" as const, label: "Degree / Certificate", icon: GraduationCap, placeholder: "e.g. B.Tech Computer Science", type: "text" },
    { key: "issueDate" as const, label: "Issue Date", icon: Calendar, placeholder: "", type: "date" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field, index) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {field.label}
          </label>
          <div className="relative">
            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type={field.type}
              value={form[field.key as keyof typeof form] as string}
              onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              required
              className="input-field pl-11"
            />
          </div>
        </motion.div>
      ))}

      {/* File Upload Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: fields.length * 0.1 }}
      >
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Certificate File (PDF)
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
            required
            className="input-field h-auto py-2.5"
          />
        </div>
        <p className="text-text-muted text-[10px] mt-2">
          The actual certificate document will be stored securely on IPFS.
        </p>
      </motion.div>

      <motion.button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Issuing Certificate...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Issue Certificate
          </>
        )}
      </motion.button>
    </form>
  );
}
