"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface PartnerPresence {
  isOnline: boolean;
  lastSeenText: string;
  partnerRole: "A" | "B";
  partnerName: string;
}

// 节流函数 - 限制频率
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export default function PresenceIndicator() {
  const [presence, setPresence] = useState<PartnerPresence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const lastHeartbeat = useRef<number>(0);
  const isVisible = useRef(true);

  // 发送心跳 - 更新自己的在线状态
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch("/api/presence", { method: "POST" });
      lastHeartbeat.current = Date.now();
    } catch (err) {
      console.error("Heartbeat failed:", err);
    }
  }, []);

  // 节流版心跳 - 最小间隔 30 秒
  const throttledHeartbeat = useCallback(
    throttle(() => {
      // 只有距离上次心跳超过 25 秒才发送
      if (Date.now() - lastHeartbeat.current > 25000) {
        sendHeartbeat();
      }
    }, 30000),
    [sendHeartbeat]
  );

  // 获取伴侣的在线状态
  const checkPartnerStatus = useCallback(async () => {
    // 页面不可见时不检查
    if (!isVisible.current) return;
    
    try {
      const res = await fetch("/api/presence");
      if (!res.ok) {
        if (res.status === 401) return; // 未登录，静默处理
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setPresence(data);
      setError(null);
    } catch (err) {
      console.error("Failed to check partner status:", err);
      setError("检查状态失败");
    }
  }, []);

  useEffect(() => {
    // 防止 React 18 StrictMode 双重执行
    if (initialized.current) return;
    initialized.current = true;
    
    // 立即发送一次心跳
    sendHeartbeat();
    checkPartnerStatus();

    // 每30秒发送一次心跳
    const heartbeatInterval = setInterval(() => {
      if (isVisible.current) {
        sendHeartbeat();
      }
    }, 30000);

    // 每30秒检查一次伴侣状态（从10秒改为30秒，减少请求）
    const checkInterval = setInterval(checkPartnerStatus, 30000);

    // 页面可见性变化时更新状态
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      isVisible.current = visible;
      if (visible) {
        // 页面重新可见时立即更新
        sendHeartbeat();
        checkPartnerStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 页面活动时发送心跳（节流版，最多每30秒一次）
    const handleActivity = () => {
      throttledHeartbeat();
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(checkInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [sendHeartbeat, checkPartnerStatus, throttledHeartbeat]);

  if (!presence) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        <span>加载中...</span>
      </div>
    );
  }

  const displayName = presence.partnerName;

  return (
    <div className="flex items-center gap-2">
      {presence.isOnline ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-green-600 text-sm font-medium">{displayName} 在线</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-gray-500 text-sm">
            {displayName} 离线 · {presence.lastSeenText || "未知"}
          </span>
        </>
      )}
    </div>
  );
}
