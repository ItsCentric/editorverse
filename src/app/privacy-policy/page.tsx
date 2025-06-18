export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-prose space-y-6 p-6">
      <h1 className="text-2xl font-bold">Privacy Policy for Editorverse</h1>
      <p>
        <strong>Effective Date:</strong> 6/18/2025
      </p>

      <section>
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <ul className="list-inside list-disc">
          <li>
            <strong>Account Information:</strong> Email address and hashed
            password
          </li>
          <li>
            <strong>OAuth Data:</strong> Information from Google OAuth (Apple
            OAuth may be added later)
          </li>
          <li>
            <strong>Session Information:</strong> IP address, browser/user agent
          </li>
          <li>
            <strong>User Content:</strong> Uploaded videos and optional profile
            images
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          2. How We Use Your Information
        </h2>
        <p>
          We use your data to authenticate users, deliver features, and improve
          the platform. Data access and deletion tools are planned.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          3. Cookies and Tracking Technologies
        </h2>
        <p>
          We use cookies for sessions and security. No third-party or
          advertising cookies are used at this time.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Legal Basis for Processing</h2>
        <p>
          Applies to users in the EU/UK: we process data with your consent or
          for legitimate interests like security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5. Your Rights</h2>
        <p>
          You will have access, correction, and deletion rights in future
          versions of the platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">6. Data Retention</h2>
        <p>
          We retain data as long as necessary to provide services.
          Account/content deletion will be supported.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Data Storage and Security</h2>
        <p>
          We use NeonDB for user data and Backblaze B2 for file storage, with
          encryption and access controls in place.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
        <p>
          We use Better Auth for login, Google OAuth is supported, and Apple
          OAuth may be added.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">9. Children’s Privacy</h2>
        <p>Users must be at least 13 years old.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
        <p>
          We may update this policy and notify users of significant changes.
        </p>
      </section>
    </div>
  );
}
