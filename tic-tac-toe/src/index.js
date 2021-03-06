import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let value = props.value
  if (props.bold) {
    value = <font color="red">{props.value}</font>
  }
  return (
    <button className="square" onClick={props.onClick}>
      {value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let bold = false;
    if (this.props.hasOwnProperty('winningLine') && this.props.winningLine.includes(i)) {
      bold = true;
    }
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        bold={bold}
      />
    );
  }

  render() {
    let sqs;
    let rows = [];
    for (let i = 0; i < 3; i++) {
      sqs = [];
      for (let j = 0; j < 3; j++) {
        sqs.push(this.renderSquare(j + i*3));
      }
      rows.push(
      <div className="board-row">
        {sqs[0]}
        {sqs[1]}
        {sqs[2]}
      </div>
      )
    }
    return (
      <div>
        {rows[0]}
        {rows[1]}
        {rows[2]}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      descending: true
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moveOrderingButton = <button onClick={() => { this.setState({ descending: !this.state.descending }); }
      }>{'reverse move order'}</button>

    let moves = history.map((step, move) => {
      let mvIndex = -1;
      step.squares.find((sq) => {
        mvIndex++;
        if (move === 0) { return sq != null; }
        return sq !== history[move-1].squares[mvIndex];
      });
      let desc;
      if (move === this.state.stepNumber) {
        desc = move ?
          <b>{'Go to move #' + move + ' (' + (mvIndex % 3 + 1) + ', ' + (~~(mvIndex / 3) + 1) + ')'}</b>:
          <b>{'Go to game start'}</b>; 
      }
      else {
        desc = move ?
          'Go to move #' + move + ' (' + (mvIndex % 3 + 1) + ', ' + (~~(mvIndex / 3) + 1) + ')':
          'Go to game start';
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.descending) {
      moves = moves.reverse();
    }

    
    let board;
    let status;
    if (winner) {
      status = 'Winner: ' + winner.winningSide;
      board = <Board
        squares={current.squares}
        onClick={(i) => this.handleClick(i)}
        winningLine = {winner.winningLine}
      />
    } else {
      if (history.length === 10 && this.state.stepNumber === 9) {
        status = 'CATS game!';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      board = <Board
        squares={current.squares}
        onClick={(i) => this.handleClick(i)}
      />
    }
    return (
      <div className="game">
        <div className="game-board">
          {board}
        </div>
        <div className="game-info">
          <div>{status}</div>
          {moves}
          <div>{moveOrderingButton}</div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winningSide: squares[a],
        winningLine: lines[i]
      }
    }
  }
  return null;
}