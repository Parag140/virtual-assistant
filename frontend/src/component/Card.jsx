import React, { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

const Card = ({ image }) => {
      const {serverUrl,frontEndImage, setFrontEndImage,backEndImage, setBackEndImage,selectedImage,setSelectedImage} = useContext(UserDataContext)
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#00005a] border-2 border-[#0000ff38] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white ${selectedImage==image ? "border-4 border-white hover:shadow-2xl hover:shadow-blue-950":null}`} onClick = {()=>{
            setSelectedImage(image)
            setBackEndImage(null);
            setFrontEndImage(null);
    }}>
      <img src={image} className="h-full object-cover" />
    </div>
  );
};

export default Card;
