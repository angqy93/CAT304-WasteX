import Image from "next/image";
import Link from "next/link";

const OrderListing = () => {
  return (
    <div className="bg-productBG md:px-12 px-4 py-12 min-h-[83vh]">
      {/* Mobile View - Hidden on Desktop */}
      <div
        className="md:hidden bg-white py-2.5 font-semibold px-5 rounded-xl 
        flex flex-col items-center space-y-4"
      >
        <div className="w-full flex items-center space-x-4">
          <div className="w-24 h-24">
            <Image
              src="/Images/Product_Img.png"
              alt="Product_Image"
              width={100}
              height={100}
              className="object-cover rounded-full w-full h-full"
            />
          </div>
          <div>
            <p className="font-semibold">Unused metal scrap</p>
            <p className="text-gray-400 text-sm">500g</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/Images/Calendar.svg"
              alt="Calendar_Icon"
              width={20}
              height={20}
            />
            <span>4th May 2025</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Buyer</p>
            <p className="font-semibold">Company Name</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total Amount</p>
            <p className="font-semibold">$ 5000</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button className="text-white bg-green px-5 py-1.5 rounded-lg">
            Approve
          </button>
          <button className="text-white bg-red px-5 py-1.5 rounded-lg">
            Cancel
          </button>
        </div>
      </div>

      {/* Desktop View - Hidden on Mobile */}
      <div
        className="hidden md:flex bg-white py-2.5 font-semibold px-5 rounded-xl 
        justify-between items-center"
      >
        <div className="w-24 h-24">
          <Image
            src="/Images/Product_Img.png"
            alt="Product_Image"
            width={100}
            height={100}
            className="object-cover rounded-full w-full h-full"
          />
        </div>
        <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
          <Image src="/Images/Tag.svg" alt="Tag_Icon" width={35} height={35} />
          <div className="flex flex-col">
            <p className="font-semibold">Unused metal scrap</p>
            <p className="text-gray-400 text-sm">500g</p>
          </div>
        </div>
        <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
          <Image
            src="/Images/Calendar.svg"
            alt="Calendar_Icon"
            width={35}
            height={35}
          />
          <p className="font-semibold">4th May 2025</p>
        </div>
        <div className="flex flex-col border-l-[3px] border-gray-300 pl-5">
          <p className="text-gray-400 text-sm text-center">buyer</p>
          <p className="font-semibold">Company Name</p>
        </div>
        <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
          <p className="font-semibold">$ 5000</p>
        </div>
        <div className="text-center space-x-7">
          <button className="text-white bg-green px-5 py-1.5 rounded-lg">
            Approve
          </button>
          <button className="text-white bg-red px-5 py-1.5 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
      <Link href="/new-listing">
        <div className="bg-white px-10 py-3 rounded-lg mt-7 w-fit mx-auto">
          + Create new listings
        </div>
      </Link>
    </div>
  );
};

export default OrderListing;
