import regular from './regular'

describe('Regular test', () => {
    it('should return 0', async () => {
        expect(await regular()).toBe(0);
    });
});
