/**
 * T-019: PDF Report Generator — Qatar University Advisor
 * يُولِّد تقريراً PDF مخصصاً للطالب بناءً على ملفه الشخصي
 * شركة النخبوية للبرمجيات | FAANG Standards
 */

import { jsPDF } from 'jspdf';

/**
 * @param {object} profile - ملف الطالب (nationality, gpa, track, preferredMajor)
 * @param {object} report - ناتج generateFinalReport() من conversation-state.js
 * @param {string} phone - رقم هاتف الطالب (آخر 4 أرقام فقط في التقرير)
 */
export function generateStudentPDF(profile, report, phone = '') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const PAGE_W = 210;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 20;

  // ── الألوان ──
  const MAROON   = [138, 21, 56];   // #8A1538
  const GOLD     = [197, 165, 90];  // #C5A55A
  const DARK     = [30, 41, 59];    // #1e293b
  const LIGHT_BG = [248, 250, 252]; // #f8fafc
  const TEXT     = [51, 65, 85];    // #334155
  const MUTED    = [100, 116, 139]; // #64748b

  // ══ HEADER ══
  // شريط ماروني علوي
  doc.setFillColor(...MAROON);
  doc.rect(0, 0, PAGE_W, 45, 'F');

  // نص العنوان باللغة الإنجليزية (jsPDF لا يدعم العربية مباشرة)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Qatar University Academic Report', PAGE_W / 2, 15, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Al-Taqrir Al-Akademi | التقرير الاكاديمي - جامعات قطر', PAGE_W / 2, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GOLD);
  doc.text('Al-Nakhbawiya Software Company | FAANG Standards', PAGE_W / 2, 29, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  const dateStr = new Date().toLocaleDateString('en-GB');
  const phoneStr = phone ? `Student: ***${phone.slice(-4)}` : '';
  doc.text(`Generated: ${dateStr}  ${phoneStr}`, PAGE_W / 2, 37, { align: 'center' });

  // الشعار (emoji بديل — نجمة ذهبية)
  doc.setFontSize(24);
  doc.setTextColor(...GOLD);
  doc.text('\u2605', MARGIN, 28);

  y = 55;

  // ══ STUDENT PROFILE CARD ══
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_W, 35, 3, 3, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 35, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MAROON);
  doc.text('Student Profile', MARGIN + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);

  const nationalityAR = profile.nationality === 'qatari' ? 'قطري' : 'مقيم';
  const nationalityLabel = profile.nationality === 'qatari' ? `Qatari (${nationalityAR})` : `Resident (${nationalityAR})`;
  const gpaLabel = profile.gpa ? `${profile.gpa}%` : 'Not specified';
  const trackMap = { scientific: 'علمي', literary: 'أدبي', commercial: 'تجاري', technical: 'تقني' };
  const trackAR = trackMap[profile.track] || profile.track || 'غير محدد';
  const trackLabel = profile.track ? `${profile.track} (${trackAR})` : `Not specified (${trackAR})`;
  const majorLabel = profile.preferredMajor || 'Not specified';

  const col1X = MARGIN + 5;
  const col2X = MARGIN + CONTENT_W / 2;
  doc.text(`Nationality:  ${nationalityLabel}`, col1X, y + 17);
  doc.text(`GPA:          ${gpaLabel}`, col1X, y + 24);
  doc.text(`Track:        ${trackLabel}`, col2X, y + 17);
  doc.text(`Major:        ${majorLabel}`, col2X, y + 24);

  // Progress bar للملف
  const completeness = getProfileCompleteness(profile);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Profile Completeness: ${completeness}%`, col1X, y + 31);
  doc.setFillColor(...GOLD);
  doc.rect(col2X, y + 27, (CONTENT_W / 2 - 10) * (completeness / 100), 4, 'F');
  doc.setDrawColor(...MUTED);
  doc.rect(col2X, y + 27, CONTENT_W / 2 - 10, 4, 'S');

  y += 45;

  // ══ RECOMMENDED UNIVERSITIES ══
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MAROON);
  doc.text('Recommended Universities | Al-Jamiaat Al-Muqtaraha', MARGIN, y);
  // خط تحت العنوان
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y + 2, MARGIN + 80, y + 2);
  y += 8;

  const universities = getUniversities(profile.gpa);
  universities.forEach((uni, i) => {
    doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 247 : 255, i % 2 === 0 ? 250 : 255);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MAROON);
    doc.text(`${i + 1}.`, MARGIN + 3, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT);
    doc.text(uni.name, MARGIN + 10, y + 5.5);
    doc.setTextColor(...MUTED);
    doc.text(uni.notes, MARGIN + CONTENT_W - 5, y + 5.5, { align: 'right' });
    y += 9;
  });

  y += 6;

  // ══ SCHOLARSHIPS ══
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MAROON);
  doc.text('Available Scholarships | Al-Minah Al-Mutaha', MARGIN, y);
  doc.setDrawColor(...GOLD);
  doc.line(MARGIN, y + 2, MARGIN + 80, y + 2);
  y += 8;

  const scholarships = getScholarships(profile.nationality);
  scholarships.forEach((s, i) => {
    doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 247 : 255, i % 2 === 0 ? 250 : 255);
    doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    doc.text(`- ${s.name}`, MARGIN + 3, y + 5.5);
    doc.setTextColor(...MUTED);
    doc.text(s.details, MARGIN + CONTENT_W - 5, y + 5.5, { align: 'right' });
    y += 9;
  });

  y += 6;

  // ══ NEXT STEPS ══
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MAROON);
  doc.text('Action Plan | Khattat Al-Amal', MARGIN, y);
  doc.setDrawColor(...GOLD);
  doc.line(MARGIN, y + 2, MARGIN + 80, y + 2);
  y += 8;

  const steps = [
    'Submit applications before deadline (usually Feb-Apr)',
    'Prepare: High school transcript + IELTS/TOEFL + Motivation letter',
    'Apply to multiple universities simultaneously',
    'Check scholarship deadlines (Amiri scholarship: Nov-Jan)',
    'Prepare for university interviews if required',
  ];

  steps.forEach((step, i) => {
    // دائرة رقم
    doc.setFillColor(...MAROON);
    doc.circle(MARGIN + 4, y + 3.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1), MARGIN + 4, y + 5, { align: 'center' });
    // النص
    doc.setTextColor(...TEXT);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(step, MARGIN + 10, y + 5.5);
    y += 9;
  });

  y += 6;

  // ══ IMPORTANT DATES ══
  if (y < 230) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MAROON);
    doc.text('Important Dates | Al-Mawaeid Al-Muhimma', MARGIN, y);
    doc.setDrawColor(...GOLD);
    doc.line(MARGIN, y + 2, MARGIN + 80, y + 2);
    y += 8;

    const dates = [
      { period: 'Nov - Jan',  event: 'Amiri Scholarship applications open' },
      { period: 'Feb - Apr',  event: 'University admissions deadlines' },
      { period: 'May - Jun',  event: 'Admission results announced' },
      { period: 'Aug - Sep',  event: 'University registration begins' },
    ];

    dates.forEach((d, i) => {
      doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 247 : 255, i % 2 === 0 ? 250 : 255);
      doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...GOLD);
      doc.text(d.period, MARGIN + 3, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      doc.text(d.event, MARGIN + 35, y + 5.5);
      y += 9;
    });
  }

  // ══ FOOTER ══
  const PAGE_H = 297;
  doc.setFillColor(...DARK);
  doc.rect(0, PAGE_H - 18, PAGE_W, 18, 'F');
  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Al-Nakhbawiya Software Company', PAGE_W / 2, PAGE_H - 10, { align: 'center' });
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Qatar University Academic Advisor | FAANG Standards | Confidential', PAGE_W / 2, PAGE_H - 5, { align: 'center' });

  // حفظ الملف
  const studentId = phone ? phone.slice(-4) : 'student';
  const filename = `Qatar-Academic-Advisor-Report-${studentId}-${dateStr.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

// ── Helpers ──

function getProfileCompleteness(profile) {
  let score = 0;
  if (profile.nationality) score += 25;
  if (profile.userType && profile.userType !== 'GENERAL') score += 15;
  if (profile.gpa) score += 25;
  if (profile.track) score += 15;
  if (profile.preferredMajor) score += 20;
  return score;
}

function getUniversities(gpa) {
  if (gpa >= 90) return [
    { name: 'Weill Cornell Medicine-Qatar', notes: 'Top choice - Medicine & Pre-med' },
    { name: 'Qatar University - Medicine', notes: 'National university' },
    { name: 'Carnegie Mellon University Qatar', notes: 'CS & Business' },
    { name: 'Georgetown University Qatar', notes: 'International Affairs' },
  ];
  if (gpa >= 85) return [
    { name: 'Carnegie Mellon University Qatar', notes: 'CS & Business' },
    { name: 'Texas A&M University Qatar', notes: 'Engineering' },
    { name: 'Qatar University - Engineering', notes: 'Top engineering programs' },
    { name: 'Northwestern University Qatar', notes: 'Journalism & Communication' },
  ];
  if (gpa >= 80) return [
    { name: 'Qatar University', notes: 'Wide range of programs' },
    { name: 'UDST', notes: 'Technical & vocational' },
    { name: 'Northwestern University Qatar', notes: 'Journalism & Communication' },
    { name: 'Virginia Commonwealth University Qatar', notes: 'Arts & Design' },
  ];
  return [
    { name: 'Qatar University', notes: 'National university' },
    { name: 'Qatar Community College', notes: 'Foundation programs' },
    { name: 'UDST', notes: 'Technical programs' },
  ];
}

function getScholarships(nationality) {
  if (nationality === 'qatari') return [
    { name: 'Amiri Scholarship',                    details: 'Harvard / MIT / Oxford' },
    { name: 'Qatar Energy Scholarship',             details: 'Engineering & Science' },
    { name: 'Internal Scholarship (Qatar Foundation)', details: 'Education City universities' },
  ];
  return [
    { name: 'Qatar Education Scholarship',       details: 'For residents' },
    { name: 'Qatar University Excellence Grant', details: 'Merit-based' },
    { name: 'Education City Internal Grants',    details: 'Per university' },
  ];
}
