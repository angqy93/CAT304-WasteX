
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">
        <Image
          src="/images/Pic1.jpg" // Path to image in the public folder
          alt="Main Image"
          className="absolute w-full object-cover"
          priority
          width={0} // No fixed width, uses the full width of its container
          height={0} // No fixed height, let the image maintain its aspect ratio
          style={{ filter: "brightness(70%)" }} // Darkens the image
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-50" />

        <div className="relative z-10 h-[90vh] flex flex-col justify-center items-center bg-gradient-to-r from-green-500 via-white-500 to-pink-500 px-6">
          <div className="text-center">
            <h1 className="md:text-6xl text-4xl font-extrabold leading-tight text-white w-full">
              Trade Your Waste Online with <br />
              <span className="text-green">WasteX!</span>
            </h1>
            <p className="md:text-lg text-base mt-20 md:w-2/3 w-full mx-auto text-gray-200">
              Transform waste into value effortlessly. Sell your waste online
              and contribute to a more sustainable future. Join the eco-friendly
              movement today with <strong>WasteX!</strong>
            </p>
            <Link href="/products" className="flex justify-center">
              <button className="relative px-8 py-4 border-2 border-green rounded-md font-bold tracking-widest uppercase text-green text-sm overflow-hidden transition-all duration-1000 hover:text-white hover:scale-110 hover:border-[#70bdca] hover:shadow-lg group">
                <span className="absolute inset-0 -left-12 bg-green skew-x-12 transform w-0 h-full transition-all duration-1000 group-hover:w-[250%]"></span>
                <span className="relative z-10">Click Me</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="relative z-10 flex flex-row justify-center items-stretch gap-4 px-6 py-8 bg-gray-100">
        {/* Card 1 */}
        <div className="flex flex-col justify-between bg-white shadow-lg rounded-lg p-6 w-[300px] h-[400px] items-center text-center">
          <Image
            src="/Images/earth-9-svgrepo-com.svg"
            alt="Geolocation Icon"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold text-gray-800 mt-4">Geolocation</h3>
          <p className="text-gray-600">
            Locate the nearest waste disposal centers using real-time geolocation
            services.
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between bg-white shadow-lg rounded-lg p-6 w-[300px] h-[400px] items-center text-center">
          <Image
            src="/Images/communication-cost-svgrepo-com.svg"
            alt="Communication Icon"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold text-gray-800 mt-4">Communication</h3>
          <p className="text-gray-600">
            Connect and collaborate with buyers and sellers easily through our
            platform.
          </p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between bg-white shadow-lg rounded-lg p-6 w-[300px] h-[400px] items-center text-center">
          <Image
            src="/Images/market-stall-svgrepo-com.svg"
            alt="Marketplace Icon"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold text-gray-800 mt-4">Marketplace</h3>
          <p className="text-gray-600">
            Buy and sell recyclable materials efficiently on our integrated
            marketplace.
          </p>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between bg-white shadow-lg rounded-lg p-6 w-[300px] h-[400px] items-center text-center">
          <Image
            src="/Images/ai-svgrepo-com.svg"
            alt="AI Analysis Icon"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold text-gray-800 mt-4">AI Analysis</h3>
          <p className="text-gray-600">
            Use AI to analyze and optimize waste management strategies
            effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}