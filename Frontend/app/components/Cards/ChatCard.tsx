// components/Cards/ChatCard.tsx
import React from "react";
import Image from "next/image";

interface ChatCardProps {
  profileImage: string;
  name: string;
  lastMessage: string;
  time: string;
  hasUnreadMessage: boolean;
  maxMessageLength?: number;
}

const ChatCard: React.FC<ChatCardProps> = ({
  profileImage,
  name,
  lastMessage,
  time,
  hasUnreadMessage,
  maxMessageLength = 30,
}) => {
  const truncateMessage = (message: string, maxLength: number): string => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength).trim() + "...";
  };

  return (
    <div className="flex justify-between items-center gap-4 md:gap-5 border-b-2 border-gray-300 py-3 px-2">
      {/* Profile Image */}
      <div className="w-12 md:w-14 h-12 md:h-14 flex-shrink-0">
        <Image
          src={profileImage}
          alt={`${name}'s profile image`}
          width={56}
          height={56}
          className="w-full h-full object-cover rounded-full"
          priority={false}
        />
      </div>

      {/* User Name and Message */}
      <div className="flex-grow overflow-hidden">
        <h3 className="font-semibold text-sm md:text-base truncate">{name}</h3>
        <p
          className="text-gray-600 text-xs md:text-sm"
          title={
            lastMessage.length > maxMessageLength ? lastMessage : undefined
          }
        >
          {truncateMessage(lastMessage, maxMessageLength)}
        </p>
      </div>

      {/* Time and Unread Indicator */}
      <div className="flex flex-col gap-2.5 items-end">
        {/* {hasUnreadMessage && ( */}
          <div className="w-2.5 h-2.5 bg-red rounded-full"></div>
        {/* )} */}
        <p className="text-gray-500 text-sm">{time}</p>
      </div>
    </div>
  );
};

export default ChatCard;