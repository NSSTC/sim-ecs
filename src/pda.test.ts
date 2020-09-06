import {PushDownAutomaton} from './pda';
import {assert} from 'chai';

describe('Test PDA', () => {
    it('pop', () => {
        const pda = new PushDownAutomaton<number>();
        pda.push(42);
        assert.equal(pda.pop(), 42);
        assert.equal(pda.pop(), undefined);
    });
});
