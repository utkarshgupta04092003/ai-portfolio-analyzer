"use client";

import DynamicCanvas from "@/components/DynamicCanvas";
import { useAppStore } from "@/store";
import {
  Check,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  UploadCloud,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./page.module.css";

const generateUUID = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function DashboardContent() {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    portfolioId,
    setPortfolioId,
    activeCanvas,
    setActiveCanvas,
    canvasPayload,
    setCanvasPayload,
  } = useAppStore();

  const updateUrlSession = (id: string) => {
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?session_id=${id}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Welcome to the AI Portfolio Analyzer! Please upload a portfolio to get started.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/chat/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const loadSessionMessages = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/chat/sessions/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(id);
        updateUrlSession(id);
        if (data.length > 0) {
          const mapped = data.map((m: any) => ({
            role: m.role,
            content: m.content,
          }));
          setMessages(mapped);

          // Find the last message that contained canvas updates
          const canvasMsgs = data.filter(
            (m: any) => m.canvasType && m.canvasType !== "PortfolioSummary",
          );
          if (canvasMsgs.length > 0) {
            const lastCanvas = canvasMsgs[canvasMsgs.length - 1];
            setActiveCanvas(lastCanvas.canvasType);
            setCanvasPayload(lastCanvas.canvasPayload);
          } else {
            setActiveCanvas("PortfolioSummary");
            setCanvasPayload({});
          }
        } else {
          setMessages([
            {
              role: "ai",
              content:
                "Welcome to the AI Portfolio Analyzer! Please upload a portfolio to get started.",
            },
          ]);
          setActiveCanvas("PortfolioSummary");
          setCanvasPayload(null);
        }
      }
    } catch (error) {
      console.error("Failed to load session messages:", error);
    }
  };

  const startNewChat = () => {
    const newId = generateUUID();
    setSessionId(newId);
    updateUrlSession(newId);
    setMessages([
      {
        role: "ai",
        content:
          "Welcome to the AI Portfolio Analyzer! Please upload a portfolio to get started.",
      },
    ]);
    setActiveCanvas("PortfolioSummary");
    setCanvasPayload(null);
  };

  const fetchActivePortfolio = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/portfolios/active`);
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio_id) {
          setPortfolioId(data.portfolio_id);
          setFileName(data.name || "Active Portfolio");
        }
      }
    } catch (error) {
      console.error("Failed to load active portfolio:", error);
    }
  };

  useEffect(() => {
    const sessionUrlId = searchParams.get("session_id");
    if (sessionUrlId) {
      setSessionId(sessionUrlId);
      loadSessionMessages(sessionUrlId);
    } else {
      const newId = generateUUID();
      setSessionId(newId);
      updateUrlSession(newId);
    }
    fetchSessions();
    fetchActivePortfolio();
  }, [searchParams]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Uploading ${file.name}...` },
      ]);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/portfolios/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPortfolioId(data.portfolio_id);
        setFileName(file.name);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `Successfully uploaded ${file.name}. It is now being analyzed. You can start asking questions!`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: `Failed to upload: ${JSON.stringify(data)}` },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error connecting to server during upload." },
      ]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!portfolioId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Please upload a portfolio first before asking questions.",
        },
      ]);
      return;
    }

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          portfolio_id: portfolioId,
          message: userMsg,
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);

      // Update canvas dynamically
      if (data.canvas_type) setActiveCanvas(data.canvas_type);
      if (data.canvas_payload) {
        let payload = data.canvas_payload;
        if (typeof payload === "string") {
          try {
            payload = JSON.parse(payload);
          } catch (e) {}
        }
        setCanvasPayload(payload);
      }

      // Reload conversations list in Column 1 to update title/timestamps
      await fetchSessions();
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I ran into an issue connecting to the AI agent.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* COLUMN 1: SIDEBAR (CONTROLS & HISTORY) */}
      <div className={styles.column1}>
        <div className={styles.uploadContainer}>
          <h2 className={styles.sidebarHeading}>Holdings</h2>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />

          <div
            className={`${styles.uploadCard} ${fileName ? styles.uploadCardGreen : ""}`}
          >
            {fileName ? (
              <>
                <Check size={28} style={{ color: "#10b981" }} />
                <span className={styles.uploadedFilename}>{fileName}</span>
                <button
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    width: "100%",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Change File
                </button>
              </>
            ) : (
              <>
                <UploadCloud
                  size={28}
                  style={{ color: "var(--text-secondary)" }}
                />
                <button
                  className={`${styles.button} ${styles.uploadBtn}`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Upload Portfolio"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <button
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={startNewChat}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Plus size={16} /> New Chat
        </button>

        <div className={styles.historyContainer}>
          <h3
            className={styles.sidebarHeading}
            style={{ marginBottom: "0.75rem" }}
          >
            Conversations
          </h3>
          <div className={styles.historyList}>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={`${styles.historyItem} ${sessionId === sess.id ? styles.historyItemActive : ""}`}
                onClick={() => loadSessionMessages(sess.id)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <MessageSquare
                    size={14}
                    style={{
                      color:
                        sessionId === sess.id
                          ? "var(--accent-hover)"
                          : "var(--text-secondary)",
                    }}
                  />
                  <span className={styles.historyItemTitle}>{sess.title}</span>
                </div>
                <span className={styles.historyItemTime}>
                  {new Date(sess.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                No past conversations.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* COLUMN 2: CURRENT CHAT ASSISTANT */}
      <div className={styles.column2}>
        <div className={styles.chatContainer}>
          <h2
            className={styles.sidebarHeading}
            style={{ marginBottom: "1rem" }}
          >
            AI Assistant
          </h2>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.aiMessage}`}
              >
                {msg.role === "ai" || msg.role === "assistant" ? (
                  <div className={styles.markdownContent}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div
                            style={{
                              overflowX: "auto",
                              width: "100%",
                              margin: "0.75rem 0",
                            }}
                          >
                            <table {...props} />
                          </div>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isTyping && (
              <div
                className={`${styles.message} ${styles.aiMessage} ${styles.analyzingPulse}`}
              >
                <Loader2
                  size={16}
                  className={`animate-spin ${styles.spinner}`}
                />
                Analyzing<span className={styles.typingDots}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your portfolio..."
            />
            <button className={styles.button} onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 3: CANVAS (DYNAMIC COMPONENT RENDERING) */}
      <div className={styles.column3}>
        <div className={styles.header}>
          <h1>Portfolio Intelligence</h1>
          <p className={styles.headerSubtitle}>
            Interactive Analysis & Simulations
          </p>
        </div>

        <div className={`${styles.canvasArea} glass-panel animate-fade-in`}>
          <DynamicCanvas onSelectPrompt={(prompt) => setInput(prompt)} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 className="animate-spin" /> Loading Analyzer...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
