const members = require('../members.json')

module.exports = async ({ github, context }) => {
    if (!context.payload.issue.title.includes('회고')) {
        return
    }

    const creator = context.payload.sender.login
    const creatorName = members[creator]

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
            title: context.payload.issue.title.replace('XXX', creatorName),
        })
    }
}
