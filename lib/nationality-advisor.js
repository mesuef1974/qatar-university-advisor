/* global */

/**
 * Add nationality-specific advice to a response
 * @param {object} response - { text, suggestions }
 * @param {string} nationality - 'qatari' | 'non_qatari' | null
 * @param {string} context - the response key (e.g., 'qu', 'scholarship_amiri')
 * @returns {object} - enhanced { text, suggestions }
 */
function addNationalityContext(response, nationality, context) {
  if (!nationality || !response) return response;

  let additionalText = '';
  let adjustedSuggestions = [...(response.suggestions || [])];

  // MILITARY COLLEGES - Qatari only
  const militaryKeys = ['abmmc', 'police', 'airforce', 'naval', 'cyber', 'rlesc', 'general_military', 'compare_military', 'fitness_military'];
  if (militaryKeys.includes(context) && nationality === 'non_qatari') {
    additionalText = '\n\n⚠️ **تنبيه مهم:** هذه الكلية/الأكاديمية متاحة **للقطريين فقط**.\n\n🌍 **بدائل متاحة لك:**\n• جامعة حمد بن خليفة (HBKU) — منح كاملة لجميع الجنسيات\n• جامعات المدينة التعليمية — منح مؤسسة قطر\n• جامعة قطر — منح المواهب والمنح الدولية';
    adjustedSuggestions = ['منح لغير القطريين', 'HBKU منح كاملة', 'جامعات المدينة التعليمية', 'جامعة قطر'];
  }

  // GOVERNMENT SCHOLARSHIPS - Qatari only
  const govScholarshipKeys = ['scholarship_amiri', 'scholarship_external', 'scholarship_internal', 'amiri', 'thamoon'];
  if (govScholarshipKeys.includes(context) && nationality === 'non_qatari') {
    additionalText = '\n\n⚠️ **تنبيه:** هذا البرنامج متاح **للقطريين فقط**.\n\n🌍 **المنح المتاحة لغير القطريين:**\n• **HBKU** — منح ماجستير 5,000 ر.ق/شهر + دكتوراه 7,500 ر.ق/شهر (جميع الجنسيات)\n• **مؤسسة قطر** — منح كاملة في المدينة التعليمية (جميع الجنسيات)\n• **منحة الفاخورة** — للمقيمين في قطر\n• **جامعة قطر** — منحة المواهب (معدل 95%+)\n• **معهد الدوحة** — منحة تميم وسند\n• **Qatar Scholarships** — للطلاب من الدول النامية';
    adjustedSuggestions = ['منح لغير القطريين', 'HBKU منح كاملة', 'منحة الفاخورة', 'معهد الدوحة'];
  }

  // COMPANY SCHOLARSHIPS - Qatari only
  const companyScholarshipKeys = ['scholarship_qatarenergy', 'scholarship_qatarairways', 'scholarship_qnb', 'scholarship_kahramaa', 'scholarship_ashghal', 'scholarship_nakilat'];
  if (companyScholarshipKeys.includes(context) && nationality === 'non_qatari') {
    additionalText = '\n\n⚠️ **تنبيه:** هذه المنحة متاحة **للقطريين فقط** (بعضها يقبل أبناء القطريات).\n\n🌍 **بدائلك:**\n• منح مؤسسة قطر في المدينة التعليمية\n• منح HBKU الممولة بالكامل\n• منحة الفاخورة (Education Above All)';
    adjustedSuggestions = ['منح لغير القطريين', 'HBKU منح كاملة', 'مؤسسة قطر'];
  }

  // QATAR UNIVERSITY - Different info per nationality
  if (context === 'qu') {
    if (nationality === 'qatari') {
      additionalText = '\n\n🇶🇦 **مميزاتك كطالب قطري:**\n✅ الدراسة **مجانية تماماً** في جميع الكليات\n✅ سكن جامعي مجاني\n✅ أولوية في القبول\n✅ برنامج طموح (10,000 ريال/شهر) لتخصصات التربية';
    } else {
      additionalText = '\n\n🌍 **معلومات لغير القطريين:**\n💰 الرسوم: 800-1,400 ريال/ساعة معتمدة حسب التخصص\n📋 القبول تنافسي\n🎓 **منحة المواهب** متاحة (معدل 80%+): سكن + تذكرة + إقامة\n🎓 **منحة الطلاب الدوليين** (معدل 95%+): رسوم + سكن + 500-1,000 ريال/شهر';
    }
  }

  // EDUCATION CITY UNIVERSITIES - highlight QF grants for non-Qataris
  const eduCityKeys = ['wcm', 'cmu', 'tamu', 'gu', 'nu', 'vcu'];
  if (eduCityKeys.includes(context)) {
    if (nationality === 'qatari') {
      additionalText = '\n\n🇶🇦 **كطالب قطري:** مؤهل للابتعاث الحكومي (الأميري أو الخارجي) الذي يغطي كامل الرسوم + راتب شهري.';
    } else {
      additionalText = '\n\n🌍 **لغير القطريين:** مؤسسة قطر تقدم **منح كاملة بناءً على الحاجة** لجميع الجنسيات. القبول need-blind — تقدم بغض النظر عن قدرتك المالية.';
    }
  }

  // HBKU - highlight for non-Qataris
  if (context === 'hbku' && nationality === 'non_qatari') {
    additionalText = '\n\n🌟 **ممتاز لغير القطريين!** HBKU تقدم:\n✅ منح ممولة بالكامل لجميع الجنسيات\n✅ ماجستير: 5,000 ريال/شهر + سكن + تذكرة\n✅ دكتوراه: 7,500 ريال/شهر + سكن + تذكرة\n✅ نسبة القبول للدوليين: 15-20%';
  }

  // UDST - free for Qataris
  if (context === 'udst') {
    if (nationality === 'qatari') {
      additionalText = '\n\n🇶🇦 **مجانية للقطريين وأبناء القطريات.**';
    } else {
      additionalText = '\n\n🌍 **لغير القطريين:** رسوم 13,000-16,000 دولار/سنة. المنحة الأميرية في UDST مفتوحة للمقيمين والدوليين.';
    }
  }

  // CCQ - for Qataris mainly
  if (context === 'ccq') {
    if (nationality === 'qatari') {
      additionalText = '\n\n🇶🇦 **مجانية للقطريين وأبناء القطريات.** ممكن التحويل لجامعة قطر بنظام 2+2.';
    } else {
      additionalText = '\n\n🌍 **لغير القطريين:** القبول ممكن بشرط إقامة سارية. رسوم تختلف حسب البرنامج.';
    }
  }

  // GRADE-BASED RESPONSES - customize available options
  if (context === 'grade') {
    if (nationality === 'non_qatari') {
      additionalText = '\n\n🌍 **ملاحظة لغير القطريين:**\n❌ الكليات العسكرية غير متاحة\n❌ الابتعاث الحكومي غير متاح\n✅ جامعة قطر (مدفوعة أو بمنحة)\n✅ المدينة التعليمية (منح مؤسسة قطر)\n✅ HBKU (منح كاملة)\n✅ الجامعات الخاصة';
    }
  }

  // SALARIES - mention Qatari vs non-Qatari difference
  if (context === 'salaries') {
    if (nationality === 'qatari') {
      additionalText = '\n\n🇶🇦 **مميزات القطري في سوق العمل:**\n✅ رواتب أعلى بكثير + بدلات سكن\n✅ أولوية التوظيف (قانون التوطين 2025)\n✅ تقاعد حكومي سخي\n✅ قطعة أرض + قرض بناء';
    } else {
      additionalText = '\n\n🌍 **لغير القطريين:** الرواتب المذكورة قد تختلف. عادة تشمل الحزمة: بدل سكن 20-40% + تذكرة سنوية + تأمين صحي + بدل تعليم أبناء (حسب الشركة).';
    }
  }

  // TEACH FOR QATAR - open to residents
  if (context === 'teach_for_qatar') {
    if (nationality === 'non_qatari') {
      additionalText = '\n\n🌟 **مفتوح لغير القطريين المقيمين!** شرط: إقامة سنتين في قطر + عمر أقل من 36 سنة + بكالوريوس غير تربوي.';
    }
  }

  // If we have additional text, append it
  if (additionalText) {
    return {
      text: response.text + additionalText,
      suggestions: adjustedSuggestions.length > 0 ? adjustedSuggestions : response.suggestions
    };
  }

  return response;
}

export { addNationalityContext };
