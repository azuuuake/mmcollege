import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { Conversation, Message } from "../types";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/ui/EmptyState";
import { Loading } from "../components/ui/Loading";

function counterpart(conversation: Conversation, userId?: string) {
  const other = conversation.participantA.id === userId ? conversation.participantB : conversation.participantA;
  return other.employerProfile?.businessName ?? `${other.hairdresserProfile?.firstName ?? ""} ${other.hairdresserProfile?.lastName ?? ""}`.trim();
}

export function MessagesPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [activeId, setActiveId] = useState(id);

  async function loadInbox() {
    const { data } = await api.get("/conversations");
    setConversations(data.conversations);
    if (!activeId && data.conversations[0]) setActiveId(data.conversations[0].id);
  }

  useEffect(() => {
    void loadInbox();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    void api.get(`/conversations/${activeId}/messages`).then(({ data }) => setMessages(data.messages));
  }, [activeId]);

  if (!conversations) return <Loading />;

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="card overflow-hidden">
        {conversations.length ? conversations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={`block w-full border-b border-cream-100 px-4 py-3 text-left text-sm ${activeId === item.id ? "bg-cream-100" : ""}`}
          >
            <p className="font-semibold">{counterpart(item, user?.id)}</p>
            <p className="truncate text-ink-500">{item.messages[0]?.body}</p>
          </button>
        )) : <EmptyState title="No messages" body="Employers can contact you from a public profile." />}
      </aside>
      <section className="card flex min-h-[420px] flex-col p-4">
        {activeId ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.senderId === user?.id ? "ml-auto bg-rose-600 text-white" : "bg-cream-100"}`}>
                  {message.body}
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!body.trim() || !activeId) return;
                await api.post(`/conversations/${activeId}/messages`, { body });
                setBody("");
                const { data } = await api.get(`/conversations/${activeId}/messages`);
                setMessages(data.messages);
                await loadInbox();
              }}
            >
              <input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" />
              <button className="btn-primary" type="submit">Send</button>
            </form>
          </>
        ) : (
          <p className="m-auto text-sm text-ink-500">Select a conversation.</p>
        )}
      </section>
    </div>
  );
}
