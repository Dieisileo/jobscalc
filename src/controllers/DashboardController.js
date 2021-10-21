const Job = require('../model/Job')
const Profile = require('../model/Profile')
const JobUtils = require('../utils/JobUtils')

module.exports = {
  async index(req, res) {
    const jobs = Job.get()
    const profile = await Profile.get()

    let statusCount = {
      progress: 0,
      done: 0,
      total: jobs.length
    }

    // total de horas por dia de cada job em progress
    let jobTotalHours = 0

    const updatedJobs = jobs.map(job => {
      // ajustes no job
      const remaining = JobUtils.remainingDays(job)
      const status = remaining <= 0 ? 'done' : 'progress'

      // somando a quantidade de status
      statusCount[status] += 1

      // total de horas por dia de cada job em progress
      jobTotalHours =
        status == 'progress'
          ? jobTotalHours + Number(job['daily-hours'])
          : jobTotalHours

      // OU
      // if (status == 'progress') {
      // jobTotalHours += Number(job["daily-hours"])
      // }

      return {
        ...job,
        remaining,
        status,
        budget: JobUtils.calculateBudget(job, profile['value-hour'])
      }
    })

    // qtd de horas que quero trabalhar por dia (PROFILE)
    // MENOS
    // qtd de horas de cada job em progress
    const freeHours = profile['hours-per-day'] - jobTotalHours

    return res.render('index', {
      jobs: updatedJobs,
      profile: profile,
      statusCount: statusCount,
      freeHours: freeHours
    })
  }
}
