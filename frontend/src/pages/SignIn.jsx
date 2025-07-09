import React, { useContext, useState } from "react";
import bg from "../assets/authBg.png";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import axios from "axios";

const SignIn = () => {
  const navigate = useNavigate();
  const { serverUrl ,userData, setUserData} = useContext(UserDataContext);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [loading,setLoading] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      console.log("User signed in successfully:", result.data);
      alert("Signin successful!");
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setUserData(null)
      setLoading(false);
      setErr(error.response?.data?.message || "Unknown error");
      alert("Error: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
    
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] h-[600px] max-w-[500px] bg-[#00000016] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignIn} 
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In to<span className="text-blue-400 "> Virtual assistant </span>
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="text-white w-full h-[60px] outline-none border-2 border-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="text-white w-full h-full rounded-full outline-none bg-transparent placeholder-gray-400 px-[20px] py-[10px]"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword && (
            <IoMdEye
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <IoMdEyeOff
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>
        {err.length > 0 && (
          <p className="text-red-500 text-[17px]">{err}</p>
        )}
        <button
          type="submit"
          className="min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] cursor-pointer"
         disabled = {loading}
         >
          {loading ? "Loading....":"Sign In"}
        </button>

        <p
          className="text-white text-[18px] cursor-pointer"
          onClick={() => navigate("/signup")} 
        >
          Want to Create an Account?{" "}
          <span className="text-blue-600">Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
