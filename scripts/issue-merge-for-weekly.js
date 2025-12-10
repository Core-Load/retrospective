const members = require('../members.json')

const START_DATE = process.env.START_DATE
const END_DATE = process.env.END_DATE

// body 안에서 "## 섹션 제목" 단위로 섹션을 추출하는 함수
function extractSections(body) {
    const regex = /##\s*(.*?)\s*\n+([\s\S]*?)(?=##\s*|$)/g
    const result = []
    let match
    while ((match = regex.exec(body)) !== null) {
        const title = match[1].trim()
        const contentBlock = match[2]
        const contentLines = contentBlock
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
        result.push([title, ...contentLines])
    }
    return result
}

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

        const sections = extractSections(body)

        for (const [sectionTitle, ...sectionContent] of sections) {
            if (!sectionMap[sectionTitle]) {
                sectionMap[sectionTitle] = []
            }

            const bullets = sectionContent
                .filter(i => i.trim().startsWith('-'))
                .filter(i => i.trim().length > 2)

            if (bullets.length === 0)
                continue

            const normalized = bullets.map(i => i.replace(/^-\s*/, `- \`${month}월 ${week}주차\` `))

            sectionMap[sectionTitle].push(...normalized)
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
