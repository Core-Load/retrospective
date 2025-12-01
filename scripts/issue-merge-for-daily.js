const members = require('../members.json')

/**
 * Calculate the start date (Sunday) and end date (Saturday) of the current week
 * @returns {Object} Object containing start and end dates in YYYY-MM-DD format
 */
const getCurrentWeekDates = () => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
  
  // Calculate Sunday (start of week)
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - currentDay)
  
  // Calculate Saturday (end of week)
  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)
  
  // Format dates as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  
  return {
    startDate: formatDate(sunday),
    endDate: formatDate(saturday)
  }
}

// Get dates based on mode
const getDateRange = () => {
  const dateMode = process.env.DATE_MODE || 'auto'
  
  if (dateMode === 'auto') {
    const { startDate, endDate } = getCurrentWeekDates()
    return { startDate, endDate }
  } else {
    return {
      startDate: process.env.START_DATE,
      endDate: process.env.END_DATE
    }
  }
}

const { startDate: START_DATE, endDate: END_DATE } = getDateRange()

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

---

> 아래 2개 중 마음에 드는 방식으로 작성해보아요.

> 아래부터는 문장으로 회고하는 섹션입니다.
> 당신의 한 주를 표현해보세요!

## [Topic]

- 

> 이번 주의 목표는 무엇이였나요?
> - 그 목표를 달성하기 위해 어떤 행동을 했나요?
> - 그 목표를 달성하는 과정에서 어떤 몰입을 경험했나요?
> - 이 과정에서 **어떤 지점이 좋았**고, **어떤 부분이 아쉬웠**고, **어떤 부분을 개선할** 수 있을까요?

## [카테고리] 이번주의 목표

- 좋은 점
  - 
- 아쉬운 점
  - 
- 개선할 점
  - 


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
        if (!title.match(/^\d{4}-\d{2}-\d{2} .+ 회고$/)) {
            continue
        }

        const [date] = title.split(' ')

        if (date < START_DATE || date > END_DATE) {
            continue
        }

        const sections = body.split('##')
            .map(section => section.split('\n').map((item, idx) => idx === 0 ? item.trim() : item))
            .filter(section => section.join('') !== '')

        for (const [sectionTitle, ...sectionContent] of sections) {
            if (!sectionMap[sectionTitle]) {
                sectionMap[sectionTitle] = []
            }

            sectionMap[sectionTitle].push(
                ...sectionContent
                    .filter(i => i.trim()[0] === '-')
                    .map(i => i.replace('-', `- \`${date}\``))
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

    await github.rest.issues.create({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title: `${START_DATE} ~ ${END_DATE} ${creatorName} 회고`,
        body: content,
        assignees: [creator],
    })
}
