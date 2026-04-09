"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Activity, Users, MessageCircle, Search } from "lucide-react";

interface AdminData {
  timestamp: string;
  stats: {
    totalUsers: number;
    totalMessages: number;
    totalQueries: number;
  };
  topQueries: Array<{ query: string; count: number }>;
  circuitStatus: {
    isHealthy: boolean;
    [key: string]: unknown;
  };
  botStatus: Record<string, string>;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (!res.ok) {
        setError(res.status === 401 ? "كلمة المرور غير صحيحة" : "خطأ في الخادم");
        return;
      }

      setData(await res.json());
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-maroon/10 dark:bg-maroon/20 flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-maroon dark:text-primary" />
            </div>
            <CardTitle>لوحة التحكم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full bg-maroon hover:bg-maroon-dark text-white"
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <Badge className="bg-white/15 text-white border-white/20">
            {new Date(data.timestamp).toLocaleString("ar-QA")}
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-maroon dark:text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">مستخدمين</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-8 w-8 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.stats.totalMessages}</p>
              <p className="text-sm text-muted-foreground">رسائل</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{data.stats.totalQueries}</p>
              <p className="text-sm text-muted-foreground">استعلامات</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              حالة الخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.botStatus).map(([service, status]) => (
                <Badge
                  key={service}
                  variant={status === "operational" ? "default" : "destructive"}
                  className={
                    status === "operational" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : ""
                  }
                >
                  {service}: {status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Queries */}
        {data.topQueries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اكثر الاستعلامات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topQueries.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  >
                    <span className="text-sm">{q.query}</span>
                    <Badge variant="secondary">{q.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
