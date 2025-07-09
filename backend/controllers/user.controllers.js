import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from 'moment'

export const getCurrentUser = async(req,res)=>{
    try{
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(400).json({message:"user not found"});
        }
        return res.status(200).json(user)
    }
    catch(err){
        return res.status(400).json({message:"Error fetching user"});
        }
}
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;
    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user)
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error updating assistant" });
  }
};

export const askToAssistant = async (req, res) => {
    try {
        const {command} = req.body;
        const user = await User.findById(req.userId);
        user.history.push(command)
        user.save()
        const userName = user.name;
        const assistantImage = user.assistantImage;
        const assistantName = user.assistantName;

        const result = await geminiResponse(command, assistantName,userName );

        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(400).json({ response: "Sorry, I can't understand." });
        }

        const gemResult = JSON.parse(jsonMatch[0]);
        console.log(gemResult)
        const type = gemResult.type;

        switch (type) {
    case 'get-date':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: `current date is ${moment().format("YYYY-MM-DD")}`
        });

    case 'get-time':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: `current time is ${moment().format("hh:mm:ss A")}`
        });

    case 'get-day':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: `today is ${moment().format("dddd")}`
        });

    case 'get-month':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: `current month is ${moment().format("MMMM")}`
        });
    case 'greeting':
  return res.json({
    type,
    userInput: gemResult.userInput,
    response: gemResult.response
  });
    case 'google-search':
    case 'youtube-play':
    case 'youtube-search':
    case 'general':
    case 'calculator-open':
    case 'instagram-open':
    case 'facebook-open':
    case 'weather-show':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: gemResult.response // Placeholder
        });

    case 'author':
        return res.json({
            type,
            userInput: gemResult.userInput,
            response: gemResult.author || "Unknown author"
        });

    default:
        return res.status(400).json({
           response:"i didn't understand that command"
        });
}

    } catch (err) {
        console.error("Error in askToAssistant:", err);
        return res.status(500).json({ response: "Internal server error." });
    }
};
