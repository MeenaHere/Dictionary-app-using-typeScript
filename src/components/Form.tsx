'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';  // Filled star
import React, { useState } from 'react';
import axios from 'axios'

interface Definition {
  definition: string;
  example: string;
}

interface Meaning {
  definitions: Definition[];
}

function Form() {
  const [text, setText] = useState<string>('');
  const [definitions, setDefinitions] = useState<Definition[] | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean > (false)

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const searchHandler = async () => {
    if (text && text !== " ") {
      // Reset state before new search
      setDefinitions(null);
      setMessage(null);
      setAudioUrl(null);

      try {
        const resp = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        console.log(resp.data)
        // Handle HTTP errors
        if (resp.status === 200) {
          const jsonResponse = await resp.data;

          // Extract audio 
          const firstAudioUrl = jsonResponse[0].phonetics[1]?.audio ;
          //Extract first 5 defintion
          const allDefinitions = jsonResponse[0].meanings.flatMap((meaning: Meaning) => meaning.definitions).slice(0, 5);
          setDefinitions(allDefinitions);
          setAudioUrl(firstAudioUrl);
          
           // Check if the word is already saved in session as favorite
          const isFav = sessionStorage.getItem(text) === 'true';  
          setIsFavorite(isFav);  
        }
        else {
          setMessage('No Definitions Found');
        }      

        } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Definition not found'); 
      }
    } else {
      setMessage("Enter a word to search") // if user search without entering
    }
  };
    
  const handleFavorite = () => {
    const updateFav = !isFavorite
    setIsFavorite(updateFav);

    if (updateFav) {
      sessionStorage.setItem(text, 'true');  // Save as favorite
    } else {
      sessionStorage.removeItem(text);  // Remove from favorites
    }
  }

  return (
    <div className='flex flex-col p-4'>
      <div className='flex justify-center'>
        <input
          type='text'
          className='text-teal-600 border border-teal-700 p-2'
          onChange={inputHandler}
          value={text}
        />
        <button className='ml-3 p-2 text-white font-bold bg-teal-600' onClick={searchHandler}>
          Search
        </button>
      </div>
      <div className='pt-4 text-teal-600'>
        {/* Display text audio */}
        {audioUrl && (
          <div className='mt-4'>
            <h3 className='text-lg font-bold'>Pronunciation:</h3>
            <audio data-testid="audio" controls>
              <source src={audioUrl} type='audio/mp3' />
            </audio>
          </div>
        )}
        {/* Display definitions and exampl */}
        {definitions ? (
          <div>            
            <div>
              <FontAwesomeIcon data-testid='favorite'
                icon={faStar }
                className={`${isFavorite ? 'text-teal-600' : 'text-gray-300'}`}
                size="2x" onClick={handleFavorite}
              />
            </div>
            <div className='mt-4'>
              <h3 className='text-lg font-bold'>Definitions:</h3>
              <ul>
                {definitions.map((def, index) => (
                  <li key={index} className='mb-2'>
                    <p>{index+1}: {def.definition}</p>
                    {def.example && (
                      <p><span className='font-bold'>Example.  </span> {def.example}</p>
                    )}
                  </li>
                ))}
              </ul>              
            </div>
          </div>
        ) : (
          <div className='mt-4'>
            {/* Display error msg  */}
            <p className='text-red-500'>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Form;
