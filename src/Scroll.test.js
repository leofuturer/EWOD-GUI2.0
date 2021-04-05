import React from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import Scroll from './Scroll';
import Provider from './Provider';

afterEach(cleanup);

it('Add sequence when click the button', () => {
    render(
        <Provider>
            <Scroll/>
        </Provider>
    );
    let seq = screen.getAllByTestId('seq-button');
    expect(seq).toHaveLength(1);
    const add = screen.getByTestId('add-button');
    fireEvent.click(add);
    seq = screen.getAllByTestId('seq-button');
    expect(seq).toHaveLength(2);
})