import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons"; // Filled star
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Definition {
  definition: string;
  example: string;
}

interface Meaning {
  definitions: Definition[];
}

function Form() {
  const [text, setText] = useState<string>("");
  const [definitions, setDefinitions] = useState<Definition[] | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Check if the current item is already a favorite on component mount
  useEffect(() => {
    const favArray: string[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    setFavorites(favArray);
  }, []);

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const searchHandler = async (word: string) => {
    if (word && word !== " ") {
      // Reset state before new search
      setDefinitions(null);
      setMessage(null);
      setAudioUrl(null);

      try {
        const resp = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        console.log(resp.data);
        // Handle HTTP errors
        if (resp.status === 200) {
          const jsonResponse = await resp.data;

          // Extract audio
          const firstAudioUrl = jsonResponse[0].phonetics[1]?.audio;
          //Extract first 5 defintion
          const allDefinitions = jsonResponse[0].meanings
            .flatMap((meaning: Meaning) => meaning.definitions)
            .slice(0, 5);
          setDefinitions(allDefinitions);
          setAudioUrl(firstAudioUrl);

          // Check if the word is already saved in session storage as favorite word
          const favArray: string[] = JSON.parse(
            sessionStorage.getItem("favorites") || "[]"
          );
          setIsFavorite(favArray.includes(word));
        } else {
          setMessage("No Definitions Found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Definition not found");
      }
    } else {
      setMessage("Enter a word to search"); // if user search without entering
    }
  };

  const handleFavorite = () => {
    const updateFav = !isFavorite;
    setIsFavorite(updateFav);

    let favoriteWords: string[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );

    if (updateFav) {
      // Updated favorites by pushing the word if not already present
      if (!favoriteWords.includes(text)) {
        favoriteWords.push(text);
      }
    } else {
      // Updated favorites by removing it from if already present
      favoriteWords = favoriteWords.filter((item) => item !== text);
    }

    // Save the updated favorites in session storage
    sessionStorage.setItem("favorites", JSON.stringify(favoriteWords));
    setFavorites(favoriteWords);
  };

  function handleFavoriteClick(fav: string) {
    setText(fav);
    searchHandler(fav);
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-center">
        <input
          type="text"
          className="text-teal-600 border border-teal-700 p-2"
          onChange={inputHandler}
          value={text}
        />
        <button
          className="ml-3 p-2 text-white font-bold bg-teal-600"
          onClick={() => searchHandler(text)}
        >
          Search
        </button>
      </div>
      <div className="flex flex-col md:items-start gap-8">
        {/*Definitions and Pronunciation section*/}
        <div className="pt-4 text-teal-600 flex-1">
          {/* Display text audio */}
          {audioUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Pronunciation:</h3>
              <audio data-testid="audio" controls>
                <source src={audioUrl} type="audio/mp3" />
              </audio>
            </div>
          )}

          {/* Display definitions and examples */}
          {definitions ? (
            <div>
              <div className="mt-4">
                <FontAwesomeIcon
                  data-testid="favorite"
                  icon={faStar}
                  className={`${
                    isFavorite ? "text-teal-600" : "text-gray-300"
                  }`}
                  size="2x"
                  onClick={handleFavorite}
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Definitions:</h3>
                <ul>
                  {definitions.map((def, index) => (
                    <li key={index} className="mb-2">
                      <p>
                        {index + 1}: {def.definition}
                      </p>
                      {def.example && (
                        <p>
                          <span className="font-bold">Example. </span>{" "}
                          {def.example}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {/* Display error msg */}
              <p className="text-red-500">{message}</p>
            </div>
          )}
        </div>

        {/* Favorite word list section */}
        <div className="mt-20 md:mt-0 text-teal-600 flex-1">
          <h2 className="text-lg font-bold mt-9">
            Here Is Your Saved Favorite Words:
          </h2>
          <ul>
            {favorites.map((fav, index) => (
              <li key={index} className="mb-1">
                <button onClick={() => handleFavoriteClick(fav)}>
                  {fav.charAt(0).toUpperCase() + fav.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Form;
