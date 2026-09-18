import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy — Competitive Vibing',
  description: 'What Competitive Vibing collects, why, who processes it, and how to delete it.',
};

const CONTACT = <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">{LEGAL.contactEmail}</a>;

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl pb-16">
      <PageHeader
        title="Privacy Policy"
        description={`Last updated ${LEGAL.updated}. Written to be read, not skimmed past.`}
      />

      <div className="prose mt-8 max-w-none text-[17px] leading-relaxed text-foreground dark:prose-invert prose-headings:font-semibold prose-headings:tracking-title prose-h2:mt-10 prose-h2:text-[22px] prose-p:my-4 prose-li:my-1.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold">
        <h2>The short version</h2>
        <p>
          {LEGAL.appName} stores your Google name, email address and profile photo so you can
          sign in and keep your progress, and it stores the explanations you write so it can
          grade them and show you your history. It sends your explanation text — never your
          name or email — to an AI provider to produce the grade. There is no advertising, no
          analytics tracker, and nothing is sold. You can delete everything yourself from your
          Profile page at any time.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details from Google:</strong> your name, email address and profile
            photo URL. Collected when you sign in with Google. Used to identify your account
            and show your avatar.
          </li>
          <li>
            <strong>Your explanations:</strong> the text you submit for evaluation, your
            answers to follow-up interview questions, and the AI’s responses (verdicts,
            scores, commentary, counterexamples). Used to grade your approach, show your
            history, and compute your progress.
          </li>
          <li>
            <strong>Progress and preferences:</strong> which problems you have attempted and
            solved, derived XP, level, streak and badges, and whether you have opted in to the
            public leaderboard.
          </li>
          <li>
            <strong>Technical data:</strong> a session cookie so you stay signed in, and a
            local-storage entry that remembers your light or dark appearance. Our hosting
            provider keeps standard server logs (IP address, request path, timestamp) for a
            short period for security and debugging.
          </li>
        </ul>
        <p>
          We do not collect payment details, location, contacts, device identifiers, or
          anything from your Google account beyond the three items above.
        </p>

        <h2>How we use it</h2>
        <ul>
          <li>To sign you in and keep you signed in.</li>
          <li>To grade your explanations and stream the result back to you.</li>
          <li>To show your history, progress, streaks and badges.</li>
          <li>To rank you on the leaderboard, only if you turn that on.</li>
          <li>To enforce the fair-use limit of ten AI evaluations per hour per account.</li>
          <li>To keep the service secure and fix problems.</li>
        </ul>
        <p>We do not use your data for advertising, profiling, or training AI models.</p>

        <h2>Who processes it</h2>
        <p>Four providers handle data on our behalf. Each receives only what its job needs.</p>
        <ul>
          <li>
            <strong>Google</strong> (sign-in). You authenticate with Google; Google tells us your
            name, email and photo. Governed by Google’s own privacy policy.
          </li>
          <li>
            <strong>Supabase</strong> (database). Stores your account, explanations, evaluations
            and progress, with row-level security so only your account can read your rows.
          </li>
          <li>
            <strong>Groq</strong> (AI grading). Receives the problem statement and the text of
            your explanation or interview answer, and returns the grade. It never receives
            your name, email or any identifier. Groq does not use API inputs to train models.
          </li>
          <li>
            <strong>Vercel</strong> (hosting). Serves the website and keeps short-lived server
            logs.
          </li>
        </ul>
        <p>
          These providers may store data outside {LEGAL.operatorLocation}. Where they do, we
          rely on their contractual commitments to handle it to a standard at least equivalent
          to the Australian Privacy Principles.
        </p>

        <h2>Who can see it</h2>
        <p>
          Your explanations, evaluations and history are private to you. The only thing other
          users can ever see is the leaderboard, and only if you opt in: your name, photo, XP,
          level and solved count. Turn it off in your Profile at any time and you disappear
          from the leaderboard immediately.
        </p>
        <p>We never sell personal information and never share it with third parties for their own use.</p>

        <h2>How long we keep it</h2>
        <p>
          Until you delete your account. Deleting it removes your account details, every
          explanation and evaluation, and your progress, immediately and permanently. Server
          logs at our hosting provider expire on their own within days. Encrypted database
          backups may hold a copy for up to 30 days after deletion before they roll off.
        </p>

        <h2>Your rights</h2>
        <ul>
          <li>
            <strong>Access and export:</strong> your History page shows every evaluation. Email
            us for a full copy of your data.
          </li>
          <li>
            <strong>Correction:</strong> your name and photo come from Google; change them
            there and they update here at your next sign-in.
          </li>
          <li>
            <strong>Deletion:</strong> Profile → Account → Delete account. No email required.
          </li>
          <li>
            <strong>Complaints:</strong> email us first at {CONTACT}. If you are in Australia
            and are not satisfied with our response, you can complain to the Office of the
            Australian Information Commissioner (OAIC).
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          One cookie: the sign-in session, which is essential and holds no tracking
          information. Your appearance preference is stored in your browser’s local storage,
          not a cookie. There are no advertising or analytics cookies.
        </p>

        <h2>Children</h2>
        <p>
          The service is intended for people preparing for technical interviews and is not
          directed at children under 13. We do not knowingly collect their data; if you believe
          a child has created an account, email us and we will delete it.
        </p>

        <h2>Security</h2>
        <p>
          Everything travels over HTTPS. Database access is restricted per user by row-level
          security. AI-provider requests strip anything that could identify you. Secrets are
          held in environment configuration, never in code. No system is perfectly secure; if
          we learn of a breach affecting your data we will tell you.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes in a way that matters, we will update the date at the top
          and, for significant changes, tell you in the app before they take effect.
        </p>

        <h2>Contact</h2>
        <p>
          {CONTACT}. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </div>
    </article>
  );
}
