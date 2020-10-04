
const settings = require('../settings.js');

describe('settings', () => {
    describe('check hashsum', () => {
        it('returns true', () => {
            const resp = settings.check("default");
            expect(resp).toEqual(true);
        })
        it('returns false', () => {
            const resp = settings.check("asdsadsa");
            expect(resp).toEqual(false);
        })
    });
});
