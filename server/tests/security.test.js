const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prismaClient');
const { getJwtSecret } = require('../src/config/jwt');

let server;
let baseUrl;

const ts = Date.now();
const validPass = 'TrackFlow9!';

let ownerToken = '';
let adminToken = '';
let memberToken = '';
let outsiderToken = '';

let projectId = '';
let adminMemberId = '';
let memberMemberId = '';

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

describe('SEC-01 & SEC-03: Security & RBAC Privilege Escalation Suite', () => {
  // Setup users and project
  test('SETUP: Register Owner, Admin, Member, and Outsider', async () => {
    // 1. Owner
    const ownerRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Owner User', email: `owner_${ts}@sec.test`, password: validPass }),
    });
    const ownerData = await ownerRes.json();
    if (ownerRes.status !== 201) {
      console.error('Owner signup failed:', ownerRes.status, ownerData);
    }
    assert.equal(ownerRes.status, 201);
    ownerToken = ownerData.token;

    // 2. Admin candidate
    const adminRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin User', email: `admin_${ts}@sec.test`, password: validPass }),
    });
    const adminData = await adminRes.json();
    assert.equal(adminRes.status, 201);
    adminToken = adminData.token;

    // 3. Regular Member candidate
    const memberRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Member User', email: `member_${ts}@sec.test`, password: validPass }),
    });
    const memberData = await memberRes.json();
    assert.equal(memberRes.status, 201);
    memberToken = memberData.token;

    // 4. Outsider
    const outsiderRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Outsider User', email: `outsider_${ts}@sec.test`, password: validPass }),
    });
    const outsiderData = await outsiderRes.json();
    assert.equal(outsiderRes.status, 201);
    outsiderToken = outsiderData.token;

    // 5. Create project as Owner
    const projRes = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ title: `Security Test Project ${ts}`, description: 'Testing RBAC' }),
    });
    const projData = await projRes.json();
    assert.equal(projRes.status, 201);
    projectId = projData.data.id;

    // 6. Add Admin to project
    const addAdminRes = await fetch(`${baseUrl}/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ email: `admin_${ts}@sec.test`, role: 'ADMIN' }),
    });
    const addAdminData = await addAdminRes.json();
    assert.equal(addAdminRes.status, 201);
    adminMemberId = addAdminData.data.id;

    // 7. Add Member to project
    const addMemberRes = await fetch(`${baseUrl}/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ email: `member_${ts}@sec.test`, role: 'MEMBER' }),
    });
    const addMemberData = await addMemberRes.json();
    assert.equal(addMemberRes.status, 201);
    memberMemberId = addMemberData.data.id;
  });

  test('SEC-01.1: ADMIN attempts to promote MEMBER to OWNER returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'OWNER' }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
    assert.match(data.message, /Only the project OWNER can transfer ownership/i);
  });

  test('SEC-01.2: ADMIN attempts to promote themselves to OWNER returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${adminMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'OWNER' }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
    assert.match(data.message, /Only the project OWNER can transfer ownership/i);
  });

  test('SEC-01.3: MEMBER attempts to modify another member role returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${adminMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
      body: JSON.stringify({ role: 'MEMBER' }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
    assert.match(data.message, /Only project OWNER or ADMIN can update member roles/i);
  });

  test('SEC-01.4: MEMBER attempts to promote themselves to ADMIN returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
  });

  test('SEC-01.5: Non-member attempts to update membership returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${outsiderToken}` },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const data = await res.json();
    assert.equal(res.status, 403);
  });

  test('SEC-01.6: Invalid membership ID returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/00000000-0000-0000-0000-000000000000`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    assert.equal(res.status, 404);
  });

  test('SEC-01.7: Invalid role value returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ role: 'SUPERUSER' }),
    });
    assert.equal(res.status, 400);
  });

  test('SEC-01.8: OWNER promotes MEMBER to ADMIN successfully', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.role, 'ADMIN');
  });

  test('SEC-01.9: OWNER demotes ADMIN to MEMBER successfully', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ role: 'MEMBER' }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.role, 'MEMBER');
  });

  test('SEC-01.10: OWNER transfers ownership atomically (former owner becomes ADMIN, new owner becomes OWNER)', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${adminMemberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ role: 'OWNER' }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.role, 'OWNER');

    // Verify DB state: adminMember is now OWNER
    const newOwnerMember = await prisma.projectMember.findUnique({ where: { id: adminMemberId } });
    assert.equal(newOwnerMember.role, 'OWNER');

    // Verify former owner is now ADMIN
    const members = await prisma.projectMember.findMany({ where: { projectId } });
    const formerOwner = members.find((m) => m.role === 'ADMIN' && m.id !== memberMemberId);
    assert.ok(formerOwner, 'Former owner was demoted to ADMIN');
  });

  test('SEC-03.1: Token signed with incorrect secret is rejected with 401', async () => {
    const forgedToken = jwt.sign({ id: 'fake-id', email: 'fake@sec.test' }, 'wrong_secret_1234567890', { expiresIn: '1h' });
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(res.status, 401);
  });

  test('SEC-03.2: Expired token is rejected with 401', async () => {
    const expiredToken = jwt.sign({ id: 'fake-id', email: 'fake@sec.test' }, getJwtSecret(), { expiresIn: '-1s' });
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(res.status, 401);
  });

  test('SEC-03.3: Valid token returns authenticated user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.user.email);
  });
});

describe('TEST-01: Negative Authorization & Resource Protection Suite', () => {
  let issueId = '';
  let commentId = '';

  test('SETUP: Create test issue and comment for negative authorization tests', async () => {
    // Admin (now owner) creates issue
    const issueRes = await fetch(`${baseUrl}/api/projects/${projectId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Authorization Test Issue',
        description: 'Testing forbidden actions',
        priority: 'MEDIUM',
      }),
    });
    const issueData = await issueRes.json();
    assert.equal(issueRes.status, 201);
    issueId = issueData.data.id;

    // Member creates comment
    const commentRes = await fetch(`${baseUrl}/api/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
      body: JSON.stringify({ content: 'Member comment for testing' }),
    });
    const commentData = await commentRes.json();
    assert.equal(commentRes.status, 201);
    commentId = commentData.data.id;
  });

  test('TEST-01.1: Non-member reading project details returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.2: Non-member reading project issues returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/issues`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.3: Non-member reading project dashboard returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/dashboard`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.4: Non-member reading project activity returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/activity`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.5: Non-member creating issue in project returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${outsiderToken}` },
      body: JSON.stringify({ title: 'Illegal Issue', priority: 'LOW' }),
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.6: Non-member reading issue comments returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/issues/${issueId}/comments`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.7: Regular MEMBER attempting to delete project returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.8: Regular MEMBER attempting to delete issue returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/issues/${issueId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.9: Non-author (even OWNER/ADMIN) attempting to edit comment returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ content: 'Attempted unauthorized edit' }),
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.10: Non-author attempting to delete comment returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(res.status, 403);
  });

  test('TEST-01.11: Non-existent project ID returns 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/projects/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 404);
  });
});

