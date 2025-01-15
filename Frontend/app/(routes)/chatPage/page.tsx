"use client";
import React from "react";
import ChatCard from "@/app/components/Cards/ChatCard";
import { ChatMessage } from "@/app/types";
import Image from "next/image";
import { IoEllipsisVerticalOutline } from "react-icons/io5";

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    profileImage: "/Images/Chat_Img.png",
    name: "Alfredo Calzoni",
    lastMessage:
      "What about the new jacket if I want to buy it this weekend and maybe get a different color",
    time: "09:18",
    hasUnreadMessage: true,
  },
  {
    id: 2,
    profileImage: "/Images/Chat_Img.png",
    name: "Emma Watson",
    lastMessage:
      "I'm thinking of going to the concert next week. Would you like to join?",
    time: "10:45",
    hasUnreadMessage: false,
  },
  {
    id: 3,
    profileImage: "/Images/Chat_Img.png",
    name: "John Doe",
    lastMessage: "Can we reschedule our meeting to tomorrow afternoon?",
    time: "11:20",
    hasUnreadMessage: true,
  },
  {
    id: 4,
    profileImage: "/Images/Chat_Img.png",
    name: "Sarah Smith",
    lastMessage:
      "The project deadline is approaching. We need to finalize the details.",
    time: "12:05",
    hasUnreadMessage: true,
  },
  {
    id: 5,
    profileImage: "/Images/Chat_Img.png",
    name: "Michael Brown",
    lastMessage: "Just finished the report. Would you like me to send it over?",
    time: "13:30",
    hasUnreadMessage: false,
  },
  {
    id: 6,
    profileImage: "/Images/Chat_Img.png",
    name: "Lisa Johnson",
    lastMessage: "Reminder: Team lunch tomorrow at the new restaurant downtown",
    time: "14:15",
    hasUnreadMessage: true,
  },
  {
    id: 7,
    profileImage: "/Images/Chat_Img.png",
    name: "David Lee",
    lastMessage: "Can you help me with the presentation slides?",
    time: "15:00",
    hasUnreadMessage: false,
  },
  {
    id: 8,
    profileImage: "/Images/Chat_Img.png",
    name: "Rachel Green",
    lastMessage: "I found the perfect solution for our marketing campaign",
    time: "16:45",
    hasUnreadMessage: true,
  },
  {
    id: 9,
    profileImage: "/Images/Chat_Img.png",
    name: "Tom Hardy",
    lastMessage: "Just booked the tickets for our weekend getaway!",
    time: "17:30",
    hasUnreadMessage: false,
  },
  {
    id: 10,
    profileImage: "/Images/Chat_Img.png",
    name: "Anna Martinez",
    lastMessage:
      "We need to discuss the new client proposal as soon as possible",
    time: "18:20",
    hasUnreadMessage: true,
  },
];

const Chat = () => {
  return (
    <div className="flex flex-col md:flex-row md:h-[83vh]">
      <div className="md:w-[27%] md:overflow-y-auto md:max-h-[800px] px-2">
        {chatMessages.map((message) => (
          <ChatCard
            key={message.id}
            profileImage={message.profileImage}
            name={message.name}
            lastMessage={message.lastMessage}
            time={message.time}
            hasUnreadMessage={message.hasUnreadMessage}
          />
        ))}
      </div>
      <div className="md:w-[73%] hidden md:block">
        <div className="flex justify-between items-center px-4 py-1 border-b-2 border-gray-200">
          <div className="w-10 h-10 flex-shrink-0">
            <Image
              src="/Images/Chat_Img.png"
              alt="Profile_Image"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
              priority={false}
            />
          </div>

          {/* User Name and Last Seen */}
          <div className="flex-grow overflow-hidden ml-4">
            <h3 className="font-semibold text-sm md:text-base truncate">
              Alfredo Calzoni
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              last seen 5 mins ago
            </p>
          </div>
          <div>
            <IoEllipsisVerticalOutline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
