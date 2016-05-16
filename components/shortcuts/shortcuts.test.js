import simulateKeypress from 'simulate-keypress';
import shortcuts from './shortcuts';

describe('Shortcuts', () => {
  const key = 'a';
  const key2 = 'b';
  const scope = 'scope scope scope';
  let noop;
  let noop2;

  function trigger() {
    simulateKeypress(key, 65);
  }

  beforeEach(() => {
    shortcuts.reset();
    shortcuts.setScope();
    shortcuts.setFilter();

    noop = sinon.stub();
    noop2 = sinon.stub();
  });

  describe('bind', () => {
    it('should throw without a handler', () => {
      expect(() => {
        shortcuts.bind();
      }).to.throw(Error, 'Shortcut handler should exist');
    });

    it('should throw without a key', () => {
      expect(() => {
        shortcuts.bind({handler: sinon.stub()});
      }).to.throw(Error, 'Shortcut key should exist');
    });

    it('should bind to root scope', () => {
      shortcuts.bind({key, handler: noop});

      shortcuts._scopes[shortcuts.ROOT_SCOPE][key].should.equal(noop);
    });

    it('should bind to custom scope', () => {
      shortcuts.bind({key, scope, handler: noop});

      shortcuts._scopes[scope][key].should.equal(noop);
    });

    it('should bind array of keys', () => {
      const keys = [key, key2];
      shortcuts.bind({key: keys, handler: noop});

      shortcuts._scopes[shortcuts.ROOT_SCOPE][key].should.equal(noop);
      shortcuts._scopes[shortcuts.ROOT_SCOPE][key2].should.equal(noop);
    });
  });

  describe('bindMap', () => {
    it('should throw without a map', () => {
      expect(() => {
        shortcuts.bindMap();
      }).to.throw(Error, 'Shortcuts map shouldn\'t be empty');
    });

    it('should throw with wrong handler', () => {
      expect(() => {
        shortcuts.bindMap({a: {}});
      }).to.throw(Error, 'Shortcut handler should exist');
    });

    it('should bind map of keys to root scope', () => {
      const keys = {};
      keys[key] = noop;
      keys[key2] = noop2;
      shortcuts.bindMap(keys);

      shortcuts._scopes[shortcuts.ROOT_SCOPE][key].should.equal(noop);
      shortcuts._scopes[shortcuts.ROOT_SCOPE][key2].should.equal(noop2);
    });

    it('should bind map of keys to custom scope', () => {
      const keys = {};
      keys[key] = noop;
      keys[key2] = noop2;
      shortcuts.bindMap(keys, {scope});

      shortcuts._scopes[scope][key].should.equal(noop);
      shortcuts._scopes[scope][key2].should.equal(noop2);
    });
  });

  describe('unbindScope', () => {
    it('should clear scope', () => {
      shortcuts.bind({key, scope, handler: noop});
      shortcuts.unbindScope(scope);

      expect(shortcuts._scopes[scope]).not.to.exist;
    });
  });

  describe('hasKey', () => {
    it('should clear scope', () => {
      shortcuts.bind({key, scope, handler: noop});

      shortcuts.hasKey(key, scope).should.be.true;
      shortcuts.hasKey(key, shortcuts.ROOT_SCOPE).should.be.false;
    });
  });

  describe('filter', () => {
    it('should setFilter', () => {
      shortcuts.setFilter(noop2);
      shortcuts.bind({key, handler: noop});

      trigger();

      noop.should.have.been.called;
      noop2.should.have.been.called;
    });

    it('should prevent handler run', () => {
      const stop = sinon.stub().returns(true);

      shortcuts.setFilter(stop);
      shortcuts.bind({key, handler: noop});

      trigger();

      stop.should.have.been.called;
      noop.should.not.have.been.called;
    });
  });

  describe('key press', () => {
    it('should handle keys in root scope', () => {
      shortcuts.bind({key, handler: noop});

      trigger();

      noop.should.have.been.called;
    });

    it('should handle keys in root scope with other scope defined', () => {
      shortcuts.bind({key, handler: noop});
      shortcuts.bind({key, scope, handler: noop2});

      trigger();

      noop.should.have.been.called;
      noop2.should.not.have.been.called;
    });

    it('should handle keys in top scope', () => {
      shortcuts.bind({key, handler: noop});
      shortcuts.bind({key, scope, handler: noop2});

      shortcuts.pushScope(scope);
      trigger();

      noop.should.not.have.been.called;
      noop2.should.have.been.called;
    });

    it('should fall trough scopes when returning true', () => {
      const fallthrough = sinon.stub().returns(true);

      shortcuts.bind({key, handler: noop});
      shortcuts.bind({key, scope, handler: fallthrough});

      shortcuts.pushScope(scope);
      trigger();

      noop.should.have.been.called;
      fallthrough.should.have.been.called;
    });
  });

  describe('scope chain operations', () => {
    const scope1 = 'a';
    const scope2 = 'bb';
    const scope3 = 'ccc';

    it('emptified scope chain be equal to default', () => {
      shortcuts.getScope().should.deep.equal([]);
    });

    it('setScope should set full scope chain by string name', () => {
      const myscope = 'aaaa';
      shortcuts.setScope(myscope);

      shortcuts.getScope().should.deep.equal([myscope]);
    });

    it('setScope should set full scope chain by array of names', () => {
      shortcuts.setScope([scope1, scope2]);

      shortcuts.getScope().should.deep.equal([scope1, scope2]);
    });

    it('pushScope should add scope to scope chain end', () => {
      shortcuts.setScope(scope1);
      shortcuts.pushScope(scope2);

      shortcuts.getScope().should.deep.equal([scope1, scope2]);
    });

    it('popScope should remove by name scope and next scopes from chain', () => {
      shortcuts.setScope([scope1, scope2, scope3]);
      shortcuts.popScope(scope2);

      shortcuts.getScope().should.deep.equal([scope1]);
    });

    it('spliceScope should remove by name scope from chain', () => {
      shortcuts.setScope([scope1, scope2, scope3]);
      shortcuts.spliceScope(scope2);

      shortcuts.getScope().should.deep.equal([scope1, scope3]);
    });
  });
});
