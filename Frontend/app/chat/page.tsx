"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/context/UserContext";
import { SendHorizonal } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Conversation {
  id: number;
  conversation_user: {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
  };
  latest_message_content: string | null;
}

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
  };
  recipient: {
    id: number;
    name: string;
  };
  content: string;
  created_at: string;
}

const ChatPage = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUserActive, setselectedUserActive] = useState<boolean>(false);

  const [selectedConversation, setSelectedConversation] = useState<
    Conversation | any
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { lastActiveData } = useUser();
  const token = localStorage.getItem("access_token");

  // ** Fetch conversations **

  useEffect(() => {
    setInterval(() => {
      fetchConversations();
    }, 10000);
  }, [token, router]);

  const fetchConversations = async () => {
    // if (!token) {
    //   toast.error("Please log in to view conversations.", {
    //     position: "bottom-right",
    //   });
    //   router.push("/login");
    //   return;
    // }

    try {
      const response = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.data);
    } catch (error: any) {
      console.error("Error fetching conversations:", error.message);
      toast.error(error.message || "Failed to load conversations", {
        position: "bottom-right",
      });
    }
  };

  const getLatestMessage = async () => {
    axios
      .post(
        `${BACKEND_URL}/api/conversations/latest_messages`,
        {
          conversation_id: selectedConversation.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response: any) => {
        if (response.data.data.length > 0) {
          setMessages((prevState) => [...prevState, ...response.data.data]);
        }
      })
      .catch((error: any) => {
        console.error("Error fetching conversations:", error.message);
        toast.error(error.message || "Failed to load conversations", {
          position: "bottom-right",
        });
      });
  };

  useEffect(() => {
    if (selectedConversation) {
      axios
        .post(
          `${BACKEND_URL}/api/users/check-user-active`,
          {
            user_id: selectedConversation.conversation_user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setselectedUserActive(response.data.data.is_active);
        })
        .catch((err) => {
          console.log(err);
        });
      setInterval(() => {
        getLatestMessage();
      }, 5000);
    }
    return;
  }, [selectedConversation]);

  // ** Fetch messages for a specific conversation **
  const fetchMessages = async (conversation: Conversation) => {
    setLoading(true);
    setSelectedConversation(conversation);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/conversations/messages?conversation_id=${conversation.id}&page=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      // Reverse messages to show latest message at the top
      const sortedMessages = data.data.messages.slice().reverse();

      setMessages(sortedMessages); // Store reversed messages
      messageContainerRef.current?.scrollTo(
        0,
        messageContainerRef.current.scrollHeight
      ); // Scroll to bottom after rendering
    } catch (error: any) {
      console.error("Error fetching messages:", error.message);
      toast.error(error.message || "Failed to load chat messages", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // ** Send message function **
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const payload = {
      conversation_id: selectedConversation.id,
      sender_id: lastActiveData?.id, // Use logged-in user's ID
      recipient_id: selectedConversation.conversation_user.id,
      content: newMessage,
    };

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/conversations/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessageData = await response.json();
      setMessages((prev) => [...prev, newMessageData.data]);
      setNewMessage("");
      messageContainerRef.current?.scrollTo(
        0,
        messageContainerRef.current.scrollHeight
      );
    } catch (error: any) {
      console.error("Error sending message:", error.message);
      toast.error(error.message || "Failed to send message", {
        position: "bottom-right",
      });
    }
  };

  const handleCloseSelectedChat = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sortedConversations = [...conversations].sort((a: any, b: any) => {
    const dateA = new Date(a.latest_conversation);
    const dateB = new Date(b.latest_conversation);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredConversations = sortedConversations.filter((conversation) => {
    const userName = conversation.conversation_user.name.toLowerCase();
    const latestMessage =
      conversation.latest_message_content?.toLowerCase() || "";
    return (
      userName.includes(searchTerm.toLowerCase()) ||
      latestMessage.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex bg-gray-100" style={{ height: "calc(100dvh - 90px)" }}>
      {/* Sidebar for Conversations */}
      <div className="w-1/4 bg-white shadow-lg overflow-y-auto border-r border-[#e3e3e3]">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search Chats"
            className="w-full px-4 py-2 border rounded-full bg-gray-100 focus-visible:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {conversations.length === 0 ? (
          <p className="text-center py-5 text-gray-600">
            No conversations found
          </p>
        ) : (
          filteredConversations.map((conversation: any) => (
            <div
              key={conversation.id}
              className={`py-4 mx-4 my-1 border-b border-[#EDECEE] cursor-pointer hover:bg-gray-50 flex items-center gap-4 ${
                selectedConversation?.id === conversation.id ? "bg-gray-50" : ""
              }`}
              onClick={() => fetchMessages(conversation)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                  {conversation.conversation_user.profile_picture ? (
                    <img
                      src={conversation.conversation_user.profile_picture}
                      alt={conversation.conversation_user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-400 text-white text-lg">
                      {conversation.conversation_user.name[0]}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-[60%]">
                <p className="font-medium">
                  {conversation.conversation_user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.latest_message_content || "No messages yet"}
                </p>
              </div>
              <div className="text-end">
                {conversation.unread_messages_count > 0 && (
                  <span className="inline-block w-3 h-3 rounded-full border-white border-2 bg-[#DD88CF]"></span>
                )}
                <p className="text-[#9EA3AE] text-sm">
                  {formatTime(conversation.latest_conversation)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedConversation.conversation_user.name}
              </h2>
              <p className="text-sm flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedUserActive ? "bg-green" : "bg-red"
                  }`}
                ></span>
                {selectedUserActive ? "Online" : "Offline"}
                <span
                  className="cursor-pointer text-lg text-white bg-slate-400 px-3 py-1 rounded-md"
                  onClick={handleCloseSelectedChat}
                >
                  X
                </span>
              </p>
            </div>
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4"
              ref={messageContainerRef}
              style={{ maxHeight: "calc(100vh - 150px)" }}
            >
              {loading ? (
                <p className="text-center">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500">No messages yet</p>
              ) : (
                // Reversed messages array for descending order
                messages
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                  ) // Ensure ascending order before reversing
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === lastActiveData?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-4 rounded-2xl shadow-md ${
                          message.sender.id === lastActiveData?.id
                            ? "bg-blue-500 text-white self-end"
                            : "bg-gray-200 text-black self-start"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
            {/* Message Input */}
            <div className="p-4 border-t flex items-center gap-3 bg-white fixed bottom-0 w-3/4">
              <input
                type="text"
                placeholder="Enter your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-full px-4 py-2"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-5 py-2 rounded-full shadow-md"
              >
                <SendHorizonal />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-600">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;