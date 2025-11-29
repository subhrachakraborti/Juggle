import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-3 bg-primary rounded-full">
            <Image
              src="/icon.webp"
              alt="Juggle"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </div>
          <p className="text-sm font-semibold">
            © 2025 Juggle. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link
            href="https://devfolio.co/projects/juggle-5776"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            A MumbaiHacks Project
          </Link>
        </div>
      </div>
    </footer>
  );
}
