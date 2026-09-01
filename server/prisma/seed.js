const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for TrackFlow...');

  // 1. Clear existing data in reverse relational order
  await prisma.comment.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('TrackFlow9!', 10);

  // 2. Create Users with Simple Indian Names
  const usersData = [
    { name: 'Aarav Sharma', email: 'aarav.sharma@trackflow.dev' },
    { name: 'Priya Patel', email: 'priya.patel@trackflow.dev' },
    { name: 'Rohan Verma', email: 'rohan.verma@trackflow.dev' },
    { name: 'Ananya Iyer', email: 'ananya.iyer@trackflow.dev' },
    { name: 'Rahul Gupta', email: 'rahul.gupta@trackflow.dev' },
    { name: 'Neha Singh', email: 'neha.singh@trackflow.dev' },
    { name: 'Aditya Rao', email: 'aditya.rao@trackflow.dev' },
    { name: 'Pooja Nair', email: 'pooja.nair@trackflow.dev' },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
      },
    });
    createdUsers.push(user);
  }

  const [aarav, priya, rohan, ananya, rahul, neha, aditya, pooja] = createdUsers;
  console.log(`✅ Seeded ${createdUsers.length} Indian team members.`);

  // 3. Create Projects
  const projectsData = [
    {
      title: 'Unified Payments Engine (UPI & Cards)',
      description: 'Next-generation multi-gateway orchestration engine supporting UPI Autopay, Razorpay, Stripe, and credit card tokenization.',
      createdById: aarav.id,
      members: [
        { userId: aarav.id, role: 'OWNER' },
        { userId: priya.id, role: 'ADMIN' },
        { userId: rohan.id, role: 'MEMBER' },
        { userId: neha.id, role: 'MEMBER' },
      ],
    },
    {
      title: 'Customer Onboarding & KYC Pipeline',
      description: 'Automated Aadhaar, PAN, and DigiLocker verification workflows with real-time fraud risk scoring and document parsing.',
      createdById: priya.id,
      members: [
        { userId: priya.id, role: 'OWNER' },
        { userId: aarav.id, role: 'ADMIN' },
        { userId: ananya.id, role: 'MEMBER' },
        { userId: pooja.id, role: 'MEMBER' },
      ],
    },
    {
      title: 'Real-time Order & Delivery Logistics',
      description: 'Low-latency WebSocket dispatch system for hyperlocal delivery partner allocation, live GPS telemetry, and ETA calculation.',
      createdById: rohan.id,
      members: [
        { userId: rohan.id, role: 'OWNER' },
        { userId: aditya.id, role: 'ADMIN' },
        { userId: rahul.id, role: 'MEMBER' },
        { userId: aarav.id, role: 'MEMBER' },
      ],
    },
    {
      title: 'Cloud Infrastructure & Zero-Trust Security',
      description: 'Kubernetes multi-region clusters, automated SSL rotation, HashiCorp Vault secrets management, and DDoS mitigation.',
      createdById: rahul.id,
      members: [
        { userId: rahul.id, role: 'OWNER' },
        { userId: neha.id, role: 'ADMIN' },
        { userId: aarav.id, role: 'MEMBER' },
        { userId: rohan.id, role: 'MEMBER' },
      ],
    },
  ];

  const createdProjects = [];
  for (const p of projectsData) {
    const project = await prisma.project.create({
      data: {
        title: p.title,
        description: p.description,
        createdById: p.createdById,
        members: {
          create: p.members.map((m) => ({
            userId: m.userId,
            role: m.role,
          })),
        },
      },
    });
    createdProjects.push(project);
  }

  const [projPayments, projKYC, projLogistics, projInfra] = createdProjects;
  console.log(`✅ Seeded ${createdProjects.length} enterprise projects.`);

  // 4. Create Rich Issues across Projects
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const issuesData = [
    // Project 1: Unified Payments Engine
    {
      projectId: projPayments.id,
      reporterId: aarav.id,
      assigneeId: priya.id,
      title: 'Integrate UPI Intent deep links for iOS and Android',
      description: 'Support automatic app switching to GPay, PhonePe, and Paytm via standard UPI intent URL handlers.',
      status: 'DONE',
      priority: 'CRITICAL',
      tags: ['upi', 'mobile', 'payments'],
      createdAt: daysAgo(14),
      resolvedAt: daysAgo(5),
      dueDate: daysAgo(4),
      comments: [
        { userId: priya.id, content: 'Integrated native intent scheme. Tested successfully on iOS 17 and Android 14.' },
        { userId: aarav.id, content: 'Verified in staging sandbox. Zero drop-off rate.' },
      ],
    },
    {
      projectId: projPayments.id,
      reporterId: rohan.id,
      assigneeId: rohan.id,
      title: 'Implement webhook signature verification for Razorpay',
      description: 'Validate HMAC-SHA256 signatures on all incoming webhook payloads before processing charge events to prevent replay attacks.',
      status: 'DONE',
      priority: 'HIGH',
      tags: ['security', 'webhook', 'backend'],
      createdAt: daysAgo(10),
      resolvedAt: daysAgo(2),
      dueDate: daysAgo(1),
      comments: [
        { userId: neha.id, content: 'Pen-tested with spoofed signatures; unauthorized requests correctly rejected.' },
      ],
    },
    {
      projectId: projPayments.id,
      reporterId: priya.id,
      assigneeId: rohan.id,
      title: 'Build automated retry queue with exponential backoff for failed refunds',
      description: 'Utilize Redis bull queue to retry transient network failures during payment gateway refund reconciliation.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      tags: ['payments', 'redis', 'resilience'],
      createdAt: daysAgo(6),
      dueDate: daysFromNow(2),
      comments: [
        { userId: rohan.id, content: 'Configured max 5 retries with jitter. Adding telemetry metrics now.' },
      ],
    },
    {
      projectId: projPayments.id,
      reporterId: neha.id,
      assigneeId: priya.id,
      title: 'Add idempotency key headers on all checkout API requests',
      description: 'Prevent duplicate double-debit charges if user double-clicks the Pay button during high latency.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      tags: ['backend', 'idempotency', 'security'],
      createdAt: daysAgo(4),
      dueDate: daysFromNow(1),
    },
    {
      projectId: projPayments.id,
      reporterId: aarav.id,
      assigneeId: null,
      title: 'Design monthly reconciliation report export (CSV & Excel)',
      description: 'Enable finance team to export transaction logs with settlement timestamps, MDR charges, and net payout sums.',
      status: 'TODO',
      priority: 'MEDIUM',
      tags: ['reporting', 'finance', 'export'],
      createdAt: daysAgo(3),
      dueDate: daysFromNow(7),
    },
    {
      projectId: projPayments.id,
      reporterId: rohan.id,
      assigneeId: neha.id,
      title: 'Audit PCI-DSS compliance for card token storage',
      description: 'Verify token vaults comply with latest RBI guidelines for recurring card subscriptions.',
      status: 'TODO',
      priority: 'LOW',
      tags: ['compliance', 'security'],
      createdAt: daysAgo(2),
      dueDate: daysFromNow(10),
    },

    // Project 2: Customer Onboarding & KYC Pipeline
    {
      projectId: projKYC.id,
      reporterId: priya.id,
      assigneeId: ananya.id,
      title: 'Build responsive document capture UI with live glare detection',
      description: 'Webcam/mobile camera overlay that validates whether Aadhaar / PAN card is blurry or experiencing flash glare.',
      status: 'DONE',
      priority: 'HIGH',
      tags: ['frontend', 'ui', 'camera', 'kyc'],
      createdAt: daysAgo(12),
      resolvedAt: daysAgo(3),
      dueDate: daysAgo(2),
      comments: [
        { userId: ananya.id, content: 'Canvas-based edge detection and brightness normalization completed.' },
        { userId: pooja.id, content: 'User drop-off during photo upload dropped by 34%!' },
      ],
    },
    {
      projectId: projKYC.id,
      reporterId: aarav.id,
      assigneeId: priya.id,
      title: 'Integrate DigiLocker OAuth2 consent flow',
      description: 'Direct integration with DigiLocker API to securely fetch verified Aadhaar XML and driving license records.',
      status: 'DONE',
      priority: 'CRITICAL',
      tags: ['digilocker', 'oauth2', 'kyc'],
      createdAt: daysAgo(15),
      resolvedAt: daysAgo(6),
      dueDate: daysAgo(5),
    },
    {
      projectId: projKYC.id,
      reporterId: pooja.id,
      assigneeId: priya.id,
      title: 'Real-time face match liveness verification with selfie check',
      description: 'Compare selfie against ID photo using face embed models with blink & head-turn liveness detection.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      tags: ['ai', 'biometrics', 'security'],
      createdAt: daysAgo(5),
      dueDate: daysFromNow(3),
      comments: [
        { userId: priya.id, content: 'Achieved 99.4% confidence score on test benchmark dataset.' },
      ],
    },
    {
      projectId: projKYC.id,
      reporterId: ananya.id,
      assigneeId: ananya.id,
      title: 'Design multi-step onboarding progress stepper',
      description: 'Clean mobile-first stepper indicating Steps: Mobile OTP, Document Upload, Selfie, and Address Confirmation.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      tags: ['ui', 'ux', 'frontend'],
      createdAt: daysAgo(4),
      dueDate: daysFromNow(4),
    },
    {
      projectId: projKYC.id,
      reporterId: pooja.id,
      assigneeId: null,
      title: 'Implement automated PEP and sanctions list screening',
      description: 'Screen applicant names against global sanctions database before account approval.',
      status: 'TODO',
      priority: 'HIGH',
      tags: ['compliance', 'aml', 'risk'],
      createdAt: daysAgo(2),
      dueDate: daysFromNow(8),
    },
    {
      projectId: projKYC.id,
      reporterId: aarav.id,
      assigneeId: null,
      title: 'Dark mode styling enhancements for document preview modal',
      description: 'Polish border contrast and backdrop filters for dark charcoal theme.',
      status: 'TODO',
      priority: 'LOW',
      tags: ['frontend', 'styling'],
      createdAt: daysAgo(1),
      dueDate: daysFromNow(12),
    },

    // Project 3: Real-time Order & Delivery Logistics
    {
      projectId: projLogistics.id,
      reporterId: rohan.id,
      assigneeId: aditya.id,
      title: 'WebSocket heartbeat & auto-reconnect logic for delivery partner app',
      description: 'Handle tunnel drops gracefully with ping-pong frames and buffer unsent GPS packets when offline.',
      status: 'DONE',
      priority: 'CRITICAL',
      tags: ['websocket', 'mobile', 'logistics'],
      createdAt: daysAgo(11),
      resolvedAt: daysAgo(4),
      dueDate: daysAgo(3),
      comments: [
        { userId: aditya.id, content: 'Integrated SQLite buffer for storing location coordinates during tunnel dropouts.' },
      ],
    },
    {
      projectId: projLogistics.id,
      reporterId: aditya.id,
      assigneeId: rohan.id,
      title: 'Geofencing trigger when driver is within 200m of customer address',
      description: 'Fire push notification "Rider is arriving" using turf.js geospatial radius calculation.',
      status: 'DONE',
      priority: 'HIGH',
      tags: ['gis', 'geofencing', 'notifications'],
      createdAt: daysAgo(9),
      resolvedAt: daysAgo(1),
      dueDate: daysAgo(1),
    },
    {
      projectId: projLogistics.id,
      reporterId: rahul.id,
      assigneeId: aditya.id,
      title: 'Dynamic ETA algorithm taking live traffic speed into account',
      description: 'Compute arrival times dynamically by weighting historical road speed curves and peak hour congestion.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      tags: ['algorithm', 'eta', 'maps'],
      createdAt: daysAgo(5),
      dueDate: daysFromNow(3),
    },
    {
      projectId: projLogistics.id,
      reporterId: rohan.id,
      assigneeId: rahul.id,
      title: 'Batching algorithm for multi-order pickup from same restaurant hub',
      description: 'Cluster adjacent drop-off locations within a 1.5km radius to reduce total delivery fleet miles.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      tags: ['optimization', 'clustering', 'backend'],
      createdAt: daysAgo(3),
      dueDate: daysFromNow(5),
    },
    {
      projectId: projLogistics.id,
      reporterId: aditya.id,
      assigneeId: null,
      title: 'Battery optimization for continuous GPS background tracking',
      description: 'Switch between Significant-Motion API and high-accuracy GPS based on rider velocity.',
      status: 'TODO',
      priority: 'MEDIUM',
      tags: ['mobile', 'performance', 'battery'],
      createdAt: daysAgo(2),
      dueDate: daysFromNow(9),
    },

    // Project 4: Cloud Infrastructure & Zero-Trust Security
    {
      projectId: projInfra.id,
      reporterId: rahul.id,
      assigneeId: rahul.id,
      title: 'Setup automated Let’s Encrypt wildcard SSL certificate renewal',
      description: 'Deploy cert-manager with DNS01 Cloudflare challenge to renew *.trackflow.dev certs 30 days before expiration.',
      status: 'DONE',
      priority: 'CRITICAL',
      tags: ['ssl', 'kubernetes', 'devops'],
      createdAt: daysAgo(16),
      resolvedAt: daysAgo(7),
      dueDate: daysAgo(6),
    },
    {
      projectId: projInfra.id,
      reporterId: neha.id,
      assigneeId: neha.id,
      title: 'Configure Cloudflare Web Application Firewall (WAF) rate limiting',
      description: 'Block malicious IP ranges attempting brute force login attacks and API credential stuffing.',
      status: 'DONE',
      priority: 'HIGH',
      tags: ['waf', 'security', 'cloudflare'],
      createdAt: daysAgo(8),
      resolvedAt: daysAgo(2),
      dueDate: daysAgo(1),
    },
    {
      projectId: projInfra.id,
      reporterId: rahul.id,
      assigneeId: rohan.id,
      title: 'Migrate PostgreSQL connection pool to PgBouncer',
      description: 'Reduce connection memory overhead and handle spike traffic up to 5,000 concurrent client queries.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      tags: ['postgres', 'database', 'performance'],
      createdAt: daysAgo(4),
      dueDate: daysFromNow(2),
    },
    {
      projectId: projInfra.id,
      reporterId: neha.id,
      assigneeId: rahul.id,
      title: 'Implement HashiCorp Vault for dynamic database credentials rotation',
      description: 'Replace static .env secrets with ephemeral JWT-backed short-lived lease tokens.',
      status: 'TODO',
      priority: 'MEDIUM',
      tags: ['vault', 'security', 'infrastructure'],
      createdAt: daysAgo(2),
      dueDate: daysFromNow(6),
    },
  ];

  for (const issueItem of issuesData) {
    const createdIssue = await prisma.issue.create({
      data: {
        projectId: issueItem.projectId,
        reporterId: issueItem.reporterId,
        assigneeId: issueItem.assigneeId,
        title: issueItem.title,
        description: issueItem.description,
        status: issueItem.status,
        priority: issueItem.priority,
        tags: issueItem.tags,
        createdAt: issueItem.createdAt || new Date(),
        resolvedAt: issueItem.resolvedAt || null,
        dueDate: issueItem.dueDate || null,
      },
    });

    // Create comments if present
    if (issueItem.comments && issueItem.comments.length > 0) {
      for (const c of issueItem.comments) {
        await prisma.comment.create({
          data: {
            issueId: createdIssue.id,
            userId: c.userId,
            content: c.content,
          },
        });
      }
    }

    // Create corresponding Activity Logs
    await prisma.activityLog.create({
      data: {
        projectId: issueItem.projectId,
        userId: issueItem.reporterId,
        action: 'CREATED_ISSUE',
        entityType: 'ISSUE',
        entityId: createdIssue.id,
        metadata: {
          title: issueItem.title,
          status: issueItem.status,
          priority: issueItem.priority,
        },
        createdAt: issueItem.createdAt || new Date(),
      },
    });

    if (issueItem.status === 'DONE') {
      await prisma.activityLog.create({
        data: {
          projectId: issueItem.projectId,
          userId: issueItem.assigneeId || issueItem.reporterId,
          action: 'STATUS_CHANGED',
          entityType: 'ISSUE',
          entityId: createdIssue.id,
          metadata: {
            title: issueItem.title,
            from: 'IN_PROGRESS',
            to: 'DONE',
          },
          createdAt: issueItem.resolvedAt || new Date(),
        },
      });
    }
  }

  console.log(`✅ Seeded ${issuesData.length} issues with comments, tags, and activity logs.`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
