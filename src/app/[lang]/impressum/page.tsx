import type { Metadata } from 'next';
import { type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === 'de' ? 'Impressum | Kaspar 2028' : 'Imprint | Kaspar 2028' };
}

export default async function ImpressumPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === 'de' ? 'de' : 'en';
  const isDE = locale === 'de';

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{isDE ? 'Impressum' : 'Imprint'}</h1>
      </div>
      <main id="main-content">
        <div className="impressum-wrapper">
          {isDE ? <ImpressumDE /> : <ImpressumEN />}
        </div>
      </main>
    </>
  );
}

function ImpressumDE() {
  return (
    <>
      <section>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          Filmuniversität Babelsberg KONRAD WOLF<br />
          Marlene-Dietrich-Allee 11<br />
          14482 Potsdam<br />
          Deutschland
        </p>
      </section>

      <section>
        <h2>Vertreten durch</h2>
        <p>
          Prof. Dr. Susanne Stürmer (Präsidentin)<br />
          Prof. Dr. Klemens Koehler (Kanzler)
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:hello@kaspar2028.de">hello@kaspar2028.de</a>
        </p>
      </section>

      <section>
        <h2>Projektverantwortliche</h2>
        <p>
          Kaspar 2028 ist ein Forschungsprojekt an der Filmuniversität Babelsberg KONRAD WOLF
          in Zusammenarbeit mit dem Residenztheater München.
        </p>
      </section>

      <section>
        <h2>Haftungsausschluss</h2>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die
          Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich
          deren Betreiber verantwortlich.
        </p>
      </section>
    </>
  );
}

function ImpressumEN() {
  return (
    <>
      <section>
        <h2>Legal Disclosure</h2>
        <p>
          Filmuniversität Babelsberg KONRAD WOLF<br />
          Marlene-Dietrich-Allee 11<br />
          14482 Potsdam<br />
          Germany
        </p>
      </section>

      <section>
        <h2>Represented by</h2>
        <p>
          Prof. Dr. Susanne Stürmer (President)<br />
          Prof. Dr. Klemens Koehler (Chancellor)
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: <a href="mailto:hello@kaspar2028.de">hello@kaspar2028.de</a>
        </p>
      </section>

      <section>
        <h2>Project</h2>
        <p>
          Kaspar 2028 is a research project at Filmuniversität Babelsberg KONRAD WOLF
          in collaboration with Residenztheater München.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          Despite careful content review we assume no liability for the content of external
          links. The operators of linked pages are solely responsible for their content.
        </p>
      </section>
    </>
  );
}
