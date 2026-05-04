---
decision_id: DEC-2026-05-04-WHATSAPP-PUBLISH
date: 2026-05-04
department: Strategic Planning / Product
status: draft
decided_by: Sufyan Mesyef (CEO)
constitutional_layer: CEF v1.0
logic_gate_tier: medium
reversibility: HIGH
target_live_date: 2026-05-18
related_decisions:
  - DEC-DPO-001
  - DEC-SEC-003
  - DEC-WA-LIVE-001 (مستقبلي — يُغلق هذا القرار)
related_standards:
  - corporate/standards/project-bootstrap-protocol.md
  - corporate/standards/pdppl-compliance.md
related_files:
  - .env (Vercel production environment)
  - apps/whatsapp-bot/src/webhook.ts
  - docs/legal/privacy-policy.md (قيد الإنشاء)
  - docs/legal/terms-of-service.md (قيد الإنشاء)
classification: confidential
advisory_input:
  - advisor_id: advisor_pdppl_qatar
    invoked_via: PENDING (CEO سيستشيره قبل توقيع DEC)
    consulted_at: PENDING
    feedback: |
      PENDING — مطلوب verdict على:
      1) كفاية DPO appointment letter draft.
      2) محتوى NCSA notification + توقيت إرساله (متأخّر 3 أيام عن deadline 2026-05-01).
      3) شكل DPA المطلوب من Meta (Standard Contractual Clauses أم نموذج خاص).
      4) هل النشر قبل توقيع DPA يُعدّ مخالفة Article 17 PDPPL؟
    recommendation: PENDING
    conditions: []
  - advisor_id: advisor_qatar_corporate_law
    invoked_via: PENDING
    consulted_at: PENDING
    feedback: |
      PENDING — مطلوب verdict على:
      1) Governing law clause في Terms of Service (Qatar courts vs arbitration).
      2) شرط حل النزاع مع Meta (Ireland jurisdiction في Meta DPA).
      3) صياغة consent للقاصرين (طلاب < 18 سنة في موسم القبول).
      4) هل تشغيل البوت من رقم أردني +962 لمدة 24 ساعة يُنشئ التزاماً قانونياً في الأردن؟
    recommendation: PENDING
    conditions: []
  - advisor_id: advisor_business_management
    invoked_via: PENDING
    consulted_at: PENDING
    feedback: |
      PENDING — مطلوب verdict على:
      1) صحة افتراض Service conversations مجانية بالكامل (نموذج Meta 2025-11-01).
      2) سقف Utility 10% × $0.019 — هل يتحمّل ذروة موسم القبول (10k+ طالب)؟
      3) Payment method: credit card قطري عند الذروة فقط — هل يكفي أم نحتاج prepaid balance؟
      4) ROI خلال 90 يوم post-Live + KPIs الإلزامية للمتابعة.
    recommendation: PENDING
    conditions: []
  - advisor_id: advisor_security
    invoked_via: PENDING
    consulted_at: PENDING
    feedback: |
      PENDING — مطلوب verdict على:
      1) System User Permanent Token rotation policy (90 يوم؟ 180 يوم؟).
      2) Webhook signature verification (X-Hub-Signature-256) — مفعّل؟
      3) Rate limiting + abuse protection على endpoint webhook.
      4) Secret scanning في Vercel + GitHub لمنع تسريب Token.
      5) Incident response plan في حال leak (rotate + revoke + audit).
    recommendation: PENDING
    conditions: []
---

# DEC-2026-05-04-WHATSAPP-PUBLISH — نشر qatar-university-advisor على Meta Live Mode

## 1. Header & Metadata

| الحقل | القيمة |
|------|--------|
| **DEC ID** | DEC-2026-05-04-WHATSAPP-PUBLISH |
| **Date** | 2026-05-04 |
| **Decision-maker** | Sufyan Mesyef (CEO) |
| **Status** | draft (advisory pending) |
| **Logic Gate Tier** | Medium (مشروع واحد، أثر محدود قابل للعكس) |
| **Reversibility** | HIGH — toggle Live → Dev في 5 دقائق |
| **Target Live Date** | 2026-05-18 (D+14) |
| **App ID** | 2561001717649358 |
| **WABA ID** | 1628680758444681 |
| **Test recipient** | +97455296286 (CEO) — مُسجَّل ✓ |
| **Current phone** | +962 (أردني، مؤقت 24h) → قطري 2026-05-05 |

---

## 2. Context (السياق)

### 2.1 المشكلة
بوت `qatar-university-advisor` يعمل حالياً في **Meta Development / Unpublished mode**.
هذا يعني:
- لا يمكن إرسال رسائل إلا للأرقام المُسجَّلة يدوياً في App Dashboard.
- سقف 5 أرقام test recipients فقط.
- Service conversations محدودة + لا access إلى free tier الكامل.
- لا يمكن قبول طلاب حقيقيين على نطاق إنتاج.

البوت جاهز تقنياً (System User Permanent Token موضوع في Vercel، test مع رقم CEO ناجح)
لكنه **محبوس خلف جدار Meta App Review**.

### 2.2 لماذا الآن؟
ثلاثة عوامل ضاغطة متلاقية:

1. **موسم القبول الجامعي القطري قريب** — التسجيل المبكّر يبدأ منتصف يونيو 2026.
   النشر اليوم (2026-05-04) يعطينا 6 أسابيع للنضج قبل الذروة.
2. **PDPPL Law 13/2016 deadline متأخّر 3 أيام** (deadline كان 2026-05-01).
   كل يوم تأخير إضافي = exposure قانوني متراكم. الـ DEC هذا يُؤطّر استدراك
   التأخير ضمن خطة 14 يوم بدلاً من ترك الأمر مفتوحاً.
3. **Meta App Review يستغرق 3-7 أيام عمل**. الانتظار = تأجيل تلقائي للموسم.

### 2.3 الكلفة الإستراتيجية للتأخير
- **كل أسبوع تأخير ≈ 500-1000 طالب لا يصلون للبوت** (تقدير من حجم سوق القطري).
- **PDPPL exposure**: غرامات حتى 5M QAR، sanctions على personal data processing
  بدون DPO/DPA/notification.
- **منافسة**: حلول مشابهة (chatbots للجامعات في الخليج) بدأت تنتشر — الـ first-mover
  advantage في قطر يتآكل.

---

## 3. Decision (القرار)

**نشر تطبيق qatar-university-advisor على Meta Live Mode بحلول 2026-05-18 (D+14)
وفق خطة 14 يوم مرحلية، مع استدراك متوازٍ لمتطلبات PDPPL المتأخّرة.**

النشر مشروط بـ:
- (أ) إنجاز Privacy Policy + Terms of Service (Engineering يكتبها بالتوازي).
- (ب) DPO appointment letter موقّع رسمياً من CEO.
- (ج) NCSA notification مُرسَلة + رقم تتبّع مُستلَم.
- (د) DPA مع Meta موقّع (أو في مرحلة "submitted-pending-counter-signature").
- (هـ) verdicts من المستشارين الأربعة (status = approve أو approve-with-conditions).

أيّ شرط مفقود = تأخير NoGo + إعادة جدولة.

---

## 4. Advisory Input (إلزامي بعد VIO-EUDST-002)

أربعة مستشارين مطلوبون قبل توقيع CEO النهائي. حالة كلٍّ منهم = **PENDING** (راجع
YAML frontmatter للتفاصيل):

| المستشار | المجال | Verdict |
|----------|--------|---------|
| `advisor_pdppl_qatar` | DPA + DPO + NCSA notification | PENDING |
| `advisor_qatar_corporate_law` | Terms governing law + minor consent | PENDING |
| `advisor_business_management` | Cost model + free tier validation | PENDING |
| `advisor_security` | Token rotation + webhook security | PENDING |

**لا توقيع CEO قبل اكتمال الأربعة. DEC يبقى `status: draft` حتى ذلك.**

---

## 5. Risks & Mitigations

| # | المخاطرة | الاحتمال | الأثر | Mitigation |
|---|----------|---------|------|------------|
| R1 | Meta App Review rejection | متوسط | عالٍ | تجهيز App Review submission كاملة مع screencast + Privacy URL + use case واضح. تحضير response template للأسئلة الشائعة. |
| R2 | PDPPL غرامة (حتى 5M QAR) | منخفض-متوسط | كارثي | إنجاز DPO + NCSA + DPA قبل Live date. توثيق محاولة الاستدراك (good faith). استشارة advisor_pdppl_qatar كـ shield قانوني. |
| R3 | DPA مع Meta متأخر | عالٍ | عالٍ | البدء بمسار DPA في 2026-05-10. إن لم يُوقَّع قبل 2026-05-18 → تأجيل Live إلى 2026-05-22 (buffer 4 أيام). |
| R4 | الرقم الأردني +962 يُرفض من Meta | منخفض | متوسط | الاستبدال برقم قطري في 2026-05-05 (D+1). الأردني فقط لاختبار 24 ساعة. |
| R5 | Token leak عبر git/logs | منخفض | كارثي | secret scanning في Vercel + GitHub Actions. rotation policy 90 يوم. webhook signature verification إلزامي. incident response runbook جاهز. |
| R6 | Delivery rate < 90% بعد Live | متوسط | متوسط | monitoring dashboard مع alert على < 95%. fallback: SMS gateway قطري كـ secondary channel. |
| R7 | تجاوز free tier فجأة في الذروة | منخفض | منخفض | credit card قطري مُعدّ مسبقاً + alert على 80% من شهري baseline. |

---

## 6. Kill Criteria

النشر يُلغى أو يُعلَّق فوراً عند أيّ من:

1. **Business Verification رُفض مرتين متتاليتين** من Meta → إعادة تقييم structure
   الشركة (CR، tax ID، documents) قبل المحاولة الثالثة.
2. **PDPPL غرامة فعلية أو إنذار رسمي من NCSA** → suspension فوري للبوت + DEC جديد
   لإعادة التقييم القانوني.
3. **Meta delivery rate < 90% لمدة 7 أيام متتالية بعد Live** → تجميد التوسّع +
   root cause analysis قبل scale-up.
4. **Token leak مُؤكَّد** → revoke فوري + rotate + audit + DEC-SEC جديد.
5. **رفض المستشار `advisor_pdppl_qatar` (recommendation: reject)** → تأجيل Live
   حتى استيفاء الشروط.

---

## 7. Rollback Plan

| الخطوة | الإجراء | الوقت | التكلفة |
|--------|---------|------|---------|
| 1 | Toggle App mode: Live → Development في Meta Dashboard | 5 دقائق | 0 |
| 2 | Suspend phone number في WABA | 10 دقائق | 0 |
| 3 | إيقاف webhook في Vercel (env var `WHATSAPP_ENABLED=false`) | 2 دقيقة | 0 |
| 4 | إشعار test users + CEO عبر قناة بديلة | 15 دقيقة | 0 |
| **المجموع** | **rollback كامل** | **< 30 دقيقة** | **0 ر.ق** |

Reversibility = HIGH. لا data loss، لا migration، لا downtime على باقي
الخدمات.

---

## 8. Action Items — خطة 14 يوم

### Day 0 — اليوم (2026-05-04)
- [ ] Engineering: كتابة Privacy Policy (مسوّدة v1) — `docs/legal/privacy-policy.md`
- [ ] Engineering: كتابة Terms of Service (مسوّدة v1) — `docs/legal/terms-of-service.md`
- [ ] CEO: توقيع DPO appointment letter رسمياً
- [ ] Strategic Planner: مسوّدة NCSA notification — جاهزة للإرسال غداً
- [ ] استشارة المستشارين الأربعة (advisory_input → PENDING → filled)

### Day 1 — 2026-05-05
- [ ] DevOps: تفعيل الرقم القطري في WABA + استبدال +962
- [ ] DevOps: تحديث Vercel env vars (PHONE_NUMBER_ID الجديد)
- [ ] Strategic Planner: إرسال NCSA notification + توثيق رقم التتبّع
- [ ] Engineering: نشر Privacy + Terms على URL عام (`/legal/privacy`, `/legal/terms`)

### Day 2-5 — 2026-05-06 إلى 2026-05-09
- [ ] Submit Business Verification في Meta Business Manager
- [ ] Submit App Review (مع screencast + use case + Privacy URL)
- [ ] متابعة يومية لحالة Verification
- [ ] استكمال DPA negotiation مع Meta (ابتداء)

### Day 6-10 — 2026-05-10 إلى 2026-05-14
- [ ] توقيع DPA مع Meta (counter-signed)
- [ ] إعداد payment method قطري في Meta Billing (credit card، not active)
- [ ] Smoke test على 5 test users إضافيين (post-Verification)
- [ ] مراجعة security: webhook signature، rate limiting، secret scanning

### Day 11-14 — 2026-05-15 إلى 2026-05-18
- [ ] **2026-05-15**: Final go/no-go meeting (CEO + advisors)
- [ ] **2026-05-16**: Switch to Live Mode (إن go)
- [ ] **2026-05-17**: 24h monitoring intensive (delivery rate, error rate, latency)
- [ ] **2026-05-18**: إغلاق DEC-WA-LIVE-001 رسمياً (closure DEC) + announcement داخلي

---

## 9. Success Criteria

النشر يُعتبر ناجحاً عند تحقّق **كلّ** المؤشرات التالية في النافذة المحدّدة:

| KPI | الهدف | النافذة | المصدر |
|-----|------|---------|--------|
| App approved by Meta | ✓ | بحلول 2026-05-16 | Meta Dashboard |
| Delivery rate | ≥ 95% | أول 30 يوم post-Live | Meta Insights |
| PDPPL violations | 0 | استمراري | NCSA + DPO log |
| First students onboarded | ≥ 100 | أول 7 أيام post-Live | Internal analytics |
| Zero token incidents | 0 leaks | استمراري | Security monitoring |
| Cost vs. budget | < 70 ر.ق/شهر حتى 10k طالب | أول 90 يوم | Meta Billing |

أيّ KPI أحمر لمدة > 7 أيام = trigger للـ Kill Criteria أو DEC تصحيحي.

---

## 10. Linked DECs

| DEC ID | الحالة | العلاقة |
|--------|--------|---------|
| DEC-DPO-001 | موجود (approved) | DPO appointment أساس امتثال PDPPL |
| DEC-SEC-003 | موجود (Phase B/C pending) | إطار security يُغطّي token rotation |
| **DEC-WA-LIVE-001** | **مستقبلي** | **closure DEC يُغلق هذا القرار في 2026-05-18** |
| DEC-2026-05-XX-PDPPL-CATCHUP | مُحتمَل | إن استدعى المستشار PDPPL إجراءات تصحيحية إضافية |

---

## 11. R-Rules Compliance

- **R-10 (silent execution):** ✓ — DEC يُكتب آلياً، لا أسئلة "هل أكمل؟".
- **R-11 (multi-commit + immediate push):** ✓ — هذا الملف commit مستقل + push فوري.
- **R-12 (quality > speed):** ✓ — لا shortcuts. advisory_input كاملة (وإن PENDING)،
  rollback موثّق، KPIs قابلة للقياس.
- **CEF §1.1 Allowlist:** ✓ — `corporate/decisions/` ضمن allowlist لـ
  azkia-strategic-planner.
- **VIO-EUDST-002:** ✓ — advisory_input مُعرَّف لكل مستشار مطلوب (4 مستشارين)،
  حالة كل verdict موثّقة (PENDING حتى استشارة CEO الفعلية).

---

## 12. Sign-off Block

```
─────────────────────────────────────────────────────────────
DECISION APPROVAL

Decision ID:    DEC-2026-05-04-WHATSAPP-PUBLISH
Status:         draft (pending advisory verdicts × 4)

Prepared by:    azkia-strategic-planner subagent
Date prepared:  2026-05-04

CEO Signature:  ________________________________
                Sufyan Mesyef
Date signed:    ____________________

Conditions for activation:
  [ ] advisor_pdppl_qatar verdict received
  [ ] advisor_qatar_corporate_law verdict received
  [ ] advisor_business_management verdict received
  [ ] advisor_security verdict received
  [ ] Privacy Policy published
  [ ] Terms of Service published
  [ ] DPO appointment letter signed
  [ ] NCSA notification sent (tracking # recorded)
  [ ] DPA with Meta signed or counter-signed-pending

Once all conditions met → status: approved → execute Day 0-14 plan.
─────────────────────────────────────────────────────────────
```

---

## 13. Notes & Open Items

- **Tension observed:** PDPPL deadline (2026-05-01) متأخّر بالفعل. هذا الـ DEC
  يُؤطّر الاستدراك ضمن good-faith framework، لكن لا يُلغي exposure القانوني
  للأيام الـ 17 (2026-05-01 → 2026-05-18). توصية: documentation كاملة للسبب
  + مسار التصحيح كـ shield إن طُلب من NCSA.
- **Secondary channel fallback:** إن Meta Live تأخّر > 7 أيام عن D+14 → تفعيل
  SMS gateway قطري كقناة احتياطية لموسم القبول، وتأجيل WhatsApp إلى موسم لاحق.
- **Future DEC:** إن نجح النشر، DEC جديد لتوسيع الميزات (templates marketing،
  voice notes، rich media) بعد 90 يوم من Live.

---

**End of DEC-2026-05-04-WHATSAPP-PUBLISH**
