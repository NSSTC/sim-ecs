import {PushDownAutomaton} from './pda';
import {assert} from 'chai';

describe('Test PDA', () => {
    class State {}
    class State1 extends State {}

    it('push', () => {
        const pda = new PushDownAutomaton<State>();
        assert.equal(pda.size, 0);
        pda.push(State1);
        assert.equal(pda.size, 1);
        assert.isTrue(pda.state instanceof State1);
    });

    it('pop', () => {
        const pda = new PushDownAutomaton<State>();
        pda.push(State1);
        assert.equal(pda.size, 1);
        assert.isTrue(pda.pop() instanceof State1);
        assert.equal(pda.size, 0);
        assert.equal(pda.pop(), undefined);
        assert.equal(pda.size, 0);
    });

    it('clear', () => {
        const pda = new PushDownAutomaton<State>();
        pda.push(State1);
        pda.push(State1);
        pda.push(State1);
        pda.push(State1);
        pda.push(State1);

        assert.equal(pda.size, 5);

        pda.clear();

        assert.equal(pda.size, 0);
        assert.equal(pda.pop(), undefined);
    });
});
