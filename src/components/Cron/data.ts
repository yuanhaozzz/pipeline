const isEn = (localStorage.getItem('currentLocal') || navigator.language).includes('en');

export const weekList = [
    { label: `${isEn ? 'Monday' : '周一'}`, value: 0 },
    { label: `${isEn ? 'Tuesday' : '周二'}`, value: 1 },
    { label: `${isEn ? 'Wednesday' : '周三'}`, value: 2 },
    { label: `${isEn ? 'Thursday' : '周四'}`, value: 3 },
    { label: `${isEn ? 'Friday' : '周五'}`, value: 4 },
    { label: `${isEn ? 'Saturday' : '周六'}`, value: 5 },
    { label: `${isEn ? 'Sunday' : '周日'}`, value: 6 },
];