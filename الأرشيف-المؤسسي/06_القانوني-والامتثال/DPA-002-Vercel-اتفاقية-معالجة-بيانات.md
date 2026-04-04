# اتفاقية معالجة البيانات الشخصية رقم DPA-002

# Data Processing Agreement No. DPA-002

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**التاريخ / Date:** 2026-04-04

**رقم العقد / Contract No.:** DPA-002-VRCL-2026

---

## الأطراف / Parties

**الطرف الأول (مراقب البيانات) / First Party (Data Controller):**
شركة النخبوية للبرمجيات (Elite Software Company)
العنوان: الدوحة، دولة قطر
البريد الإلكتروني: legal@elite-software.qa
(يُشار إليه لاحقاً بـ "المراقب" / hereinafter referred to as the "Controller")

**الطرف الثاني (معالج البيانات) / Second Party (Data Processor):**
Vercel Inc.
العنوان: San Francisco, California, United States of America
الموقع: https://vercel.com
(يُشار إليه لاحقاً بـ "المعالج" / hereinafter referred to as the "Processor")

---

## تمهيد / Preamble

حيث إن المراقب يستخدم خدمات المعالج لتوفير خدمات الاستضافة وشبكة توصيل المحتوى (CDN) لتطبيق "مستشار جامعة قطر" (Qatar University Advisor)، وحيث إن هذه الخدمات تتطلب معالجة بيانات شخصية تقنية تخص مستخدمي التطبيق المقيمين في دولة قطر، فإن الطرفين يتفقان على الأحكام والشروط التالية لضمان الامتثال للقانون القطري رقم (13) لسنة 2016 بشأن حماية خصوصية البيانات الشخصية (PDPPL).

Whereas the Controller utilizes the Processor's services to provide hosting and Content Delivery Network (CDN) services for the "Qatar University Advisor" application, and whereas such services require the processing of technical personal data belonging to application users residing in the State of Qatar, the Parties hereby agree to the following terms and conditions to ensure compliance with Qatar Law No. (13) of 2016 concerning the Protection of Personal Data Privacy (PDPPL).

---

## المادة 1: التعريفات / Article 1: Definitions

**1.1** "البيانات الشخصية" / "Personal Data": أي بيانات تتعلق بشخص طبيعي محدد أو قابل للتحديد، بما في ذلك على سبيل المثال لا الحصر: عناوين بروتوكول الإنترنت (IP)، ملفات تعريف الارتباط للجلسات، البيانات الوصفية للمتصفح، وسجلات الوصول. وذلك وفقاً للمادة (2) من قانون PDPPL.

Any data relating to an identified or identifiable natural person, including but not limited to: IP addresses, session cookies, browser metadata, and access logs, as defined in Article (2) of the PDPPL.

**1.2** "المراقب" / "Controller": الشخص الطبيعي أو الاعتباري الذي يحدد أغراض ووسائل معالجة البيانات الشخصية، وهو في هذه الاتفاقية شركة النخبوية للبرمجيات.

The natural or legal person that determines the purposes and means of processing personal data, which in this Agreement is Elite Software Company.

**1.3** "المعالج" / "Processor": الشخص الطبيعي أو الاعتباري الذي يعالج البيانات الشخصية نيابةً عن المراقب، وهو في هذه الاتفاقية شركة Vercel Inc.

The natural or legal person that processes personal data on behalf of the Controller, which in this Agreement is Vercel Inc.

**1.4** "المعالجة" / "Processing": أي عملية أو مجموعة عمليات تُجرى على البيانات الشخصية، بما في ذلك الجمع والتسجيل والتخزين والنقل والتوزيع والمحو، وتشمل معالجة الطلبات (HTTP requests) وتخزين السجلات المؤقت.

Any operation or set of operations performed on personal data, including collection, recording, storage, transmission, distribution, and erasure, including HTTP request processing and temporary log storage.

**1.5** "PDPPL" / "قانون حماية خصوصية البيانات الشخصية": القانون القطري رقم (13) لسنة 2016 بشأن حماية خصوصية البيانات الشخصية ولوائحه التنفيذية.

Qatar Law No. (13) of 2016 concerning the Protection of Personal Data Privacy and its implementing regulations.

**1.6** "خرق البيانات" / "Data Breach": أي خرق أمني يؤدي إلى التدمير أو الفقدان أو التغيير العرضي أو غير المشروع أو الإفصاح غير المصرح به عن البيانات الشخصية أو الوصول إليها.

Any security breach leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data.

**1.7** "المعالج الفرعي" / "Sub-processor": أي طرف ثالث يُعيّنه المعالج لمعالجة البيانات الشخصية نيابةً عن المراقب، بما في ذلك مزودي البنية التحتية السحابية (مثل AWS و Cloudflare).

Any third party appointed by the Processor to process personal data on behalf of the Controller, including cloud infrastructure providers (such as AWS and Cloudflare).

**1.8** "شبكة توصيل المحتوى (CDN)" / "Content Delivery Network (CDN)": شبكة من الخوادم الموزعة جغرافياً تعمل على تقديم المحتوى للمستخدمين من أقرب نقطة جغرافية.

A geographically distributed network of servers that delivers content to users from the nearest geographic point.

---

## المادة 2: نطاق المعالجة / Article 2: Scope of Processing

**2.1 موضوع المعالجة / Subject Matter of Processing:**

يقوم المعالج بتوفير خدمات الاستضافة (Hosting) وشبكة توصيل المحتوى (CDN) ووظائف الحوسبة بدون خادم (Serverless Functions) لتطبيق مستشار جامعة قطر.

The Processor provides hosting, Content Delivery Network (CDN), and Serverless Functions services for the Qatar University Advisor application.

**2.2 فئات البيانات الشخصية المعالجة / Categories of Personal Data Processed:**

| الفئة / Category | الوصف / Description | مستوى الحساسية / Sensitivity | مدة الاحتفاظ / Retention |
|---|---|---|---|
| عناوين IP / IP Addresses | عناوين بروتوكول الإنترنت للمستخدمين / Users' Internet Protocol addresses | متوسط / Medium | 30 يوم / 30 days |
| ملفات تعريف ارتباط الجلسات / Session Cookies | معرفات الجلسات ورموز المصادقة / Session identifiers and authentication tokens | متوسط / Medium | مدة الجلسة / Session duration |
| البيانات الوصفية للمتصفح / Browser Metadata | نوع المتصفح والنظام واللغة / Browser type, OS, and language | منخفض / Low | 30 يوم / 30 days |
| سجلات الوصول / Access Logs | سجلات طلبات HTTP والاستجابات / HTTP request and response logs | متوسط / Medium | 30 يوم / 30 days |

**2.3 الغرض من المعالجة / Purpose of Processing:**

- استضافة وتقديم تطبيق الويب للمستخدمين النهائيين / Hosting and serving the web application to end users
- توصيل المحتوى عبر شبكة CDN لضمان سرعة الوصول / Delivering content via CDN for optimal access speed
- تنفيذ وظائف الحوسبة بدون خادم (API routes) / Executing serverless computing functions (API routes)
- مراقبة أداء التطبيق واكتشاف الأخطاء / Application performance monitoring and error detection
- حماية التطبيق من هجمات DDoS والتهديدات الأمنية / Protecting the application from DDoS attacks and security threats

**2.4 مدة المعالجة / Duration of Processing:**

تستمر المعالجة طوال فترة سريان هذه الاتفاقية. تُحذف سجلات الوصول تلقائياً بعد ثلاثين (30) يوماً. يتم حذف جميع البيانات الشخصية المتبقية خلال ثلاثين (30) يوماً من تاريخ الإنهاء.

Processing shall continue for the duration of this Agreement. Access logs are automatically deleted after thirty (30) days. All remaining personal data shall be deleted within thirty (30) days of termination.

**2.5 فئات أصحاب البيانات / Categories of Data Subjects:**

- جميع زوار ومستخدمي تطبيق مستشار جامعة قطر / All visitors and users of the Qatar University Advisor application
- مديرو النظام والمطورون / System administrators and developers

---

## المادة 3: التزامات المعالج / Article 3: Processor Obligations

**3.1 التعليمات / Instructions:**

يلتزم المعالج بمعالجة البيانات الشخصية فقط وفقاً لتعليمات المراقب الموثقة، ولا يجوز للمعالج معالجة البيانات لأي غرض آخر غير تقديم الخدمات المحددة في هذه الاتفاقية. وذلك وفقاً للمادة (4) من قانون PDPPL.

The Processor shall process personal data only on documented instructions from the Controller and shall not process data for any purpose other than providing the services specified in this Agreement. This is in accordance with Article (4) of the PDPPL.

**3.2 السرية / Confidentiality:**

يضمن المعالج أن جميع الموظفين والمتعاقدين المصرح لهم بمعالجة البيانات الشخصية قد التزموا بالسرية أو خاضعين لالتزام قانوني مناسب بالسرية.

The Processor shall ensure that all employees and contractors authorized to process personal data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.

**3.3 التدابير الأمنية / Security Measures:**

يلتزم المعالج بتنفيذ التدابير التقنية والتنظيمية المناسبة التالية:

The Processor shall implement the following appropriate technical and organizational measures:

- التشفير أثناء النقل (TLS 1.3) لجميع الاتصالات / Encryption in transit (TLS 1.3) for all communications
- حماية DDoS على مستوى الشبكة والتطبيق / DDoS protection at network and application level
- جدار حماية تطبيقات الويب (WAF) / Web Application Firewall (WAF)
- عزل بيئات النشر (Preview / Production) / Deployment environment isolation (Preview / Production)
- المصادقة متعددة العوامل لحسابات الإدارة / Multi-factor authentication for management accounts
- سجلات التدقيق للنشر والإعدادات / Audit logs for deployments and configurations
- حماية الحافة (Edge Protection) على مستوى شبكة CDN / Edge protection at CDN network level
- رؤوس الأمان الافتراضية (Security Headers) / Default security headers
- شهادات SOC 2 Type II و ISO 27001 / SOC 2 Type II and ISO 27001 certifications

**3.4 المعالجون الفرعيون / Sub-processors:**

- لا يجوز للمعالج الاستعانة بمعالج فرعي آخر دون الحصول على موافقة كتابية مسبقة من المراقب.
- يقر المراقب بعلمه بأن المعالج يستخدم البنية التحتية لـ Amazon Web Services (AWS) و Cloudflare كمعالجين فرعيين أساسيين.
- يلتزم المعالج بإبلاغ المراقب بأي تغيير مقترح يتعلق بإضافة أو استبدال معالجين فرعيين، مع منح المراقب فرصة للاعتراض خلال خمسة عشر (15) يوماً.
- يلتزم المعالج بإبرام عقد مع كل معالج فرعي يتضمن نفس التزامات حماية البيانات المنصوص عليها في هذه الاتفاقية.

- The Processor shall not engage another sub-processor without the prior written consent of the Controller.
- The Controller acknowledges that the Processor uses Amazon Web Services (AWS) and Cloudflare infrastructure as primary sub-processors.
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
| حق الوصول / Right of Access | حق صاحب البيانات في معرفة ما إذا كانت بياناته تُعالج / Data subject's right to know if their data is being processed | 15 يوم عمل / 15 business days |
| حق التصحيح / Right to Rectification | حق تصحيح البيانات غير الدقيقة / Right to correct inaccurate data | 10 أيام عمل / 10 business days |
| حق الحذف / Right to Erasure | حق طلب حذف البيانات التقنية / Right to request deletion of technical data | 15 يوم عمل / 15 business days |
| حق الاعتراض / Right to Object | حق الاعتراض على جمع البيانات التقنية / Right to object to technical data collection | 10 أيام عمل / 10 business days |

**4.2** نظراً لطبيعة البيانات التقنية المعالجة (عناوين IP، سجلات الوصول)، يقر الطرفان بأن بعض حقوق أصحاب البيانات قد تكون محدودة التطبيق بسبب عدم القدرة على تحديد هوية صاحب البيانات بشكل مباشر من البيانات التقنية وحدها.

Due to the technical nature of the data processed (IP addresses, access logs), the Parties acknowledge that some data subject rights may be limited in application due to the inability to directly identify the data subject from technical data alone.

**4.3** يلتزم المعالج بإخطار المراقب فوراً عند تلقي أي طلب من صاحب البيانات مباشرةً.

The Processor shall immediately notify the Controller upon receiving any request directly from a data subject.

---

## المادة 5: نقل البيانات عبر الحدود / Article 5: Cross-Border Data Transfer

**5.1 الأساس القانوني / Legal Basis:**

وفقاً للمادتين (19) و(20) من قانون PDPPL، يجوز نقل البيانات الشخصية خارج دولة قطر بشرط توفر ضمانات كافية لحماية البيانات.

Pursuant to Articles (19) and (20) of the PDPPL, personal data may be transferred outside the State of Qatar provided that adequate safeguards for data protection are in place.

**5.2 مواقع المعالجة / Processing Locations:**

يقر المعالج بأن البيانات الشخصية تُعالج وتُوزع عبر شبكة حافة عالمية (Edge Network) تشمل نقاط تواجد متعددة حول العالم، بما في ذلك الولايات المتحدة الأمريكية وأوروبا وآسيا ومنطقة الشرق الأوسط. ويلتزم المعالج بتوفير قائمة محدثة بمواقع معالجة البيانات عند الطلب.

The Processor acknowledges that personal data is processed and distributed across a global Edge Network encompassing multiple points of presence worldwide, including the United States, Europe, Asia, and the Middle East region. The Processor shall provide an updated list of data processing locations upon request.

**5.3 الضمانات الكافية / Adequate Safeguards:**

يلتزم المعالج بتوفير الضمانات التالية وفقاً للمادة (20) من قانون PDPPL:

The Processor shall provide the following safeguards in accordance with Article (20) of the PDPPL:

- الالتزام بالبنود التعاقدية القياسية (SCCs) المعتمدة / Adherence to approved Standard Contractual Clauses (SCCs)
- تشفير جميع البيانات أثناء النقل بين نقاط الحافة / Encryption of all data in transit between edge points
- تقديم تقييم أثر نقل البيانات (Transfer Impact Assessment) عند الطلب / Provision of a Transfer Impact Assessment upon request
- ضمان عدم تخزين البيانات الشخصية بشكل دائم على نقاط الحافة / Ensuring personal data is not permanently stored on edge points
- ضمان عدم وصول الجهات الحكومية الأجنبية إلى البيانات بشكل مخالف للقانون القطري / Ensuring foreign government authorities do not access data in violation of Qatari law
- الالتزام بشهادات الامتثال المعترف بها دولياً (SOC 2 Type II) / Adherence to internationally recognized compliance certifications (SOC 2 Type II)

**5.4 التخزين المؤقت على الحافة / Edge Caching:**

يقر الطرفان بأن المحتوى الثابت (Static Content) قد يُخزن مؤقتاً على نقاط حافة متعددة لتحسين الأداء. ولا يُعتبر هذا التخزين المؤقت نقلاً دائماً للبيانات الشخصية ما دام:
- لا يحتوي المحتوى المخزن مؤقتاً على بيانات شخصية حساسة
- تُحدد مدة التخزين المؤقت بواسطة رؤوس التحكم في التخزين المؤقت (Cache-Control headers)

The Parties acknowledge that static content may be temporarily cached on multiple edge points for performance optimization. Such temporary caching shall not be considered a permanent transfer of personal data provided that:
- Cached content does not contain sensitive personal data
- Cache duration is controlled by Cache-Control headers

**5.5 الموافقة المسبقة / Prior Consent:**

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

1. وصف طبيعة خرق البيانات الشخصية وفئات البيانات المتأثرة / A description of the nature of the personal data breach and categories of data affected
2. العدد التقريبي لأصحاب البيانات المتأثرين والطلبات المتأثرة / The approximate number of data subjects affected and requests impacted
3. اسم ومعلومات الاتصال بنقطة الاتصال المسؤولة / The name and contact details of the responsible point of contact
4. وصف العواقب المحتملة لخرق البيانات / A description of the likely consequences of the data breach
5. وصف التدابير المتخذة أو المقترحة لمعالجة الخرق ومنع تكراره / A description of the measures taken or proposed to address the breach and prevent recurrence
6. الجدول الزمني للإصلاح / Timeline for remediation

**6.3 المساعدة في التحقيق / Investigation Assistance:**

يلتزم المعالج بالتعاون الكامل مع المراقب في التحقيق في أي خرق، بما في ذلك توفير سجلات الوصول ذات الصلة وتحليلات حركة المرور.

The Processor shall fully cooperate with the Controller in investigating any breach, including providing relevant access logs and traffic analysis.

**6.4 التوثيق / Documentation:**

يلتزم المعالج بتوثيق جميع خروقات البيانات الشخصية وتقديم تقرير مفصل عن الحادثة خلال سبعة (7) أيام عمل من تاريخ الخرق.

The Processor shall document all personal data breaches and provide a detailed incident report within seven (7) business days of the breach.

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
- تغيير جوهري في سياسات المعالج الأمنية دون موافقة المراقب / A material change in the Processor's security policies without the Controller's consent

**7.3 الالتزامات عند الإنهاء / Obligations upon Termination:**

عند إنهاء هذه الاتفاقية أو انتهاء مدتها:

Upon termination or expiry of this Agreement:

- يلتزم المعالج بحذف جميع سجلات الوصول والبيانات الشخصية خلال ثلاثين (30) يوماً / The Processor shall delete all access logs and personal data within thirty (30) days
- يلتزم المعالج بإزالة جميع المحتوى المخزن مؤقتاً على نقاط الحافة / The Processor shall purge all cached content from edge points
- يقدم المعالج للمراقب شهادة خطية تؤكد الحذف الكامل / The Processor shall provide the Controller with a written certification confirming complete deletion
- يوفر المعالج فترة انتقالية مدتها خمسة عشر (15) يوماً لنقل الخدمات / The Processor shall provide a fifteen (15) day transition period for service migration

---

## المادة 8: المسؤولية والتعويض / Article 8: Liability and Indemnification

**8.1 المسؤولية / Liability:**

يكون كل طرف مسؤولاً عن الأضرار الناجمة عن إخلاله بأحكام هذه الاتفاقية أو قانون PDPPL. ويتحمل المعالج المسؤولية الكاملة عن أي ضرر ناتج عن معالجة مخالفة لتعليمات المراقب أو لأحكام هذه الاتفاقية، بما في ذلك حالات التوقف غير المبرر للخدمة التي تؤدي إلى كشف البيانات الشخصية.

Each Party shall be liable for damages resulting from its breach of the provisions of this Agreement or the PDPPL. The Processor shall bear full liability for any damage resulting from processing that violates the Controller's instructions or the provisions of this Agreement, including unjustified service outages that lead to personal data exposure.

**8.2 التعويض / Indemnification:**

يلتزم المعالج بتعويض المراقب والدفاع عنه وحمايته من أي مطالبات أو خسائر أو أضرار أو نفقات (بما في ذلك أتعاب المحاماة المعقولة) ناشئة عن:

The Processor shall indemnify, defend, and hold harmless the Controller from any claims, losses, damages, or expenses (including reasonable attorneys' fees) arising from:

- أي خرق من المعالج لالتزاماته بموجب هذه الاتفاقية / Any breach by the Processor of its obligations under this Agreement
- أي وصول غير مصرح به للبيانات عبر شبكة الحافة / Any unauthorized access to data through the edge network
- أي خرق أمني في البنية التحتية للاستضافة / Any security breach in the hosting infrastructure
- أي غرامات أو عقوبات تُفرض على المراقب بسبب إخلال المعالج / Any fines or penalties imposed on the Controller due to the Processor's breach

**8.3 حدود المسؤولية / Limitation of Liability:**

لا يجوز أن يتجاوز إجمالي مسؤولية المعالج مبلغ الرسوم المدفوعة خلال الاثني عشر (12) شهراً السابقة لحدوث المطالبة، ما لم يكن الضرر ناتجاً عن سوء سلوك متعمد أو إهمال جسيم.

The Processor's total liability shall not exceed the fees paid during the twelve (12) months preceding the claim, unless the damage results from willful misconduct or gross negligence.

---

## المادة 9: التدقيق والتفتيش / Article 9: Audit and Inspection

**9.1** يلتزم المعالج بإتاحة جميع المعلومات اللازمة للمراقب لإثبات الامتثال لالتزامات هذه الاتفاقية، بما في ذلك تقارير SOC 2 Type II وشهادات ISO 27001.

The Processor shall make available to the Controller all information necessary to demonstrate compliance with the obligations under this Agreement, including SOC 2 Type II reports and ISO 27001 certifications.

**9.2** يحق للمراقب طلب تقرير تدقيق أمني سنوي، ويجوز إجراء تدقيق إضافي في حالة حدوث خرق أمني.

The Controller shall be entitled to request an annual security audit report, and may conduct an additional audit in the event of a security breach.

**9.3** يلتزم المعالج بتقديم تقارير الامتثال المحدثة خلال خمسة عشر (15) يوم عمل من تاريخ الطلب.

The Processor shall provide updated compliance reports within fifteen (15) business days of the request.

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

**Vercel Inc.**

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

1. يجب الحصول على توقيع Vercel Inc. قبل سريان هذه الاتفاقية / Vercel Inc. signature must be obtained before this Agreement takes effect
2. يُوصى بمراجعة قائمة المعالجين الفرعيين لدى Vercel (AWS, Cloudflare) بشكل ربع سنوي / Quarterly review of Vercel's sub-processor list (AWS, Cloudflare) is recommended
3. يجب مراجعة سياسة التخزين المؤقت على نقاط الحافة لضمان عدم تخزين بيانات شخصية حساسة / Edge caching policy must be reviewed to ensure sensitive personal data is not cached
4. يُوصى بتفعيل رؤوس الأمان (Security Headers) وفقاً لتقرير التدقيق الأمني / Security headers should be enabled per the security audit report
5. النسخة العربية هي النسخة المعتمدة في حالة الخلاف / The Arabic version is the authoritative version in case of dispute
