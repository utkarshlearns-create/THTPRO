import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — The Home Tuitions',
  description: 'Privacy Policy for The Home Tuitions (THTPRO). Learn how we collect, use, and protect your personal information.',
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-indigo-300 hover:text-white text-sm mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-indigo-200">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">

          <p className="text-slate-600 leading-relaxed mb-10">
            The Home Tuitions ("THT", "THTPRO", "we", "our", or "us") is operated by The Home Tuitions,
            Verma Complex 1st floor, A-mart Chauraha near Bal Nikunj School, Madiyaon, Lucknow, Uttar Pradesh, India.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            visit our website <strong>thehometuitions.com</strong> and use our platform. Please read this policy carefully.
            By using our services, you agree to the terms described here.
          </p>

          <Section title="1. Information We Collect">
            <p><strong>Personal Information you provide:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Name, email address, phone number, and password when you register</li>
              <li>Your role — Parent, Student, Teacher, or Institution</li>
              <li>Address and locality for tutor-matching purposes</li>
              <li>Academic details — subjects, class grade, board of study</li>
              <li>For tutors: educational qualifications, teaching experience, and KYC documents (Aadhaar card, education certificates, photograph)</li>
              <li>Payment information processed through Razorpay (we do not store card details)</li>
            </ul>
            <p className="mt-4"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>IP address, browser type, device information</li>
              <li>Pages visited, time spent, and interactions on our platform</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your account</li>
              <li>To match parents and students with suitable tutors</li>
              <li>To verify tutor identity and qualifications (KYC)</li>
              <li>To process payments and maintain transaction records</li>
              <li>To send notifications about job applications, hiring status, and platform updates</li>
              <li>To improve our platform and develop new features</li>
              <li>To comply with legal obligations under Indian law</li>
              <li>To prevent fraud and ensure platform safety</li>
            </ul>
          </Section>

          <Section title="3. KYC Documents and Sensitive Information">
            <p>
              Tutors are required to submit KYC documents including Aadhaar card, educational certificates, and
              a photograph. This information is considered Sensitive Personal Data or Information (SPDI) under the
              Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or
              Information) Rules, 2011.
            </p>
            <p className="mt-3">
              KYC documents are stored securely on Cloudinary with restricted access. They are accessible only
              to the tutor themselves and authorized THT admin staff for verification purposes. These documents
              are never shared with parents or third parties.
            </p>
          </Section>

          <Section title="4. Sharing of Information">
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Tutors and Parents:</strong> Limited profile information is shared to facilitate matches (e.g., tutor name, subjects, locality — but not contact details until a connection is made)</li>
              <li><strong>Service Providers:</strong> Cloudinary (file storage), Razorpay (payments), Google (authentication), MSG91 (SMS OTP)</li>
              <li><strong>Legal Authorities:</strong> When required by law, court order, or government regulation</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              services. KYC documents are retained for a minimum of 3 years as required by applicable law.
              You may request deletion of your account by contacting us at{' '}
              <a href="mailto:support@thehometuitions.in" className="text-indigo-600 hover:underline">
                support@thehometuitions.in
              </a>.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use cookies and similar technologies to maintain your login session, remember your preferences,
              and analyze platform usage. You can control cookie settings through your browser, but disabling
              cookies may affect platform functionality.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We implement industry-standard security measures including HTTPS encryption, JWT-based authentication,
              bcrypt password hashing, and rate limiting on sensitive endpoints. However, no method of transmission
              over the internet is 100% secure and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Under applicable Indian law, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing (where consent is the basis)</li>
              <li>Lodge a complaint with the relevant authority</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@thehometuitions.in" className="text-indigo-600 hover:underline">
                support@thehometuitions.in
              </a>.
            </p>
          </Section>

          <Section title="9. Third-Party Links">
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the privacy
              practices of those sites and encourage you to read their privacy policies.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              Our platform is not directed at children under 13. Parents may create accounts on behalf of their
              children for tutoring purposes. We do not knowingly collect personal information directly from
              children under 13 without parental consent.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              by posting the new policy on this page with an updated date. Continued use of our platform after
              changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
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
