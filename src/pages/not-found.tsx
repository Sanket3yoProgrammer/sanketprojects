import React from 'react';
import './not-found.css'; // Ensure your styles are applied
import "../styles.css";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="terminal">
      <div className="status-indicators">
        <div className="circle red"></div>
        <div className="circle yellow"></div>
        <div className="circle green"></div>
      </div>

     

      <h1 className="errorcode -mt-6">404 - Page Not Found</h1>
      <p className="message mt-2">The page you are looking for does not exist.</p>
      <a className='shiny-cta -mt-0 group' href="/"><p className="flex gap-2">Return to home <Home className="size-5 transition-transform duration-300 group-hover:translate-x-3" /></p></a>
       <div className="divider"></div>
    </div>
  );
};

export default NotFound; 