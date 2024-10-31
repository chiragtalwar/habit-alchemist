Habit Alchemist Technical Specification
Project Overview
Habit Alchemist is a habit-tracking SaaS with team-based functionality. Key features include real-time habit tracking, teammate pairing, points-based milestones, and Google OAuth integration.

## Core User Flow
1. User1 (Team Creator):
   - Logs in with Google OAuth
   - Selects habits they want to track
   - Generates an invite link
   - Shares the link with their potential teammate

2. User2 (Team Joiner):
   - Clicks the invite link
   - Logs in with Google OAuth (if not already logged in)
   - Reviews and accepts the habits selected by User1
   - Team is formed automatically

3. Team Dashboard:
   - Both users are redirected to the team dashboard
   - Can see each other's progress
   - Track habits together
   - Earn points and complete journey milestones

1. Setup and Environment Configuration
1.1 Development Environment
Installations:

Cursor (main development IDE).
Supabase CLI: For managing the database.
Frontend Framework: React (with Webpack/Bundler).
Authentication: Google OAuth with Supabase Auth.
Backend Runtime: Node.js with Express.js if backend customization is needed.
Local URL Tunnel:

Use ngrok to tunnel localhost so Google OAuth callbacks can function properly in local development. Configure ngrok to use a consistent URL.
1.2 Supabase Configuration
Create Tables:
Use the SQL provided to create the tables in Supabase, adding the suggested modifications below for team tracking and invite management.
Google OAuth:
In Supabase’s Auth settings, configure Google OAuth. Specify the ngrok-tunneled URL for the callback during local development.
Environment Variables:
Set up .env with Supabase credentials and Google OAuth keys.
Example:
plaintext
Copy code
SUPABASE_URL=<Your Supabase URL>
SUPABASE_ANON_KEY=<Supabase Anon Key>
GOOGLE_CLIENT_ID=<Google Client ID>
GOOGLE_CLIENT_SECRET=<Google Client Secret>
2. Database Schema Adjustments and Enhancements
2.1 Updated Table Structure (SQL Modifications)
Include the following changes in Supabase to enhance functionality and ensure smooth team formation with invite links.

sql
Copy code
-- Additional Fields for Enhanced Functionality

-- Habits Table Modification
alter table public.habits add column category text, add column is_public boolean default false;

-- Teammates Table Enhancement
alter table public.teammates drop column user1_ready, drop column user2_ready;
alter table public.teammates add column ready_status jsonb default '{"user1": false, "user2": false}';

-- Team Journeys Enhancement
alter table public.team_journeys add column end_date timestamptz, add column status text default 'active';

-- Invite Links Enhancement
alter table public.invite_links add column is_active boolean default true;
3. Backend API and Services
3.1 Authentication Flow (Google OAuth)
Redirect Logic:

On first login, redirect to a profile setup page; on subsequent logins, check the user's teammates table entry and route accordingly.
Session Management:

Store the JWT and user ID in cookies for seamless API authentication. Ensure cookies are accessible across incognito and normal tabs to handle multiple sessions.
API Endpoints:

POST /auth/login: For Google OAuth; initiates the Google login.
GET /auth/redirect: Redirect callback URL for Google.
3.2 Invite Link System
Invite Link Generation:

When a user wants to invite a teammate, generate a unique invite code, store it in invite_links, and mark it is_active.
Link Validation and Joining Flow:

Issue: If the invite link fails in incognito, check for storage and validity across sessions.
Solution:
Set SameSite=None on cookies for cross-session linking.
Validate the invite link for is_active and expires_at before creating the teammate record.
API Endpoints:

POST /invite/generate: Generates a unique invite link and stores it.
POST /invite/join: Validates invite link. If valid, links the user to an existing team and updates teammates.
Sample Invite Flow Pseudocode:

javascript
Copy code
// Invite Link Generation
async function generateInvite(userId) {
  const inviteCode = generateUniqueCode(); // generate a unique code
  await supabase.from('invite_links').insert({
    user_id: userId,
    invite_code: inviteCode,
    expires_at: getExpirationDate(),
    is_active: true
  });
  return `${FRONTEND_URL}/invite/${inviteCode}`;
}

// Join Team Using Invite Link
async function joinTeam(inviteCode, joiningUserId) {
  const inviteLink = await supabase.from('invite_links')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('is_active', true)
    .single();
  if (inviteLink && isNotExpired(inviteLink.expires_at)) {
    await createOrUpdateTeammate(inviteLink.user_id, joiningUserId);
  } else {
    throw new Error("Invite link expired or invalid.");
  }
}
4. Real-Time Data Updates
4.1 WebSocket Setup for Cursor
Event Triggers:

Use WebSockets or Supabase’s real-time features to listen to habit completions and team status updates.
Subscription Events:

Habit Completion: Notify the team when a habit is completed.
Ready Status: Change on teammates table update.
Frontend Listener Example:

javascript
Copy code
// Frontend listener for teammate progress updates
supabase.channel('team_updates').on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'habit_completions',
}, payload => {
  updateUIWithRealTimeProgress(payload.new);
}).subscribe();
5. Frontend Implementation
5.1 UI/UX Components: With shadcn/ui, we can use their CLI to add components.
Dashboard:

Create a dual calendar view with habit tracking.
Use React state hooks for daily habit tracking, streaks, and journey milestones.
Progress Effects:

Incorporate animations for habit completions and level-ups.
Example: Progress Mountain climbing animation on team journey completion milestones.
5.2 Teammate and Team Journey Flow
Journey Start Screen:
Once both teammates are marked ready in teammates.ready_status, redirect to the journey start screen.
Points System:
Implement points and levels on both front and backend, awarding Ambrosia Points for completions, streaks, and team syncs.
6. Testing and Deployment
6.1 Testing Strategy
Unit Tests:

Test invite link validation, user login, and teammate pairing.
Integration Tests:

Validate real-time updates on habit completions.
Simulate journeys with various user progress levels to ensure accuracy.
Acceptance Testing:

Use two different browser sessions to test the full journey, ensuring seamless team formation and journey tracking.
6.2 Deployment
Frontend and Backend Hosting:

Consider Vercel for frontend and Heroku or Digital Ocean for backend. Ensure WebSockets are supported.
Environment Variable Management:

Store environment variables securely using Cursor’s or host’s built-in env settings.