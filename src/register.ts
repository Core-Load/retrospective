import dayjs from 'dayjs'
import members from '../members.json'

import broadcast from '~/modules/broadcast'

import {
    ISSUE_CREATOR,
    ISSUE_TITLE,
    ISSUE_URL,
} from '~/env'

export default async function main() {
    if (!ISSUE_TITLE?.includes('회고'))
        return 'Error: This is not a retrospective issue.'

    if (!ISSUE_TITLE?.includes(dayjs().format('YYYY-MM-DD')))
        return 'Error: This is not a retrospective issue of today.'

    const message = [
        `${members[ISSUE_CREATOR as keyof typeof members] ?? ISSUE_CREATOR}님, 오늘도 수고하셨습니다 👏`,
        `${ISSUE_URL}`
    ].join('\n')

    await broadcast(message)

    return 0
}

main()
