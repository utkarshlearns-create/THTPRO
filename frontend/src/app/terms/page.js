import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — The Home Tuitions',
  description: 'Terms of Service for The Home Tuitions (THTPRO). Read the terms and conditions for using our tutoring platform.',
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-indigo-300 hover:text-white text-sm mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-indigo-200">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">

          <p className="text-slate-600 leading-relaxed mb-10">
            Welcome to The Home Tuitions ("THT", "THTPRO"). By accessing or using our platform at{' '}
            <strong>thehometuitions.com</strong>, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our platform.
            These terms constitute a legally binding agreement between you and The Home Tuitions,
            Verma Complex 1st floor, A-mart Chauraha near Bal Nikunj School, Madiyaon, Lucknow, U.P., India.
          </p>

          <Section title="1. Eligibility">
            <p>You must be at least 18 years of age to create an account on our platform. Parents may register on behalf of their children for tutoring purposes. By using our platform, you confirm that all information you provide is accurate and complete.</p>
          </Section>

          <Section title="2. User Roles and Accounts">
            <p>Our platform supports the following roles:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Parent/Student:</strong> Can post tutoring requirements and hire tutors</li>
              <li><strong>Teacher/Tutor:</strong> Can create a profile, apply for jobs, and offer tutoring services</li>
              <li><strong>Institution:</strong> Can post bulk teaching requirements for schools or coaching centers</li>
            </ul>
            <p className="mt-3">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </Section>

          <Section title="3. Tutor Verification and KYC">
            <p>
              Tutors are required to complete a KYC (Know Your Customer) process before being listed as verified.
              This includes submitting Aadhaar card, educational certificates, and a photograph.
              THT reserves the right to reject or suspend any tutor profile that fails verification or violates our standards.
            </p>
            <p className="mt-3">
              Verified status does not constitute an endorsement by THT. Parents are advised to exercise their own
              judgment when selecting a tutor and supervise initial sessions.
            </p>
          </Section>

          <Section title="4. Demo Classes">
            <p>
              THT facilitates a free demo class between the matched tutor and the parent/student.
              The demo class is an opportunity to assess the tutor's teaching style before committing.
              THT is not responsible for the quality or outcome of any demo or regular classes conducted.
            </p>
          </Section>

          <Section title="5. Payments and Fees">
            <ul className="list-disc pl-6 space-y-2">
              <li>Tuition fees are agreed directly between the parent and tutor</li>
              <li>THT may charge a platform fee for certain services — this will be communicated clearly before payment</li>
              <li>All payments through our platform are processed securely via Razorpay</li>
              <li>THT does not store your payment card details</li>
              <li>Refund requests must be raised within 7 days of payment by contacting support</li>
              <li>THT is not responsible for any financial disputes between parents and tutors that occur outside the platform</li>
            </ul>
          </Section>

          <Section title="6. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide false information during registration or KYC</li>
              <li>Contact or solicit other users outside the platform to bypass THT's services</li>
              <li>Harass, abuse, or threaten any other user</li>
              <li>Post fake reviews or manipulate the rating system</li>
              <li>Use our platform for any illegal activity</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape, copy, or reproduce content from our platform without permission</li>
            </ul>
            <p className="mt-3">Violation of these terms may result in immediate suspension or termination of your account.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on our platform — including the THTPRO name, logo, design, software, and text — is
              the property of The Home Tuitions and is protected under applicable intellectual property laws.
              You may not use, reproduce, or distribute our content without prior written permission.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              THT is a platform that connects parents/students with tutors. We do not employ tutors and are
              not responsible for the actions, behavior, or performance of any tutor or parent on our platform.
            </p>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, THT shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of our platform,
              including but not limited to loss of data, loss of revenue, or personal injury.
            </p>
          </Section>

          <Section title="9. Dispute Resolution">
            <p>
              Any dispute between a parent and a tutor should first be attempted to be resolved by contacting
              THT support at{' '}
              <a href="mailto:support@thehometuitions.in" className="text-indigo-600 hover:underline">
                support@thehometuitions.in
              </a>.
              THT will make reasonable efforts to mediate but is not obligated to resolve disputes between users.
            </p>
            <p className="mt-3">
              Any legal disputes arising out of these Terms shall be subject to the exclusive jurisdiction
              of the courts in Lucknow, Uttar Pradesh, India, and shall be governed by Indian law.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              THT reserves the right to suspend or terminate your account at any time for violation of these
              Terms or for any conduct we deem harmful to the platform or its users.
              You may also delete your account at any time by contacting our support team.
            </p>
          </Section>

          <Section title="11. Changes to Terms">
            <p>
              We may update these Terms of Service from time to time. Continued use of our platform after
              changes are posted constitutes acceptance of the updated terms. We will notify registered users
              of material changes via email or platform notification.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions regarding these Terms, contact us:</p>
            <div className="mt-4 p-6 bg-slate-50 rounded-xl">
              <p><strong>The Home Tuitions</strong></p>
              <p>Verma Complex 1st floor, A-mart Chauraha</p>
              <p>Near Bal Nikunj School, Madiyaon</p>
              <p>Lucknow, Uttar Pradesh — India</p>
              <p className="mt-3">
                Email:{' '}
                <a href="mailto:support@thehometuitions.in" className="text-indigo-600 hover:underline">
                  support@thehometuitions.in
                </a>
              </p>
              <p>Phone: <a href="tel:+916387488141" className="text-indigo-600 hover:underline">+91 6387488141</a></p>
            </div>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© 2026 The Home Tuitions. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
