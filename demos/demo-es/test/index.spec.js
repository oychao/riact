import { expect } from 'chai';
import 'mocha-sinon';

describe('your test cases', () => {
  beforeEach(function () {
    this.sinon.stub(console, 'info');
  });
  it('should run correctly', done => {
    console.info('hello test');
    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith('hello test')).to.be.true;
    done();
  });
});
