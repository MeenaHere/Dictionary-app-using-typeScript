'use client';

import React, { useState } from 'react';

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
        const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        const jsonResponse = await resp.json();

        // Extract audio 
        const firstAudioUrl = jsonResponse[0].phonetics[1]?.audio ;
        //Extract first 5 defintion
        const allDefinitions = jsonResponse[0].meanings.flatMap((meaning: Meaning) => meaning.definitions).slice(0, 5);
          setDefinitions(allDefinitions);
          setAudioUrl(firstAudioUrl);
        } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Definition not found');  //error message if there is no definition found
      }
    } else {
      setMessage("Enter a word to search") // if user search without entering
    }
  };

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
            <audio controls>
              <source src={audioUrl} type='audio/mp3' />
            </audio>
          </div>
        )}
        {/* Display definitions and exampl */}
        {definitions ? (
          <div>
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
