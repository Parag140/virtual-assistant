import React, { useState, useRef, useContext } from "react";
import { TbUpload } from "react-icons/tb";
import Card from "../component/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";

const Customize = () => {
  const {
    serverUrl,
    frontEndImage,
    setFrontEndImage,
    backEndImage,
    setBackEndImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();
  const [oldUrl, setOldUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBackEndImage(file);

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const newUrl = URL.createObjectURL(file);
    setFrontEndImage(newUrl);
    setOldUrl(newUrl);
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#0b0b62] flex justify-center items-center flex-col p-[20px]">
      <IoArrowBackSharp
        className='absolute top-[30px] text-white left-[30px] w-[25px] cursor-pointer'
        onClick={() => navigate('/')}
      />
      <h1 className="text-white text-[30px] text-center mb-[30px]">
        Select your <span className="text-blue-400">Virtual Assistant Image</span>
      </h1>
      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#00005a] border-2 border-[#0000ff38] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${
            selectedImage === "input"
              ? "border-4 border-white hover:shadow-2xl hover:shadow-blue-950"
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontEndImage && (
            <TbUpload className="text-white w-[50px] h-[50px]" />
          )}
          {frontEndImage && (
            <img src={frontEndImage} className="h-full object-cover" alt="preview" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImageChange}
        />
      </div>
      {selectedImage && (
        <button
          className="min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] cursor-pointer"
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Customize;
