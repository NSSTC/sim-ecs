import {PushDownAutomaton} from './pda';
import {assert} from 'chai';

describe('Test PDA', () => {
    class State {}
    class State1 extends State {}

    it('pop', () => {
        const pda = new PushDownAutomaton<State>();
        pda.push(State1);
        assert.isTrue(pda.pop() instanceof State1);
        assert.equal(pda.pop(), undefined);
    });
});
