"use client";

import { useCallback, useRef } from "react";
import { useTerraformStore } from "@/store/terraform";
import type { SSEEventType } from "@/types";

export function useSSE() {
  const abortRef = useRef<AbortController | null>(null);
  const {
    setConversationId,
    setDeliberation,
    setSynthesis,
    setGraph,
    appendStreamingText,
    setStreamingText,
    setIsStreaming,
    addMessage,
    addAgentLog,
  } = useTerraformStore();

  const sendMessage = useCallback(
    async (message: string, conversationId?: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStreamingText("");

      addMessage({ role: "user", content: message });

      try {
        const resp = await fetch("/api/converse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, conversation_id: conversationId, stream: true }),
          signal: controller.signal,
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const reader = resp.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent: SSEEventType | null = null;
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim() as SSEEventType;
            } else if (line.startsWith("data: ") && currentEvent) {
              const data = line.slice(6);
              handleEvent(currentEvent, data);
              currentEvent = null;
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("SSE error:", err);
        }
      } finally {
        setIsStreaming(false);
        const finalText = useTerraformStore.getState().streamingText;
        if (finalText) {
          addMessage({ role: "assistant", content: finalText });
        }
      }
    },
    [addMessage, appendStreamingText, setStreamingText, setIsStreaming]
  );

  const handleEvent = (event: SSEEventType, data: string) => {
    switch (event) {
      case "token":
        appendStreamingText(data);
        break;
      case "graph":
        try {
          setGraph(JSON.parse(data));
        } catch {}
        break;
      case "deliberation":
        try {
          const d = JSON.parse(data);
          setDeliberation(d);
          d.contributions?.forEach((t: any) => addAgentLog(t));
        } catch {}
        break;
      case "synthesis":
        try {
          setSynthesis(JSON.parse(data));
        } catch {}
        break;
      case "meta":
        try {
          const m = JSON.parse(data);
          if (m.conversation_id) setConversationId(m.conversation_id);
        } catch {}
        break;
      case "done":
        setIsStreaming(false);
        break;
    }
  };

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  return { sendMessage, cancel };
}
