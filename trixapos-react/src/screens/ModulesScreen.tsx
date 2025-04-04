import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const apps = [
    {
      id: 'trixapos',
      name: 'Trixapos',
      image: 'src/assets/trixapos-screenshot.png', 
      link: '/trixapos/',
    },
    {
      id: 'kiosk',
      name: 'Trixapos Kiosk Menu',
      image: 'src/assets/verticalscreen-screenshot.png', 
      link: '/Modules/',
    },
  ];

  return (
    <div className="relative min-h-screen bg-blue-50">
      {/* Blurred Background */}
      {selectedApp && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(105, 170, 255, 0.4), rgba(105, 170, 255, 0.4), rgba(105, 170, 255, 0.4),rgba(255, 255, 255, 0.8)), url(${apps.find(app => app.id === selectedApp)?.image})`,
            filter: 'blur(10px)',
            opacity: 0.5,
          }}
        ></div>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center min-h-screen z-10">
        {/* Logo */}
        <div className="">
          <img
            src="src/assets/TRIXAPOS-LOGO.png"
            alt="Logo"
            className="w-52 h-52"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-blue-700 mb-8">Select an Application</h1>

        {/* Application Options */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {apps.map(app => (
            <div
              key={app.id}
              className={`relative flex flex-col items-center justify-start w-64 h-80 bg-white rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 ${
                selectedApp === app.id ? 'border-2 border-blue-500 rounded-xl scale-105' : ''
              }`}
              onClick={() => {(!selectedApp || (selectedApp !== app.id)) ? setSelectedApp(app.id) : setSelectedApp(null);}}
            >
              <img
                src={app.image}
                alt={app.name}
                className="w-full object-cover rounded-t-lg h-52$s4XHS!tjS/8"
              />
              <div className="flex flex-col items-center justify-center flex-grow p-4 h-52">
                <span className="text-xl font-medium text-blue-700 mb-4">{app.name}</span>
                {selectedApp === app.id && (
                  <button
                    className="px-8 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                    onClick={() => navigate(app.link)}
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center text-blue-600">
        <p>Developed by Trixapos</p>
      </footer>
    </div>
  );
};

export default ModulesScreen;