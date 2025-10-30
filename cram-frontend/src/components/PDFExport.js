'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function PDFExport({ barangay, aiAnalysis }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 220, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('CRAM Report', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Climate Resilience Action Matrix', 105, 25, { align: 'center' });
      doc.text(`Barangay: ${barangay.name || 'Unknown'}`, 105, 33, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Basic Information
      doc.setFontSize(16);
      doc.text('Basic Information', 14, 50);
      
      const basicInfo = [
        ['Barangay', barangay.name || 'N/A'],
        ['Municipality', barangay.municipality || 'N/A'],
        ['Province', barangay.province || 'Negros Oriental'],
        ['Population', barangay.population?.toLocaleString() || 'N/A'],
        ['Coastal', barangay.is_coastal ? 'Yes' : 'No']
      ];
      
      doc.autoTable({
        startY: 55,
        head: [['Field', 'Value']],
        body: basicInfo,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Resilience Scores
      doc.setFontSize(16);
      doc.text('Resilience Scores', 14, doc.lastAutoTable.finalY + 15);
      
      const resilience = barangay.resilience || {};
      const scores = [
        ['Overall BRRS Score', resilience.overall_score?.toFixed(1) || 'N/A'],
        ['Risk Level', resilience.risk_level || 'N/A'],
        ['Hazard Exposure', resilience.hazard_exposure_score?.toFixed(1) || 'N/A'],
        ['Health Sensitivity', resilience.health_sensitivity_score?.toFixed(1) || 'N/A'],
        ['Adaptive Capacity', resilience.adaptive_capacity_score?.toFixed(1) || 'N/A']
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Metric', 'Score']],
        body: scores,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Hazards
      if (barangay.hazards && barangay.hazards.length > 0) {
        doc.setFontSize(16);
        doc.text('Identified Hazards', 14, doc.lastAutoTable.finalY + 15);
        
        const hazards = barangay.hazards.map(h => [
          h.hazard_type || 'Unknown',
          h.susceptibility || 'N/A',
          h.susceptibility_score?.toString() || 'N/A'
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Hazard Type', 'Susceptibility', 'Score']],
          body: hazards,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68] }
        });
      }
      
      // AI Analysis (if available)
      if (aiAnalysis) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('AI Analysis & Recommendations', 14, 20);
        
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(aiAnalysis, 180);
        doc.text(splitText, 14, 30);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleString()} | CRAM System`,
          105,
          290,
          { align: 'center' }
        );
      }
      
      // Save
      const filename = `CRAM_Report_${barangay.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all ${
        generating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
    >
      {generating ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download size={20} />
          Export PDF Report
        </>
      )}
    </button>
  );
}