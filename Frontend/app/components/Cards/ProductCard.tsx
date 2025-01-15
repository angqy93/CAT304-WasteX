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
    <div>
      <div className="w-full">
        <Image
          src={product.image}
          alt={product.title}
          width={100}
          height={280}
          className="w-full h-[180px] object-cover rounded-lg"
        />
      </div>
      <h3 className="font-bold text-lg mt-2">{product.title}</h3>
      <p className="my-1 capitalize opacity-80"><b>Type: </b>{product.category}</p>
        <p className="my-1 capitalize opacity-80"><b>Unit: </b>{product.quantity} {product.unit}</p>
      <p className="text-ellipsis overflow-hidden text-sm line-clamp-2 opacity-80">
        {/*product.quantity} {product.unit*/}
      </p>
      <p>
        <b>Fees: </b>${product.price}
      </p>
    </div>
  );
};

export default ProductCard;