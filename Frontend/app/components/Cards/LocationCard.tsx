import Image from "next/image";
import React from "react";

const parseStyledText = (text: string) => {
  const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g; // Match ***...***, **...**, and *...*
  const parts = text.split(regex); // Split the text into styled and non-styled parts

  return parts.map((part, index) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      // Bold + Italic
      return (
        <strong key={index} style={{ fontStyle: "italic" }}>
          {part.slice(3, -3)} {/* Remove *** */}
        </strong>
      );
    } else if (part.startsWith("**") && part.endsWith("**")) {
      // Bold
      return (
        <strong key={index}>
          {part.slice(2, -2)} {/* Remove ** */}
        </strong>
      );
    } else if (part.startsWith("*") && part.endsWith("*")) {
      // Italic
      return (
        <em key={index}>
          {part.slice(1, -1)} {/* Remove * */}
        </em>
      );
    }
    // Regular text
    return part;
  });
};

const LocationCard = ({ location }: any) => {
  return (
    <div className="flex flex-col md:flex-row  gap-4 p-3 shadow-all rounded-2xl">
      <div className="md:w-[260px] w-full flex-shrink-0">
        <Image
          src={location.image}
          alt="Location Image"
          width={260}
          height={200}
          className="w-full h-full object-contain rounded-2xl"
        />
      </div>
      <div className="p-4 flex flex-col justify-between ">
        <div className="text-top">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {location.title}
          </h2>
          <div className="flex items-center text-gray-700">

            <p className="capitalize text-sm">{location?.category}</p>
            <p className="border-l border-r border-gray-700 px-2 mx-2 text-sm">
              ${location?.price}
            </p>
            <p className="capitalize text-sm">{location?.quantity} {location?.unit}</p>
          </div>
          <hr className="my-2"/>
          <p className="text-sm opacity-85 text-ellipsis overflow-hidden line-clamp-3">
            {parseStyledText(location.description)}
          </p>

        </div>
       
        <div className="text-bottom">
          <p className="text-sm my-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-map-pin bg-[#96F49D] text-white rounded-full p-1"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location.location}
            </p>
          

        </div>
      </div>
    </div>
  );
};

export default LocationCard;