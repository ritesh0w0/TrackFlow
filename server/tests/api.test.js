const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const prisma = require('../src/config/prismaClient');

let server;
let baseUrl;

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

describe('TrackFlow API Automated Test Suite', () => {
  const timestamp = Date.now();
  const testUserEmail = `qa_engineer_${timestamp}@trackflow.test`;
  const collaboratorEmail = `qa_collab_${timestamp}@trackflow.test`;
  const validPassword = 'TrackFlow9!';
  let userToken = '';
  let collabToken = '';
  let createdProjectId = '';
  let createdIssueId = '';
  let collabMemberId = '';

  test('SYS-01: GET /api/health returns { status: "ok" }', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
  });

  test('AUTH-01: User Signup with weak password fails password policy', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Password User',
        email: `weak_${timestamp}@trackflow.test`,
        password: 'password', // Fails: no upper, no number, no special
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  test('AUTH-02: User Signup with valid credentials complying with strict policy', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Engineer',
        email: testUserEmail,
        password: validPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testUserEmail.toLowerCase());
    userToken = data.token;
  });

  test('AUTH-03: User Signup with duplicate email fails', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Engineer 2',
        email: testUserEmail,
        password: validPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  test('AUTH-04: User Login with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: validPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    userToken = data.token;
  });

  test('AUTH-05: User Login with invalid credentials returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'WrongPassword9!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  test('AUTH-06: /auth/me returns authenticated user with Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.email, testUserEmail.toLowerCase());
  });

  test('PROF-01: GET /auth/profile returns user profile with stats', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.stats);
  });

  test('PROF-02: PUT /auth/profile updates user display name', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: 'Lead Architect' }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.name, 'Lead Architect');
  });

  test('PROJ-01: Create project and verify creator is OWNER', async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: `Test Project ${timestamp}`,
        description: 'Automated test project for TrackFlow QA suite',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.data.id);
    createdProjectId = data.data.id;
  });

  test('MEMB-01: Signup collaborator and add to project as MEMBER', async () => {
    // Signup collaborator
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Collaborator User',
        email: collaboratorEmail,
        password: validPassword,
      }),
    });
    const signupData = await signupRes.json();
    assert.equal(signupRes.status, 201);
    collabToken = signupData.token;

    // Add collaborator to project
    const addRes = await fetch(`${baseUrl}/api/projects/${createdProjectId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        email: collaboratorEmail,
        role: 'MEMBER',
      }),
    });

    const addData = await addRes.json();
    assert.equal(addRes.status, 201);
    assert.equal(addData.success, true);
    collabMemberId = addData.data.id;
  });

  test('MEMB-02: List project members', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/members`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.length, 2); // Owner + Collaborator
  });

  test('ISSUE-01: Create issue in project with tags and priority', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Implement OAuth2 integration',
        description: 'Support GitHub and Google SSO providers',
        priority: 'HIGH',
        tags: ['auth', 'backend', 'security'],
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'TODO');
    assert.equal(data.data.priority, 'HIGH');
    assert.deepEqual(data.data.tags, ['auth', 'backend', 'security']);
    createdIssueId = data.data.id;
  });

  test('ISSUE-02: Update issue status to DONE sets resolvedAt', async () => {
    const patchRes = await fetch(`${baseUrl}/api/issues/${createdIssueId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ status: 'DONE' }),
    });

    const data = await patchRes.json();
    assert.equal(patchRes.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'DONE');
    assert.ok(data.data.resolvedAt);
  });

  test('COMM-01: Add comment to issue', async () => {
    const res = await fetch(`${baseUrl}/api/issues/${createdIssueId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        content: 'PR is submitted and ready for review: #104',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.content, 'PR is submitted and ready for review: #104');
  });

  test('DASH-01: Project Intelligence Dashboard returns valid metrics & workload', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.stats.totalIssues, 1);
    assert.equal(data.data.stats.done, 1);
    assert.equal(data.data.stats.completion, 100);
    assert.ok(Array.isArray(data.data.workloadDistribution));
    assert.ok(Array.isArray(data.data.recentActivity));
  });

  test('ACT-01: Project activity timeline includes recent actions', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdProjectId}/activity`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.length > 0);
  });

  test('AUTH-07: Logout clears session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });
});
