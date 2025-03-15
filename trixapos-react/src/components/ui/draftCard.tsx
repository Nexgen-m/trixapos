import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { CartItem } from "@/types/pos";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Button } from "./button";

interface ExtendedCartItem extends CartItem {
  discount?: number; // Percentage-based discount
}

type draftCardProps = {
    date: Date;
    name: string;
    cart: ExtendedCartItem[];
    total: number;
    deleteDraft: (name: string) => void;
}


const DraftCard:React.FC<draftCardProps> = ({date, name, cart, total, deleteDraft}) => {


    const navigate = useNavigate();

    const handleClick = () => {
        usePOSStore.getState().restoreDraftOrder(name);
        navigate('/');
    }

    

    return(
        <div
            className="relative w-[350px] h-[250px] p-5 pt-10 m-5 bg-white border 
                       border-gray-300 rounded-2xl border-[2.3px] 
                       hover:drop-shadow-md transition-all hover:border-blue-400"
        >
            {/* X (Close) Button - Independent of Flexbox */}
            <button
                onClick={() => deleteDraft(name)}
                className="absolute top-2 right-2 border-[1.5px] hover:border-red-500 
                           border border-red-200 rounded-sm p-1"
            >
                <X size={32} color="red" />
            </button>

            {/* Clickable Area for Order Restore */}
            <button onClick={handleClick} className="w-full h-full flex flex-col justify-center items-center">
                <div>
                <span className="text-lg">
                    {date.toString()}
                </span>
                    <br className="my-2"/>
                    <p className="text-gray-500">
                        {"$" + total.toString()}
                    </p>
                    <br/>

                    {/* Product Images Row */}
                    <div className="m-1 p-1 flex flex-row justify-center gap-2 mt-5">
                        {cart.slice(0,3).map((product, index) => (
                            <img
                                key={index}
                                className="w-12 h-12 m-1 p-1 rounded-sm"
                                src={product.image}
                            />
                        ))}
                    </div>
                </div>
            </button>
        </div>
    )
}

export {DraftCard};