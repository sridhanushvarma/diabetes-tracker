import React from 'react';
import Link from 'next/link';
import { withBasePath } from '@/utils/path';

interface GithubPagesLinkProps {
  href: string;
  as?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * A wrapper around Next.js Link component that handles GitHub Pages paths correctly
 * This ensures that links work both in development and when deployed to GitHub Pages
 */
const GithubPagesLink: React.FC<GithubPagesLinkProps> = ({
  href,
  as,
  className,
  children,
  onClick
}) => {
  // For external links, use the href as is
  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  // For internal links, use the withBasePath utility
  const asPath = as || withBasePath(href);

  return (
    <Link href={href} as={asPath} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};

export default GithubPagesLink;
