const members = require('../members.json')

const START_DATE = process.env.START_DATE
const END_DATE = process.env.END_DATE

const createContent = (map) => `
## 내면

${map['내면'].join('\n')}

## 전진

${map['전진'].join('\n')}

## 좌절

${map['좌절'].join('\n')}

${Object.keys(map).filter(i => !['내면', '전진', '좌절'].includes(i)).map(title => `

## ${title}

${map[title].join('\n')}`).join('\n').trim()}

`.trim()

module.exports = async ({ github, context }) => {
    const creator = context.payload.sender.login
    const creatorName = members[creator]

    const { data: issues } = await github.rest.issues.listForRepo({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        assignee: creator,
        state: 'open',
    })

    const sectionMap = {
        '내면': [],
        '전진': [],
        '좌절': [],
    }

    for (const { number, title, body } of issues.reverse()) {
        if (!title.match(/^\d{4}-\d{2}-\d{2} \~ \d{4}-\d{2}-\d{2} .+ 회고$/)) {
            continue
        }

        const [startDate, endDate] = title.match(/\d{4}-\d{2}-\d{2}/g)

        if (startDate < START_DATE || endDate > END_DATE) {
            continue
        }

        const month = new Date(startDate).getMonth() + 1
        const week = Math.ceil((new Date(startDate)).getDate() / 7)

        const sections = body.split('##')
            .map(section => section.split('\n').map((item, idx) => idx === 0 ? item.trim() : item))
            .filter(section => section.join('').trim() !== '')

        for (const [sectionTitle, ...sectionContent] of sections) {
            if (!sectionMap[sectionTitle]) {
                sectionMap[sectionTitle] = []
            }

            // "-" 단독 제거 (내용 없는 bullet 제거)
            const bullets = sectionContent.map(i => i.trim()).filter(i => i.startsWith('-')).filter(i => i.length > 1)
            if (bullets.length === 0) continue

            sectionMap[sectionTitle].push(
                ...bullets.map(i =>
                    i.replace(/^-\s*/, `- \`${month}월 ${week}주차\` `)
                )
            )
        }

        await github.rest.issues.update({
            owner: context.payload.repository.owner.login,
            repo: context.payload.repository.name,
            issue_number: number,
            state: 'closed',
        })
    }

    const content = createContent(sectionMap)

    const startYear = new Date(START_DATE).getFullYear()
    const startMonth = new Date(START_DATE).getMonth() + 1
    const startWeek = Math.ceil((new Date(START_DATE)).getDate() / 7)
    const endYear = new Date(END_DATE).getFullYear()
    const endMonth = new Date(END_DATE).getMonth() + 1
    const endWeek = Math.ceil((new Date(END_DATE)).getDate() / 7)

    await github.rest.issues.create({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title: `${startYear}년 ${startMonth}월 ${startWeek}주차 ~ ${endYear}년 ${endMonth}월 ${endWeek}주차 ${creatorName} 회고`,
        body: content,
        assignees: [creator],
    })
}
