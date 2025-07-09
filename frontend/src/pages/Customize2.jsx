import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { IoArrowBackSharp } from "react-icons/io5";

const Customize2 = () => {
  const { userData, backEndImage, selectedImage, serverUrl, setUserData } = useContext(UserDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backEndImage) {
        formData.append("assistantImage", backEndImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }
      const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
      console.log(result.data)
      setUserData(result.data);
      setLoading(false);
      navigate("/"); // Go to home after success
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#0b0b62] flex justify-center items-center flex-col p-[20px] relative">
      <IoArrowBackSharp className='absolute top-[30px] text-white left-[30px] w-[25px] cursor-pointer' onClick={() => navigate('/customize')} />
      <h1 className='text-white mb-[40px] text-[30px] text-center'>
        Enter your <span className='text-blue-700'>Assistant name</span>
      </h1>
      <input
        type="text"
        placeholder="eg. shifra"
        className="text-white w-full max-w-[600px] h-[60px] outline-none border-2 border-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        onChange={(e) => setAssistantName(e.target.value)}
        required
        value={assistantName}
      />
      {assistantName && (
        <button
  className="min-w-[300px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] cursor-pointer"
  disabled={loading}
  onClick={handleUpdateAssistant}
>
  {!loading ? "Finally create your Assistant" : "loading.."}
</button>

      )}
    </div>
  );
};

export default Customize2;
