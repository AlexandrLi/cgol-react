import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';

import * as styles from './App.module.css';

import Cell from './Cell/Cell';
import scenes from './scenes';

export const STATE = {DEAD: 0, ALIVE: 1};

class App extends Component {
    state = {
        isStarted: false,
        grid: Array.from({length: 16}, () => Array.from({length: 25}, () => 0)),
        speed: 1000,
    };
    onCellClickHandler = (x, y) => () => {
        if (this.state.isStarted) {
            return;
        }
        this.setState(prevState => {
            const {grid} = prevState;
            grid[y][x] = grid[y][x] === 0 ? 1 : 0;
            return {grid};
        });
    };

    tick = () => {
        this.setState(prevState => {
            const {grid} = prevState;
            const nextGridState = grid.map((row, rowIdx, grid) =>
                row.map((cell, cellIdx) => this.mutateCell(grid, rowIdx, cell, cellIdx))
            );
            return {grid: nextGridState};
        });
    };

    mutateCell(grid, rowIdx, cell, cellIdx) {
        const neighbors = this.getNeighbors(grid, rowIdx, cellIdx);
        const aliveNeighborsCount = this.getAliveNeighborsCount(neighbors) - cell;
        if (cell === STATE.DEAD) {
            return aliveNeighborsCount === 3 ? STATE.ALIVE : STATE.DEAD;
        } else {
            return aliveNeighborsCount === 2 || aliveNeighborsCount === 3
                ? STATE.ALIVE
                : STATE.DEAD;
        }
    }

    getNeighbors(grid, rowIdx, cellIdx) {
        return grid
            .slice(this.getSliceStart(rowIdx), rowIdx + 2)
            .map(row => row.slice(this.getSliceStart(cellIdx), cellIdx + 2));
    }

    getSliceStart(idx) {
        return idx - 1 > 0 ? idx - 1 : undefined;
    }

    getAliveNeighborsCount(neighbors) {
        return neighbors.reduce((sum, row) => sum + row.reduce((sum, cell) => sum + cell, 0), 0);
    }

    start = () => {
        this.setState({isStarted: true});
        this.interval = setInterval(this.tick, this.state.speed);
    };

    stop = () => {
        clearInterval(this.interval);
        this.setState({isStarted: false});
    };

    armageddon = () => {
        if (!this.state.isStarted) {
            this.setState({
                grid: Array.from({length: 16}, () => Array.from({length: 25}, () => 0)),
            });
        }
    };

    render() {
        const {isStarted, grid, speed} = this.state;
        return (
            <div>
                <h1>Conway's Game of Life</h1>
                <div className={styles.Container}>
                    <Paper elevation={2}>
                        <div className={styles.Grid}>
                            {grid.map((row, rowIdx) => {
                                return (
                                    <ul key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <Cell
                                                key={`${rowIdx}${cellIdx}`}
                                                state={cell}
                                                handleClick={this.onCellClickHandler(
                                                    cellIdx,
                                                    rowIdx
                                                )}
                                            />
                                        ))}
                                    </ul>
                                );
                            })}
                        </div>
                    </Paper>
                    <div className={styles.Controls}>
                        <div>
                            <TextField
                                id="outlined-adornment-weight"
                                className=""
                                type="number"
                                variant="outlined"
                                label="Game speed"
                                value={speed}
                                disabled={isStarted}
                                onChange={e => this.setState({speed: e.target.value})}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">ms</InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div className={styles.Scenes}>
                            <Chip
                                label="Scene 1"
                                color="primary"
                                onClick={() => !isStarted && this.setState({grid: scenes.first})}
                            />
                            <Chip
                                label="Scene 2"
                                color="secondary"
                                onClick={() => !isStarted && this.setState({grid: scenes.second})}
                            />
                            <Chip
                                label="Scene 3"
                                color="primary"
                                variant="outlined"
                                onClick={() => !isStarted && this.setState({grid: scenes.third})}
                            />
                        </div>

                        {isStarted ? (
                            <Button variant="outlined" color="secondary" onClick={this.stop}>
                                Stop evolution
                            </Button>
                        ) : (
                            <Button variant="contained" color="primary" onClick={this.start}>
                                Begin life
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={this.armageddon}
                            disabled={isStarted}
                        >
                            Armageddon
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
