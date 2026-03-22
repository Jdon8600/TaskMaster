import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('should instantiate', () => {
    const app = new App();
    expect(app).toBeTruthy();
  });
});
