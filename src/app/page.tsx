import { siteConfig } from '@/config/site';

export default function Home() {
  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
          Welcome to {siteConfig.name}!
        </h1>
      </div>
    </>
  );
}
