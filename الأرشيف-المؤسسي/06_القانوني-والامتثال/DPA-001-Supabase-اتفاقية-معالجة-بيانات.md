# اتفاقية معالجة البيانات الشخصية رقم DPA-001

# Data Processing Agreement No. DPA-001

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**التاريخ / Date:** 2026-04-04

**رقم العقد / Contract No.:** DPA-001-SUPA-2026

---

## الأطراف / Parties

**الطرف الأول (مراقب البيانات) / First Party (Data Controller):**
شركة النخبوية للبرمجيات (Elite Software Company)
العنوان: الدوحة، دولة قطر
البريد الإلكتروني: legal@elite-software.qa
(يُشار إليه لاحقاً بـ "المراقب" / hereinafter referred to as the "Controller")

**الطرف الثاني (معالج البيانات) / Second Party (Data Processor):**
Supabase Inc.
العنوان: San Francisco, California, United States of America
الموقع: https://supabase.com
(يُشار إليه لاحقاً بـ "المعالج" / hereinafter referred to as the "Processor")

---

## تمهيد / Preamble

حيث إن المراقب يستخدم خدمات المعالج لتوفير قاعدة البيانات والمصادقة لتطبيق "مستشار جامعة قطر" (Qatar University Advisor)، وحيث إن هذه الخدمات تتطلب معالجة بيانات شخصية تخص المستخدمين المقيمين في دولة قطر، فإن الطرفين يتفقان على الأحكام والشروط التالية لضمان الامتثال للقانون القطري رقم (13) لسنة 2016 بشأن حماية خصوصية البيانات الشخصية (PDPPL).

Whereas the Controller utilizes the Processor's services to provide database and authentication services for the "Qatar University Advisor" application, and whereas such services require the processing of personal data belonging to users residing in the State of Qatar, the Parties hereby agree to the following terms and conditions to ensure compliance with Qatar Law No. (13) of 2016 concerning the Protection of Personal Data Privacy (PDPPL).

---

## المادة 1: التعريفات / Article 1: Definitions

**1.1** "البيانات الشخصية" / "Personal Data": أي بيانات تتعلق بشخص طبيعي محدد أو قابل للتحديد، بما في ذلك على سبيل المثال لا الحصر: أرقام الهواتف، سجلات المحادثات، الملفات الشخصية للمستخدمين، الجنسية، وبيانات الجلسات. وذلك وفقاً للمادة (2) من قانون PDPPL.

Any data relating to an identified or identifiable natural person, including but not limited to: phone numbers, conversation history, user profiles, nationality, and session data, as defined in Article (2) of the PDPPL.

**1.2** "المراقب" / "Controller": الشخص الطبيعي أو الاعتباري الذي يحدد أغراض ووسائل معالجة البيانات الشخصية، وهو في هذه الاتفاقية شركة النخبوية للبرمجيات.

The natural or legal person that determines the purposes and means of processing personal data, which in this Agreement is Elite Software Company.

**1.3** "المعالج" / "Processor": الشخص الطبيعي أو الاعتباري الذي يعالج البيانات الشخصية نيابةً عن المراقب، وهو في هذه الاتفاقية شركة Supabase Inc.

The natural or legal person that processes personal data on behalf of the Controller, which in this Agreement is Supabase Inc.

**1.4** "المعالجة" / "Processing": أي عملية أو مجموعة عمليات تُجرى على البيانات الشخصية، بما في ذلك الجمع والتسجيل والتنظيم والتخزين والتعديل والاسترجاع والاستخدام والإفصاح والمحو.

Any operation or set of operations performed on personal data, including collection, recording, organization, storage, modification, retrieval, use, disclosure, and erasure.

**1.5** "PDPPL" / "قانون حماية خصوصية البيانات الشخصية": القانون القطري رقم (13) لسنة 2016 بشأن حماية خصوصية البيانات الشخصية ولوائحه التنفيذية.

Qatar Law No. (13) of 2016 concerning the Protection of Personal Data Privacy and its implementing regulations.

**1.6** "خرق البيانات" / "Data Breach": أي خرق أمني يؤدي إلى التدمير أو الفقدان أو التغيير العرضي أو غير المشروع أو الإفصاح غير المصرح به عن البيانات الشخصية أو الوصول إليها.

Any security breach leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data.

**1.7** "المعالج الفرعي" / "Sub-processor": أي طرف ثالث يُعيّنه المعالج لمعالجة البيانات الشخصية نيابةً عن المراقب.

Any third party appointed by the Processor to process personal data on behalf of the Controller.

---

## المادة 2: نطاق المعالجة / Article 2: Scope of Processing

**2.1 موضوع المعالجة / Subject Matter of Processing:**

يقوم المعالج بتوفير خدمات قاعدة البيانات (PostgreSQL) والمصادقة (Authentication) لتطبيق مستشار جامعة قطر.

The Processor provides database (PostgreSQL) and authentication services for the Qatar University Advisor application.

**2.2 فئات البيانات الشخصية المعالجة / Categories of Personal Data Processed:**

| الفئة / Category | الوصف / Description | مستوى الحساسية / Sensitivity |
|---|---|---|
| أرقام الهواتف / Phone Numbers | أرقام هواتف المستخدمين المسجلين / Registered users' phone numbers | عالٍ / High |
| سجل المحادثات / Conversation History | محادثات المستخدمين مع المستشار الذكي / User conversations with the AI advisor | متوسط / Medium |
| الملفات الشخصية / User Profiles | بيانات التعريف الشخصية / Personal identification data | عالٍ / High |
| الجنسية / Nationality | جنسية المستخدم / User's nationality | متوسط / Medium |
| بيانات الجلسات / Session Data | بيانات الجلسات والتوثيق / Session and authentication data | متوسط / Medium |

**2.3 الغرض من المعالجة / Purpose of Processing:**

- تخزين بيانات المستخدمين واسترجاعها بشكل آمن / Secure storage and retrieval of user data
- مصادقة المستخدمين وإدارة الجلسات / User authentication and session management
- تقديم خدمات الاستشارات الأكاديمية المخصصة / Providing personalized academic advisory services
- تحسين جودة الخدمة / Service quality improvement

**2.4 مدة المعالجة / Duration of Processing:**

تستمر المعالجة طوال فترة سريان هذه الاتفاقية، ويتم حذف جميع البيانات الشخصية خلال ثلاثين (30) يوماً من تاريخ الإنهاء ما لم يُلزم القانون بالاحتفاظ بها لمدة أطول.

Processing shall continue for the duration of this Agreement. All personal data shall be deleted within thirty (30) days of termination unless longer retention is required by law.

**2.5 فئات أصحاب البيانات / Categories of Data Subjects:**

- طلاب جامعة قطر الحاليون والمحتملون / Current and prospective Qatar University students
- أعضاء هيئة التدريس والموظفون / Faculty and staff members
- الزوار والمستخدمون العامون للتطبيق / Visitors and general application users

---

## المادة 3: التزامات المعالج / Article 3: Processor Obligations

**3.1 التعليمات / Instructions:**

يلتزم المعالج بمعالجة البيانات الشخصية فقط وفقاً لتعليمات المراقب الموثقة، بما في ذلك ما يتعلق بنقل البيانات إلى دولة ثالثة، ما لم يكن ملزماً بذلك بموجب قانون الاتحاد الأوروبي أو قانون الولاية المعنية، وفي هذه الحالة يُخطر المراقب مسبقاً ما لم يُحظر ذلك قانوناً. وذلك وفقاً للمادة (4) من قانون PDPPL.

The Processor shall process personal data only on documented instructions from the Controller, including with regard to transfers to a third country, unless required by applicable law, in which case the Processor shall inform the Controller in advance unless prohibited by law. This is in accordance with Article (4) of the PDPPL.

**3.2 السرية / Confidentiality:**

يضمن المعالج أن الأشخاص المصرح لهم بمعالجة البيانات الشخصية قد التزموا بالسرية أو خاضعين لالتزام قانوني مناسب بالسرية.

The Processor shall ensure that persons authorized to process personal data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.

**3.3 التدابير الأمنية / Security Measures:**

يلتزم المعالج بتنفيذ التدابير التقنية والتنظيمية المناسبة التالية:

The Processor shall implement the following appropriate technical and organizational measures:

- التشفير أثناء النقل والتخزين (TLS 1.3 / AES-256) / Encryption in transit and at rest (TLS 1.3 / AES-256)
- العزل على مستوى الصفوف (Row Level Security - RLS) / Row Level Security (RLS)
- المصادقة متعددة العوامل (MFA) / Multi-factor authentication (MFA)
- النسخ الاحتياطي المنتظم والمشفر / Regular encrypted backups
- سجلات التدقيق (Audit Logs) / Audit logs
- فصل البيئات (إنتاج / اختبار / تطوير) / Environment separation (production / staging / development)
- اختبارات اختراق دورية / Periodic penetration testing
- ضوابط الوصول القائمة على الأدوار (RBAC) / Role-based access controls (RBAC)

**3.4 المعالجون الفرعيون / Sub-processors:**

- لا يجوز للمعالج الاستعانة بمعالج فرعي آخر دون الحصول على موافقة كتابية مسبقة من المراقب.
- يلتزم المعالج بإبلاغ المراقب بأي تغيير مقترح يتعلق بإضافة أو استبدال معالجين فرعيين، مع منح المراقب فرصة للاعتراض خلال خمسة عشر (15) يوماً.
- يلتزم المعالج بإبرام عقد مع كل معالج فرعي يتضمن نفس التزامات حماية البيانات المنصوص عليها في هذه الاتفاقية.

- The Processor shall not engage another sub-processor without the prior written consent of the Controller.
- The Processor shall inform the Controller of any intended changes concerning the addition or replacement of sub-processors, giving the Controller an opportunity to object within fifteen (15) days.
- The Processor shall enter into a contract with each sub-processor containing the same data protection obligations as set out in this Agreement.

**3.5 المساعدة / Assistance:**

يلتزم المعالج بمساعدة المراقب في ضمان الامتثال لالتزاماته بموجب المواد (4) و(19) و(20) من قانون PDPPL، مع مراعاة طبيعة المعالجة والمعلومات المتاحة للمعالج.

The Processor shall assist the Controller in ensuring compliance with its obligations under Articles (4), (19), and (20) of the PDPPL, taking into account the nature of processing and the information available to the Processor.

---

## المادة 4: حقوق أصحاب البيانات / Article 4: Data Subject Rights

**4.1** يلتزم المعالج بمساعدة المراقب في الوفاء بالتزامه بالاستجابة لطلبات أصحاب البيانات لممارسة حقوقهم وفقاً للمادة (9) من قانون PDPPL، بما في ذلك:

The Processor shall assist the Controller in fulfilling its obligation to respond to data subjects' requests to exercise their rights under Article (9) of the PDPPL, including:

| الحق / Right | الوصف / Description | المدة الزمنية / Timeframe |
|---|---|---|
| حق الوصول / Right of Access | حق صاحب البيانات في الحصول على نسخة من بياناته / Data subject's right to obtain a copy of their data | 15 يوم عمل / 15 business days |
| حق التصحيح / Right to Rectification | حق تصحيح البيانات غير الدقيقة / Right to correct inaccurate data | 10 أيام عمل / 10 business days |
| حق الحذف / Right to Erasure | حق طلب حذف البيانات / Right to request deletion of data | 15 يوم عمل / 15 business days |
| حق النقل / Right to Portability | حق الحصول على البيانات بصيغة قابلة للقراءة آلياً / Right to obtain data in a machine-readable format | 20 يوم عمل / 20 business days |
| حق الاعتراض / Right to Object | حق الاعتراض على معالجة البيانات / Right to object to data processing | 10 أيام عمل / 10 business days |

**4.2** يلتزم المعالج بإخطار المراقب فوراً عند تلقي أي طلب من صاحب البيانات مباشرةً، وعدم الاستجابة لهذا الطلب إلا بتعليمات من المراقب.

The Processor shall immediately notify the Controller upon receiving any request directly from a data subject and shall not respond to such request except on the Controller's instructions.

---

## المادة 5: نقل البيانات عبر الحدود / Article 5: Cross-Border Data Transfer

**5.1 الأساس القانوني / Legal Basis:**

وفقاً للمادتين (19) و(20) من قانون PDPPL، يجوز نقل البيانات الشخصية خارج دولة قطر بشرط توفر ضمانات كافية لحماية البيانات.

Pursuant to Articles (19) and (20) of the PDPPL, personal data may be transferred outside the State of Qatar provided that adequate safeguards for data protection are in place.

**5.2 موقع المعالجة / Processing Location:**

يقر المعالج بأن البيانات الشخصية قد تُعالج وتُخزن في مراكز بيانات تقع في الولايات المتحدة الأمريكية. ويلتزم المعالج بعدم نقل البيانات إلى أي موقع آخر دون موافقة كتابية مسبقة من المراقب.

The Processor acknowledges that personal data may be processed and stored in data centers located in the United States of America. The Processor shall not transfer data to any other location without the prior written consent of the Controller.

**5.3 الضمانات الكافية / Adequate Safeguards:**

يلتزم المعالج بتوفير الضمانات التالية وفقاً للمادة (20) من قانون PDPPL:

The Processor shall provide the following safeguards in accordance with Article (20) of the PDPPL:

- الالتزام بالبنود التعاقدية القياسية (SCCs) المعتمدة / Adherence to approved Standard Contractual Clauses (SCCs)
- تطبيق تدابير أمنية تقنية معادلة أو أعلى من المعايير القطرية / Implementation of technical security measures equivalent to or exceeding Qatari standards
- تقديم تقييم أثر نقل البيانات (Transfer Impact Assessment) عند الطلب / Provision of a Transfer Impact Assessment upon request
- ضمان عدم وصول الجهات الحكومية الأجنبية إلى البيانات بشكل مخالف للقانون القطري / Ensuring foreign government authorities do not access data in violation of Qatari law
- الاحتفاظ بسجل محدث لجميع عمليات النقل عبر الحدود / Maintaining an up-to-date record of all cross-border transfers

**5.4 الموافقة المسبقة / Prior Consent:**

لا يجوز نقل البيانات الشخصية إلى دولة ثالثة لا توفر مستوى حماية كافياً إلا بعد الحصول على موافقة صريحة من صاحب البيانات وفقاً للمادة (19) من قانون PDPPL.

Personal data shall not be transferred to a third country that does not provide an adequate level of protection without obtaining the explicit consent of the data subject in accordance with Article (19) of the PDPPL.

---

## المادة 6: إخطار الاختراقات / Article 6: Breach Notification

**6.1 الإخطار الفوري / Immediate Notification:**

يلتزم المعالج بإخطار المراقب دون تأخير غير مبرر، وفي أي حال خلال اثنتين وسبعين (72) ساعة من علمه بأي خرق للبيانات الشخصية، وذلك وفقاً لمتطلبات قانون PDPPL.

The Processor shall notify the Controller without undue delay, and in any event within seventy-two (72) hours of becoming aware of any personal data breach, in accordance with PDPPL requirements.

**6.2 محتوى الإخطار / Content of Notification:**

يجب أن يتضمن الإخطار على الأقل:

The notification shall include at a minimum:

1. وصف طبيعة خرق البيانات الشخصية، بما في ذلك فئات وعدد أصحاب البيانات المتأثرين / A description of the nature of the personal data breach, including the categories and approximate number of data subjects affected
2. اسم ومعلومات الاتصال بنقطة الاتصال المسؤولة / The name and contact details of the responsible point of contact
3. وصف العواقب المحتملة لخرق البيانات / A description of the likely consequences of the data breach
4. وصف التدابير المتخذة أو المقترحة لمعالجة الخرق / A description of the measures taken or proposed to address the breach
5. التدابير المتخذة للتخفيف من الآثار السلبية المحتملة / Measures taken to mitigate possible adverse effects

**6.3 المساعدة في التحقيق / Investigation Assistance:**

يلتزم المعالج بالتعاون الكامل مع المراقب في التحقيق في أي خرق وتقديم جميع المعلومات والمساعدة اللازمة.

The Processor shall fully cooperate with the Controller in investigating any breach and provide all necessary information and assistance.

**6.4 التوثيق / Documentation:**

يلتزم المعالج بتوثيق جميع خروقات البيانات الشخصية، بما في ذلك الحقائق المتعلقة بالخرق وآثاره والتدابير التصحيحية المتخذة.

The Processor shall document all personal data breaches, including the facts relating to the breach, its effects, and the remedial actions taken.

---

## المادة 7: مدة الاتفاقية وإنهاؤها / Article 7: Term and Termination

**7.1 المدة / Term:**

تسري هذه الاتفاقية اعتباراً من تاريخ التوقيع ولمدة اثني عشر (12) شهراً، وتتجدد تلقائياً لفترات مماثلة ما لم يُخطر أحد الطرفين الآخر كتابياً برغبته في عدم التجديد قبل ستين (60) يوماً من تاريخ انتهاء الفترة السارية.

This Agreement shall take effect from the date of signature for a period of twelve (12) months and shall automatically renew for successive equal periods unless either Party notifies the other in writing of its intention not to renew at least sixty (60) days prior to the expiry of the current term.

**7.2 الإنهاء المبكر / Early Termination:**

يجوز لأي من الطرفين إنهاء هذه الاتفاقية فوراً في حالة:

Either Party may terminate this Agreement immediately in the event of:

- إخلال جوهري من الطرف الآخر لم يتم تصحيحه خلال ثلاثين (30) يوماً من الإخطار / A material breach by the other Party that is not remedied within thirty (30) days of notification
- إفلاس أو إعسار الطرف الآخر / Bankruptcy or insolvency of the other Party
- تغيير جوهري في التشريعات يجعل الاستمرار غير ممكن / A material change in legislation making continuation impossible

**7.3 الالتزامات عند الإنهاء / Obligations upon Termination:**

عند إنهاء هذه الاتفاقية أو انتهاء مدتها:

Upon termination or expiry of this Agreement:

- يلتزم المعالج بحذف جميع البيانات الشخصية خلال ثلاثين (30) يوماً ما لم يُلزم القانون بخلاف ذلك / The Processor shall delete all personal data within thirty (30) days unless otherwise required by law
- يقدم المعالج للمراقب شهادة خطية تؤكد الحذف الكامل / The Processor shall provide the Controller with a written certification confirming complete deletion
- يعيد المعالج جميع البيانات بالصيغة التي يطلبها المراقب قبل الحذف / The Processor shall return all data in the format requested by the Controller prior to deletion

---

## المادة 8: المسؤولية والتعويض / Article 8: Liability and Indemnification

**8.1 المسؤولية / Liability:**

يكون كل طرف مسؤولاً عن الأضرار الناجمة عن إخلاله بأحكام هذه الاتفاقية أو قانون PDPPL. ويتحمل المعالج المسؤولية الكاملة عن أي ضرر ناتج عن معالجة مخالفة لتعليمات المراقب أو لأحكام هذه الاتفاقية.

Each Party shall be liable for damages resulting from its breach of the provisions of this Agreement or the PDPPL. The Processor shall bear full liability for any damage resulting from processing that violates the Controller's instructions or the provisions of this Agreement.

**8.2 التعويض / Indemnification:**

يلتزم المعالج بتعويض المراقب والدفاع عنه وحمايته من أي مطالبات أو خسائر أو أضرار أو نفقات (بما في ذلك أتعاب المحاماة المعقولة) ناشئة عن:

The Processor shall indemnify, defend, and hold harmless the Controller from any claims, losses, damages, or expenses (including reasonable attorneys' fees) arising from:

- أي خرق من المعالج لالتزاماته بموجب هذه الاتفاقية / Any breach by the Processor of its obligations under this Agreement
- أي معالجة غير مصرح بها للبيانات الشخصية / Any unauthorized processing of personal data
- أي خرق أمني ناتج عن إهمال المعالج / Any security breach resulting from the Processor's negligence
- أي غرامات أو عقوبات تُفرض على المراقب بسبب إخلال المعالج / Any fines or penalties imposed on the Controller due to the Processor's breach

**8.3 حدود المسؤولية / Limitation of Liability:**

لا يجوز أن يتجاوز إجمالي مسؤولية المعالج مبلغ الرسوم المدفوعة خلال الاثني عشر (12) شهراً السابقة لحدوث المطالبة، ما لم يكن الضرر ناتجاً عن سوء سلوك متعمد أو إهمال جسيم.

The Processor's total liability shall not exceed the fees paid during the twelve (12) months preceding the claim, unless the damage results from willful misconduct or gross negligence.

---

## المادة 9: التدقيق والتفتيش / Article 9: Audit and Inspection

**9.1** يلتزم المعالج بإتاحة جميع المعلومات اللازمة للمراقب لإثبات الامتثال لالتزامات هذه الاتفاقية، والسماح بعمليات التدقيق والتفتيش التي يجريها المراقب أو مدقق معتمد من قبله.

The Processor shall make available to the Controller all information necessary to demonstrate compliance with the obligations under this Agreement and allow for audits and inspections conducted by the Controller or an auditor mandated by the Controller.

**9.2** يحق للمراقب إجراء تدقيق سنوي واحد على الأقل، مع إخطار مسبق بثلاثين (30) يوماً، ما لم يستدعِ خرق أمني إجراء تدقيق عاجل.

The Controller shall be entitled to conduct at least one annual audit with thirty (30) days' prior notice, unless a security breach necessitates an urgent audit.

---

## المادة 10: القانون الواجب التطبيق وتسوية المنازعات / Article 10: Governing Law and Dispute Resolution

**10.1 القانون الواجب التطبيق / Governing Law:**

تخضع هذه الاتفاقية وتُفسر وفقاً لقوانين دولة قطر، وبصفة خاصة القانون رقم (13) لسنة 2016 بشأن حماية خصوصية البيانات الشخصية (PDPPL).

This Agreement shall be governed by and construed in accordance with the laws of the State of Qatar, in particular Law No. (13) of 2016 concerning the Protection of Personal Data Privacy (PDPPL).

**10.2 تسوية المنازعات / Dispute Resolution:**

في حالة نشوء أي نزاع يتعلق بتفسير أو تنفيذ هذه الاتفاقية، يسعى الطرفان أولاً إلى حله ودياً خلال ثلاثين (30) يوماً. وفي حالة عدم التوصل إلى تسوية، يُحال النزاع إلى التحكيم وفقاً لقواعد مركز قطر الدولي للتوفيق والتحكيم (QICCA).

In the event of any dispute arising out of or in connection with the interpretation or performance of this Agreement, the Parties shall first seek to resolve it amicably within thirty (30) days. If no settlement is reached, the dispute shall be referred to arbitration in accordance with the rules of the Qatar International Center for Conciliation and Arbitration (QICCA).

**10.3 مكان التحكيم / Seat of Arbitration:**

الدوحة، دولة قطر. وتكون لغة التحكيم العربية مع الترجمة إلى الإنجليزية عند الحاجة.

Doha, State of Qatar. The language of arbitration shall be Arabic with English translation as needed.

---

## المادة 11: أحكام عامة / Article 11: General Provisions

**11.1** تُشكل هذه الاتفاقية الاتفاق الكامل بين الطرفين فيما يتعلق بموضوعها وتحل محل جميع الاتفاقيات السابقة. / This Agreement constitutes the entire agreement between the Parties regarding its subject matter and supersedes all prior agreements.

**11.2** لا يجوز تعديل هذه الاتفاقية إلا بموجب اتفاق كتابي موقع من كلا الطرفين. / This Agreement may only be amended by written agreement signed by both Parties.

**11.3** إذا اعتُبر أي حكم من أحكام هذه الاتفاقية غير صالح أو غير قابل للتنفيذ، فإن ذلك لا يؤثر على صحة وقابلية تنفيذ الأحكام المتبقية. / If any provision of this Agreement is deemed invalid or unenforceable, this shall not affect the validity and enforceability of the remaining provisions.

**11.4** تُحرر هذه الاتفاقية باللغتين العربية والإنجليزية. وفي حالة وجود أي تعارض، يُعتد بالنص العربي. / This Agreement is drawn up in Arabic and English. In case of any discrepancy, the Arabic text shall prevail.

---

## المادة 12: التوقيعات / Article 12: Signatures

### الطرف الأول — المراقب / First Party — Controller

**شركة النخبوية للبرمجيات / Elite Software Company**

| | |
|---|---|
| الاسم / Name: | _________________________ |
| المنصب / Title: | المدير التنفيذي / CEO |
| التوقيع / Signature: | _________________________ |
| التاريخ / Date: | ____/____/2026 |
| الختم / Stamp: | [ختم الشركة / Company Stamp] |

### الطرف الثاني — المعالج / Second Party — Processor

**Supabase Inc.**

| | |
|---|---|
| الاسم / Name: | _________________________ |
| المنصب / Title: | Authorized Signatory |
| التوقيع / Signature: | _________________________ |
| التاريخ / Date: | ____/____/2026 |
| الختم / Stamp: | [Company Stamp] |

---

### ختم المراجعة القانونية / Legal Review Stamp

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ مُراجَع ومعتمد قانونياً
المستشار القانوني: elite-legal-counsel
التاريخ: 2026-04-04
الحكم: ⚠️ متوافق مع تحفظات — يستلزم توقيع الطرف الآخر
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**ملاحظات المراجعة القانونية / Legal Review Notes:**

1. يجب الحصول على توقيع Supabase Inc. قبل سريان هذه الاتفاقية / Supabase Inc. signature must be obtained before this Agreement takes effect
2. يُوصى بمراجعة قائمة المعالجين الفرعيين لدى Supabase بشكل ربع سنوي / Quarterly review of Supabase's sub-processor list is recommended
3. يجب التحقق من تقييم أثر نقل البيانات (TIA) قبل بدء المعالجة / A Transfer Impact Assessment (TIA) must be verified before processing begins
4. النسخة العربية هي النسخة المعتمدة في حالة الخلاف / The Arabic version is the authoritative version in case of dispute
