"use client";

/**
 * ConsentModal — PDPPL Article 7 (Law 13/2016) consent capture for the web UI.
 *
 * Closes F-3 from PLATFORM_AUDIT_PoC_2026-04-26.
 *
 * Shows once per browser. Records consent server-side via /api/consent.
 * Decline → redirects user to a public-only landing message.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "qua_consent_v1";
const STATE_ACCEPTED = "accepted";
const STATE_DECLINED = "declined";

/** Generate a stable web session id (16 hex chars) for consent tracking. */
function getOrCreateSessionId(): string {
  const existing = localStorage.getItem("qua_session_id");
  if (existing && /^web:[a-f0-9]{16,64}$/i.test(existing)) return existing;
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const sid = `web:${random}`;
  localStorage.setItem("qua_session_id", sid);
  return sid;
}

export function ConsentModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = localStorage.getItem(STORAGE_KEY);
    if (!state) {
      setOpen(true);
    }
  }, []);

  async function handleAccept() {
    setSubmitting(true);
    setError(null);
    try {
      const identifier = getOrCreateSessionId();
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Consent recording failed");
      }
      localStorage.setItem(STORAGE_KEY, STATE_ACCEPTED);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, STATE_DECLINED);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => { /* gated — explicit choice required */ }}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-right">
            🔒 موافقة على معالجة البيانات الشخصية
          </DialogTitle>
          <DialogDescription className="text-right">
            PDPPL — قانون 13/2016 (المادة 7)
          </DialogDescription>
        </DialogHeader>

        <div
          className="text-sm leading-relaxed text-right whitespace-pre-line"
          aria-label="نص الموافقة"
        >
          {`مرحباً بك في "المستشار الجامعي القطري" التابع لـ شركة أذكياء للبرمجيات.

📌 الغرض من المعالجة:
تقديم استشارة جامعية مخصصة (اختيار التخصص، الجامعات، المنح، شروط القبول).

📊 البيانات التي نجمعها:
• رقم الهاتف (عند الاستخدام عبر WhatsApp)
• الجنسية
• المعدل الدراسي
• محتوى المحادثة

🌐 المعالجون الفرعيون:
• Supabase (تخزين قاعدة البيانات)
• Vercel (استضافة التطبيق)
• Meta WhatsApp (قناة المراسلة)
• Google Gemini (المعالجة الذكية)

⏳ مدة الاحتفاظ:
طوال مدة استخدامك للخدمة + 30 يوماً بعد طلب الحذف.

⚖️ حقوقك (المواد 9–14 من PDPPL):
• الوصول إلى بياناتك (المادة 9)
• تصحيح أي بيانات غير دقيقة (المادة 10)
• حذف بياناتك / النسيان (المادة 11) — راسلنا على dpo@azkia.qa
• نقل بياناتك بصيغة قابلة للقراءة الآلية (المادة 12)
• الاعتراض على المعالجة (المادة 13)
• تقييد المعالجة في حالات محددة (المادة 14)
• سحب الموافقة في أي وقت

📚 المرجع القانوني: PDPPL Qatar — قانون رقم 13 لسنة 2016.`}
        </div>

        {error && (
          <div
            role="alert"
            className="text-sm text-red-600 dark:text-red-400 text-right"
          >
            {error}
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-start">
          <Button
            onClick={handleAccept}
            disabled={submitting}
            aria-label="أوافق على معالجة بياناتي"
          >
            {submitting ? "جارٍ التسجيل..." : "✅ أوافق"}
          </Button>
          <Button
            onClick={handleDecline}
            disabled={submitting}
            variant="outline"
            aria-label="لا أوافق على معالجة بياناتي"
          >
            ❌ لا أوافق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
