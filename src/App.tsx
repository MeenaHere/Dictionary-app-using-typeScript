//import logoImage from './logo.png';
import Form from './components/Form';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function App() {
  // Setting darkMode based on localStorage if not saved in local storage set it to false
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem('darkMode');
    return storedTheme ? storedTheme === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode)); //Saving darkmode to local storage
  }, [darkMode]); // This will run whenever darkMode changes

  const handleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      data-testid="main-div"
      className={`flex min-h-screen flex-col pt-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <header className="flex w-full justify-between items-center px-4">
        <div className="flex-1 text-center">
          <h1 className="protest-guerrilla-regular text-teal-600 text-xl">
            📚 <span className="underline">Dictionary</span>
          </h1>
        </div>
        <div
          className="text-xl cursor-pointer"
          data-testid={"toggle-theme"}
          onClick={handleTheme}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </div>
      </header>
      <div className="pt-8">
        <Form />
      </div>
    </div>
  );
}

export default App;
