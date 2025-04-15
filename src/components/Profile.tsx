import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Github } from "lucide-react";
import "./Profile.css";
import "./ProfileStyles.css";

const Profile = () => {
  
  const [isHovered, setIsHovered] = useState(false);

  

  return (
    <div className="relative flex flex-col items-center mt-24">
      
      {/* Avatar with Scale Effect on Hover */}
      
      
      <div className="image-container">
  <img 
    src="https://avatars.githubusercontent.com/u/152056082?v=4" 
    alt="Sanket3yoProgrammer" 
    className="custom-image"
  />
</div>



          

          

      {/* Animated Text with Fade In */}
{/*     <h2 className=" font-bold text-gray-800 dark:text-gray-200 tracking-wide fade-in" style={{ fontFamily: 'Qwitcher Grypen', fontWeight: 800, fontSize: '60px'  }}>
        Sanket3yoProgrammer
      </h2> */}
        <h2
          className="font-bold text-gray-800 dark:text-gray-200 tracking-wide fade-in text-[40px] sm:text-[50px] md:text-[60px]"
          style={{ fontFamily: 'Qwitcher Grypen', fontWeight: 800 }}
        >
          SanketyoProgrammer
        </h2>


      <img className="mx-auto mt-2" src="https://i.ibb.co/pBBVGgRR/pixelcut-export-2.png" alt="divider" />

    </div>
  );
};

export default Profile;
