import Image from "next/image";

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

const ProductCard = ({ product }: any) => {
  return (
    <div className="rounded-lg border shadow-lg">
      <div className="w-full">
        <Image
          src={product.image}
          alt={product.title}
          width={100}
          height={280}
          className="w-full h-[180px] object-contain bg-gray-100 "
        />
      </div>
      <div className="p-3">
        <h3 className="font-bold text-lg text-center">{product.title}</h3>
        <hr className="my-2"/>
        <div className="px-3 py-2">
          <p className="mb-2 w-full capitalize flex flex-wrap"><div className="md:w-1/4 sm:w-full"><b>Type: </b></div><div className="text-gray-500 w-3/4"> {product.category}</div></p>
          <p className="mb-2 w-full capitalize flex flex-wrap"><div className="md:w-1/4 sm:w-full"><b>Unit: </b></div><div className="text-gray-500 w-3/4"> {product.quantity} {product.unit}</div></p>
          <p className="mb-2 w-full capitalize flex flex-wrap"><div className="md:w-1/4 sm:w-full"><b>Fees: </b></div><div className="text-gray-500 w-3/4"> {product.price} </div></p>
        </div>
      </div>
    
    </div>
  );
};

export default ProductCard;