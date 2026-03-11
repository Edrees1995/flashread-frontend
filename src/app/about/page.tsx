import type { Metadata } from 'next';
import AboutContent from '../components/AboutContent';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about FlashRead — the speed reading tool with a built-in editor. Read faster, remember more.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
