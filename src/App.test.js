import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';

import App, {STATE} from './App';
import scenes from './scenes';

jest.useFakeTimers();

describe('Conways game of life', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('Should renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('Should initialize state on load', () => {
        const wrapper = shallow(<App />);
        expect(wrapper.state()).toEqual({
            isStarted: false,
            grid: Array.from({length: 16}, () => Array.from({length: 25}, () => 0)),
            speed: 1000,
        });
    });

    it('Should change cell state when onCellClickHandler called and isStarted is false', () => {
        const wrapper = shallow(<App />);
        wrapper.setState({grid: [[0, 0], [0, 0]]});
        wrapper.instance().onCellClickHandler(0, 0)();
        expect(wrapper.state().grid).toEqual([[1, 0], [0, 0]]);
    });

    it('Should change grid state when tick is called', () => {
        const wrapper = shallow(<App />);
        wrapper.setState({grid: [[0, 0], [0, 0]]});
        wrapper.instance().mutateCell = jest.fn(() => STATE.ALIVE);
        wrapper.update();
        wrapper.instance().tick();
        expect(wrapper.state().grid).toEqual([[1, 1], [1, 1]]);
    });

    it('Should return STATE.ALIVE for dead cell if it has 3 alive neighbors', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 0, 0], [0, 1, 0], [0, 0, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        wrapper.instance().getNeighbors = jest.fn(() => [[1, 1], [0, 1]]);
        wrapper.instance().getAliveNeighborsCount = jest.fn(() => 3);
        wrapper.update();
        const cellState = wrapper.instance().mutateCell(grid, rowIdx, 0, cellIdx);
        expect(cellState).toEqual(STATE.ALIVE);
    });

    it('Should return STATE.DEAD for dead cell if it has less than 3 alive neighbors', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 0, 0], [0, 1, 0], [0, 0, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        wrapper.instance().getNeighbors = jest.fn(() => [[1, 0], [0, 1]]);
        wrapper.instance().getAliveNeighborsCount = jest.fn(() => 2);
        wrapper.update();
        const cellState = wrapper.instance().mutateCell(grid, rowIdx, 0, cellIdx);
        expect(cellState).toEqual(STATE.DEAD);
    });

    it('Should return STATE.ALIVE for live cell if it has 2 alive neighbors', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 1, 0], [0, 1, 0], [0, 0, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        wrapper.instance().getNeighbors = jest.fn(() => [[1, 1], [0, 1]]);
        wrapper.instance().getAliveNeighborsCount = jest.fn(() => 3);
        wrapper.update();
        const cellState = wrapper.instance().mutateCell(grid, rowIdx, 1, cellIdx);
        expect(cellState).toEqual(STATE.ALIVE);
    });

    it('Should return STATE.ALIVE for live cell if it has 3 alive neighbors', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 1, 0], [1, 1, 0], [1, 1, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        wrapper.instance().getNeighbors = jest.fn(() => [[1, 1], [1, 1]]);
        wrapper.instance().getAliveNeighborsCount = jest.fn(() => 4);
        wrapper.update();
        const cellState = wrapper.instance().mutateCell(grid, rowIdx, 1, cellIdx);
        expect(cellState).toEqual(STATE.ALIVE);
    });

    it('Should return STATE.DEAD for live cell if it less than 2 alive neighbors', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 0, 0], [0, 1, 0], [0, 0, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        wrapper.instance().getNeighbors = jest.fn(() => [[1, 1], [1, 1]]);
        wrapper.instance().getAliveNeighborsCount = jest.fn(() => 2);
        wrapper.update();
        const cellState = wrapper.instance().mutateCell(grid, rowIdx, 1, cellIdx);
        expect(cellState).toEqual(STATE.DEAD);
    });

    it('Should not change cell state when onCellClickHandler called and isStarted is true', () => {
        const wrapper = shallow(<App />);
        const initialGrid = [[0, 0], [0, 0]];
        wrapper.setState({isStarted: true, grid: initialGrid});
        wrapper.instance().onCellClickHandler(0, 0)();
        expect(wrapper.state().grid).toEqual(initialGrid);
    });

    it('Should return array of cell neighbor when getNeighbors called', () => {
        const wrapper = shallow(<App />);
        const grid = [[1, 0, 0], [0, 1, 0], [0, 0, 0]];
        const rowIdx = 0;
        const cellIdx = 0;
        const neighborsArray = wrapper.instance().getNeighbors(grid, rowIdx, cellIdx);
        expect(neighborsArray).toEqual([[1, 0], [0, 1]]);
    });

    it('Should return index of left neighbor if cell index is more than 1', () => {
        const wrapper = shallow(<App />);
        const cellIdx = 2;
        const leftNeighborIxd = wrapper.instance().getSliceStart(cellIdx);
        expect(leftNeighborIxd).toEqual(1);
    });

    it('Should return undefined if cell index is less than 1', () => {
        const wrapper = shallow(<App />);
        const cellIdx = 0;
        const leftNeighborIxd = wrapper.instance().getSliceStart(cellIdx);
        expect(leftNeighborIxd).toBeUndefined();
    });

    it('Should return live neighbors on getAliveNeighborsCount', () => {
        const wrapper = shallow(<App />);
        const neighbors = [[1, 1], [1, 0]];
        const aliveNeighbors = wrapper.instance().getAliveNeighborsCount(neighbors);
        expect(aliveNeighbors).toEqual(3);
    });

    it('Should set isStarted to true and call setInterval when start called', () => {
        const wrapper = shallow(<App />);
        wrapper.instance().start();
        expect(setInterval).toBeCalled();
        expect(wrapper.state().isStarted).toBeTruthy();
    });

    it('Should call clearInterval and set isStarted to false when stop called', () => {
        const wrapper = shallow(<App />);
        wrapper.setState({isStarted: true});
        wrapper.instance().stop();
        expect(clearInterval).toBeCalled();
        expect(wrapper.state().isStarted).toBeFalsy();
    });

    it('Should destroy all live cells on armageddon call', () => {
        const wrapper = shallow(<App />);
        wrapper.setState({grid: Array.from({length: 16}, () => Array.from({length: 25}, () => 1))});
        wrapper.instance().armageddon();
        expect(wrapper.state().grid).toEqual(
            Array.from({length: 16}, () => Array.from({length: 25}, () => 0))
        );
    });

    it('Should change game speed on text field value change', () => {
        const wrapper = shallow(<App />);
        wrapper
            .find('TextField')
            .props()
            .onChange({target: {value: 50}});
        expect(wrapper.state().speed).toEqual(50);
    });

    it('Should set scene1 on first Chip click', () => {
        const wrapper = shallow(<App />);
        wrapper
            .find('[label="Scene 1"]')
            .props()
            .onClick();
        expect(wrapper.state().grid).toEqual(scenes.first);
    });

    it('Should set scene 2 on second Chip click', () => {
        const wrapper = shallow(<App />);
        wrapper
            .find('[label="Scene 2"]')
            .props()
            .onClick();
        expect(wrapper.state().grid).toEqual(scenes.second);
    });

    it('Should set scene 3 on third Chip click', () => {
        const wrapper = shallow(<App />);
        wrapper
            .find('[label="Scene 3"]')
            .props()
            .onClick();
        expect(wrapper.state().grid).toEqual(scenes.third);
    });
});
