const members = require('../members.json')

module.exports = async ({ github, context }) => {
    if (!context.payload.issue.title.includes('회고')) {
        return
    }

    const creator = context.payload.sender.login
    const creatorName = members[creator]
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const yyyymmdd = `${year}-${month}-${day}`

    await github.rest.issues.addAssignees({
        issue_number: context.payload.issue.number,
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        assignees: [creator]
    })

    if (context.payload.issue.title.includes('XXX')) {
        await github.rest.issues.update({
            issue_number: context.payload.issue.number,
            owner: context.payload.repository.owner.login,
            repo: context.payload.repository.name,
            title: context.payload.issue.title.replace('YYYY-MM-DD', yyyymmdd).replace('XXX', creatorName),
        })
    }
}
