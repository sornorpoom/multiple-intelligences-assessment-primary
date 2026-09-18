/**
 * โมดูลส่งออกรายงานการประเมินเป็น PDF
 */

class MIPDFExport {
  /**
   * สร้าง HTML Report สำหรับพิมพ์หรือดาวน์โหลด PDF
   * @param {Object} studentInfo 
   * @param {Object} scoringResults 
   */
  static generateReportHtml(studentInfo, scoringResults) {
    const { dimensionResults, totalStats, topStrengths } = scoringResults;
    const narrative = MIScoring.getSummaryNarrative(scoringResults);
    const radarImg = MICharts.getRadarChartImage();
    const barImg = MICharts.getBarChartImage();

    const formattedDate = studentInfo.date 
      ? new Date(studentInfo.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    let rowsHtml = '';
    dimensionResults.forEach((dim, idx) => {
      let badgeBg = '#f1f5f9';
      let badgeColor = '#334155';
      if (dim.level === 4) { badgeBg = '#d1fae5'; badgeColor = '#065f46'; }
      else if (dim.level === 3) { badgeBg = '#dbeafe'; badgeColor = '#1e40af'; }
      else if (dim.level === 2) { badgeBg = '#fef3c7'; badgeColor = '#92400e'; }
      else if (dim.level === 1) { badgeBg = '#ffedd5'; badgeColor = '#9a3412'; }

      rowsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #475569;">${idx + 1}</td>
          <td style="padding: 8px 10px; font-weight: bold; color: ${dim.dimension.color};">${dim.dimension.name}</td>
          <td style="padding: 8px 10px; text-align: center;">${dim.rawScore} / 10</td>
          <td style="padding: 8px 10px; text-align: center; font-weight: bold;">${dim.percentage}%</td>
          <td style="padding: 8px 10px; text-align: center;">
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block;">
              ${dim.levelInfo.shortTitle}
            </span>
          </td>
        </tr>
      `;
    });

    let topStrengthsHtml = '';
    if (topStrengths.length > 0 && !totalStats.isOverallLevel0) {
      topStrengthsHtml = topStrengths.map((s, idx) => `
        <div style="margin-bottom: 8px; padding: 10px; background: #f8fafc; border-left: 4px solid ${s.dimension.color}; border-radius: 4px;">
          <strong style="color: ${s.dimension.color}; font-size: 14px;">อันดับ ${idx + 1}: ${s.dimension.name} (${s.percentage}%)</strong> - ${s.levelInfo.shortTitle}
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${s.dimension.description}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #1e293b;"><strong>แนวทางส่งเสริม:</strong> ${s.dimension.guidance}</p>
        </div>
      `).join('');
    } else {
      topStrengthsHtml = `<p style="color: #64748b; font-size: 13px;">${narrative.summaryText}</p>`;
    }

    return `
      <div id="pdf-report-container" style="font-family: 'Sarabun', 'Prompt', sans-serif; color: #1e293b; background: #ffffff; padding: 24px; max-width: 800px; margin: 0 auto; line-height: 1.45;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
          <h1 style="font-family: 'Prompt', sans-serif; font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0 0 4px 0;">
            รายงานผลการประเมินพหุปัญญา (Multiple Intelligences Report)
          </h1>
          <p style="font-size: 13px; color: #475569; margin: 0;">
            แบบประเมินพหุปัญญาสำหรับผู้เรียนระดับชั้นประถมศึกษาตอนปลาย | สำนักงานเลขาธิการสภาการศึกษา
          </p>
        </div>

        <!-- Student Info Box -->
        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
          <tr>
            <td style="padding: 8px 12px;"><strong>ชื่อ-นามสกุล:</strong> ${studentInfo.fullName || '-'}</td>
            <td style="padding: 8px 12px;"><strong>ระดับชั้น:</strong> ${studentInfo.grade || '-'}</td>
            <td style="padding: 8px 12px;"><strong>เลขที่:</strong> ${studentInfo.studentNo || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>โรงเรียน:</strong> ${studentInfo.schoolName || '-'}</td>
            <td style="padding: 8px 12px;" colspan="2"><strong>วันที่ประเมิน:</strong> ${formattedDate}</td>
          </tr>
        </table>

        <!-- Visual Analytics Section (Charts) -->
        <div style="display: flex; gap: 16px; margin-bottom: 16px; align-items: center; justify-content: center;">
          ${radarImg ? `<div style="flex: 1; text-align: center; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;"><h4 style="font-size: 12px; margin: 0 0 4px 0; color: #475569;">ผังใยแมงมุมแสดงสมดุล 9 ด้าน</h4><img src="${radarImg}" style="max-width: 100%; height: 210px; object-fit: contain;" /></div>` : ''}
          ${barImg ? `<div style="flex: 1; text-align: center; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;"><h4 style="font-size: 12px; margin: 0 0 4px 0; color: #475569;">แผนภูมิเปรียบเทียบระดับคะแนน</h4><img src="${barImg}" style="max-width: 100%; height: 210px; object-fit: contain;" /></div>` : ''}
        </div>

        <!-- Score Summary Table -->
        <h3 style="font-family: 'Prompt', sans-serif; font-size: 15px; color: #1e3a8a; margin: 0 0 8px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
          📊 ตารางสรุปผลคะแนนรายด้าน 9 ด้าน
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; font-size: 12px;">
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; width: 35px;">ที่</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; text-align: left;">ด้านพหุปัญญา</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; width: 90px;">คะแนนดิบ</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; width: 90px;">ร้อยละ</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; width: 170px;">ระดับความสามารถ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Page break for cleaner print layout if needed -->
        <div style="page-break-inside: avoid;">
          <!-- Top Strengths & Guidance -->
          <h3 style="font-family: 'Prompt', sans-serif; font-size: 15px; color: #1e3a8a; margin: 0 0 8px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
            🌟 การวิเคราะห์จุดเด่นและแนวทางพัฒนาศักยภาพ
          </h3>
          <div style="margin-bottom: 16px;">
            ${topStrengthsHtml}
          </div>

          <!-- Signature Section -->
          <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 12px; font-size: 12px; color: #475569;">
            <div style="text-align: center; width: 45%;">
              <p>ลงชื่อ..........................................................</p>
              <p>( ${studentInfo.fullName || 'ผู้รับการประเมิน'} )</p>
              <p>ผู้ประเมินตนเอง</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <p>ลงชื่อ..........................................................</p>
              <p>( .......................................................... )</p>
              <p>ครูที่ปรึกษา / ครูแนะแนว</p>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * ดาวน์โหลดรายงานเป็นไฟล์ PDF ด้วย html2pdf.js
   * @param {Object} studentInfo 
   * @param {Object} scoringResults 
   */
  static downloadPDF(studentInfo, scoringResults) {
    const reportHtml = this.generateReportHtml(studentInfo, scoringResults);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportHtml;
    document.body.appendChild(tempDiv);

    const filename = `รายงานพหุปัญญา_${studentInfo.fullName || 'นักเรียน'}_${new Date().toISOString().slice(0,10)}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(tempDiv.firstElementChild).save().then(() => {
        document.body.removeChild(tempDiv);
      }).catch(err => {
        console.error('html2pdf error:', err);
        document.body.removeChild(tempDiv);
        window.print();
      });
    } else {
      document.body.removeChild(tempDiv);
      window.print();
    }
  }

  /**
   * สั่งพิมพ์ผ่านเบราว์เซอร์
   */
  static printReport(studentInfo, scoringResults) {
    window.print();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MIPDFExport;
}
