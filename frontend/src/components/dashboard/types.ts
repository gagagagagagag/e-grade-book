export type DashboardDataEntry = {
  _id: 'last' | ''
  totalLessons: number
  totalDuration: number
  totalAttendance: number
  totalAbstence: number
  totalMissingHomework: number
}

export type DashboardData = {
  lessons: {
    current?: DashboardDataEntry
    last?: DashboardDataEntry
  }
}
