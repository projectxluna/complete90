import { ElapsedTimestampPipe } from './elapsed-timestamp.pipe';

describe('ElapsedTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new ElapsedTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
