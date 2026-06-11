"use client";

import DynamicCanvas from "@/components/DynamicCanvas";
import { useAppStore } from "@/store";
import { Loader2, Send, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./page.module.css";

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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

  // Dummy messages for UI scaffold
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", "My Uploaded Portfolio");

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
          session_id: "default_session",
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
      {/* Sidebar - Chat & Controls */}
      <div className={styles.sidebar}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className={styles.sidebarHeading}>Controls</h2>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
          <button
            className={`${styles.button} ${styles.uploadBtn}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UploadCloud size={18} />
            )}
            {isUploading ? "Uploading..." : "Upload Portfolio"}
          </button>
        </div>

        <div className={styles.chatContainer}>
          <h2 className={styles.sidebarHeading}>AI Assistant</h2>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.aiMessage}`}
              >
                {msg.role === "ai" ? (
                  <div className={styles.markdownContent}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
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

      {/* Main Content - Dynamic Canvas */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Portfolio Intelligence</h1>
          <p className={styles.headerSubtitle}>
            Interactive Analysis & Simulations
          </p>
        </div>

        <div className={`${styles.canvasArea} glass-panel animate-fade-in`}>
          <DynamicCanvas />
        </div>
      </div>
    </div>
  );
}
