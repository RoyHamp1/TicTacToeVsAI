import { useState } from "react";
import { FaTimes, FaRegCircle } from "react-icons/fa";
import "./tictactoe.css";

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board){
  for(let pattern of WIN_PATTERNS){
    const [a,b,c] = pattern;
    if(board[a] && board[a]===board[b] && board[a]===board[c]){
      return board[a];
    }
  }
  return null;
}

// AI moves based on difficulty
function aiMove(board, difficulty){
  const empty = board
    .map((val,i)=> val===null ? i : null)
    .filter(v=>v!==null);

  if(difficulty === "Easy"){
    return empty[Math.floor(Math.random()*empty.length)];
  }

  // Medium: block wins, take center/corners
  if(difficulty === "Medium"){
    // win if possible
    for(let i of empty){
      const copy = [...board]; copy[i]="O";
      if(checkWinner(copy)==="O") return i;
    }
    // block player
    for(let i of empty){
      const copy = [...board]; copy[i]="X";
      if(checkWinner(copy)==="X") return i;
    }
    if(empty.includes(4)) return 4;
    const corners = [0,2,6,8].filter(i=>empty.includes(i));
    if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
    return empty[Math.floor(Math.random()*empty.length)];
  }

  // Hard: minimax
  if(difficulty === "Hard"){
    return minimax(board, "O").index;
  }
}

// Minimax algorithm
function minimax(newBoard, player){
  const avail = newBoard.map((v,i)=>v===null?i:null).filter(v=>v!==null);

  const huPlayer = "X";
  const aiPlayer = "O";

  const winner = checkWinner(newBoard);
  if(winner === huPlayer) return {score:-10};
  if(winner === aiPlayer) return {score:10};
  if(avail.length === 0) return {score:0};

  const moves = [];

  for(let i of avail){
    const move = {};
    move.index = i;
    newBoard[i] = player;

    if(player===aiPlayer){
      move.score = minimax(newBoard, huPlayer).score;
    } else {
      move.score = minimax(newBoard, aiPlayer).score;
    }

    newBoard[i] = null;
    moves.push(move);
  }

  let bestMove;
  if(player===aiPlayer){
    let bestScore=-Infinity;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score>bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore=Infinity;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score<bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

export default function TicTacToeAI(){

  const [board,setBoard] = useState(Array(9).fill(null));
  const [xMoves,setXMoves] = useState([]);
  const [oMoves,setOMoves] = useState([]);
  const [winner,setWinner] = useState(null);

  const [playerScore,setPlayerScore] = useState(0);
  const [aiScore,setAiScore] = useState(0);

  const [difficulty,setDifficulty] = useState("Easy");

  function playerMove(i){
    if(board[i] || winner) return;

    const newBoard = [...board];
    const newX = [...xMoves];

    newBoard[i]="X";
    newX.push(i);
    if(newX.length>3){
      const removeIndex = newX.shift();
      newBoard[removeIndex]=null;
    }

    setBoard(newBoard);
    setXMoves(newX);

    const win = checkWinner(newBoard);
    if(win){
      setWinner(win);
      if(win==="X") setPlayerScore(playerScore+1);
      else setAiScore(aiScore+1);
      return;
    }

    setTimeout(()=> aiTurn(newBoard,newX),300);
  }

  function aiTurn(currentBoard,currentX){
    const newBoard = [...currentBoard];
    const newO = [...oMoves];

    const move = aiMove(newBoard,difficulty);

    newBoard[move]="O";
    newO.push(move);

    if(newO.length>3){
      const removeIndex = newO.shift();
      newBoard[removeIndex]=null;
    }

    setBoard(newBoard);
    setOMoves(newO);

    const win = checkWinner(newBoard);
    if(win){
      setWinner(win);
      if(win==="X") setPlayerScore(playerScore+1);
      else setAiScore(aiScore+1);
    }
  }

  function squareClass(i){
    let fade = false;
    if(xMoves.length===3 && xMoves[0]===i) fade=true;
    if(oMoves.length===3 && oMoves[0]===i) fade=true;
    return fade ? "square fade" : "square";
  }

  function renderIcon(val){
    if(val==="X") return <FaTimes className="icon x"/>;
    if(val==="O") return <FaRegCircle className="icon o"/>;
    return null;
  }

  function reset(){
    setBoard(Array(9).fill(null));
    setXMoves([]);
    setOMoves([]);
    setWinner(null);
  }

  return(
    <div className="container">

      <h1 className="title">Tic Tac Toe VS. AI</h1>
        <p className="subtitle">By: Roydon Hampton</p>
      <p className="subtitle">Only 3 pieces allowed • Oldest fades away</p>

      <div className="scoreboard">
        <div>Player: {playerScore}</div>
        <div>AI: {aiScore}</div>
      </div>

      <div className="difficulty">
        Difficulty: {" "}
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {winner && <h2 className="winner">{winner} Wins!</h2>}

      <div className="board">
        {board.map((val,i)=>(
          <div key={i} className={squareClass(i)} onClick={()=>playerMove(i)}>
            {renderIcon(val)}
          </div>
        ))}
      </div>

      <button className="reset" onClick={reset}>New Game</button>

    </div>
  );
}