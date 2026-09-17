import prisma from "../../../lib/prisma.js";

export const getAdminSubscriptionsOverview = async () => {
  const [totalUsers, freeCount, plusCount, proCount, recentSubscribers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "FREE" } }),
    prisma.user.count({ where: { plan: "PLUS" } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.user.findMany({
      where: { plan: { in: ["PLUS", "PRO"] } },
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        careerProfile: {
          select: {
            targetRole: true,
            targetRoleName: true,
          },
        },
      },
    }),
  ]);

  const mrr = plusCount * 29 + proCount * 99;
  const arr = mrr * 12;
  const totalPaid = plusCount + proCount;
  const conversionRate = totalUsers > 0 ? ((totalPaid / totalUsers) * 100).toFixed(1) : "0.0";

  const tierConfigs = [
    {
      tier: "FREE",
      name: "Go (Free Tier)",
      badge: "Forever Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      subscribersCount: freeCount,
      features: [
        "Core Personalized AI Learning Roadmap",
        "Diagnostic Skill Assessment Engine",
        "Basic Portfolio Project Showcase",
        "Public Learning Community Support",
      ],
    },
    {
      tier: "PLUS",
      name: "Career Accelerator (Plus)",
      badge: "Most Popular",
      monthlyPrice: 29,
      yearlyPrice: 199,
      subscribersCount: plusCount,
      features: [
        "AI Capstone Project Generator (Flow A)",
        "Voice & Text AI Mock Interview Simulator",
        "Skill Gap Recovery & Adaptive Engine",
        "Unlimited Roadmap Recalibration",
        "Job Reality Market Demand Analysis",
      ],
    },
    {
      tier: "PRO",
      name: "Market Dominance (Pro)",
      badge: "Elite Access",
      monthlyPrice: 99,
      yearlyPrice: 699,
      subscribersCount: proCount,
      features: [
        "Everything in Plus",
        "AI Resume Builder & Real-time ATS Optimization",
        "Cryptographic Proof Graph & Verifiable Public Credential",
        "Digital Career Twin AI Simulation",
        "Career Intelligence & Strategic Career Decision Engine",
        "Highest Priority GPU Inference",
      ],
    },
  ];

  return {
    summary: {
      totalUsers,
      totalPaid,
      freeCount,
      plusCount,
      proCount,
      mrr,
      arr,
      conversionRate,
    },
    tierConfigs,
    recentSubscribers,
  };
};
