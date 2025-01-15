import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[83vh] flex flex-col justify-center items-center">
      <div>
        <h1 className="md:text-5xl text-4xl font-bold text-center w-10/12 md:w-full mx-auto">
          Trade your waste online with
          <br />
          <span className="text-green">WasteX!</span>
        </h1>
        <p className="md:text-lg md:w-1/2 w-10/12 mx-auto text-center my-7 text-gray-600">
          Turn your waste into value with WasteX! Sell your waste effortlessly
          online and support a sustainable future. Join the eco-friendly
          revolution today!
        </p>
        <Link href="/products" className="flex justify-center">
          <button className="px-16 py-3 rounded-full border border-black">
            Marketplace
          </button>
        </Link>
      </div>
    </div>
  );
}
