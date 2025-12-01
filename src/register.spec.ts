import dayjs from 'dayjs';

import register from './register'

var env = {
    ISSUE_TITLE: '',
    ISSUE_URL: '',
    ISSUE_CREATOR: '',
};

function generateEnv(newEnv: Partial<typeof env>) {
    Object.assign(env, newEnv);
}

function resetEnv() {
    env = {
        ISSUE_TITLE: '',
        ISSUE_URL: '',
        ISSUE_CREATOR: '',
    };
}

jest.mock('~/env', () => ({
    get ISSUE_TITLE() {
        return env?.ISSUE_TITLE;
    },
    get ISSUE_URL() {
        return env?.ISSUE_URL;
    },
    get ISSUE_CREATOR() {
        return env?.ISSUE_CREATOR;
    }
}));

describe('Register test', () => {
    beforeEach(() => {
        resetEnv();
    });

    it('제목에 회고가 없으면 종료한다.', async () => {
        generateEnv({
            ISSUE_TITLE: '오늘 회의',
        });

        expect(await register()).toBe('Error: This is not a retrospective issue.');
    });

    it('제목에 오늘 날짜가 없으면 종료한다.', async () => {
        generateEnv({
            ISSUE_TITLE: '회고',
        });

        expect(await register()).toBe('Error: This is not a retrospective issue of today.');
    });

    it('제목에 회고가 있고, 오늘 날짜가 있으면 메시지를 보낸다.', async () => {
        generateEnv({
            ISSUE_TITLE: `${dayjs().format('YYYY-MM-DD')} 회고`,
            ISSUE_URL: 'MOCK_ISSUE_URL',
            ISSUE_CREATOR: 'someone',
        });

        expect(await register()).toBe(0);
    });
});
