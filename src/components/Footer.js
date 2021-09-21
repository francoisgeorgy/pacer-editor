import React from 'react';
import "./Footer.css";

const Footer = () => {
    return (
        <div className="footer">
            <div>
               This web site is not endorsed by, directly affiliated with, maintained, or sponsored by Nektar Technology.
            </div>
            <div>
                Version {process.env.REACT_APP_VERSION}
            </div>
        </div>
    );
};

export default Footer;
