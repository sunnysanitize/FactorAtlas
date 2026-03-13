"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { AiSummaryCard } from "@/components/cards/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { askCopilot } from "@/lib/api/copilot";
import type { CopilotResponse } from "@/lib/types/api";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: CopilotResponse;
}

const SUGGESTIONS = [
  "What are my biggest risks?",
  "Am I actually diversified?",
  "Which positions drive most of my volatility?",
  "What themes dominate my portfolio?",
  "Summarize my portfolio's key characteristics.",
  "What are the hidden concentrations in my portfolio?",
];

export default function CopilotPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askCopilot(portfolioId, question);
      const aiMsg: Message = { role: "assistant", content: response.answer, response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: err instanceof Error ? err.message : "Failed to get response.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Copilot"
        description="Ask questions about your portfolio — answers are grounded in computed analytics"
      />

      {/* Suggestions */}
      {messages.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((q) => (
                <Button key={q} variant="outline" size="sm" onClick={() => send(q)} className="text-xs">
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message history */}
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg px-4 py-2 max-w-lg">
                  <p className="text-sm text-foreground">{msg.content}</p>
                </div>
              </div>
            ) : (
              <AiSummaryCard
                answer={msg.content}
                confidence={msg.response?.confidence}
                sourceMetrics={msg.response?.source_metrics}
              />
            )}
          </div>
        ))}
        {loading && <AiSummaryCard answer="" loading />}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Ask about your portfolio..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
