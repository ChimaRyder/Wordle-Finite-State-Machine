import {useEffect, useRef, useState} from 'react'
import './App.css'
import {generate} from "random-words";
import {useWordChecker} from "react-word-checker";

function App() {
  const [state, setState] = useState("Start");
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [guess, setGuess] = useState([])
  const [guessesCount, setGuessesCount] = useState(5);
  const {wordExists} = useWordChecker("en")
  const focusRef = useRef(null);

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus()
    }
  })

  const handleBG = (guess, letter, index) => {
    if (word[index] === letter) {
      return "bg-green-600"
    } else if (word.includes(letter)) {
      if (guess.match(new RegExp(letter, "g")).length > 1) {
        const x = [...guess].map((l, index) => l === letter ? index : -1).filter(index => index !== -1)
        const y = [...word].map((l, index) => l === letter ? index : -1).filter(index => index !== -1)
        const new_x = x.filter(l => !y.includes(l))
        if (!new_x.slice(0, y.length).includes(index) || x.length !== new_x.length) {
          return "bg-red-600"
        }
      }
      return "bg-yellow-500"
    } else {
      return "bg-red-600"
    }
  }

  const handleInput = (event) => {

    if ((event.keyCode > 64 && event.keyCode < 91) || (event.keyCode > 96 && event.keyCode < 123)) {
      setGuess([...guess, event.key.toLowerCase()])
    }

    handleState(state)
  }

  const handleClearEnter = (event) => {
    if (event.key === "Backspace") {
      const new_guess = guess.slice(0, -1);
      setGuess(new_guess)
    } else if (event.key === "Enter") {
      if (guess.length !== 5) {
        return;
      }
      setState("EvaluateWord")
      handleState(state)
    }
  }

  const handleState = (s) => {
    switch (s) {
      case "Start":
        setState("AwaitLetter")
        break;
      case "AwaitLetter":
        if (guess.length === 5) {
          setState("EvaluateWord")
        }
        break;
      case "EvaluateWord":
        if(wordExists(guess.join('')) && guess.length === 5) {
          setGuesses([...guesses, guess.join('')])
          setGuess([])

          if (guess.join('') === word) {
            setState("GameWon")
            break;
          } else {
            setState("IncorrectWord")
            break;
          }
        } else {
          setState("AwaitLetter")
          break;
        }
      case "IncorrectWord":
        if (guessesCount > 0) {
          setGuessesCount(guessesCount-1)
          setState("AwaitLetter")
        } else {
          setState("GameOver")
        }

    }
  }

  const handleRestart = () => {
    setState("Start")
    setGuesses([])
    setGuess([])
    setGuessesCount(5)
  }

  useEffect(() => {
    if (guess.length === 5) {
      handleState(state)
    }
  }, [guess]);

  useEffect(() => {
    if (state === "IncorrectWord" && guessesCount === 0) {
      handleState(state)
    }
  }, [state]);

  return (
    <>
    {state === "Start" && (
        <div>
            <h1>Wordle</h1>
            <button onClick={() => {
                    setWord(generate({minLength: 5, maxLength: 5}));
                    handleState(state)
                }
            }>Start</button>
        </div>
      )
    }

    {state !== "Start" && state !== "GameWon" && state !== "GameOver" && (
        <>
        <div className="grid grid-cols-5 gap-3">
          {guesses.map((guess) => (
              <>
                  {guess.split('').map((letter, index) => (
                      <div key={index} className={"h-20 text-7xl px-3 border-2 rounded-md " + handleBG(guess, letter, index)}>{letter.toUpperCase()}</div>
                  ))}
              </>
          ))}

          {Array(6 - guesses.length).fill().map((_, index) => (
              <>
                  {index === 0 && (
                    <>
                        {guess.map((letter, index) => (
                            <>
                              {index !== 4 && <div key={index} className="h-20 text-7xl px-3 border-2 rounded-md">{letter.toUpperCase()}</div>}
                              {index === 4 && <div key={index} className="h-20 text-7xl px-3 border-2 rounded-md" onKeyUp={handleClearEnter} tabIndex={0} ref={focusRef}>{letter.toUpperCase()}</div>}
                            </>
                        ))}

                        {Array(5-guess.length).fill().map((_, index) => (
                          <>
                          {index === 0 && (
                              <div key={index} className="h-20 px-3 border-2 rounded-md" onKeyUp={(e) => {
                                handleInput(e);
                                handleClearEnter(e)
                              }} tabIndex="0" ref={focusRef}></div>
                          )}
                            {index !== 0 && (<div key={index} className="h-20 px-3 border-2 rounded-md"></div>)}
                          </>
                        ))}
                    </>
                  )}

                  {index !== 0 && Array(5).fill().map((index) => (
                      <div key={index} className="h-20 w-24 px-3 border-2 rounded-md"></div>
                  ))}
              </>
          ))}
        </div>
        </>
    )}

      {state === "GameWon" && (
          <div>
            <h1>You Won!</h1>
            <button onClick={handleRestart}>Try Again?</button>
          </div>
      )}

      {state === "GameOver" && (
          <div>
            <h1>Game Over</h1>
            <h3>The word was: {word}</h3>
            <button onClick={handleRestart}>Try Again?</button>
          </div>
      )}

    </>
  )
}

export default App
