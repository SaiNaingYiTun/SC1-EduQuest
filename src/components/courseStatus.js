// Course status constants - Single source of truth
export const COURSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const COURSE_STATUS_LIST = Object.values(COURSE_STATUS);

export const COURSE_STATUS_COLORS = {
  [COURSE_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    button: 'bg-yellow-500'
  },
  [COURSE_STATUS.APPROVED]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    button: 'bg-green-500'
  },
  [COURSE_STATUS.REJECTED]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    button: 'bg-red-500'
  }
};

export const COURSE_STATUS_DISPLAY = {
  [COURSE_STATUS.PENDING]: 'Pending',
  [COURSE_STATUS.APPROVED]: 'Approved',
  [COURSE_STATUS.REJECTED]: 'Rejected'
};

export const COURSE_STATUS_MESSAGES = {
  [COURSE_STATUS.PENDING]: 'Awaiting approval',
  [COURSE_STATUS.REJECTED]: 'Course rejected',
  [COURSE_STATUS.APPROVED]: 'Active'
};