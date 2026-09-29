// Imprint (Impressum) and privacy policy (Datenschutzerklärung): the legal
// information required for German websites. Hardcoded here rather than in
// Sanity, since it rarely changes and must stay correct. Both languages have
// the same sections in the same order. The footer links to the privacy
// policy via the id of its title (#privacy).

import type { Metadata } from 'next';
import Image from 'next/image';
import { toLocale, type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

type ImprintSection = { heading: string; body: React.ReactNode };

const TITLE = { en: 'Imprint', de: 'Impressum' };
const PRIVACY_TITLE = { en: 'Privacy Policy', de: 'Datenschutzerklärung' };


function Address({ country }: { country: string }) {
  return (
    <p>
      Prof. Dr. Lena Gieseke
      <br />
      Marlene-Dietrich-Allee 11
      <br />
      14482 Potsdam
      <br />
      {country}
    </p>
  );
}

// The email address is shown as an image (not text or a mailto link) so spam
// bots can't harvest it. The alt text spells it out for screen readers.
// Displayed at half the 300×40 source size, so it stays sharp on high-resolution screens.
const email = (
  <Image
    src="/email_01.png"
    alt="hello at lenagieseke dot com"
    width={150}
    height={20}
    className="impressum-email"
  />
);

// Vercel hosts the site and is the only third party that receives visitors'
// data (server logs). Update this if the hosting changes.
const HOST = (
  <p>
    Vercel Inc.
    <br />
    440 N Barranca Ave #4133
    <br />
    Covina, CA 91723, USA
  </p>
);

// Supervisory authority for data protection in Brandenburg (Art. 77 GDPR).
const AUTHORITY = (
  <p>
    Die Landesbeauftragte für den Datenschutz und für das Recht auf Akteneinsicht Brandenburg
    <br />
    Stahnsdorfer Damm 77
    <br />
    14532 Kleinmachnow
  </p>
);

const IMPRINT_SECTIONS: Record<Locale, ImprintSection[]> = {
  en: [
    { heading: 'Legal Disclosure', body: <Address country="Germany" /> },
    { heading: 'Contact', body: <p>{email}</p> },
    {
      heading: 'Responsible for Content (§ 18 (2) MStV)',
      body: <Address country="Germany" />,
    },
    {
      heading: 'Disclaimer',
      body: (
        <p>
          We do not assume any liability for the content of external links. The operators of the
          linked pages are solely responsible for their content.
        </p>
      ),
    },
    {
      heading: 'Terms of Use',
      body: (
        <p>
          The content of this website may not be accessed, copied, or used for the purposes of
          training machine learning models or automated data mining.
        </p>
      ),
    },
  ],
  de: [
    { heading: 'Angaben gemäß § 5 DDG', body: <Address country="Deutschland" /> },
    { heading: 'Kontakt', body: <p>{email}</p> },
    {
      heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      body: <Address country="Deutschland" />,
    },
    {
      heading: 'Haftungsausschluss',
      body: (
        <p>
          Für die Inhalte externer Links übernehmen wir keine Haftung. Für den Inhalt der
          verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
        </p>
      ),
    },
    {
      heading: 'Nutzungsbedingungen',
      body: (
        <p>
          Die Inhalte dieser Website dürfen nicht für das Training von Machine Learning Modellen oder für automatisiertes Data Mining abgerufen, kopiert oder verwendet werden.
        </p>
      ),
    },
  ],
};

// Privacy policy, shown below the imprint under its own page-sized title.
const PRIVACY_SECTIONS: Record<Locale, ImprintSection[]> = {
  en: [
    {
      heading: 'Controller',
      body: (
        <>
          <p>
            The controller responsible for data processing on this website is the person named
            above under Legal Disclosure, reachable at the email address given under Contact.
          </p>
        </>
      ),
    },
    {
      heading: 'No cookies, no tracking',
      body: (
        <>
          <p>
            This website does not use cookies, analytics or tracking tools. Fonts and images are
            served from this website&apos;s own server, so your browser does not connect to
            third parties such as Google. Texts and images are managed with the content system
            Sanity; they are loaded by our server, not by your browser, so Sanity receives no
            data about you.
          </p>
        </>
      ),
    },
    {
      heading: 'Hosting and server logs',
      body: (
        <>
          <p>This website is hosted by:</p>
          {HOST}
          <p>
            When you visit the website, the hosting provider automatically records technical
            data in server log files: your IP address, the date and time of the request, the page
            requested, the referring page, and your browser and operating system. This data is
            needed to deliver the website and to keep it secure and stable, and is deleted once
            it is no longer required for these purposes. Legal basis: Art. 6 (1) (f) GDPR (our
            legitimate interest in the secure, reliable operation of the website). Vercel may
            process data in the USA; Vercel is certified under the EU-US Data Privacy Framework,
            for which the European Commission has issued an adequacy decision (Art. 45 GDPR).
          </p>
        </>
      ),
    },
    {
      heading: 'Contact by email',
      body: (
        <>
          <p>
            If you contact us by email, we use your email address and the content of your message
            only to answer your request. Legal basis: Art. 6 (1) (b) or (f) GDPR. We delete the
            data once your request has been dealt with, unless we are legally required to keep
            it.
          </p>
        </>
      ),
    },
    {
      heading: 'External links',
      body: (
        <>
          <p>
            This website links to external sites such as social media profiles. Only when you
            click such a link does your browser connect to that site; its own privacy policy then
            applies.
          </p>
        </>
      ),
    },
    {
      heading: 'Your rights',
      body: (
        <>
          <p>
            You have the right to access your personal data (Art. 15 GDPR), to have it corrected
            (Art. 16) or deleted (Art. 17), to restrict its processing (Art. 18), to data
            portability (Art. 20), and to object to processing based on Art. 6 (1) (f) (Art. 21).
            To exercise these rights, contact us at the email address above. You also have the
            right to lodge a complaint with a data protection supervisory authority (Art. 77
            GDPR). The authority responsible for us is:
          </p>
          {AUTHORITY}
        </>
      ),
    },
  ],
  de: [
    {
      heading: 'Verantwortliche Stelle',
      body: (
        <>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist die oben unter
            „Angaben gemäß § 5 DDG“ genannte Person, erreichbar über die unter „Kontakt“
            angegebene E-Mail-Adresse.
          </p>
        </>
      ),
    },
    {
      heading: 'Keine Cookies, kein Tracking',
      body: (
        <>
          <p>
            Diese Website verwendet keine Cookies, keine Analyse- und keine Tracking-Werkzeuge.
            Schriften und Bilder werden vom eigenen Server dieser Website ausgeliefert, Ihr
            Browser stellt also keine Verbindung zu Dritten wie Google her. Texte und Bilder
            werden mit dem Content-System Sanity verwaltet; sie werden von unserem Server
            geladen, nicht von Ihrem Browser, sodass Sanity keine Daten über Sie erhält.
          </p>
        </>
      ),
    },
    {
      heading: 'Hosting und Server-Logfiles',
      body: (
        <>
          <p>Diese Website wird gehostet bei:</p>
          {HOST}
          <p>
            Beim Besuch der Website erfasst der Hosting-Anbieter automatisch technische Daten in
            Server-Logfiles: Ihre IP-Adresse, Datum und Uhrzeit des Abrufs, die aufgerufene
            Seite, die zuvor besuchte Seite (Referrer) sowie Browser und Betriebssystem. Diese
            Daten sind nötig, um die Website auszuliefern und ihren sicheren, stabilen Betrieb
            zu gewährleisten, und werden gelöscht, sobald sie dafür nicht mehr erforderlich
            sind. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (unser berechtigtes Interesse
            am sicheren und zuverlässigen Betrieb der Website). Vercel verarbeitet Daten
            gegebenenfalls in den USA; Vercel ist nach dem EU-US Data Privacy Framework
            zertifiziert, für das ein Angemessenheitsbeschluss der EU-Kommission vorliegt
            (Art. 45 DSGVO).
          </p>
        </>
      ),
    },
    {
      heading: 'Kontakt per E-Mail',
      body: (
        <>
          <p>
            Wenn Sie uns per E-Mail kontaktieren, verwenden wir Ihre E-Mail-Adresse und den
            Inhalt Ihrer Nachricht ausschließlich zur Bearbeitung Ihrer Anfrage.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. f DSGVO. Wir löschen die Daten, sobald
            Ihre Anfrage erledigt ist, sofern keine gesetzlichen Aufbewahrungspflichten
            bestehen.
          </p>
        </>
      ),
    },
    {
      heading: 'Externe Links',
      body: (
        <>
          <p>
            Diese Website verlinkt auf externe Seiten, etwa Social-Media-Profile. Erst wenn Sie
            einen solchen Link anklicken, stellt Ihr Browser eine Verbindung zu dieser Seite
            her; dort gilt deren eigene Datenschutzerklärung.
          </p>
        </>
      ),
    },
    {
      heading: 'Ihre Rechte',
      body: (
        <>
          <p>
            Sie haben das Recht auf Auskunft über Ihre personenbezogenen Daten (Art. 15 DSGVO),
            auf Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
            (Art. 18), Datenübertragbarkeit (Art. 20) sowie auf Widerspruch gegen eine
            Verarbeitung nach Art. 6 Abs. 1 lit. f DSGVO (Art. 21). Wenden Sie sich dazu an die
            oben angegebene E-Mail-Adresse. Außerdem haben Sie das Recht, sich bei einer
            Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Für uns zuständig ist:
          </p>
          {AUTHORITY}
        </>
      ),
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return { title: `${TITLE[locale]} | Kaspar 2028` };
}

export default async function ImpressumPage({ params }: Props) {
  const locale = toLocale((await params).lang);

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{TITLE[locale]}</h1>
      </div>
      <main id="main-content">
        <Sections sections={IMPRINT_SECTIONS[locale]} />
        {/* Same style as the page title above; h2 because the page has one h1. */}
        <div id="privacy" className="page-title-header privacy-title-header">
          <h2 className="page-title">{PRIVACY_TITLE[locale]}</h2>
        </div>
        <Sections sections={PRIVACY_SECTIONS[locale]} />
      </main>
    </>
  );
}

function Sections({ sections }: { sections: ImprintSection[] }) {
  return (
    <div className="impressum-wrapper">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body}
        </section>
      ))}
    </div>
  );
}
