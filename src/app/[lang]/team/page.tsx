// Team page: team member cards (photo, role, role in the project, bio, links)
// in the three-column card grid, followed by the partner and funding
// institutions. All content comes from Sanity ("Team Members", "Institutions").

import type { Metadata } from 'next';
import Image from 'next/image';
import CardGrid from '@/components/CardGrid';
import { getContent, toLocale, type Institution, type TeamMember } from '@/lib/content';
import { croppedImageUrl, imageUrl } from '@/lib/image';

type Props = { params: Promise<{ lang: string }> };

const INSTITUTIONS_TITLE = { en: 'Institutions', de: 'Institutionen' };

// Photos are shown at 4:5 (portrait), cropped around the hotspot set in Sanity.
const PHOTO_ASPECT = 4 / 5;

// Tells the browser how wide the image is on screen, so next/image can pick a
// suitable size: full width on phones, about a third of the page otherwise.
const CARD_IMAGE_SIZES = '(max-width: 768px) 100vw, 30vw';

export const metadata: Metadata = { title: 'Team | Kaspar 2028' };

export default async function TeamPage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { team } = await getContent(locale);

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">Team</h1>
      </div>
      <main id="main-content">
        <CardGrid>
          {team.members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </CardGrid>

        {team.institutions.length > 0 && (
          <section className="institutions">
            <div className="project-wrapper">
              <h1>{INSTITUTIONS_TITLE[locale]}</h1>
            </div>
            <CardGrid>
              {team.institutions.map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
              ))}
            </CardGrid>
          </section>
        )}
      </main>
    </>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const { photo } = member;
  const photoWidth = 1200;
  return (
    <>
      {photo ? (
        <Image
          src={croppedImageUrl(photo, PHOTO_ASPECT, photoWidth)}
          alt={photo.alt}
          width={photoWidth}
          height={Math.round(photoWidth / PHOTO_ASPECT)}
          sizes={CARD_IMAGE_SIZES}
          placeholder={photo.lqip ? 'blur' : 'empty'}
          blurDataURL={photo.lqip}
          className="team-photo"
        />
      ) : (
        // No photo in Sanity yet: same-size box with initials, so the grid
        // stays even. Decorative only — the name follows as text.
        <div className="team-photo team-photo-placeholder" aria-hidden="true">
          {initials(member.name)}
        </div>
      )}
      {member.role && <span className="card-kicker">{member.role}</span>}
      <h2 className="card-title">{member.name}</h2>
      {member.projectRole && <p className="card-text team-project-role">{member.projectRole}</p>}
      {member.bio && <p className="card-text">{member.bio}</p>}
      {member.links.length > 0 && (
        <ul className="card-links">
          {member.links.map((link) => (
            <li key={link.key}>
              <ExternalLink href={link.url}>{link.label}</ExternalLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function InstitutionCard({ institution }: { institution: Institution }) {
  const { logo, url } = institution;
  return (
    <>
      {logo && (
        <Image
          src={imageUrl(logo)}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          sizes="16rem"
          className="institution-logo"
        />
      )}
      <h2 className="card-title">{institution.name}</h2>
      {institution.description && <p className="card-text">{institution.description}</p>}
      {url && (
        <ul className="card-links">
          <li>
            <ExternalLink href={url}>{displayHost(url)}</ExternalLink>
          </li>
        </ul>
      )}
    </>
  );
}

// Links to other sites open in a new tab; noopener stops the new page from
// accessing this one.
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} ↗
    </a>
  );
}

// "Manuel Flurin Hendry" → "MH" (first and last name)
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// "https://www.residenztheater.de/about" → "residenztheater.de"
function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
