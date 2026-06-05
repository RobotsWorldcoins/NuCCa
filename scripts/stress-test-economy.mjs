const dailyRewardPolicy = {
  dailyNuccaBudget: 3000,
  referralMonthlyBudget: 25000,
};

function activeUserMultiplier(activeUsers) {
  if (activeUsers <= 5000) return 1;
  if (activeUsers <= 15000) return 0.75;
  if (activeUsers <= 33000) return 0.5;
  return 0.25;
}

function halvingReward(monthIndex) {
  return 1 / 2 ** monthIndex;
}

function simulateClaims(activeUsers, months = 12) {
  let total = 0;
  const rows = [];

  for (let month = 0; month < months; month += 1) {
    const perUser = halvingReward(month) * activeUserMultiplier(activeUsers);
    const dailyRequested = perUser * activeUsers;
    const dailyPaid = Math.min(dailyRequested, dailyRewardPolicy.dailyNuccaBudget);
    const monthlyPaid = dailyPaid * 30;
    total += monthlyPaid;
    rows.push({
      month: month + 1,
      activeUsers,
      perUser,
      dailyRequested,
      dailyPaid,
      monthlyPaid,
    });
  }

  return { activeUsers, total, rows };
}

for (const users of [1000, 10000, 33000]) {
  const result = simulateClaims(users);
  console.log(JSON.stringify(result, null, 2));
}
