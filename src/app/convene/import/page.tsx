'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PS_SCRIPT: string = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://static.mystwiz.net/wutheringwaves/getlink.ps1'))}"`;
const VALID_URL_PATH: string =
  'https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html';

export default function Page() {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isScriptCopied, setIsScriptCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  async function handleImport(): Promise<void> {
    if (isBusy) return;

    if (!inputUrl) {
      setError(
        'Please paste your convene history URL in the input field above.',
      );
      return;
    }

    try {
      setIsBusy(true);
      setError('');
      const url = new URL(inputUrl);

      validateUrl(url);
      const queryParams = extractQueryParams(url);
      localStorage.setItem('gachaQueryParams', JSON.stringify(queryParams)); // Save query params to localStorage
      router.push('/convene'); // Redirect to /convene
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setIsBusy(false);
    }
  }

  function validateUrl(url: URL): void {
    if (url.origin + url.pathname !== VALID_URL_PATH) {
      throw new Error('Please provide the URL of your convene history page.');
    }
  }

  function extractQueryParams(url: URL): { [key: string]: string } {
    const queryParams: { [key: string]: string } = {};
    const searchParams = new URLSearchParams(url.hash.split('?')[1]);

    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return queryParams;
  }

  async function copyPowerShellScript(): Promise<void> {
    try {
      await navigator.clipboard.writeText(PS_SCRIPT);
      setIsScriptCopied(true);
    } catch (error) {
      console.error('An error occurred while copying the script:', error);
    }
  }

  function handleError(error: unknown): void {
    console.error('An error occurred:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred.');
    }
  }

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
        Import Convene History
      </h1>
      <Alert>
        <AlertTitle>Read Me!</AlertTitle>
        <AlertDescription>
          Please open your convene history page in Wuthering Waves before
          following the instructions!
        </AlertDescription>
      </Alert>
      <div className="w-full">
        <h2 className="text-xl font-bold md:text-2xl">Instructions</h2>
        <p>Copy the PowerShell script below and run it in your PowerShell.</p>
        <div className="w-full mb-4">
          <pre className="flex-wrap p-4 mb-2 text-xs break-words whitespace-pre-wrap bg-gray-100 rounded-md sm:text-sm text-wrap dark:bg-neutral-800 dark:text-white">
            {PS_SCRIPT}
          </pre>
          <Button
            onClick={copyPowerShellScript}
            className="flex-shrink-0"
            style={{ height: 'auto' }}
          >
            {isScriptCopied ? 'Copied!' : 'Copy PowerShell Script'}
          </Button>
        </div>
        <div className="w-full">
          <p>Paste your convene history URL below.</p>
          <Input
            name="url-input"
            type="url"
            className="flex-grow w-full"
            placeholder="Paste URL here"
            value={inputUrl}
            required
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setInputUrl(e.target.value)
            }
          />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-between">
        <Button size="lg" variant="secondary">
          <Link href="/convene">Cancel</Link>
        </Button>
        <Button size="lg" onClick={handleImport}>
          {isBusy ? 'Importing...' : 'Import'}
        </Button>
      </div>
    </div>
  );
}
